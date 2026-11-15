import { createFileRoute, Outlet } from '@tanstack/react-router';
import { AdminShell } from '@/components/linkbus/admin-shell';
import { AuthGuard } from '@/components/linkbus/auth-guard';

export const Route = createFileRoute('/admin')({ component: Admin });

function Admin() {
  return (
    <AuthGuard allowedRoles={['admin', 'superadmin']}>
      <AdminShell>
        <Outlet />
      </AdminShell>
    </AuthGuard>
  );
}
