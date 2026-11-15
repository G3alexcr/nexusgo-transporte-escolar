import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import {
  Bell,
  Building2,
  Camera,
  LogOut,
  Monitor,
  Smartphone,
  ShieldCheck,
  User,
  CheckCheck,
} from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { useAuth } from './auth-provider';
import { usePlatform } from './platform-provider';
import { toast } from 'sonner';

const ROLE_LABELS: Record<string, string> = {
  superadmin: 'SuperAdmin NexusEduCR',
  admin: 'Administrador de Flota',
  chofer: 'Chofer / Asistente',
  apoderado: 'Padre / Apoderado',
};

function getAvatarStorageKey(userId?: string | null, role?: string | null) {
  return `linkbus_avatar_${userId || role || 'guest'}`;
}

export function UserProfileMenu() {
  const { user, profile, signOut } = useAuth();
  const { state, dispatch } = usePlatform();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const storageKey = getAvatarStorageKey(user?.id, profile?.role);
  const isTrueSuperAdmin = profile?.role === 'superadmin';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const syncAvatar = () => setAvatarUrl(window.localStorage.getItem(storageKey));
    syncAvatar();
    window.addEventListener('linkbus-avatar-changed', syncAvatar);
    return () => window.removeEventListener('linkbus-avatar-changed', syncAvatar);
  }, [storageKey]);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  const displayName =
    profile?.fullName ||
    (user?.user_metadata?.['full_name'] as string | undefined) ||
    user?.email?.split('@')[0] ||
    'Usuario Nexus Go';

  const initials = displayName
    .split(' ')
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
        }
        toast.success('Foto de perfil actualizada');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleLogout = async () => {
    setOpen(false);
    await signOut();
    dispatch({ type: 'setSuperAdmin', enabled: false });
    toast.info('Sesión cerrada');
    void navigate({ to: '/login', search: { tab: 'login', redirect: '' } });
  };

  const superAdminViews = [
    { to: '/superadmin', label: 'Centro de Mando', icon: ShieldCheck, match: '/superadmin' },
    { to: '/admin/dashboard', label: 'Admin Flota', icon: Monitor, match: '/admin' },
    { to: '/chofer', label: 'App Chofer', icon: Smartphone, match: '/chofer' },
    { to: '/apoderado', label: 'App Familia', icon: Building2, match: '/apoderado' },
  ] as const;

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoSelected}
      />

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative h-9 w-9 rounded-full overflow-hidden border-2 border-emerald-400/80 bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-xs flex items-center justify-center shadow-sm hover:scale-105 transition-transform cursor-pointer"
        title="Mi perfil"
        aria-label="Abrir menú de perfil"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
        ) : (
          <span>{initials || 'LB'}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl border bg-card text-card-foreground shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1">
          {/* Header with Avatar + Change Photo */}
          <div className="p-4 bg-muted/40 border-b flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="h-11 w-11 rounded-full overflow-hidden border border-border bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  <span>{initials || 'LB'}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-slate-900 text-white hover:bg-amber-400 hover:text-slate-950 flex items-center justify-center shadow border border-white/20 cursor-pointer"
                title="Cambiar foto"
                aria-label="Cambiar foto de perfil"
              >
                <Camera className="h-3 w-3" />
              </button>
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-extrabold text-foreground truncate">{displayName}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email || state.company}</p>
              <span className="mt-1 inline-block rounded-full bg-amber-400/20 px-2 py-0.5 text-[9px] font-bold text-amber-700 dark:text-amber-300">
                {ROLE_LABELS[profile?.role || ''] || 'Usuario'}
              </span>
            </div>
          </div>

          {/* Profile Page Action */}
          <div className="p-2 border-b">
            <Link
              to="/perfil"
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-extrabold text-foreground hover:bg-muted transition-colors"
            >
              <User className="h-3.5 w-3.5 text-amber-500" />
              <span>Mi Perfil</span>
            </Link>
          </div>

          {/* Role Switcher: STRICTLY ONLY for SuperAdmin */}
          {isTrueSuperAdmin && (
            <div className="p-2 border-b space-y-1">
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Cambiar vista (SuperAdmin)
              </p>
              {superAdminViews.map((v) => {
                const Icon = v.icon;
                const active = pathname.startsWith(v.match);
                return (
                  <Link
                    key={v.to}
                    to={v.to}
                    onClick={() => setOpen(false)}
                    className={`w-full flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                      active
                        ? 'bg-amber-400/20 text-amber-700 dark:text-amber-300'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{v.label}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Logout */}
          <div className="p-2">
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function UserUtilityBar({ darkBar = false }: { darkBar?: boolean }) {
  const { state, dispatch } = usePlatform();
  const [notifOpen, setNotifOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement | null>(null);

  const notifications = state.notifications || [];
  const unreadNotifications = notifications.filter((n) => !n.read);
  const unreadCount = unreadNotifications.length;

  useEffect(() => {
    if (!notifOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [notifOpen]);

  const iconBtnClass = darkBar
    ? 'grid h-9 w-9 place-items-center rounded-xl border border-white/15 bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer'
    : 'grid h-9 w-9 place-items-center rounded-xl border border-border bg-card text-foreground hover:bg-muted transition-colors cursor-pointer';

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {/* Theme Toggle */}
      <ThemeToggle />

      {/* Notifications Bell */}
      <div ref={bellRef} className="relative">
        <button
          type="button"
          onClick={() => setNotifOpen((prev) => !prev)}
          className={`relative ${iconBtnClass}`}
          title="Notificaciones"
          aria-label="Ver notificaciones"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {notifOpen && (
          <div className="absolute right-0 mt-2 w-72 rounded-2xl border bg-card text-card-foreground shadow-2xl z-50 overflow-hidden">
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b bg-muted/40">
              <span className="text-xs font-extrabold">Notificaciones</span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'markAllNotificationsRead' })}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  <CheckCheck className="h-3 w-3" />
                  Marcar leídas
                </button>
              )}
            </div>
            <div className="max-h-64 overflow-y-auto divide-y">
              {unreadNotifications.length === 0 ? (
                <p className="p-4 text-center text-xs text-muted-foreground">Sin notificaciones pendientes</p>
              ) : (
                unreadNotifications.map((n) => (
                  <button
                    type="button"
                    key={n.id}
                    onClick={() => dispatch({ type: 'markNotificationRead', id: n.id })}
                    className="w-full text-left p-3 text-xs bg-amber-400/5 hover:bg-amber-400/15 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-foreground truncate">{n.title}</p>
                      <span className="text-[10px] text-muted-foreground shrink-0">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* User Avatar Profile Menu */}
      <UserProfileMenu />
    </div>
  );
}
