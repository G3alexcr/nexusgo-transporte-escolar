import { createFileRoute, Navigate } from '@tanstack/react-router';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/admin/')({ head: () => pageHead('Administración', 'Administración de flota de busetas Nexus Go.'), component: () => <Navigate to="/admin/dashboard" /> });
