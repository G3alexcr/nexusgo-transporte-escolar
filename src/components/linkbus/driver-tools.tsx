import { useState } from 'react';
import {
  UserRound,
  CalendarX,
  Wallet,
  Check,
  Bell,
  ArrowLeft,
  Search,
  Camera,
  ShieldCheck,
  Bus,
  Phone,
  Save,
  Star,
  Eye,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  FileCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePlatform } from './platform-provider';
import { Badge } from './shared';
import { crc, type Alumno } from '@/lib/data';
import { canManageCollections, type DriverMode, type OperationalRole } from '@/lib/platform-state';
import { SinpeComprobanteModal } from './sinpe-modal';

export function DriverProfile({ onAgenda, onCollections }: { onAgenda: () => void; onCollections?: () => void }) {
  const { state, dispatch } = usePlatform();
  const profile = state.driverProfile;
  const van = state.vans[0];

  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80');
  const [driverName, setDriverName] = useState(van?.chofer || 'Tío Jorge Muñoz');
  const [cedula, setCedula] = useState('1-0876-0234');
  const [licencia, setLicencia] = useState('C2 - Transporte Estudiantil (Vence: 2028)');
  const [telefono, setTelefono] = useState('+506 8841-2390');

  const update = (role: OperationalRole, mode: DriverMode) => dispatch({ type: 'driverProfile', role, mode });

  const handleSave = () => {
    toast.success('¡Perfil operativo de chofer actualizado con éxito!', {
      description: 'Credenciales CTP y datos de contacto guardados.',
    });
  };

  return (
    <section className="space-y-5 pb-6">
      {/* Driver Hero Card */}
      <div className="relative rounded-2xl bg-gradient-to-br from-navy via-slate-900 to-navy p-4 text-white shadow-md border border-white/10">
        <div className="flex items-center gap-3.5">
          <div className="relative group shrink-0">
            <img
              src={avatarUrl}
              alt={driverName}
              className="h-16 w-16 rounded-2xl object-cover ring-2 ring-amber-400 shadow-md bg-slate-800"
            />
            <button
              type="button"
              onClick={() => {
                const alternates = [
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80',
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80',
                  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=240&q=80',
                ];
                const next = alternates[(alternates.indexOf(avatarUrl) + 1) % alternates.length];
                setAvatarUrl(next || alternates[0]!);
                toast.success('Foto de perfil actualizada');
              }}
              className="absolute -bottom-1 -right-1 p-1 rounded-full bg-amber-400 text-slate-950 shadow hover:bg-amber-500 transition-transform active:scale-90"
              title="Cambiar foto de perfil"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-extrabold text-white truncate">{driverName}</h2>
              <span title="Chofer Verificado CTP">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              </span>
            </div>
            <p className="text-xs text-amber-300 font-semibold truncate">{profile.role} · CTP Costa Rica</p>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-amber-400 font-bold">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span>4.95 (142 recorridos completados)</span>
            </div>
          </div>
        </div>

        <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
          <span>Buseta: <b className="text-white">{van?.patente}</b></span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">RTV / INS Al Día</span>
        </div>
      </div>

      {/* Assigned Vehicle Card */}
      {van && (
        <div className="rounded-xl border bg-card p-3.5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Bus className="h-3.5 w-3.5 text-amber-500" /> Unidad Escolar Asignada
            </span>
            <span className="text-[10px] font-mono text-muted-foreground font-bold">16 Pasajeros</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-extrabold text-foreground">Mercedes-Benz Sprinter 2024</h4>
              <p className="text-[11px] text-muted-foreground">Placa: <b className="text-foreground">{van.patente}</b></p>
            </div>
            <Badge tone="ok">Operativa</Badge>
          </div>
        </div>
      )}

      {/* Personal & License Data Form */}
      <div className="rounded-xl border bg-card p-4 shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Datos de Conducción y Contacto
        </h3>

        <div className="space-y-1">
          <Label className="text-[11px] font-bold">Nombre del Conductor</Label>
          <Input
            value={driverName}
            onChange={(e) => setDriverName(e.target.value)}
            className="h-9 text-xs"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[11px] font-bold">Cédula</Label>
            <Input
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              className="h-9 text-xs font-mono"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] font-bold">Teléfono Celular</Label>
            <Input
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="h-9 text-xs font-mono"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-[11px] font-bold">Licencia de Conducir CTP</Label>
          <Input
            value={licencia}
            onChange={(e) => setLicencia(e.target.value)}
            className="h-9 text-xs"
          />
        </div>

        <Button
          onClick={handleSave}
          className="w-full h-9 bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 text-xs font-bold rounded-lg mt-2"
        >
          <Save className="h-3.5 w-3.5 mr-1.5" />
          Guardar Datos Operativos
        </Button>
      </div>

      {/* Role & Work Modality */}
      <div className="rounded-xl border bg-card p-4 shadow-xs space-y-3.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Configuración Operativa
        </h3>

        <div className="space-y-1">
          <Label id="operational-role" className="text-[11px] font-bold">Rol Operativo</Label>
          <Select
            value={profile.role}
            onValueChange={(value) => {
              if (value === 'Chofer / Conductor' || value === 'Asistente de Buseta') update(value, profile.mode);
            }}
          >
            <SelectTrigger aria-labelledby="operational-role" className="h-10 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Chofer / Conductor">Chofer / Conductor</SelectItem>
              <SelectItem value="Asistente de Buseta">Asistente de Buseta</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {profile.role === 'Chofer / Conductor' && (
          <div className="space-y-1">
            <Label id="driver-mode" className="text-[11px] font-bold">Modalidad de Trabajo</Label>
            <Select
              value={profile.mode}
              onValueChange={(value) => {
                if (value === 'Empresa de transporte' || value === 'Chofer Independiente') update(profile.role, value);
              }}
            >
              <SelectTrigger aria-labelledby="driver-mode" className="h-10 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Empresa de transporte">Empresa de transporte</SelectItem>
                <SelectItem value="Chofer Independiente">Chofer Independiente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Bottom Action Buttons */}
      <div className="space-y-2.5 pt-1">
        <Button variant="outline" onClick={onAgenda} className="h-10 w-full text-xs font-bold rounded-xl cursor-pointer">
          <CalendarX className="h-4 w-4 mr-1.5" />
          Avisos de Inasistencia de Apoderados
        </Button>
      </div>
    </section>
  );
}

