import { useState } from 'react';
import { Bus, Check, UserX, Navigation, MessageCircle, Phone, MapPin, UserCheck, ShieldCheck, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlatform } from './platform-provider';
import { Badge } from './shared';
import { AuthorizedPickupModal } from './authorized-pickup-modal';
import type { AttendanceStatus } from '@/lib/platform-state';
import type { Alumno } from '@/lib/data';
import { toast } from 'sonner';
import { playNotificationSound } from '@/lib/sound-effects';

const actions: { status: AttendanceStatus; icon: typeof Bus; selected: string; label: string }[] = [
  { status: 'A bordo', icon: Bus, selected: 'bg-amber-400 text-slate-950 hover:bg-amber-500 border-transparent font-extrabold', label: 'A bordo' },
  { status: 'Entregado', icon: Check, selected: 'bg-emerald-600 text-white hover:bg-emerald-700 border-transparent font-extrabold', label: 'Entregado' },
  { status: 'Ausente', icon: UserX, selected: 'bg-rose-600 text-white hover:bg-rose-700 border-transparent font-extrabold', label: 'Ausente' },
];

export function DriverAttendance() {
  const { state, dispatch } = usePlatform();
  const activeDriver = state.choferes.find((c) => c.id === state.selectedDriverId) || state.choferes[0];
  const currentVan = state.vans.find((v) => v.patente === activeDriver?.buseta || v.chofer === activeDriver?.nombre) || state.vans[0];

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Alumno | null>(null);
  const [showAllStudents, setShowAllStudents] = useState(false);

  const routeStudents = currentVan?.colegio
    ? state.alumnos.filter(
        (a) =>
          a.colegio.toLowerCase().includes(currentVan.colegio.toLowerCase()) ||
          currentVan.colegio.toLowerCase().includes(a.colegio.toLowerCase())
      )
    : state.alumnos;

  const students = showAllStudents || routeStudents.length === 0 ? state.alumnos : routeStudents;

  const handleOpenWaze = (a: Alumno) => {
    const lat = a.lat || 9.9333;
    const lng = a.lng || -84.0833;
    window.open(`https://www.waze.com/ul?ll=${lat},${lng}&navigate=yes&q=${encodeURIComponent(a.direccion + ', Costa Rica')}`, '_blank');
    toast.info(`Abriendo Waze hacia la parada de ${a.nombre}`);
  };

  const handleOpenGoogleMaps = (a: Alumno) => {
    const dest = a.lat && a.lng ? `${a.lat},${a.lng}` : encodeURIComponent(`${a.direccion}, Costa Rica`);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest}`, '_blank');
    toast.info(`Navegando con Google Maps hacia ${a.nombre}`);
  };

  const handleSendWhatsApp = (a: Alumno) => {
    const phone = a.telefonoApoderado ? a.telefonoApoderado.replace(/\D/g, '') : '88419230';
    const message = encodeURIComponent(
      `¡Hola ${a.apoderado}! Le saluda ${activeDriver?.nombre || 'el conductor'} de la buseta escolar (${currentVan?.patente || 'SJ-4821'}). Me encuentro aproximándome (a unos 3 minutos) a su ubicación en ${a.direccion} para recoger a ${a.nombre}.`
    );
    window.open(`https://wa.me/506${phone}?text=${message}`, '_blank');
    toast.success(`Aviso de WhatsApp enviado a ${a.apoderado}`);
  };

  const handleCall = (a: Alumno) => {
    const phone = a.telefonoApoderado ? a.telefonoApoderado.replace(/\D/g, '') : '88419230';
    window.open(`tel:+506${phone}`);
  };

  return (
    <div className="space-y-3">
      {/* Route Filter Indicator */}
      <div className="flex items-center justify-between text-xs px-1 text-muted-foreground">
        <span>
          Estudiantes: <b className="text-foreground">{currentVan?.colegio || 'Mi Ruta'}</b> ({students.length})
        </span>
        {state.alumnos.length > routeStudents.length && routeStudents.length > 0 && (
          <button
            type="button"
            onClick={() => setShowAllStudents((prev) => !prev)}
            className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
          >
            {showAllStudents ? `Filtrar solo ${currentVan?.colegio}` : `Ver todos (${state.alumnos.length})`}
          </button>
        )}
      </div>

      <ul className="space-y-4">
      {students.map((a) => {
        const row = state.attendance[a.id];
        const status = row?.status || 'Pendiente';

        const isQueuedOffline = state.offlineQueue.some((q) => q.alumnoId === a.id);

        return (
          <li key={a.id} className="rounded-2xl border bg-card p-4 shadow-sm transition-all hover:border-amber-400/40">
            {/* Header: Student name, course, school & Status */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-extrabold text-slate-950 text-xs shadow-xs">
                  {a.nombre.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-extrabold text-foreground truncate">{a.nombre}</h4>
                  <p className="text-[11px] font-medium text-muted-foreground truncate">{a.colegio} · {a.curso}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <Badge tone={status === 'Entregado' ? 'ok' : status === 'Ausente' ? 'bad' : status === 'A bordo' ? 'warn' : 'info'}>
                  {status}
                </Badge>
                {isQueuedOffline && (
                  <span className="text-[9.5px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 border border-amber-400/30 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                    <WifiOff className="h-2.5 w-2.5" /> Offline
                  </span>
                )}
              </div>
            </div>

            {/* Address & Guardian Line */}
            <div className="my-2.5 flex items-center justify-between text-xs text-muted-foreground border-b pb-2.5">
              <div className="flex items-center gap-1.5 min-w-0 truncate">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                <span className="truncate text-foreground font-medium">{a.direccion}</span>
              </div>
              <span className="text-[11px] text-muted-foreground shrink-0 ml-2">
                {a.apoderado.split(' ')[0]} {a.apoderado.split(' ')[1] || ''}
              </span>
            </div>

            {/* Driver Unified Segmented Control Dock */}
            <div className="mb-3.5 grid grid-cols-4 rounded-xl bg-muted/60 p-1 border border-border/60">
              <button
                type="button"
                onClick={() => handleOpenWaze(a)}
                className="flex items-center justify-center gap-1.5 py-2 px-1 text-xs font-bold text-foreground hover:bg-background rounded-lg transition-all"
                title="Navegar con Waze hacia la parada"
              >
                <Navigation className="h-3.5 w-3.5 text-sky-500" />
                <span className="text-[11px]">Navegar</span>
              </button>

              <button
                type="button"
                onClick={() => handleSendWhatsApp(a)}
                className="flex items-center justify-center gap-1.5 py-2 px-1 text-xs font-bold text-foreground hover:bg-background rounded-lg transition-all"
                title="Avisar por WhatsApp al encargado"
              >
                <MessageCircle className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-[11px]">WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => handleCall(a)}
                className="flex items-center justify-center gap-1.5 py-2 px-1 text-xs font-bold text-foreground hover:bg-background rounded-lg transition-all"
                title={`Llamar a ${a.apoderado}`}
              >
                <Phone className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-[11px]">Llamar</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedStudent(a);
                  setAuthModalOpen(true);
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-1 text-xs font-bold text-foreground hover:bg-background rounded-lg transition-all"
                title="Ver personas autorizadas para retirar al estudiante"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-[11px]">Retiro</span>
              </button>
            </div>

            {/* Large 1-Tap Attendance Controls */}
            <div className="grid grid-cols-3 gap-2">
              {actions.map(({ status: value, icon: Icon, selected, label }) => {
                const isSelected = status === value;
                return (
                  <Button
                    key={value}
                    disabled={!state.active}
                    aria-label={`${a.nombre}: ${value}`}
                    aria-pressed={isSelected}
                    variant="outline"
                    className={`h-16 min-w-0 touch-manipulation flex-col gap-1.5 px-0 text-xs font-bold transition-all rounded-xl ${
                      isSelected
                        ? selected
                        : 'bg-muted/40 text-foreground hover:bg-muted'
                    }`}
                    onClick={() => {
                      const now = new Date();
                      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                      if (state.isOfflineMode) {
                        dispatch({
                          type: 'queueOfflineAttendance',
                          item: {
                            id: `offline-${Date.now()}-${a.id}`,
                            type: 'attendance',
                            alumnoId: a.id,
                            alumnoNombre: a.nombre,
                            status: value,
                            time: timeStr,
                            timestamp: Date.now(),
                          },
                        });
                        playNotificationSound('push');
                        toast.warning(`[Modo Offline] ${a.nombre} marcado como "${value}"`, {
                          description: 'Guardado en la cola local. Se sincronizará automáticamente al volver la cobertura celular.',
                        });
                      } else {
                        dispatch({ type: 'attendance', id: a.id, status: value, time: timeStr });
                        toast.success(`${a.nombre} marcado como "${value}"`);
                      }
                    }}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{label}</span>
                  </Button>
                );
              })}
            </div>

            {/* Time stamps */}
            {(row?.subida !== '—' || row?.bajada !== '—') && (
              <div className="mt-2.5 flex justify-between text-[11px] font-medium text-muted-foreground">
                <span>Subida: <b>{row?.subida || '—'}</b></span>
                <span>Bajada: <b>{row?.bajada || '—'}</b></span>
              </div>
            )}
          </li>
        );
      })}

      <AuthorizedPickupModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        alumnoId={selectedStudent?.id}
        isDriverView
      />
    </ul>
  </div>
  );
}
