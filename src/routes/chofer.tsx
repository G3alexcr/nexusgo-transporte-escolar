import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  createRouteGpsLog,
  haversineMeters,
  updateRouteGpsLogPoints,
  type GpsRoutePoint,
} from '@/lib/route-gps-logs';
import {
  Bell,
  Home,
  Route as RouteIcon,
  Play,
  ArrowLeft,
  Check,
  Bus,
  Clock,
  UserRound,
  Wallet,
  AlertTriangle,
  ShieldAlert,
  QrCode,
  CheckCircle2,
  Users,
  MapPin,
  Calendar as CalendarIcon,
  Phone,
  Radio,
  ClipboardCheck,
  ShieldCheck,
  Printer,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DriverQrScannerModal } from '@/components/linkbus/qr-checkin';
import { NotificationBellButton, NotificationModal } from '@/components/linkbus/notification-center';
import { TopBar, Badge } from '@/components/linkbus/shared';
import { MobileMenuButton, RoleSidebar } from '@/components/linkbus/role-sidebar';
import { InstallAppButton } from '@/components/linkbus/install-app-button';
import { AuthGuard } from '@/components/linkbus/auth-guard';
import { FleetMap } from '@/components/linkbus/fleet-map';
import { usePlatform } from '@/components/linkbus/platform-provider';
import { Button } from '@/components/ui/button';
import { pageHead } from '@/lib/page-head';
import { canManageCollections } from '@/lib/platform-state';
import { DriverProfile, DriverCollections } from '@/components/linkbus/driver-tools';
import { DriverAttendance } from '@/components/linkbus/driver-attendance';
import { playNotificationSound } from '@/lib/sound-effects';
import { PreOpChecklistModal, PreOpCertificateViewerModal } from '@/components/linkbus/pre-op-checklist-modal';
import { ManifiestoPasajerosModal } from '@/components/linkbus/manifiesto-pasajeros-modal';
import { OfflineBanner } from '@/components/linkbus/offline-banner';
import { useDriverGpsBroadcast, type GpsBroadcastStatus } from '@/lib/realtime-telemetry';

export const Route = createFileRoute('/chofer')({
  head: () => pageHead('Consola Chofer', 'Perfil operativo, ruta en vivo, asistencia y gestión móvil de mensualidades.'),
  component: () => (
    <AuthGuard allowedRoles={['chofer', 'asistente', 'admin', 'superadmin']}>
      <Driver />
    </AuthGuard>
  ),
});

const DRIVER_AVATARS: Record<string, string> = {
  c1: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  c2: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
  c3: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  c4: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
  c5: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
};

