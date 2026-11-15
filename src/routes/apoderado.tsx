import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';
import { es } from 'date-fns/locale';
import {
  CalendarX,
  CreditCard,
  Map,
  Bell,
  Trash2,
  Bus,
  MessageCircle,
  Phone,
  QrCode,
  UserCheck,
  ShieldCheck,
  Plus,
  User,
  Users,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar as CalendarIcon,
  AlertCircle,
  Download,
  Share2,
  Eye,
  Receipt,
  FileText,
} from 'lucide-react';
import { StudentCardModal } from '@/components/linkbus/qr-checkin';
import { NotificationBellButton, NotificationModal } from '@/components/linkbus/notification-center';
import { ParentProfileView } from '@/components/linkbus/parent-profile';
import { AuthorizedPickupModal } from '@/components/linkbus/authorized-pickup-modal';
import { BusetaFichaModal } from '@/components/linkbus/buseta-ficha-modal';
import { LiveEtaWidget } from '@/components/linkbus/live-eta';
import { ReportarSinpeModal, SinpeComprobanteModal } from '@/components/linkbus/sinpe-modal';
import { ContratoTransporteModal } from '@/components/linkbus/contrato-modal';
import { TopBar, Badge } from '@/components/linkbus/shared';
import { MobileMenuButton, RoleSidebar } from '@/components/linkbus/role-sidebar';
import { InstallAppButton } from '@/components/linkbus/install-app-button';
import { AuthGuard } from '@/components/linkbus/auth-guard';
import { FleetMap } from '@/components/linkbus/fleet-map';
import { usePlatform } from '@/components/linkbus/platform-provider';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from '@/components/ui/dialog';
import { clp } from '@/lib/data';
import { pageHead } from '@/lib/page-head';
import type { AbsenceMode } from '@/lib/platform-state';
import { playNotificationSound } from '@/lib/sound-effects';

export const Route = createFileRoute('/apoderado')({
  head: () => pageHead('Portal Apoderado', 'Seguimiento en vivo de la buseta, control de asistencia, mensualidades y expedientes de seguridad.'),
  component: () => (
    <AuthGuard allowedRoles={['apoderado', 'admin', 'superadmin']}>
      <Parent />
    </AuthGuard>
  ),
});

const PARENT_AVATARS: Record<string, string> = {
  a1: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
  a2: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
  a3: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  a4: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  a5: 'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=200&q=80',
  a6: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
};

