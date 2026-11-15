import { createFileRoute } from '@tanstack/react-router';
import { AdminDirectory } from '@/components/linkbus/admin-directory';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/admin/rutas')({ head: () => pageHead('Rutas', 'Rutas de la plataforma de transporte escolar Nexus Go.'), component: () => <AdminDirectory section="rutas" /> });