function Driver() {
  const { state, dispatch } = usePlatform();
  const [tab, setTab] = useState<'inicio' | 'rutas' | 'avisos' | 'perfil' | 'agenda'>('inicio');
  const [routeOpen, setRouteOpen] = useState(state.active);
  const [sosOpen, setSosOpen] = useState(false);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [driverSelectOpen, setDriverSelectOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [preOpModalOpen, setPreOpModalOpen] = useState(false);
  const [preOpViewerOpen, setPreOpViewerOpen] = useState(false);
  const [manifiestoOpen, setManifiestoOpen] = useState(false);
  const [pendingRouteToStart, setPendingRouteToStart] = useState<string | null>(null);

  const activeDriver = state.choferes.find((c) => c.id === state.selectedDriverId) || state.choferes[0];
  const van = state.vans.find((v) => v.patente === activeDriver?.buseta || v.chofer === activeDriver?.nombre) || state.vans[0];
  const driverAvatar = (activeDriver && DRIVER_AVATARS[activeDriver.id]) || DRIVER_AVATARS['c1'];
  const vanInspection = van ? state.inspections[van.patente] : undefined;

  const gpsLogIdRef = useRef<string | null>(null);
  const gpsPointsRef = useRef<GpsRoutePoint[]>([]);
  const lastGpsFlushRef = useRef<number>(0);

  useEffect(() => {
    if (state.active && state.recordGpsRoutes && !gpsLogIdRef.current && van) {
      gpsPointsRef.current = [];
      lastGpsFlushRef.current = Date.now();
      void createRouteGpsLog({
        tenantId: state.currentTenantId,
        vanId: van.id,
        vanPatente: van.patente,
        routeName: state.routeName || van.ruta || 'Recorrido escolar',
        driverName: activeDriver?.nombre || van.chofer,
      }).then((id) => {
        if (id) gpsLogIdRef.current = id;
      });
    } else if ((!state.active || !state.recordGpsRoutes) && gpsLogIdRef.current) {
      const closingId = gpsLogIdRef.current;
      const finalPoints = [...gpsPointsRef.current];
      gpsLogIdRef.current = null;
      gpsPointsRef.current = [];
      void updateRouteGpsLogPoints(closingId, finalPoints, new Date().toISOString());
    }
  }, [state.active, state.recordGpsRoutes, state.currentTenantId, state.routeName, van, activeDriver?.nombre]);

  const { status: gpsStatus } = useDriverGpsBroadcast({
    enabled: state.active,
    tenantId: state.currentTenantId,
    vanId: van?.id,
    onLocalLocation: (lat, lng) => {
      if (van?.id) {
        dispatch({ type: 'updateVanLocation', vanId: van.id, lat, lng });
      }
      if (state.active && state.recordGpsRoutes && gpsLogIdRef.current) {
        const pts = gpsPointsRef.current;
        const last = pts[pts.length - 1];
        if (!last || haversineMeters(last.lat, last.lng, lat, lng) >= 15) {
          pts.push({ lat, lng, t: new Date().toISOString() });
        }
        const now = Date.now();
        if (now - lastGpsFlushRef.current >= 15000) {
          lastGpsFlushRef.current = now;
          void updateRouteGpsLogPoints(gpsLogIdRef.current, [...pts]);
        }
      }
    },
  });

  const gpsBadgeMap: Record<GpsBroadcastStatus, { label: string; tone: 'ok' | 'warn' | 'info' | 'bad' }> = {
    idle: { label: 'GPS en espera', tone: 'info' },
    acquiring: { label: 'Buscando señal GPS...', tone: 'warn' },
    active: { label: 'GPS en vivo', tone: 'ok' },
    denied: { label: 'Permiso GPS denegado', tone: 'bad' },
    unsupported: { label: 'GPS no soportado', tone: 'bad' },
    error: { label: 'Error de señal GPS', tone: 'bad' },
  };
  const gpsBadge = gpsBadgeMap[gpsStatus];

  const handleStartRouteAttempt = (name: string) => {
    if (!vanInspection) {
      setPendingRouteToStart(name);
      setPreOpModalOpen(true);
    } else {
      start(name);
    }
  };

  const driverRoutes = [
    {
      name: `Mañana · ${van?.colegio || 'Colegio'}`,
      hour: van?.horario?.split('/')[0]?.trim() || '06:30',
      desc: `Recogida: ${van?.ruta || 'Ruta matutina escolar'}`,
    },
    {
      name: `Vuelta a Casa · ${van?.colegio || 'Colegio'}`,
      hour: van?.horario?.split('/')[1]?.trim() || '14:30',
      desc: `Regreso de estudiantes a sus hogares`,
    },
  ];

  const notice = (message: string) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    dispatch({ type: 'notice', message, time: timeStr });

    if (message.includes('aproximándose')) {
      playNotificationSound('bus_approach');
    } else {
      playNotificationSound('push');
    }

    toast.success('Aviso enviado a los encargados', { description: message });
  };

  const handleReportSos = (incidentText: string) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    dispatch({ type: 'notice', message: incidentText, time: timeStr });

    playNotificationSound('sos_alert');

    toast.error(`Alerta emitida: ${incidentText}`, { description: 'Notificación enviada a familias y administración' });
    setSosOpen(false);
  };

  const start = (name: string) => {
    dispatch({ type: 'start', name });
    setRouteOpen(true);
    setTab('inicio');
    toast.success(`${name} iniciada`);
  };

  const navItems = [
    { key: 'inicio', label: 'Ruta & Asistencia', shortLabel: 'Ruta', icon: Home },
    { key: 'rutas', label: 'Rutas Asignadas', shortLabel: 'Rutas', icon: RouteIcon },
    { key: 'avisos', label: 'Avisos Rápidos', shortLabel: 'Avisos', icon: Bell, count: state.notices.length },
    { key: 'perfil', label: 'Perfil Conductor', shortLabel: 'Perfil', icon: UserRound },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20 lg:pb-12">
      <TopBar />

      <div className="mx-auto flex max-w-[1600px]">
        <RoleSidebar
          company={state.company}
          logoUrl={state.tenants.find((t) => t.id === state.currentTenantId)?.logoUrl}
          roleLabel="Consola Chofer"
          sectionTitle="OPERACIÓN EN RUTA"
          items={navItems}
          activeKey={tab}
          onSelect={(k) => setTab(k as typeof tab)}
          userName={activeDriver?.nombre || 'Conductor'}
          userSubtitle={`Buseta ${van?.patente || '—'}`}
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />

      <main className="min-w-0 flex-1 px-3 sm:px-6 lg:px-8 py-5">
        {/* Top Header / Context Banner */}
        <div className="mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
          <div>
            <div className="flex items-center gap-2">
              <MobileMenuButton onClick={() => setMobileMenuOpen(true)} className="lg:hidden" />
              {state.tenants.find((t) => t.id === state.currentTenantId)?.logoUrl && (
                <img
                  src={state.tenants.find((t) => t.id === state.currentTenantId)?.logoUrl}
                  alt={state.company}
                  className="h-6 w-auto rounded-md object-contain"
                />
              )}
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {state.company} · Consola del Conductor
              </p>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground mt-1">
              Hola, {activeDriver?.nombre?.split(' ')[0]} 👋
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Conductor Titular: <b className="text-foreground">{activeDriver?.nombre}</b> · Buseta{' '}
              <b className="font-mono text-amber-600 dark:text-amber-400">{van?.patente}</b> ({van?.colegio}) · Licencia {activeDriver?.licenciaTipo || 'C-2 Profesional'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="lg:hidden"><InstallAppButton compact /></span>
            <NotificationBellButton onClick={() => setNotifOpen(true)} />

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setQrScannerOpen(true)}
              className="gap-1.5 font-bold text-xs rounded-xl border-amber-400/60 bg-amber-400/10 hover:bg-amber-400 hover:text-slate-950 cursor-pointer shadow-xs"
            >
              <QrCode className="h-4 w-4 text-amber-500" />
              <span>Escanear QR</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setManifiestoOpen(true)}
              className="gap-1.5 font-bold text-xs rounded-xl border-amber-400/60 bg-amber-400/10 hover:bg-amber-400 hover:text-slate-950 text-slate-900 dark:text-amber-100 cursor-pointer shadow-xs"
              title="Manifiesto oficial de pasajeros para retenes de Tránsito"
            >
              <Printer className="h-4 w-4 text-amber-500" />
              <span>Manifiesto CTP (Tránsito)</span>
            </Button>

            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setSosOpen(true)}
              className="gap-1.5 font-bold text-xs rounded-xl cursor-pointer shadow-xs"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Reportar SOS</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDriverSelectOpen(true)}
              className="gap-1.5 font-bold text-xs rounded-xl border-border hover:bg-muted cursor-pointer"
            >
              <Users className="h-4 w-4 text-slate-500" />
              <span>Chofer: {activeDriver?.nombre.split(' ')[0]} ▾</span>
            </Button>
          </div>
        </div>

        {/* Offline Mode Banner & Connectivity Controller */}
        <div className="mb-4">
          <OfflineBanner />
        </div>

        {/* TAB 1: RUTA EN VIVO & LISTA DE ASISTENCIA */}
        {tab === 'inicio' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Map, Route Controls & Broadcast actions (5 cols on desktop) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Route status banner */}
              <div className="rounded-2xl border bg-card p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-amber-400/20 text-amber-600">
                      <Bus className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-extrabold text-foreground">
                        {state.active ? state.routeName : `Ruta ${van?.colegio}`}
                      </h3>
                      <p className="text-xs text-muted-foreground font-mono">Buseta {van?.patente} · {van?.horario}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    <Badge tone={gpsBadge.tone}>
                      <Radio className="h-3 w-3 mr-1 inline" />
                      {gpsBadge.label}
                    </Badge>
                    <Badge tone={state.active ? 'warn' : 'info'}>
                      {state.active ? '● En Ruta' : 'Detenida'}
                    </Badge>
                  </div>
                </div>

                {/* Pre-Op CTP Inspection Status Box */}
                {vanInspection ? (
                  <div className="rounded-xl border border-emerald-500/40 bg-emerald-50/70 dark:bg-emerald-950/30 p-2.5 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-extrabold text-foreground text-[11px] truncate">
                          Inspección CTP Al Día ({vanInspection.fechaHora.split(',')[1]?.trim() || '06:15 AM'})
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono truncate">
                          Folio: {vanInspection.folioDigital} · 6/6 Conforme
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setPreOpViewerOpen(true)}
                        className="h-7 px-2 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg cursor-pointer"
                      >
                        Ver Constancia
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setPendingRouteToStart(null);
                          setPreOpModalOpen(true);
                        }}
                        className="h-7 px-2 text-[10px] font-semibold rounded-lg cursor-pointer"
                        title="Volver a inspeccionar la buseta"
                      >
                        Repetir
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-amber-400/60 bg-amber-50/80 dark:bg-amber-950/30 p-2.5 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <ClipboardCheck className="h-4 w-4 text-amber-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-extrabold text-amber-950 dark:text-amber-200 text-[11px] truncate">
                          Inspección Pre-Operativa Pendiente
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          Exigida por CTP antes de iniciar servicio
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setPendingRouteToStart(null);
                        setPreOpModalOpen(true);
                      }}
                      className="h-7 px-2.5 text-[10px] font-black bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-lg cursor-pointer shrink-0"
                    >
                      Hacer (30s)
                    </Button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {state.active ? (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="w-full font-bold text-xs h-10 rounded-xl cursor-pointer"
                      onClick={() => {
                        dispatch({ type: 'finish' });
                        toast.success('Viaje finalizado con éxito');
                      }}
                    >
                      Finalizar Viaje
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full bg-amber-400 text-slate-950 hover:bg-amber-500 font-extrabold text-xs h-10 rounded-xl cursor-pointer"
                      onClick={() => handleStartRouteAttempt(`Mañana · ${van?.colegio || 'Colegio'}`)}
                    >
                      <Play className="h-4 w-4 mr-1.5 fill-current" />
                      Iniciar Recorrido
                    </Button>
                  )}
                </div>
              </div>

              {/* Operational Fleet Map */}
              <div className="rounded-2xl border bg-card p-1 shadow-md overflow-hidden">
                {van && (
                  <FleetMap
                    vans={[van]}
                    selected={van.id}
                    running={state.active}
                    className="h-[320px] sm:h-[380px] w-full rounded-xl"
                  />
                )}
              </div>

              {/* Quick Broadcast Notifications to Parents */}
              <div className="rounded-2xl border bg-card p-4 shadow-sm space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Avisos Automáticos a los Encargados
                </span>

                <Button
                  className="w-full justify-start gap-2.5 text-xs font-bold rounded-xl h-auto min-h-10 py-2.5 px-3.5 text-left whitespace-normal leading-snug cursor-pointer bg-amber-400 text-slate-950 hover:bg-amber-500"
                  onClick={() => notice(`Buseta (${van?.patente}) aproximándose a paradas`)}
                >
                  <Bus className="h-4 w-4 shrink-0" />
                  <span>Aviso: Buseta aproximándose</span>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start gap-2.5 text-xs font-bold rounded-xl h-auto min-h-10 py-2.5 px-3.5 text-left whitespace-normal leading-snug cursor-pointer hover:bg-muted"
                  onClick={() => notice(`Llegada a ${van?.colegio || 'colegio'} confirmada con estudiantes seguros`)}
                >
                  <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span>Confirmar llegada a {van?.colegio?.split(' ')[0]}</span>
                </Button>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setQrScannerOpen(true)}
                    className="gap-1.5 text-xs font-bold rounded-xl h-auto min-h-10 py-2 px-2.5 whitespace-normal text-center leading-tight border-amber-400/50 hover:bg-amber-400/15 cursor-pointer"
                  >
                    <QrCode className="h-4 w-4 shrink-0 text-amber-500" />
                    <span>Escanear QR</span>
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setSosOpen(true)}
                    className="gap-1.5 text-xs font-bold rounded-xl h-auto min-h-10 py-2 px-2.5 whitespace-normal text-center leading-tight cursor-pointer"
                  >
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>Presa / SOS</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Right: Driver Attendance List (7 cols on desktop) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                  <div>
                    <h2 className="text-lg font-black text-foreground">Lista de Asistencia & Abordaje</h2>
                    <p className="text-xs text-muted-foreground">
                      Registro de subida, bajada y navegación directa hacia la parada de cada alumno
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setManifiestoOpen(true)}
                      className="h-8 gap-1.5 text-xs font-bold rounded-xl border-amber-400/60 hover:bg-amber-50 dark:hover:bg-amber-950/40 cursor-pointer"
                      title="Imprimir o ver manifiesto CTP de la ruta para Tránsito"
                    >
                      <Printer className="h-3.5 w-3.5 text-amber-500" />
                      <span>Manifiesto CTP (Retenes)</span>
                    </Button>
                    <Badge tone="warn">
                      {Object.values(state.attendance).filter((a) => a.status === 'A bordo').length} a bordo
                    </Badge>
                  </div>
                </div>

                <DriverAttendance />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RUTAS ASIGNADAS */}
        {tab === 'rutas' && (
          <div className="rounded-2xl border bg-card p-6 shadow-sm max-w-4xl mx-auto space-y-4">
            <div className="border-b pb-3">
              <h2 className="text-xl font-black text-foreground">Rutas Programadas para {activeDriver?.nombre}</h2>
              <p className="text-xs text-muted-foreground">Horarios, recorridos y colegios asignados a la unidad {van?.patente}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {driverRoutes.map((r, i) => (
                <div key={r.name} className="rounded-2xl border bg-card p-5 shadow-xs space-y-3 hover:border-amber-400/50 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400/20 text-amber-600">
                      <RouteIcon className="h-5 w-5" />
                    </span>
                    <Badge tone={i === 0 ? 'warn' : 'info'}>
                      {state.active && state.routeName === r.name ? 'En Ruta Activa' : 'Programada'}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-foreground">{r.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground border-t pt-2.5">
                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                    <span>Horario: <b>{r.hour}</b></span>
                    <span>·</span>
                    <span className="font-mono">{van?.patente}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Button
                      className="bg-amber-400 text-slate-950 hover:bg-amber-500 font-extrabold text-xs h-10 rounded-xl cursor-pointer"
                      onClick={() => handleStartRouteAttempt(r.name)}
                    >
                      <Play className="h-4 w-4 mr-1.5 fill-current" />
                      Iniciar Esta Ruta
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setManifiestoOpen(true)}
                      className="font-bold text-xs h-10 rounded-xl cursor-pointer hover:bg-muted"
                    >
                      <Printer className="h-3.5 w-3.5 mr-1 text-amber-500" />
                      Manifiesto CTP
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: AVISOS RÁPIDOS */}
        {tab === 'avisos' && (
          <div className="rounded-2xl border bg-card p-6 shadow-sm max-w-4xl mx-auto space-y-5">
            <div className="border-b pb-3">
              <h2 className="text-xl font-black text-foreground">Avisos Rápidos a Familias</h2>
              <p className="text-xs text-muted-foreground">
                Envía notificaciones con sonido push en tiempo real a los teléfonos de los encargados de la ruta {van?.colegio}.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                className="h-auto p-4 text-left justify-start flex-col items-start gap-1 rounded-2xl bg-amber-400 text-slate-950 hover:bg-amber-500 cursor-pointer"
                onClick={() => notice(`Buseta (${van?.patente}) aproximándose a paradas`)}
              >
                <div className="flex items-center gap-2 font-black text-sm">
                  <Bus className="h-4 w-4" />
                  <span>Buseta Aproximándose</span>
                </div>
                <span className="text-xs font-medium opacity-85">
                  Alerta a los padres para que los alumnos salgan a la acera.
                </span>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 text-left justify-start flex-col items-start gap-1 rounded-2xl cursor-pointer hover:bg-muted"
                onClick={() => notice(`Llegada a ${van?.colegio || 'colegio'} confirmada con todos a salvo`)}
              >
                <div className="flex items-center gap-2 font-black text-sm text-emerald-600 dark:text-emerald-400">
                  <Check className="h-4 w-4" />
                  <span>Llegada a Colegio Confirmada</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Tranquiliza a las familias de que los alumnos ya están en la institución.
                </span>
              </Button>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-extrabold text-foreground mb-3">Historial de Avisos Emitidos Hoy</h3>
              {state.notices.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">Sin avisos enviados durante esta jornada.</p>
              ) : (
                <div className="space-y-2">
                  {state.notices.map((n) => (
                    <div key={n.id} className="rounded-xl border p-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono text-muted-foreground mr-2">{n.time}</span>
                        <span className="font-bold text-foreground">{n.message}</span>
                      </div>
                      <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-[11px] shrink-0">
                        Entregado
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: PERFIL & AGENDA */}
        {tab === 'perfil' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <DriverProfile
              onAgenda={() => setTab('agenda')}
            />
          </div>
        )}

        {tab === 'agenda' && (
          <div className="max-w-4xl mx-auto rounded-2xl border bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="text-xl font-black text-foreground">Agenda de Inasistencias</h2>
                <p className="text-xs text-muted-foreground">Avisos notificados por los encargados para la ruta {van?.colegio}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setTab('perfil')} className="cursor-pointer text-xs">
                Volver al Perfil
              </Button>
            </div>

            {Object.keys(state.absences).length === 0 ? (
              <p className="text-xs text-muted-foreground py-8 text-center">No hay ausencias programadas para hoy.</p>
            ) : (
              <div className="divide-y">
                {Object.entries(state.absences).sort().map(([date, mode]) => (
                  <div key={date} className="flex items-center justify-between py-3.5 text-xs">
                    <div>
                      <p className="font-bold text-sm text-foreground">{date.split('-').reverse().join('/')}</p>
                      <p className="text-muted-foreground">Estudiante: Sofía Rojas Gómez (Lincoln School)</p>
                    </div>
                    <Badge tone={mode === 'No va hoy' ? 'bad' : 'warn'}>{mode}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      </div>

      {/* Mobile Sticky Bottom Nav Bar (visible on small screens) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 grid grid-cols-4 border-t bg-card/95 backdrop-blur-md px-1 py-2 shadow-lg">
        {navItems.map((item) => {
          const active = tab === item.key;
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key as typeof tab)}
              className={`flex min-w-0 w-full flex-col items-center justify-center gap-0.5 px-0.5 py-1 text-[10px] font-bold transition-all cursor-pointer ${
                active ? 'text-amber-500' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className={`grid h-7 w-10 place-items-center rounded-full transition-all ${active ? 'bg-amber-400 text-slate-950 font-bold' : ''}`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="w-full truncate text-center">{item.shortLabel}</span>
            </button>
          );
        })}
      </nav>

      {/* Driver Selector Dialog */}
      <Dialog open={driverSelectOpen} onOpenChange={setDriverSelectOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-500" />
              Seleccionar Conductor (Usuario Real)
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            Escoge cualquiera de los conductores registrados en el sistema para operar con sus datos, buseta y alumnos asignados:
          </p>
          <div className="space-y-2 py-2 max-h-[60vh] overflow-y-auto pr-1">
            {state.choferes.map((c) => {
              const isSelected = c.id === activeDriver?.id;
              const cVan = state.vans.find((v) => v.patente === c.buseta || v.chofer === c.nombre);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    dispatch({ type: 'selectDriver', driverId: c.id });
                    setDriverSelectOpen(false);
                    toast.success(`Cambiado a conductor: ${c.nombre}`);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-amber-400 bg-amber-400/10 ring-2 ring-amber-400/60 shadow-xs'
                      : 'border-border/70 hover:bg-muted/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={DRIVER_AVATARS[c.id] || DRIVER_AVATARS['c1']}
                      alt={c.nombre}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-border shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{c.nombre}</p>
                      <p className="text-[11px] text-muted-foreground font-mono truncate">
                        Buseta {c.buseta} · {cVan?.colegio || 'Costa Rica'}
                      </p>
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold truncate">
                        {c.licenciaTipo || 'C-2 Profesional'} · Tel: {c.telefono}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="h-5 w-5 text-amber-500 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* SOS Alert Modal */}
      <Dialog open={sosOpen} onOpenChange={setSosOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <ShieldAlert className="h-5 w-5" />
              Reportar Incidente / Alerta SOS
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            Selecciona el tipo de evento para alertar inmediatamente a los padres de familia y a la administración escolar:
          </p>
          <div className="space-y-2 py-2">
            {[
              { label: '🚗 Presa / Tráfico pesado (+15 min retraso)', text: '⚠️ Retraso de 15 min por congestión vehicular severa en la ruta' },
              { label: '🔧 Avería mecánica en la buseta', text: '🔧 Buseta detenida por falla mecánica / cambio de llanta. Asistencia en camino.' },
              { label: '🌧️ Vía cerrada o clima adverso', text: '🌧️ Vía principal cerrada. Tomando desvío seguro por ruta alterna.' },
              { label: '🚨 Emergencia médica urgente', text: '🚨 Emergencia médica reportada en la buseta. Se activaron protocolos de atención.' },
            ].map((inc) => (
              <Button
                key={inc.label}
                variant="outline"
                className="h-auto w-full justify-start whitespace-normal py-3 text-left text-xs font-bold hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40 cursor-pointer"
                onClick={() => handleReportSos(inc.text)}
              >
                {inc.label}
              </Button>
            ))}
          </div>
          <Button variant="ghost" className="w-full text-xs cursor-pointer" onClick={() => setSosOpen(false)}>
            Cancelar
          </Button>
        </DialogContent>
      </Dialog>

      <DriverQrScannerModal open={qrScannerOpen} onOpenChange={setQrScannerOpen} />
      <NotificationModal open={notifOpen} onOpenChange={setNotifOpen} />

      {/* CTP Pre-Operational Inspection Modals */}
      {van && (
        <>
          <PreOpChecklistModal
            open={preOpModalOpen}
            onOpenChange={setPreOpModalOpen}
            van={van}
            driverName={activeDriver?.nombre}
            routeName={pendingRouteToStart || `Mañana · ${van?.colegio || 'Colegio'}`}
            existingInspection={vanInspection}
            onComplete={(inspection) => {
              const routeToStart = pendingRouteToStart;
              dispatch({
                type: 'savePreOpInspection',
                inspection,
                startRoute: !!routeToStart,
                routeName: routeToStart || undefined,
              });
              setPendingRouteToStart(null);
            }}
          />

          {vanInspection && (
            <PreOpCertificateViewerModal
              open={preOpViewerOpen}
              onOpenChange={setPreOpViewerOpen}
              inspection={vanInspection}
              van={van}
            />
          )}

          <ManifiestoPasajerosModal
            open={manifiestoOpen}
            onOpenChange={setManifiestoOpen}
            van={van}
          />
        </>
      )}
    </div>
  );
}