export function DriverCollections({ onBack }: { onBack: () => void }) {
  const { state, dispatch } = usePlatform();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'Todos' | 'En Verificación' | 'Por cobrar' | 'Pagados'>('Todos');
  const [selectedStudent, setSelectedStudent] = useState<Alumno | null>(null);

  const activeDriver = state.choferes.find((c) => c.id === state.selectedDriverId) || state.choferes[0];
  const driverName = activeDriver?.nombre || 'Carlos Solís Morales';

  const alumnosList = state.alumnos;
  const paidAlumnos = alumnosList.filter((a) => (state.payments[a.id]?.status ?? a.pago) === 'Pagado');
  const verifyingAlumnos = alumnosList.filter((a) => (state.payments[a.id]?.status ?? a.pago) === 'En Verificación');
  const pendingAlumnos = alumnosList.filter((a) => {
    const s = state.payments[a.id]?.status ?? a.pago;
    return s !== 'Pagado' && s !== 'En Verificación';
  });

  const totalRecaudado = paidAlumnos.reduce((sum, a) => sum + a.monto, 0);
  const totalPorCobrar = [...pendingAlumnos, ...verifyingAlumnos].reduce((sum, a) => sum + a.monto, 0);

  const filteredRows = alumnosList.filter((a) => {
    const pStatus = state.payments[a.id]?.status ?? a.pago;
    const matchesQuery = `${a.nombre} ${a.apoderado} ${a.colegio}`.toLowerCase().includes(query.toLowerCase());
    if (!matchesQuery) return false;

    if (filter === 'Todos') return true;
    if (filter === 'En Verificación') return pStatus === 'En Verificación';
    if (filter === 'Pagados') return pStatus === 'Pagado';
    if (filter === 'Por cobrar') return pStatus !== 'Pagado';
    return true;
  });

  return (
    <section className="space-y-5 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Volver al perfil"
            onClick={onBack}
            className="rounded-xl cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl font-black text-foreground">Gestión de Cobros & SINPE Móvil</h2>
            <p className="text-xs text-muted-foreground">
              Octubre 2026 · Recaudación directa a la cuenta de <b>{driverName}</b>
            </p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 self-start sm:self-auto">
          SINPE: +506 8841-2390
        </span>
      </div>

      {/* Prominent Banner for Incoming SINPE Vouchers Awaiting Verification */}
      {verifyingAlumnos.length > 0 && (
        <div className="rounded-2xl border-2 border-amber-400 bg-amber-50/90 dark:bg-amber-950/40 p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-950 dark:text-amber-200">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
              </span>
              <h3 className="text-sm font-black">
                {verifyingAlumnos.length} {verifyingAlumnos.length === 1 ? 'Comprobante SINPE Móvil por Aprobar' : 'Comprobantes SINPE Móvil por Aprobar'}
              </h3>
            </div>
            <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-200/80 dark:bg-amber-900/60 px-2 py-0.5 rounded-full">
              Acción Requerida
            </span>
          </div>

          <p className="text-xs text-amber-900/80 dark:text-amber-300/80">
            Los siguientes apoderados reportaron pagos mediante SINPE Móvil. Abre el comprobante, verifica que los fondos estén acreditados en tu cuenta bancaria y dale clic a <b>Aprobar Pago</b> para emitir el recibo digital oficial:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {verifyingAlumnos.map((a) => {
              const payment = state.payments[a.id];
              return (
                <div
                  key={a.id}
                  className="rounded-xl border border-amber-300 bg-white dark:bg-slate-900 p-3 flex flex-col justify-between gap-2 shadow-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-extrabold text-foreground">{a.nombre}</h4>
                      <p className="text-xs text-muted-foreground">{a.apoderado} · {a.colegio}</p>
                      <p className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400 mt-0.5">
                        Ref: {payment?.comprobanteRef || 'SINPE-PENDIENTE'} ({payment?.banco || 'Banco'})
                      </p>
                    </div>
                    <span className="text-sm font-black text-foreground">
                      {crc(payment?.montoReportado || a.monto)}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => setSelectedStudent(a)}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs h-9 rounded-xl cursor-pointer gap-1.5 shadow-xs"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Revisar Comprobante & Aprobar</span>
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border bg-card p-3.5 shadow-xs">
          <p className="text-[11px] font-bold uppercase text-muted-foreground">Total Recaudado (CRC)</p>
          <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">{crc(totalRecaudado)}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{paidAlumnos.length} estudiantes al día</p>
        </div>

        <div className="rounded-xl border bg-card p-3.5 shadow-xs">
          <p className="text-[11px] font-bold uppercase text-muted-foreground">En Verificación SINPE</p>
          <p className="mt-1 text-2xl font-black text-amber-500">{verifyingAlumnos.length}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Comprobantes listos para revisión</p>
        </div>

        <div className="rounded-xl border bg-card p-3.5 shadow-xs">
          <p className="text-[11px] font-bold uppercase text-muted-foreground">Por Cobrar</p>
          <p className="mt-1 text-2xl font-black text-slate-800 dark:text-slate-200">{crc(totalPorCobrar)}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{pendingAlumnos.length} pendientes</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2 pt-1">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            aria-label="Buscar estudiante o apoderado"
            placeholder="Buscar por estudiante, apoderado o colegio…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 pl-9 text-xs rounded-xl"
          />
        </div>

        <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
          {(['Todos', 'En Verificación', 'Por cobrar', 'Pagados'] as const).map((opt) => (
            <Button
              key={opt}
              size="sm"
              variant={filter === opt ? 'default' : 'outline'}
              onClick={() => setFilter(opt)}
              className={`text-xs font-bold rounded-xl cursor-pointer whitespace-nowrap h-10 ${
                filter === opt ? 'bg-amber-400 text-slate-950 hover:bg-amber-500' : ''
              }`}
            >
              {opt}
              {opt === 'En Verificación' && verifyingAlumnos.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                  {verifyingAlumnos.length}
                </span>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Students Collection List */}
      <div className="space-y-3">
        {filteredRows.map((a) => {
          const payment = state.payments[a.id];
          const status = payment?.status ?? a.pago;
          return (
            <div
              key={a.id}
              className="rounded-xl border bg-card p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-amber-400/40 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-extrabold text-foreground">{a.nombre}</h3>
                  <Badge tone={status === 'Pagado' ? 'ok' : status === 'En Verificación' ? 'warn' : 'bad'}>
                    {status}
                  </Badge>
                  {status === 'En Verificación' && (
                    <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                      Ref: {payment?.comprobanteRef}
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  Apoderado: <b className="text-foreground">{a.apoderado}</b> ({a.telefonoApoderado || '8841-9230'}) · {a.colegio} ({a.curso})
                </p>

                {status === 'Pagado' && payment?.reciboNumero && (
                  <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                    Recibo #{payment.reciboNumero} · Emitido {payment.fechaAprobado}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                <span className="text-lg font-black text-foreground">{crc(a.monto)}</span>

                {status === 'En Verificación' ? (
                  <Button
                    size="sm"
                    onClick={() => setSelectedStudent(a)}
                    className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs h-9 rounded-xl cursor-pointer gap-1.5 shadow-sm"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Revisar Comprobante</span>
                  </Button>
                ) : status === 'Pagado' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedStudent(a)}
                    className="text-xs font-bold rounded-xl cursor-pointer gap-1.5 border-emerald-400/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                  >
                    <Receipt className="h-3.5 w-3.5" />
                    <span>Ver Recibo</span>
                  </Button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      onClick={() => {
                        dispatch({
                          type: 'approvePayment',
                          alumnoId: a.id,
                          aprobadoPor: driverName,
                        });
                        toast.success(`Pago de ${a.nombre} registrado como Pagado`);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-9 rounded-xl cursor-pointer gap-1"
                      title="Registrar pago directo recibido"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Registrar Pago</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        dispatch({ type: 'paymentReminder', id: a.id });
                        const msg = encodeURIComponent(
                          `Estimado(a) ${a.apoderado}, le recordamos el pago de la mensualidad de transporte de ${a.nombre} por ${crc(a.monto)}. Puede cancelarlo por SINPE Móvil al 8841-2390. Muchas gracias.`
                        );
                        window.open(`https://wa.me/506${(a.telefonoApoderado || '88419230').replace(/\D/g, '')}?text=${msg}`, '_blank');
                        toast.success('Recordatorio enviado por WhatsApp');
                      }}
                      className="text-xs font-bold rounded-xl cursor-pointer gap-1"
                      title="Enviar recordatorio por WhatsApp"
                    >
                      <Bell className="h-3.5 w-3.5 text-amber-500" />
                      <span>Recordar</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredRows.length === 0 && (
          <div className="py-12 text-center text-muted-foreground text-xs">
            <Search className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="font-bold">Sin mensualidades para este criterio de búsqueda</p>
          </div>
        )}
      </div>

      {/* Lightbox Modal for Driver to Inspect SINPE Voucher and Approve/Reject */}
      {selectedStudent && (
        <SinpeComprobanteModal
          open={!!selectedStudent}
          onOpenChange={(isOpen) => {
            if (!isOpen) setSelectedStudent(null);
          }}
          alumno={selectedStudent}
          payment={state.payments[selectedStudent.id]}
          choferNombre={driverName}
          isApprover={true}
          onApprove={() => {
            dispatch({
              type: 'approvePayment',
              alumnoId: selectedStudent.id,
              aprobadoPor: driverName,
            });
          }}
          onReject={(motivo) => {
            dispatch({
              type: 'rejectPayment',
              alumnoId: selectedStudent.id,
              motivo,
            });
          }}
        />
      )}
    </section>
  );
}