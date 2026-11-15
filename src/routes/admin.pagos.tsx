import { createFileRoute } from '@tanstack/react-router';
import { AdminDirectory } from '@/components/linkbus/admin-directory';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/admin/pagos')({ head: () => pageHead('Pagos', 'Pagos de la plataforma de transporte escolar Nexus Go.'), component: () => <AdminDirectory section="pagos" /> });