function Parent() {
  const { state, dispatch } = usePlatform();
  const [tab, setTab] = useState<'mapa' | 'ausencias' | 'pagos' | 'noticias' | 'perfil'>('mapa');
  const [open, setOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [authorizedOpen, setAuthorizedOpen] = useState(false);
  const [fichaModalOpen, setFichaModalOpen] = useState(false);
  const [reportSinpeOpen, setReportSinpeOpen] = useState(false);
  const [viewSinpeOpen, setViewSinpeOpen] = useState(false);
  const [contratoOpen, setContratoOpen] = useState(false);
  const [studentSelectOpen, setStudentSelectOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 9, 18));
  const [mode, setMode] = useState<AbsenceMode>('No va hoy');

  const child = state.alumnos.find((a) => a.id === state.selectedAlumnoId) || state.alumnos[0];
  const van =
    state.vans.find(
      (v) =>
        v.colegio.toLowerCase().includes(child?.colegio?.toLowerCase() || '') ||
        (child?.colegio && child.colegio.toLowerCase().includes(v.colegio.toLowerCase()))
    ) || state.vans[0];

  if (!child || !van) return null;

  const activeParent = child.apoderado || state.parentProfile?.nombre || 'Carla Pérez';
  const parentAvatar = (child && PARENT_AVATARS[child.id]) || PARENT_AVATARS['a1'];

  const attendance = state.attendance[child.id]?.status;
  const status =
    attendance === 'Entregado'
      ? 'Llegado al colegio'
      : state.active && attendance === 'A bordo'
      ? 'A bordo'
      : attendance === 'Ausente'
      ? 'Ausente'
      : 'Buseta en camino';

  const navItems = [
    { key: 'mapa', label: 'Seguimiento en Vivo', shortLabel: 'En Vivo', icon: Map },
    { key: 'ausencias', label: 'Inasistencias & Avisos', shortLabel: 'Avisos', icon: CalendarX },
    { key: 'pagos', label: 'Mensualidades & Recibos', shortLabel: 'Pagos', icon: CreditCard },
    { key: 'noticias', label: 'Novedades', shortLabel: 'Novedades', icon: Bell, count: state.notices.length },
    { key: 'perfil', label: 'Perfil de Familia', shortLabel: 'Perfil', icon: User },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20 lg:pb-12">
      <TopBar />

      <div className="mx-auto flex max-w-[1600px]">
        <RoleSidebar
          company={state.company}
          logoUrl={state.tenants.find((t) => t.id === state.currentTenantId)?.logoUrl}
          roleLabel="Portal Familia"
          sectionTitle="MI TRANSPORTE"
          items={navItems}
          activeKey={tab}
          onSelect={(k) => setTab(k as typeof tab)}
          userName={activeParent}
          userSubtitle={`Estudiante: ${child.nombre.split(' ')[0]}`}
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
                {state.company} · Portal de Familias y Apoderados
              </p>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground mt-1">
              Hola, {activeParent.split(' ')[0]} 👋
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Estudiante: <b className="text-foreground">{child.nombre}</b> ({child.curso}) · {child.colegio} · Parada en {child.direccion}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="lg:hidden"><InstallAppButton compact /></span>
            <NotificationBellButton onClick={() => setNotifOpen(true)} />

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setQrOpen(true)}
              className="gap-1.5 font-bold text-xs rounded-xl border-amber-400/60 bg-amber-400/10 hover:bg-amber-400 hover:text-slate-950 cursor-pointer shadow-xs"
            >
              <QrCode className="h-4 w-4 text-amber-500" />
              <span>Carnet QR de {child.nombre.split(' ')[0]}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setStudentSelectOpen(true)}
              className="gap-1.5 font-bold text-xs rounded-xl border-border hover:bg-muted cursor-pointer"
            >
              <Users className="h-4 w-4 text-slate-500" />
              <span>Estudiante: {child.nombre.split(' ')[0]} ▾</span>
            </Button>
          </div>
        </div>

        {/* TAB 1: SEGUIMIENTO EN VIVO (MAPA) */}
        {tab === 'mapa' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Map & ETA Widget (8 cols on desktop) */}
            <div className="lg:col-span-8 space-y-4">
              {/* Header Status Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border bg-card p-4 shadow-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge tone={attendance === 'Entregado' ? 'ok' : attendance === 'Ausente' ? 'bad' : 'warn'}>
                      ● {status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">Viaje en curso</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-foreground mt-1">
                    {child.nombre} · {child.curso}
                  </h2>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span>Parada / Recogida: <b>{child.direccion}</b> ({child.colegio})</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setOpen(true)}
                    className="gap-1.5 text-xs font-bold rounded-xl border-amber-400/50 hover:bg-amber-50 dark:hover:bg-amber-950/40 cursor-pointer"
                  >
                    <CalendarX className="h-3.5 w-3.5 text-amber-500" />
                    <span>Avisar Inasistencia</span>
                  </Button>
                </div>
              </div>

              {/* Large Live Interactive Map */}
              <div className="rounded-2xl border bg-card p-1 shadow-md overflow-hidden">
                <FleetMap
                  vans={[van]}
                  selected={van.id}
                  running={state.active}
                  className="h-[380px] sm:h-[460px] w-full rounded-xl"
                />
              </div>

              {/* Live ETA Card Widget */}
              <LiveEtaWidget
                status={status}
                driverName={van.chofer}
                vanPlate={van.patente}
                childName={child.nombre}
                stopName={child.direccion}
              />
            </div>

            {/* Right: Driver Card, CTP Dossier & Trust Controls (4 cols on desktop) */}
            <div className="lg:col-span-4 space-y-4">
              {/* Driver & Assigned Van Card */}
              <div className="rounded-2xl border bg-card p-4 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Conductor & Unidad
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                    Licencia C-2 Profesional
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-400 text-slate-950 font-black text-base shadow-sm">
                      {van.chofer.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-card" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-extrabold text-foreground truncate">{van.chofer}</h3>
                    <p className="text-xs font-mono text-muted-foreground truncate">
                      Buseta <b>{van.patente}</b> · {van.marcaModelo || 'Toyota Coaster'}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      Ruta: {van.colegio}
                    </p>
                  </div>
                </div>

                {/* Direct Contact Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button
                    size="sm"
                    onClick={() => {
                      const msg = encodeURIComponent(
                        `Hola Don ${van.chofer.split(' ')[0]}, le saluda ${activeParent} (apoderado/a de ${child.nombre}). Le escribo respecto al recorrido de la buseta ${van.patente}.`
                      );
                      window.open(`https://wa.me/50688412390?text=${msg}`, '_blank');
                    }}
                    className="gap-1.5 rounded-xl bg-emerald-600 font-bold text-xs text-white hover:bg-emerald-700 cursor-pointer shadow-xs"
                    title="Abrir chat de WhatsApp con el conductor"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open('tel:+50688412390')}
                    className="gap-1.5 rounded-xl font-bold text-xs cursor-pointer hover:bg-muted"
                    title="Llamar al chofer"
                  >
                    <Phone className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
                    <span>Llamar</span>
                  </Button>
                </div>

                {/* CTP Security Dossier Action Card */}
                <button
                  type="button"
                  onClick={() => setFichaModalOpen(true)}
                  className="w-full rounded-xl border border-amber-300/80 bg-gradient-to-r from-amber-50/90 to-amber-100/50 dark:from-amber-950/40 dark:to-amber-900/20 p-3 text-left hover:bg-amber-100/80 dark:hover:bg-amber-900/40 transition-all shadow-xs group cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-amber-100 leading-tight">
                          Expediente Oficial de Seguridad CTP
                        </p>
                        <p className="text-[10px] text-muted-foreground leading-tight truncate">
                          Dekra al día, Póliza INS, Marchamo y Licencia C-2
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-200/60 dark:bg-amber-900/60 px-2 py-1 rounded-md shrink-0 group-hover:bg-amber-300 transition-colors">
                      Ver Ficha →
                    </span>
                  </div>
                </button>
              </div>

              {/* Family Quick Actions Card */}
              <div className="rounded-2xl border bg-card p-4 shadow-sm space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Gestión Escolar
                </span>

                <Button
                  variant="outline"
                  onClick={() => setAuthorizedOpen(true)}
                  className="w-full justify-start gap-2.5 text-xs font-bold rounded-xl h-10 cursor-pointer hover:bg-muted"
                >
                  <UserCheck className="h-4 w-4 text-emerald-500" />
                  <span>Personas Autorizadas para Retiro</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setQrOpen(true)}
                  className="w-full justify-start gap-2.5 text-xs font-bold rounded-xl h-10 cursor-pointer hover:bg-muted"
                >
                  <QrCode className="h-4 w-4 text-amber-500" />
                  <span>Carnet Digital QR del Alumno</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setTab('pagos')}
                  className="w-full justify-start gap-2.5 text-xs font-bold rounded-xl h-10 cursor-pointer hover:bg-muted"
                >
                  <CreditCard className="h-4 w-4 text-sky-500" />
                  <span>Estado de Mensualidad ({state.payments[child.id]?.status ?? child.pago})</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setContratoOpen(true)}
                  className="w-full justify-between gap-2.5 text-xs font-bold rounded-xl h-10 cursor-pointer hover:bg-muted"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="h-4 w-4 text-amber-500" />
                    <span>Contrato Escolar CTP</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      state.contracts[child.id]?.signed
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-500/20 text-amber-800 dark:text-amber-300 animate-pulse'
                    }`}
                  >
                    {state.contracts[child.id]?.signed ? '✓ Firmado' : 'Pendiente'}
                  </span>
                </Button>
              </div>

              {/* Driver live notices card */}
              <div className="rounded-2xl border bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between border-b pb-2.5 mb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Avisos en Ruta Hoy
                  </span>
                  <span className="text-[10px] text-muted-foreground">{state.notices.length} avisos</span>
                </div>

                {state.notices.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2 text-center">
                    Sin incidentes reportados en la ruta hoy
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {state.notices.slice(0, 3).map((n) => (
                      <div key={n.id} className="rounded-xl border bg-muted/40 p-2.5 text-xs">
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                          <span className="font-semibold">Chofer: {van.chofer.split(' ')[0]}</span>
                          <span>{n.time}</span>
                        </div>
                        <p className="font-bold text-foreground">{n.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INASISTENCIAS & AVISOS */}
        {tab === 'ausencias' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 rounded-2xl border bg-card p-5 shadow-sm space-y-4">
              <div>
                <h2 className="text-lg font-black text-foreground">Programar Aviso de Inasistencia</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Selecciona la fecha en la que <b>{child.nombre}</b> no requerirá el servicio de buseta. El chofer recibirá la notificación en su lista de asistencia en tiempo real.
                </p>
              </div>

              <div className="flex justify-center p-2 rounded-xl bg-muted/30 border">
                <Calendar
                  locale={es}
                  mode="single"
                  today={new Date(2026, 9, 18)}
                  defaultMonth={new Date(2026, 9, 1)}
                  selected={date}
                  onSelect={setDate}
                  className="mx-auto"
                />
              </div>

              <div>
                <p className="text-xs font-bold text-foreground mb-1.5">Tipo de inasistencia:</p>
                <div className="grid grid-cols-3 gap-2">
                  {(['No va hoy', 'Solo ida', 'Solo vuelta'] as AbsenceMode[]).map((m) => (
                    <Button
                      key={m}
                      variant={mode === m ? 'default' : 'outline'}
                      size="sm"
                      className={`text-xs font-bold rounded-xl cursor-pointer ${
                        mode === m ? 'bg-amber-400 text-slate-950 hover:bg-amber-500' : ''
                      }`}
                      onClick={() => setMode(m)}
                    >
                      {m}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                disabled={!date}
                onClick={() => {
                  if (!date) return;
                  const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                  dispatch({ type: 'absence', date: key, mode });
                  playNotificationSound('absence_alert');
                  dispatch({
                    type: 'addNotification',
                    notification: {
                      id: `abs-${Date.now()}`,
                      title: 'Aviso de Inasistencia Enviado',
                      body: `${child.nombre} registrado como "${mode}" para el ${key}. Chofer notificado.`,
                      time: 'Ahora',
                      type: 'attendance',
                      read: false,
                    },
                  });
                  toast.success('Aviso de inasistencia enviado al chofer');
                }}
                className="w-full bg-amber-400 text-slate-950 hover:bg-amber-500 font-extrabold rounded-xl h-11 cursor-pointer"
              >
                Confirmar y Enviar Aviso al Chofer
              </Button>
            </div>

            <div className="lg:col-span-6 rounded-2xl border bg-card p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h2 className="text-lg font-black text-foreground">Avisos de Inasistencia Registrados</h2>
                  <p className="text-xs text-muted-foreground">Historial y fechas reportadas para {child.nombre}</p>
                </div>
                <Badge tone="info">{Object.keys(state.absences).length} registrados</Badge>
              </div>

              {Object.keys(state.absences).length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  <CalendarX className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="font-bold">No hay inasistencias registradas</p>
                  <p className="text-xs mt-1">El estudiante tiene asistencia normal programada.</p>
                </div>
              ) : (
                <div className="divide-y">
                  {Object.entries(state.absences).sort().map(([d, m]) => (
                    <div key={d} className="flex items-center justify-between gap-3 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400/15 text-amber-600 font-black text-xs">
                          {d.split('-')[2]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">
                            {d.split('-').reverse().join('/')}
                          </p>
                          <Badge tone={m === 'No va hoy' ? 'bad' : 'warn'}>{m}</Badge>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        title="Eliminar aviso"
                        aria-label={`Eliminar aviso ${d}`}
                        onClick={() => {
                          dispatch({ type: 'removeAbsence', date: d });
                          toast.info('Aviso cancelado. El chofer volverá a incluir al alumno.');
                        }}
                        className="cursor-pointer text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: MENSUALIDADES & RECIBOS */}
        {tab === 'pagos' && (() => {
          const paymentInfo = state.payments[child.id];
          const currentStatus = paymentInfo?.status ?? child.pago;
          return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 rounded-2xl border bg-card p-5 shadow-sm space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Mensualidad Actual (Octubre 2026)
                </span>

                <div className="rounded-2xl border p-4 bg-muted/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-foreground">Servicio Transporte Escolar</h3>
                    <Badge tone={currentStatus === 'Pagado' ? 'ok' : currentStatus === 'En Verificación' ? 'warn' : currentStatus === 'Atrasado' ? 'bad' : 'warn'}>
                      {currentStatus}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-3xl font-black text-foreground">₡{child.monto.toLocaleString('es-CR')}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Monto mensual acordado · {child.colegio}</p>
                  </div>

                  <div className="border-t pt-3 space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Estudiante:</span>
                      <b className="text-foreground">{child.nombre}</b>
                    </div>
                    <div className="flex justify-between">
                      <span>Apoderado titular:</span>
                      <b className="text-foreground">{activeParent}</b>
                    </div>
                    <div className="flex justify-between">
                      <span>Buseta asignada:</span>
                      <b className="text-foreground font-mono">{van.patente} ({van.chofer})</b>
                    </div>
                  </div>
                </div>

                {/* Status-Driven SINPE Action Box */}
                {currentStatus === 'En Verificación' ? (
                  <div className="rounded-2xl border border-amber-400/60 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/40 dark:to-amber-900/20 p-4 space-y-3 shadow-xs">
                    <div className="flex items-start gap-3">
                      <span className="grid h-8 w-8 place-items-center rounded-xl bg-amber-400/30 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5">
                        <Clock className="h-4 w-4" />
                      </span>
                      <div className="text-xs">
                        <h4 className="font-black text-amber-950 dark:text-amber-200">
                          Comprobante SINPE en Verificación
                        </h4>
                        <p className="text-muted-foreground mt-0.5 leading-relaxed">
                          Referencia: <b className="font-mono text-foreground">{paymentInfo?.comprobanteRef || 'SINPE-9941203'}</b> ({paymentInfo?.banco || 'Banco'}).
                          El chofer {van.chofer.split(' ')[0]} está validando el depósito en su cuenta.
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setViewSinpeOpen(true)}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs h-10 rounded-xl cursor-pointer gap-2 shadow-sm"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Ver Comprobante Enviado</span>
                    </Button>
                  </div>
                ) : currentStatus === 'Pagado' ? (
                  <div className="rounded-2xl border border-emerald-500/50 bg-gradient-to-br from-emerald-50 to-emerald-100/40 dark:from-emerald-950/40 dark:to-emerald-900/20 p-4 space-y-3 shadow-xs">
                    <div className="flex items-start gap-3">
                      <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                        <CheckCircle2 className="h-4 w-4" />
                      </span>
                      <div className="text-xs">
                        <h4 className="font-black text-emerald-950 dark:text-emerald-200">
                          Mensualidad Pagada y Verificada
                        </h4>
                        <p className="text-muted-foreground mt-0.5 leading-relaxed">
                          Recibo digital oficial: <b className="font-mono text-foreground">#{paymentInfo?.reciboNumero || 'LB-REC-2026-8812'}</b>. Aprobado por {paymentInfo?.aprobadoPor || van.chofer}.
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setViewSinpeOpen(true)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-10 rounded-xl cursor-pointer gap-2 shadow-sm"
                    >
                      <Receipt className="h-4 w-4" />
                      <span>Ver Recibo Digital Oficial</span>
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-50/70 to-emerald-100/30 dark:from-emerald-950/30 dark:to-emerald-900/10 p-4 space-y-3 shadow-xs">
                    <div>
                      <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 dark:text-emerald-300">
                        <CreditCard className="h-4 w-4 text-emerald-600" />
                        Paga en segundos vía SINPE Móvil
                      </span>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Transfiere al número oficial <b>8841-2390</b> a nombre de <b>{van.chofer}</b> y adjunta el comprobante para emitir tu recibo.
                      </p>
                    </div>
                    <Button
                      onClick={() => setReportSinpeOpen(true)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs h-11 rounded-xl cursor-pointer gap-2 shadow-md"
                    >
                      <CreditCard className="h-4 w-4" />
                      <span>Reportar Pago por SINPE Móvil</span>
                    </Button>
                  </div>
                )}

                {/* Payment Instructions SINPE Móvil */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-muted/40 p-3.5 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-foreground font-extrabold">
                    <CreditCard className="h-3.5 w-3.5 text-amber-500" />
                    <span>Datos para SINPE Móvil BCCR</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Número del Chofer: <b>+506 8841-2390</b> · Titular: <b>{van.chofer}</b>.
                  </p>
                  <p className="text-muted-foreground leading-relaxed font-mono text-[11px]">
                    Detalle bancario: <b>{child.nombre.split(' ')[0]} - Octubre</b>
                  </p>
                </div>
              </div>

              <div className="lg:col-span-7 rounded-2xl border bg-card p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h2 className="text-lg font-black text-foreground">Historial de Recibos y Mensualidades</h2>
                    <p className="text-xs text-muted-foreground">Comprobantes digitales y constancias de pago para {child.nombre}</p>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1 text-xs font-bold rounded-xl cursor-pointer">
                    <Download className="h-3.5 w-3.5" />
                    <span>Estado de Cuenta</span>
                  </Button>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      month: 'Octubre 2026',
                      status: currentStatus,
                      amount: child.monto,
                      ref: paymentInfo?.comprobanteRef || 'SINPE-88410-OCT',
                      canView: currentStatus === 'Pagado' || currentStatus === 'En Verificación',
                    },
                    {
                      month: 'Septiembre 2026',
                      status: 'Pagado' as const,
                      amount: child.monto,
                      ref: 'SINPE-77219-SEP',
                      canView: true,
                    },
                    {
                      month: 'Agosto 2026',
                      status: 'Pagado' as const,
                      amount: child.monto,
                      ref: 'SINPE-66102-AGO',
                      canView: true,
                    },
                  ].map((item) => (
                    <div
                      key={item.month}
                      className="rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-amber-400/50 transition-all"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold text-foreground">{item.month}</h4>
                          <Badge tone={item.status === 'Pagado' ? 'ok' : item.status === 'En Verificación' ? 'warn' : item.status === 'Atrasado' ? 'bad' : 'warn'}>
                            {item.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                          Ref: {item.ref} · {item.status === 'Pagado' ? 'Recibo oficial emitido' : item.status === 'En Verificación' ? 'En revisión por chofer' : 'Pendiente de reporte'}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-base font-extrabold text-foreground">₡{item.amount.toLocaleString('es-CR')}</span>
                        {item.canView ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setViewSinpeOpen(true)}
                            className="h-8 gap-1 text-xs font-bold rounded-lg cursor-pointer hover:bg-muted"
                          >
                            <Eye className="h-3.5 w-3.5 text-amber-500" />
                            <span>{item.status === 'Pagado' ? 'Ver Recibo' : 'Ver Comprobante'}</span>
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => setReportSinpeOpen(true)}
                            className="h-8 gap-1 text-xs font-extrabold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                          >
                            <CreditCard className="h-3.5 w-3.5" />
                            <span>Pagar</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {/* TAB 4: NOVEDADES & CIRCULARES */}
        {tab === 'noticias' && (
          <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4 max-w-4xl mx-auto">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-black text-foreground">Novedades y Circulares Escolares</h2>
                <p className="text-xs text-muted-foreground">Comunicados oficiales de tu conductor y de la administración de la buseta</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setNotifOpen(true)}
                className="gap-1.5 font-bold text-xs rounded-xl cursor-pointer"
              >
                <Bell className="h-3.5 w-3.5 text-amber-500" />
                <span>Notificaciones Push ({state.notifications?.length || 0})</span>
              </Button>
            </div>

            {state.notices.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No hay comunicados ni avisos nuevos en este momento.
              </p>
            ) : (
              <div className="space-y-3">
                {state.notices.map((n) => (
                  <div key={n.id} className="rounded-2xl border bg-muted/20 p-4 space-y-1.5 hover:border-amber-400/40 transition-all">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-bold text-amber-600 dark:text-amber-400">Aviso Oficial de la Buseta</span>
                      <span>Hoy · {n.time}</span>
                    </div>
                    <p className="text-sm font-extrabold text-foreground">{n.message}</p>
                    <p className="text-xs text-muted-foreground">Emitido por el conductor: {van.chofer} ({van.patente})</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: PERFIL DEL ESTUDIANTE */}
        {tab === 'perfil' && (
          <div className="max-w-4xl mx-auto">
            <ParentProfileView onOpenQr={() => setQrOpen(true)} onOpenContrato={() => setContratoOpen(true)} />
          </div>
        )}
      </main>
      </div>

      {/* Mobile Sticky Bottom Nav Bar (visible on small screens) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 grid grid-cols-5 border-t bg-card/95 backdrop-blur-md px-1 py-2 shadow-lg">
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

      {/* Student / Family Selector Dialog */}
      <Dialog open={studentSelectOpen} onOpenChange={setStudentSelectOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-500" />
              Seleccionar Familia / Estudiante (Usuario Real)
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            Escoge cualquiera de los estudiantes registrados para probar el portal del apoderado con su ruta, buseta asignada, chofer y estado de mensualidad:
          </p>
          <div className="space-y-2 py-2 max-h-[60vh] overflow-y-auto pr-1">
            {state.alumnos.map((a) => {
              const isSelected = a.id === child.id;
              const aVan = state.vans.find(
                (v) =>
                  v.colegio.toLowerCase().includes(a.colegio.toLowerCase()) ||
                  a.colegio.toLowerCase().includes(v.colegio.toLowerCase())
              );
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => {
                    dispatch({ type: 'selectAlumno', alumnoId: a.id });
                    setStudentSelectOpen(false);
                    toast.success(`Cambiado a estudiante: ${a.nombre}`);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-amber-400 bg-amber-400/10 ring-2 ring-amber-400/60 shadow-xs'
                      : 'border-border/70 hover:bg-muted/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={PARENT_AVATARS[a.id] || PARENT_AVATARS['a1']}
                      alt={a.apoderado}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-border shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{a.nombre}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        Apoderado: <b className="text-foreground">{a.apoderado}</b>
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono truncate">
                        {a.colegio} ({a.curso}) · Buseta {aVan?.patente || 'Costa Rica'}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <Badge tone={a.pago === 'Pagado' ? 'ok' : a.pago === 'Atrasado' ? 'bad' : 'warn'}>
                          {a.pago}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">₡{a.monto.toLocaleString('es-CR')}</span>
                      </div>
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

      {/* Absence modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-sm">
          <DialogTitle>Avisar Inasistencia</DialogTitle>
          <DialogDescription>{child.nombre} · Selecciona la fecha del aviso</DialogDescription>
          <Calendar
            locale={es}
            mode="single"
            today={new Date(2026, 9, 18)}
            defaultMonth={new Date(2026, 9, 1)}
            selected={date}
            onSelect={setDate}
            className="mx-auto"
          />
          <div className="grid grid-cols-3 gap-1">
            {(['No va hoy', 'Solo ida', 'Solo vuelta'] as AbsenceMode[]).map((m) => (
              <Button
                key={m}
                variant={mode === m ? 'default' : 'outline'}
                size="sm"
                className="px-1 text-xs cursor-pointer"
                onClick={() => setMode(m)}
              >
                {m}
              </Button>
            ))}
          </div>
          <Button
            disabled={!date}
            className="cursor-pointer bg-amber-400 text-slate-950 hover:bg-amber-500 font-bold"
            onClick={() => {
              if (!date) return;
              const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
              dispatch({ type: 'absence', date: key, mode });
              playNotificationSound('absence_alert');
              dispatch({
                type: 'addNotification',
                notification: {
                  id: `abs-${Date.now()}`,
                  title: 'Aviso de Inasistencia Enviado',
                  body: `${child.nombre} registrado como "${mode}" para el ${key}. Chofer notificado.`,
                  time: 'Ahora',
                  type: 'attendance',
                  read: false,
                },
              });
              setOpen(false);
              toast.success('Aviso de inasistencia enviado al chofer');
            }}
          >
            Confirmar aviso
          </Button>
        </DialogContent>
      </Dialog>

      <StudentCardModal open={qrOpen} onOpenChange={setQrOpen} student={child} />
      <NotificationModal open={notifOpen} onOpenChange={setNotifOpen} />
      <AuthorizedPickupModal open={authorizedOpen} onOpenChange={setAuthorizedOpen} alumnoId={child.id} />
      <BusetaFichaModal open={fichaModalOpen} onOpenChange={setFichaModalOpen} van={van} mode="parent" />
      <ContratoTransporteModal open={contratoOpen} onOpenChange={setContratoOpen} alumno={child} van={van} />

      {/* SINPE Móvil Modals */}
      <ReportarSinpeModal
        open={reportSinpeOpen}
        onOpenChange={setReportSinpeOpen}
        alumno={child}
        choferNombre={van.chofer}
        choferTelefono="8841-2390"
        onSuccess={({ banco, comprobanteRef, comprobanteFoto, monto }) => {
          dispatch({
            type: 'reportSinpePayment',
            alumnoId: child.id,
            banco,
            comprobanteRef,
            comprobanteFoto,
            montoReportado: monto,
          });
          toast.success('¡Comprobante SINPE reportado!', {
            description: `Referencia ${comprobanteRef} enviada al chofer ${van.chofer.split(' ')[0]} para su aprobación.`,
          });
        }}
      />

      <SinpeComprobanteModal
        open={viewSinpeOpen}
        onOpenChange={setViewSinpeOpen}
        alumno={child}
        payment={state.payments[child.id]}
        choferNombre={van.chofer}
        isApprover={false}
      />
    </div>
  );
}
