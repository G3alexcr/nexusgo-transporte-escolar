import { createFileRoute } from '@tanstack/react-router';
import { AdminDirectory } from '@/components/linkbus/admin-directory';
import { pageHead } from '@/lib/page-head';

export const Route = createFileRoute('/admin/busetas')({
  head: () =>
    pageHead(
      'Busetas y Flota Escolar · Requisitos CTP & ARESEP',
      'Padrón vehicular oficial de busetas escolares: Permisos CTP, revisión Dekra, pólizas INS y equipamiento normativo.'
    ),
  component: () => <AdminDirectory section="busetas" />,
});
