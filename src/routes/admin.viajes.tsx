import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { PageTitle, TransferButton } from '@/components/linkbus/admin-shell';
import { usePlatform } from '@/components/linkbus/platform-provider';
import { Badge } from '@/components/linkbus/shared';
import { Button } from '@/components/ui/button';
import { pageHead } from '@/lib/page-head';
import { Download, FileText, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { JuntaReportModal } from '@/components/linkbus/junta-report-modal';
import { ManifiestoPasajerosModal } from '@/components/linkbus/manifiesto-pasajeros-modal';

export const Route = createFileRoute('/admin/viajes')({
  validateSearch: (s: Record<string, unknown>) => ({ viaje: typeof s['viaje'] === 'string' ? s['viaje'] : 'v1' }),
  head: () => pageHead('Viajes e historial', 'Detalle de estudiantes, subida, bajada y estados de los viajes.'),
  component: Trips,
});

function Trips() {
  const { state } = usePlatform();
  const { viaje } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [reportOpen, setReportOpen] = useState(false);
  const [manifiestoOpen, setManifiestoOpen] = useState(false);
  const van = state.vans.find((v) => v.id === viaje) ?? state.vans[0];
  const students = state.alumnos && state.alumnos.length > 0 ? state.alumnos : [];

  const handleExportTrip = () => {
    const headers = ['Estudiante', 'Grado', 'Colegio', 'Hora Subida', 'Hora Bajada', 'Estado'];
    const rows = students.map((a) => {
      const row = state.attendance[a.id];
      const status = row?.status || 'Pendiente';
      return [a.nombre, a.curso, a.colegio, row?.subida || '—', row?.bajada || '—', status];
    });

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join(
        '\n'
      );
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `asistencia_viaje_${van?.patente || 'buseta'}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Reporte de asistencia del viaje descargado');
  };

  return (
    <>
      <PageTitle title="Viajes / Historial" subtitle="Registro de recorridos, paradas y asistencia de estudiantes en Costa Rica">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setManifiestoOpen(true)}
            className="gap-1.5 font-bold text-xs border-amber-400/80 bg-amber-50/60 dark:bg-amber-950/20 text-slate-900 dark:text-amber-200 hover:bg-amber-100 cursor-pointer shadow-xs"
            title="Lista oficial de pasajeros para retenes de Tránsito"
          >
            <Printer className="h-3.5 w-3.5 text-amber-500" />
            <span>Manifiesto CTP (Retenes)</span>
          </Button>
          <Button size="sm" onClick={() => setReportOpen(true)} className="gap-1.5 font-bold text-xs bg-amber-400 text-slate-950 hover:bg-amber-500 shadow-sm cursor-pointer">
            <FileText className="h-3.5 w-3.5" />
            <span>Acta Oficial / PDF</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportTrip} className="gap-1 font-semibold text-xs cursor-pointer">
            <Download className="h-3.5 w-3.5" />
            <span>Exportar CSV</span>
          </Button>
          <TransferButton />
        </div>
      </PageTitle>

      <div className="mb-6 flex flex-wrap gap-2">
        {state.vans.map((v) => (
          <Button key={v.id} variant={v.id === viaje ? 'default' : 'outline'} onClick={() => navigate({ search: { viaje: v.id } })}>
            {v.patente} · {v.ruta.split('→')[0]}
          </Button>
        ))}
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold">{van?.ruta}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Chofer: <b className="text-foreground">{van?.chofer}</b> · Buseta: <b className="font-mono text-foreground">{van?.patente}</b> · Horario: {van?.horario || '06:30 / 14:30'}
          </p>
        </div>
        <Badge tone={van?.estado === 'En ruta' ? 'ok' : 'warn'}>{van?.estado || 'En ruta'}</Badge>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-muted text-xs text-muted-foreground font-bold">
            <tr>
              {['Estudiante', 'Colegio', 'Hora de Subida', 'Hora de Bajada', 'Estado'].map((h) => (
                <th key={h} className="px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {students.map((a) => {
              const row = state.attendance[a.id];
              const status = row?.status === 'A bordo' || row?.status === 'Pendiente' ? 'En Ruta' : row?.status ?? 'En Ruta';
              return (
                <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3.5 font-bold">
                    {a.nombre}
                    <p className="mt-0.5 text-xs font-normal text-muted-foreground">{a.curso}</p>
                  </td>
                  <td className="px-4 py-3.5">{a.colegio}</td>
                  <td className="px-4 py-3.5 font-mono text-xs">{row?.subida ?? '—'}</td>
                  <td className="px-4 py-3.5 font-mono text-xs">{row?.bajada ?? '—'}</td>
                  <td className="px-4 py-3.5">
                    <Badge tone={status === 'Ausente' ? 'bad' : status === 'Entregado' ? 'ok' : 'warn'}>{status}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 mt-9 text-xl font-extrabold">Viajes anteriores</h2>
      <div className="divide-y rounded-xl border bg-card shadow-sm">
        {state.viajes.filter((v) => v.estado === 'Finalizado').map((v) => (
          <div key={v.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
            <div>
              <p className="font-bold text-foreground">{v.ruta}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {v.fecha} · Buseta: {v.patente} · {v.inicio} – {v.fin} ({v.desvio})
              </p>
            </div>
            <Badge tone="ok">Finalizado</Badge>
          </div>
        ))}
      </div>

      <JuntaReportModal open={reportOpen} onOpenChange={setReportOpen} defaultColegio={van?.colegio} />
      <ManifiestoPasajerosModal open={manifiestoOpen} onOpenChange={setManifiestoOpen} van={van} customAlumnos={students} />
    </>
  );
}
