import { createFileRoute } from '@tanstack/react-router';
import { AdminUsuarios } from '@/components/linkbus/admin-usuarios';
import { pageHead } from '@/lib/page-head';

export const Route = createFileRoute('/admin/usuarios')({
  head: () => pageHead('Usuarios y Roles', 'Registro de usuarios y asignación de roles por transportista.'),
  component: AdminUsuarios,
});
