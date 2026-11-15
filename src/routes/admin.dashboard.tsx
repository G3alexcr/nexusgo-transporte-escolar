import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Bus, Users, School, ArrowUpRight, Radio, ShieldAlert, FileText } from 'lucide-react';
import { FleetMap } from '@/components/linkbus/fleet-map';
import { PageTitle, TransferButton } from '@/components/linkbus/admin-shell';
import { Badge, Occupancy } from '@/components/linkbus/shared';
import { usePlatform } from '@/components/linkbus/platform-provider';
import { Button } from '@/components/ui/button';
import { pageHead } from '@/lib/page-head';
import { ExpirationAlertsWidget } from '@/components/linkbus/expiration-alerts-widget';
import { JuntaReportModal } from '@/components/linkbus/junta-report-modal';

export const Route = createFileRoute('/admin/dashboard')({
  head: () => pageHead('Mapa de Flota & Alertas CTP', 'Monitoreo interactivo de flota, alertas tempranas de vencimiento y ocupación.'),
  component: Dashboard,
});

function Dashboard() {
  const { state } = usePlatform();
  const [selected, setSelected] = useState('v1');
  const [juntaReportOpen, setJuntaReportOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageTitle title="Panel de Control y Mapa de Flota" subtitle="Fiscalización en tiempo real · Jornada de Transporte Escolar">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            onClick={() => setJuntaReportOpen(true)}
            className="bg-amber-400 font-bold text-slate-950 hover:bg-amber-500 text-xs gap-1.5 shadow-xs cursor-pointer"
          >
            <FileText className="h-4 w-4 text-slate-950" />
            <span>Informe Junta Educación / MEP</span>
          </Button>
          <TransferButton />
        </div>
      </PageTitle>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 gap-4 border-y py-4 lg:grid-cols-4">
        {[
          { label: 'Busetas en ruta', value: state.vans.filter(v => v.estado === 'En ruta').length, icon: Bus },
          { label: 'Estudiantes a bordo', value: state.vans.reduce((s, v) => s + v.aBordo, 0), icon: Users },
          { label: 'Colegios afiliados', value: state.colegios.length, icon: School },
          { label: 'Viajes activos hoy', value: state.vans.length, icon: Radio },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold/25 text-slate-900 dark:text-amber-300">
              <s.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
              <p className="font-display text-2xl font-extrabold">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ⚠️ Semáforo Preventivo de Vencimientos CTP / Dekra / INS */}
      <ExpirationAlertsWidget />

      {/* Live Fleet Operation & Map */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="font-bold text-base text-foreground">Operación de Flota en Vivo</h2>
          </div>
          <Badge tone="ok">● {state.vans.filter(v => v.estado === 'En ruta').length} busetas en movimiento</Badge>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <FleetMap vans={state.vans} selected={selected} onSelect={setSelected} className="h-[430px] rounded-2xl border sm:h-[550px]" />
          <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
            {state.vans.map((v) => (
              <div
                key={v.id}
                className={`rounded-2xl border bg-card p-4 shadow-xs transition-all ${
                  selected === v.id ? 'border-amber-400 ring-2 ring-amber-400/20' : 'hover:border-border/80'
                }`}
              >
                <Button
                  variant="ghost"
                  className="h-auto w-full justify-between p-0 hover:bg-transparent cursor-pointer"
                  onClick={() => setSelected(v.id)}
                >
                  <span className="flex items-center gap-2 font-black font-mono text-sm">
                    <Bus className="h-4 w-4 text-amber-500" />
                    {v.patente}
                  </span>
                  <Badge tone={v.estado === 'En ruta' ? 'ok' : 'warn'}>{v.estado}</Badge>
                </Button>
                <p className="mt-2.5 text-xs font-bold text-foreground">{v.chofer}</p>
                <p className="text-[11px] leading-tight text-muted-foreground truncate">{v.marcaModelo || 'Toyota Coaster'} · {v.colegio}</p>
                <p className="mb-3 mt-1 text-xs leading-5 text-muted-foreground">{v.ruta}</p>
                <Occupancy n={v.aBordo} cap={v.cap} />
                <Button asChild variant="link" className="mt-2 h-7 px-0 text-xs font-bold">
                  <Link to="/admin/viajes" search={{ viaje: v.id }}>
                    Ver detalle del viaje <ArrowUpRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <JuntaReportModal
        open={juntaReportOpen}
        onOpenChange={setJuntaReportOpen}
      />
    </div>
  );
}
