import { useEffect, useState, type FormEvent } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Building2, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck, User } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getDefaultPortalForRole, useAuth } from '@/components/linkbus/auth-provider';
import { getSupabaseClient } from '@/lib/supabase';
import { pageHead } from '@/lib/page-head';

type AuthTab = 'login' | 'register';
type AccountType = 'apoderado' | 'chofer' | 'empresa';

export const Route = createFileRoute('/login')({
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s['redirect'] === 'string' ? s['redirect'] : '',
    tab: (s['tab'] === 'register' || s['tab'] === 'empresa' ? 'register' : 'login') as AuthTab,
  }),
  head: () => pageHead('Iniciar sesión', 'Acceso seguro a Nexus Go Costa Rica.'),
  component: LoginPage,
});

function PasswordInput({
  id,
  value,
  onChange,
  leftIcon = false,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  leftIcon?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      {leftIcon && (
        <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      )}
      <Input
        id={id}
        type={visible ? 'text' : 'password'}
        required
        minLength={6}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="••••••••"
        className={`${leftIcon ? 'pl-9' : ''} pr-10 bg-slate-950 border-white/15 text-white`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Ocultar contraseña' : 'Ver contraseña'}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 grid h-6 w-6 place-items-center rounded text-slate-300 hover:text-white cursor-pointer"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function LoginPage() {
  const { redirect, tab: initialTab } = Route.useSearch();
  const navigate = useNavigate();
  const { session, profile, signIn, signUpEmpresa, signUpUser } = useAuth();

  const [tab, setTab] = useState<AuthTab>(initialTab);
  const [accountType, setAccountType] = useState<AccountType>('apoderado');
  const [submitting, setSubmitting] = useState(false);

  // Credenciales
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Datos empresa
  const [companyName, setCompanyName] = useState('');
  const [provincia, setProvincia] = useState('San José');
  const [telefono, setTelefono] = useState('');

  // Empresa vinculada (apoderado / chofer)
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [tenantsList, setTenantsList] = useState<{ id: string; nombre: string }[]>([]);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    void supabase
      .from('tenants')
      .select('id, nombre')
      .eq('activa', true)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const list = data.map((t) => ({ id: t.id as string, nombre: t.nombre as string }));
          setTenantsList(list);
          setSelectedTenantId((prev) => prev || list[0]?.id || '');
        }
      });
  }, []);

  useEffect(() => {
    if (session && profile) {
      const target = redirect && redirect !== '/login' ? redirect : getDefaultPortalForRole(profile.role);
      void navigate({ to: target, replace: true });
    }
  }, [session, profile, redirect, navigate]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error, profile: loggedProfile } = await signIn(email.trim(), password);
    setSubmitting(false);

    if (error) {
      toast.error('No se pudo iniciar sesión', { description: error });
      return;
    }

    toast.success('¡Bienvenido a Nexus Go!');
    const target =
      redirect && redirect !== '/login'
        ? redirect
        : getDefaultPortalForRole(loggedProfile?.role);
    void navigate({ to: target, replace: true });
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();

    if (accountType === 'empresa') {
      if (!companyName.trim() || !fullName.trim()) {
        toast.error('Completa el nombre de la empresa y del titular.');
        return;
      }
      setSubmitting(true);
      const res = await signUpEmpresa({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        companyName: companyName.trim(),
        provincia,
        telefono: telefono.trim(),
      });
      setSubmitting(false);

      if (res.error) {
        toast.error('Error al crear la empresa', { description: res.error });
        return;
      }
      if (res.requiresEmailVerification) {
        toast.success('Cuenta creada. Revisa tu correo para confirmar y luego inicia sesión.');
        setTab('login');
        return;
      }
      toast.success(`Empresa "${companyName}" creada exitosamente`);
      void navigate({ to: '/admin/dashboard', replace: true });
      return;
    }

    if (!selectedTenantId) {
      toast.error('Selecciona una empresa de transporte.');
      return;
    }
    setSubmitting(true);
    const res = await signUpUser({
      email: email.trim(),
      password,
      fullName: fullName.trim(),
      role: accountType,
      tenantId: selectedTenantId,
    });
    setSubmitting(false);

    if (res.error) {
      toast.error('Error en el registro', { description: res.error });
      return;
    }
    if (res.requiresEmailVerification) {
      toast.success('Cuenta registrada. Confirma tu correo e inicia sesión.');
      setTab('login');
      return;
    }
    toast.success('Cuenta creada exitosamente');
    void navigate({ to: getDefaultPortalForRole(accountType), replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="border-b border-white/10 px-4 py-3.5">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center rounded-xl bg-white px-2.5 py-1 shadow-sm transition-transform hover:scale-[1.02]"
            aria-label="Nexus Go Inicio"
          >
            <img
              src="/logo-nexus-go.jpg"
              alt="Nexus Go"
              className="h-10 w-auto object-contain"
            />
          </Link>
          <Link to="/" className="text-xs font-semibold text-slate-300 hover:text-white">
            ← Volver al inicio
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl">
          <div className="mb-4 flex justify-center">
            <img
              src="/logo-nexus-go.jpg"
              alt="Nexus Go"
              className="h-36 w-auto rounded-2xl bg-white object-contain px-4 py-2 shadow-lg"
            />
          </div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4" /> Acceso Seguro
          </div>
          <h1 className="mt-2 text-2xl font-extrabold">
            {tab === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            {tab === 'login'
              ? 'Ingresa con tu correo y contraseña.'
              : 'Regístrate como familia, chofer o empresa de transporte.'}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-1 rounded-xl bg-slate-950 p-1 border border-white/10">
            <button
              type="button"
              onClick={() => setTab('login')}
              className={`rounded-lg py-2 text-xs font-bold transition-colors cursor-pointer ${
                tab === 'login' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => setTab('register')}
              className={`rounded-lg py-2 text-xs font-bold transition-colors cursor-pointer ${
                tab === 'register' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Registrarse
            </button>
          </div>

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="mt-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="login-email" className="text-xs text-slate-300">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@empresa.cr"
                    className="pl-9 bg-slate-950 border-white/15 text-white"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="login-password" className="text-xs text-slate-300">Contraseña</Label>
                <PasswordInput id="login-password" value={password} onChange={setPassword} leftIcon />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-amber-400 text-slate-950 hover:bg-amber-500 font-extrabold h-10 cursor-pointer"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Entrar a la plataforma'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="mt-5 space-y-3">
              <div className="space-y-1">
                <Label className="text-xs text-slate-300">Tipo de cuenta</Label>
                <Select value={accountType} onValueChange={(v) => setAccountType(v as AccountType)}>
                  <SelectTrigger className="bg-slate-950 border-white/15 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apoderado">Padre / Apoderado</SelectItem>
                    <SelectItem value="chofer">Chofer / Asistente</SelectItem>
                    <SelectItem value="empresa">Empresa de Transporte</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {accountType === 'empresa' ? (
                <>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-300">Nombre de la empresa</Label>
                    <div className="relative">
                      <Building2 className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Transportes Escolares CR"
                        className="pl-9 bg-slate-950 border-white/15 text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-300">Titular / Admin</Label>
                      <Input
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Nombre completo"
                        className="bg-slate-950 border-white/15 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-300">Teléfono</Label>
                      <Input
                        required
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        placeholder="8800-0000"
                        className="bg-slate-950 border-white/15 text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-300">Provincia</Label>
                    <Select value={provincia} onValueChange={setProvincia}>
                      <SelectTrigger className="bg-slate-950 border-white/15 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['San José', 'Alajuela', 'Cartago', 'Heredia', 'Guanacaste', 'Puntarenas', 'Limón'].map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-300">Empresa de transporte</Label>
                    <Select value={selectedTenantId} onValueChange={setSelectedTenantId}>
                      <SelectTrigger className="bg-slate-950 border-white/15 text-white">
                        <SelectValue placeholder="Selecciona tu empresa" />
                      </SelectTrigger>
                      <SelectContent>
                        {tenantsList.map((t) => (
                          <SelectItem key={t.id} value={t.id}>{t.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-300">Nombre completo</Label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Nombre y apellidos"
                        className="pl-9 bg-slate-950 border-white/15 text-white"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-1">
                <Label className="text-xs text-slate-300">Correo electrónico</Label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.cr"
                  className="bg-slate-950 border-white/15 text-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-300">Contraseña (mín. 6 caracteres)</Label>
                <PasswordInput value={password} onChange={setPassword} />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-amber-400 text-slate-950 hover:bg-amber-500 font-extrabold h-10 mt-1 cursor-pointer"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Crear cuenta'}
              </Button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
