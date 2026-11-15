import { createFileRoute } from '@tanstack/react-router';
import { AdminDirectory } from '@/components/linkbus/admin-directory';
import { pageHead } from '@/lib/page-head';

export const Route = createFileRoute('/admin/alumnos')({
  head: () =>
    pageHead(
      'Estudiantes y Contratos CTP',
      'Padrón de estudiantes, verificación de contratos legales CTP y control de apoderados.'
    ),
  component: () => <AdminDirectory section="alumnos" />,
});
