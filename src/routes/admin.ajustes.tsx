import { createFileRoute } from '@tanstack/react-router';
import { AdminDirectory } from '@/components/linkbus/admin-directory';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/admin/ajustes')({ head: () => pageHead('Ajustes', 'Ajustes de la plataforma de transporte escolar Nexus Go.'), component: () => <AdminDirectory section="ajustes" /> });
