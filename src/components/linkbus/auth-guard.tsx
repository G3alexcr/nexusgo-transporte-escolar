import { useEffect, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { ShieldAlert, Loader2, LogOut, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getDefaultPortalForRole, useAuth, type UserRole } from './auth-provider';

export function AuthGuard({
  allowedRoles,
  children,
}: {
  allowedRoles: UserRole[];
  children: ReactNode;
}) {
  const { session, profile, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!isLoading && !session) {
      void navigate({
        to: '/login',
        search: { redirect: pathname, tab: 'login' },
        replace: true,
      });
    }
  }, [isLoading, session, navigate, pathname]);

  if (isLoading || !session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        <p className="text-sm font-semibold text-muted-foreground">Verificando sesión segura...</p>
      </div>
    );
  }

  const role = profile?.role;
  if (role && !allowedRoles.includes(role)) {
    const targetPortal = getDefaultPortalForRole(role);
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-2xl border bg-card p-6 text-center shadow-lg">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-destructive/15 text-destructive">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-xl font-extrabold text-foreground">Acceso restringido</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tu cuenta tiene el rol <span className="font-bold text-foreground">{role}</span> y no tiene permisos para acceder a esta sección.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link to={targetPortal}>
              <Button className="w-full bg-amber-400 font-bold text-slate-950 hover:bg-amber-500 gap-2">
                Ir a mi portal autorizado <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => void signOut()}
              className="w-full gap-2 text-xs font-semibold"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
