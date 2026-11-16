import { useEffect, useRef, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import {
  ArrowLeft,
  Bell,
  Camera,
  CheckCircle2,
  CreditCard,
  KeyRound,
  LogOut,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  User,
  Volume2,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthGuard } from '@/components/linkbus/auth-guard';
import { useAuth } from '@/components/linkbus/auth-provider';
import { usePlatform } from '@/components/linkbus/platform-provider';
import { ThemeToggle } from '@/components/linkbus/theme-toggle';
import { SvgQrCode } from '@/components/linkbus/qr-checkin';
import { getSupabaseClient } from '@/lib/supabase';
import { requestPushPermissionAndSubscribe } from '@/lib/pwa-push';
import { playNotificationSound } from '@/lib/sound-effects';
import { pageHead } from '@/lib/page-head';
import { toast } from 'sonner';

export const Route = createFileRoute('/perfil')({
  head: () =>
    pageHead(
      'Perfil de Usuario · Nexus Go CR',
      'Gestiona tu información personal, foto de perfil, seguridad y preferencias de notificación.',
    ),
  component: PerfilRoutePage,
});

const ROLE_BADGES: Record<string, string> = {
  superadmin: 'SUPER ADMIN',
  admin: 'ADMIN FLOTA',
  chofer: 'CHOFER / ASISTENTE',
  apoderado: 'ENCARGADO',
};

function getAvatarStorageKey(userId?: string | null, role?: string | null) {
  return `linkbus_avatar_${userId || role || 'guest'}`;
}

function PerfilRoutePage() {
  return (
    <AuthGuard allowedRoles={['superadmin', 'admin', 'chofer', 'apoderado']}>
      <PerfilContent />
    </AuthGuard>
  );
}

function PerfilContent() {
  const { user, profile, signOut } = useAuth();
  const { state, dispatch } = usePlatform();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState<'datos' | 'carnet'>('datos');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const fullNameRaw =
    profile?.fullName ||
    (user?.user_metadata?.['full_name'] as string | undefined) ||
    user?.email?.split('@')[0] ||
    'Usuario Nexus Go';
  const nameParts = fullNameRaw.trim().split(/\s+/);
  const initialFirst = nameParts[0] || '';
  const initialLast = nameParts.slice(1).join(' ');

  const [nombre, setNombre] = useState(initialFirst);
  const [apellidos, setApellidos] = useState(initialLast);
  const [telefono, setTelefono] = useState(
    (user?.user_metadata?.['telefono'] as string | undefined) || '',
  );
  const [correoRecuperacion, setCorreoRecuperacion] = useState(
    (user?.user_metadata?.['recovery_email'] as string | undefined) || '',
  );
  const [whatsappRecuperacion, setWhatsappRecuperacion] = useState(
    (user?.user_metadata?.['whatsapp'] as string | undefined) || '',
  );
  const [savingProfile, setSavingProfile] = useState(false);

  const [pushEnabled, setPushEnabled] = useState(
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission === 'granted'
      : false,
  );
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const storageKey = getAvatarStorageKey(user?.id, profile?.role);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setAvatarUrl(window.localStorage.getItem(storageKey));
  }, [storageKey]);

  const homePath =
    profile?.role === 'superadmin'
      ? '/superadmin'
      : profile?.role === 'admin'
      ? '/admin/dashboard'
      : profile?.role === 'chofer'
      ? '/chofer'
      : '/apoderado';

  const initials = `${nombre} ${apellidos}`
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handlePhotoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen debe pesar menos de 2 MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null;
      if (result) {
        setAvatarUrl(result);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(storageKey, result);
          window.dispatchEvent(new Event('linkbus-avatar-changed'));
        }
        toast.success('Foto de perfil actualizada');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = `${nombre} ${apellidos}`.trim();
    if (!fullName) {
      toast.error('Ingresa tu nombre');
      return;
    }

    setSavingProfile(true);
    try {
      const supabase = getSupabaseClient();
      if (supabase && user) {
        await supabase.auth.updateUser({
          data: {
            full_name: fullName,
            telefono,
            recovery_email: correoRecuperacion,
            whatsapp: whatsappRecuperacion,
          },
        });
        await supabase
          .from('user_profiles')
          .update({ full_name: fullName })
          .eq('id', user.id);
      }
      toast.success('Datos de perfil guardados');
    } catch {
      toast.error('No se pudieron guardar los cambios en este momento');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleConfigurePush = async () => {
    const sub = await requestPushPermissionAndSubscribe();
    const granted =
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted';
    setPushEnabled(granted);
    if (granted) {
      toast.success(
        sub
          ? 'Notificaciones Push habilitadas y suscritas'
          : 'Notificaciones Push habilitadas en este dispositivo',
      );
    } else {
      toast.warning('Permiso de notificaciones denegado por el navegador');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    setSavingPassword(true);
    try {
      const supabase = getSupabaseClient();
      if (!supabase) return;
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        toast.error(error.message);
      } else {
        setNewPassword('');
        toast.success('Contraseña actualizada correctamente');
      }
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    dispatch({ type: 'setSuperAdmin', enabled: false });
    toast.info('Sesión cerrada');
    void navigate({ to: '/login', search: { tab: 'login', redirect: '' } });
  };

  return (
    <div className="min-h-screen bg-muted/20 pb-12">
      {/* Top Bar */}
      <header className="sticky top-0 z-20 border-b bg-card/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-black tracking-tight text-foreground">Nexus Go CR</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-700 dark:text-amber-300 border border-amber-400/30">
              <ShieldCheck className="h-3 w-3" />
              {ROLE_BADGES[profile?.role || ''] || 'USUARIO'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="grid h-9 w-9 place-items-center rounded-xl border bg-background"
              title={state.isOfflineMode ? 'Sin conexión' : 'Conectado'}
            >
              {state.isOfflineMode ? (
                <WifiOff className="h-4 w-4 text-amber-500" />
              ) : (
                <Wifi className="h-4 w-4 text-emerald-500" />
              )}
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 pt-6 space-y-6">
        {/* Back + Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void navigate({ to: homePath })}
            className="grid h-9 w-9 place-items-center rounded-full border bg-card hover:bg-muted transition-colors cursor-pointer"
            aria-label="Volver"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              PERFIL DE USUARIO
            </h1>
            <p className="text-xs text-muted-foreground">
              Gestiona tu información personal, foto de perfil y notificaciones
            </p>
          </div>
        </div>

        {/* Profile Hero Card */}
        <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-xs flex flex-col items-center text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoSelected}
          />

          <div className="relative">
            <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-amber-400/70 bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg">
              {avatarUrl ? (
                <img src={avatarUrl} alt={fullNameRaw} className="h-full w-full object-cover" />
              ) : (
                <span>{initials || 'LB'}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-slate-950 text-white hover:bg-amber-400 hover:text-slate-950 flex items-center justify-center shadow-md border-2 border-card transition-colors cursor-pointer"
              title="Cambiar foto de perfil"
              aria-label="Cambiar foto de perfil"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>

          <span className="-mt-2.5 z-10 inline-flex items-center rounded-full bg-slate-950 px-3 py-0.5 text-[10px] font-black tracking-wider text-white shadow">
            {ROLE_BADGES[profile?.role || ''] || 'USUARIO'}
          </span>

          <h2 className="mt-3 text-xl font-black text-foreground">
            {`${nombre} ${apellidos}`.trim() || fullNameRaw}
          </h2>
          <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              VERIFICADO
            </span>
            <span>·</span>
            <span className="font-mono">ID: {(user?.id || 'linkbus').slice(0, 8).toUpperCase()}</span>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-8 text-xs font-bold"
            >
              <Camera className="h-3.5 w-3.5 mr-1.5" />
              Cambiar foto
            </Button>
            {avatarUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAvatarUrl(null);
                  if (typeof window !== 'undefined') {
                    window.localStorage.removeItem(storageKey);
                    window.dispatchEvent(new Event('linkbus-avatar-changed'));
                  }
                  toast.info('Foto eliminada');
                }}
                className="h-8 text-xs text-muted-foreground"
              >
                Quitar foto
              </Button>
            )}
          </div>
        </div>

        {/* Tabs: MIS DATOS | MI CARNET */}
        <div className="flex justify-center">
          <div className="inline-flex rounded-2xl bg-slate-950 p-1 shadow-md">
            <button
              type="button"
              onClick={() => setActiveTab('datos')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'datos'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <User className="h-3.5 w-3.5" />
              MIS DATOS
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('carnet')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'carnet'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <CreditCard className="h-3.5 w-3.5" />
              MI CARNET
            </button>
          </div>
        </div>

        {activeTab === 'datos' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Card: Personal Data */}
            <form
              onSubmit={handleSaveProfile}
              className="rounded-3xl border bg-card p-6 shadow-xs space-y-4"
            >
              <div className="flex items-center gap-2.5 pb-2 border-b">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-amber-400/15 text-amber-600 dark:text-amber-400">
                  <User className="h-4 w-4" />
                </span>
                <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                  Datos Personales y de Contacto
                </h3>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold uppercase text-muted-foreground">Nombre</Label>
                <Input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="h-10 text-xs font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold uppercase text-muted-foreground">Apellidos</Label>
                <Input
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                  className="h-10 text-xs font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold uppercase text-muted-foreground">
                  Correo de Cuenta
                </Label>
                <div className="relative">
                  <Input
                    value={user?.email || ''}
                    readOnly
                    className="h-10 text-xs bg-muted/50 text-muted-foreground pr-9 cursor-not-allowed"
                  />
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 absolute right-3 top-3" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold uppercase text-muted-foreground">
                  Teléfono Personal
                </Label>
                <div className="relative">
                  <Input
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="8888-8888"
                    className="h-10 text-xs font-mono pr-9"
                  />
                  <Phone className="h-4 w-4 text-muted-foreground absolute right-3 top-3" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold uppercase text-muted-foreground">
                  Correo de Recuperación (Personal)
                </Label>
                <div className="relative">
                  <Input
                    type="email"
                    value={correoRecuperacion}
                    onChange={(e) => setCorreoRecuperacion(e.target.value)}
                    placeholder="correo@personal.com"
                    className="h-10 text-xs pr-9"
                  />
                  <Mail className="h-4 w-4 text-muted-foreground absolute right-3 top-3" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold uppercase text-muted-foreground">
                  Teléfono de Recuperación (WhatsApp)
                </Label>
                <div className="relative">
                  <Input
                    value={whatsappRecuperacion}
                    onChange={(e) => setWhatsappRecuperacion(e.target.value)}
                    placeholder="8888-8888"
                    className="h-10 text-xs font-mono pr-9"
                  />
                  <Phone className="h-4 w-4 text-muted-foreground absolute right-3 top-3" />
                </div>
              </div>

              <Button
                type="submit"
                disabled={savingProfile}
                className="w-full h-10 bg-amber-400 text-slate-950 hover:bg-amber-500 font-extrabold text-xs rounded-xl"
              >
                <Save className="h-4 w-4 mr-1.5" />
                {savingProfile ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </form>

            {/* Right Card: Notification Preferences */}
            <div className="rounded-3xl border bg-card p-6 shadow-xs space-y-5">
              <div className="flex items-center gap-2.5 pb-2 border-b">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-amber-400/15 text-amber-600 dark:text-amber-400">
                  <Bell className="h-4 w-4" />
                </span>
                <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                  Preferencias de Notificación
                </h3>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Elige cómo quieres recibir las alertas de abordaje, ruta, pagos SINPE y avisos de Nexus Go CR.
              </p>

              <div className="rounded-2xl border bg-muted/30 p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                    Estado de Notificación
                  </span>
                  <span
                    className={`rounded-xl px-3 py-1 text-[10px] font-black ${
                      pushEnabled
                        ? 'bg-emerald-500 text-white'
                        : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {pushEnabled ? '✓ PUSH HABILITADO' : 'PENDIENTE'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    onClick={() => void handleConfigurePush()}
                    className="h-9 bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 font-bold text-xs rounded-xl"
                  >
                    <Bell className="h-3.5 w-3.5 mr-1.5" />
                    CONFIGURAR
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      playNotificationSound('push');
                      toast.info('Sonido de notificación probado');
                    }}
                    className="h-9 font-bold text-xs rounded-xl"
                  >
                    <Volume2 className="h-3.5 w-3.5 mr-1.5" />
                    PROBAR SONIDO
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between rounded-2xl border p-3.5 cursor-pointer">
                  <div>
                    <p className="text-xs font-extrabold text-foreground">NOTIFICACIONES PUSH</p>
                    <p className="text-[11px] text-muted-foreground">
                      Alertas instantáneas en tu dispositivo móvil o PC
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={pushEnabled}
                    onChange={() => void handleConfigurePush()}
                    className="h-4 w-4 accent-emerald-500"
                  />
                </label>

                <label className="flex items-center justify-between rounded-2xl border p-3.5 cursor-pointer">
                  <div>
                    <p className="text-xs font-extrabold text-foreground">ENVÍO POR CORREO</p>
                    <p className="text-[11px] text-muted-foreground">
                      Reportes detallados y avisos en tu email
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="h-4 w-4 accent-emerald-500"
                  />
                </label>
              </div>

              <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-3.5 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <span>
                  Nexus Go CR respeta tu privacidad. La configuración de notificaciones se aplica de inmediato a tu cuenta.
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* MI CARNET TAB */
          <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-xs max-w-md mx-auto text-center space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
              Carnet Digital de Identificación
            </h3>
            <div className="inline-flex p-4 rounded-2xl bg-muted/40 border">
              <SvgQrCode
                value={`LINKBUS-CR-USER-${user?.id || 'guest'}-${fullNameRaw}`}
                size={150}
              />
            </div>
            <div>
              <p className="text-base font-black text-foreground">
                {`${nombre} ${apellidos}`.trim() || fullNameRaw}
              </p>
              <p className="text-xs text-muted-foreground">
                {ROLE_BADGES[profile?.role || ''] || 'USUARIO'} · {state.company}
              </p>
            </div>
          </div>
        )}

        {/* Active Session & Password Card */}
        <div className="rounded-3xl border bg-card p-6 shadow-xs flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <form onSubmit={handleChangePassword} className="flex-1 max-w-md space-y-2">
            <Label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-amber-500" />
              Cambiar Contraseña (Sesión Activa)
            </Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <PasswordInput
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nueva contraseña (mín. 6 caracteres)"
                  className="h-9 text-xs"
                />
              </div>
              <Button
                type="submit"
                size="sm"
                disabled={savingPassword}
                className="h-9 px-4 font-bold text-xs"
              >
                {savingPassword ? 'Guardando...' : 'Actualizar'}
              </Button>
            </div>
          </form>

          <Button
            type="button"
            variant="outline"
            onClick={() => void handleLogout()}
            className="h-9 border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white font-bold text-xs rounded-xl"
          >
            <LogOut className="h-4 w-4 mr-1.5" />
            Cerrar Sesión
          </Button>
        </div>
      </main>
    </div>
  );
}
