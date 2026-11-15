import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';

export type UserRole = 'superadmin' | 'admin' | 'chofer' | 'asistente' | 'apoderado';

export type UserProfile = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  tenantId: string | null;
  alumnoId: string | null;
  choferId: string | null;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null; profile: UserProfile | null }>;
  signUpEmpresa: (input: {
    email: string;
    password: string;
    fullName: string;
    companyName: string;
    provincia: string;
    telefono: string;
  }) => Promise<{ error: string | null; requiresEmailVerification?: boolean; profile: UserProfile | null }>;
  signUpUser: (input: {
    email: string;
    password: string;
    fullName: string;
    role: 'chofer' | 'apoderado';
    tenantId: string;
  }) => Promise<{ error: string | null; requiresEmailVerification?: boolean; profile: UserProfile | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<UserProfile | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function getDefaultPortalForRole(role: UserRole | undefined): string {
  switch (role) {
    case 'superadmin':
      return '/superadmin';
    case 'admin':
      return '/admin/dashboard';
    case 'chofer':
    case 'asistente':
      return '/chofer';
    case 'apoderado':
      return '/apoderado';
    default:
      return '/login';
  }
}

async function fetchProfileFromDb(userId: string): Promise<UserProfile | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, email, full_name, role, tenant_id, alumno_id, chofer_id')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id as string,
    email: data.email as string,
    fullName: (data.full_name as string) || '',
    role: (data.role as UserRole) || 'apoderado',
    tenantId: (data.tenant_id as string | null) ?? null,
    alumnoId: (data.alumno_id as string | null) ?? null,
    choferId: (data.chofer_id as string | null) ?? null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserProfile = useCallback(async (activeSession: Session | null) => {
    setSession(activeSession);
    setUser(activeSession?.user ?? null);

    if (!activeSession?.user) {
      setProfile(null);
      setIsLoading(false);
      return null;
    }

    const loaded = await fetchProfileFromDb(activeSession.user.id);
    setProfile(loaded);
    setIsLoading(false);
    return loaded;
  }, []);

  useEffect(() => {
    const supabase = isSupabaseConfigured() ? getSupabaseClient() : null;
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    let mounted = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        void loadUserProfile(data.session ?? null);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) {
        void loadUserProfile(nextSession);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  const refreshProfile = useCallback(async () => {
    if (!user) return null;
    const loaded = await fetchProfileFromDb(user.id);
    setProfile(loaded);
    return loaded;
  }, [user]);

  const signIn = useCallback(async (email: string, password: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) return { error: 'Supabase no configurado', profile: null };

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message, profile: null };

    const loaded = data.user ? await fetchProfileFromDb(data.user.id) : null;
    setSession(data.session);
    setUser(data.user);
    setProfile(loaded);
    return { error: null, profile: loaded };
  }, []);

  const signUpEmpresa: AuthContextValue['signUpEmpresa'] = useCallback(
    async ({ email, password, fullName, companyName, provincia, telefono }) => {
      const supabase = getSupabaseClient();
      if (!supabase) return { error: 'Supabase no configurado', profile: null };

      const newTenantId = crypto.randomUUID();
      const slug = companyName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'admin',
            tenant_id: newTenantId,
          },
        },
      });

      if (error) return { error: error.message, profile: null };
      if (!data.session || !data.user) {
        return { error: null, requiresEmailVerification: true, profile: null };
      }

      const tenantPayload = {
        id: newTenantId,
        slug: slug || `empresa-${Date.now()}`,
        nombre: companyName,
        tipo: 'Empresa de Transporte',
        cedulaJuridica: 'Pendiente',
        contactoTitular: fullName,
        telefono,
        email,
        provincia,
        canton: 'Central',
        permisoCtp: 'En trámite',
        plan: 'Básico (1-3 busetas)',
        montoMensualSaaS: 45000,
        estado: 'En prueba',
        busetasActivas: 0,
        estudiantesTotales: 0,
        fechaRegistro: new Date().toLocaleDateString('es-CR'),
      };

      await supabase.from('tenants').insert({
        id: newTenantId,
        nombre: companyName,
        slug: tenantPayload.slug,
        provincia,
        telefono,
        plan: tenantPayload.plan,
        activa: true,
        data: tenantPayload,
      });

      await supabase.from('app_settings').upsert({
        tenant_id: newTenantId,
        company: companyName,
        route_name: 'Ruta Principal',
        active: false,
        driver_profile: { role: 'Chofer / Conductor', mode: 'Empresa de transporte' },
        parent_profile: {},
      });

      await supabase
        .from('user_profiles')
        .update({ tenant_id: newTenantId, role: 'admin', full_name: fullName })
        .eq('id', data.user.id);

      const loaded = await fetchProfileFromDb(data.user.id);
      setSession(data.session);
      setUser(data.user);
      setProfile(loaded);
      return { error: null, profile: loaded };
    },
    [],
  );

  const signUpUser: AuthContextValue['signUpUser'] = useCallback(
    async ({ email, password, fullName, role, tenantId }) => {
      const supabase = getSupabaseClient();
      if (!supabase) return { error: 'Supabase no configurado', profile: null };

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
            tenant_id: tenantId,
          },
        },
      });

      if (error) return { error: error.message, profile: null };
      if (!data.session || !data.user) {
        return { error: null, requiresEmailVerification: true, profile: null };
      }

      const loaded = await fetchProfileFromDb(data.user.id);
      setSession(data.session);
      setUser(data.user);
      setProfile(loaded);
      return { error: null, profile: loaded };
    },
    [],
  );

  const signOut = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setUser(null);
    setProfile(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        isLoading,
        signIn,
        signUpEmpresa,
        signUpUser,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('AuthProvider is required');
  return ctx;
}
