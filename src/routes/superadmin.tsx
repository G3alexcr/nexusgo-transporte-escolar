import { createFileRoute } from '@tanstack/react-router';
import { SuperAdminDashboard } from '@/components/linkbus/superadmin-dashboard';
import { AuthGuard } from '@/components/linkbus/auth-guard';
import { pageHead } from '@/lib/page-head';

export const Route = createFileRoute('/superadmin')({
  head: () =>
    pageHead(
      'Centro de Mando SuperAdmin · NexusEduCR Master Hub',
      'Plataforma SaaS multitenant para la gestión, afiliación y control de transportistas escolares de Costa Rica.'
    ),
  component: SuperAdminPage,
});

function SuperAdminPage() {
  return (
    <AuthGuard allowedRoles={['superadmin']}>
      <SuperAdminDashboard />
    </AuthGuard>
  );
}
