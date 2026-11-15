import { useState } from 'react';
import { User, Camera, ShieldCheck, Mail, Phone, MapPin, QrCode, Bell, Save, CheckCircle2, Bus, School, Smartphone, UserCheck, UserPlus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { usePlatform } from './platform-provider';
import { AuthorizedPickupModal } from './authorized-pickup-modal';
import { toast } from 'sonner';

export function ParentProfileView({ onOpenQr, onOpenContrato }: { onOpenQr?: () => void; onOpenContrato?: () => void }) {
  const { state, dispatch } = usePlatform();
  const profile = state.parentProfile;
  const child = state.alumnos.find((a) => a.id === state.selectedAlumnoId) || state.alumnos[0];
  const van = state.vans[0];

  const contract = child ? state.contracts[child.id] : undefined;
  const isContractSigned = contract?.signed;

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [nombre, setNombre] = useState(profile?.nombre || 'Carla Pérez Monge');
  const [cedula, setCedula] = useState(profile?.cedula || '1-1240-0899');
  const [telefono, setTelefono] = useState(profile?.telefono || '+506 8841-9230');
  const [email, setEmail] = useState(profile?.email || 'carla.perez@nexusgo.cr');
  const [direccion, setDireccion] = useState(profile?.direccion || 'Condominio Las Palmas #42, Guachipelín, Escazú');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=80');

  // Notification toggles
  const [notifGps, setNotifGps] = useState(profile?.notifGps ?? true);
  const [notifAsistencia, setNotifAsistencia] = useState(profile?.notifAsistencia ?? true);
  const [notifRetrasos, setNotifRetrasos] = useState(profile?.notifRetrasos ?? true);
  const [notifPagos, setNotifPagos] = useState(profile?.notifPagos ?? true);

  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    dispatch({
      type: 'updateParentProfile',
      profile: {
        nombre,
        cedula,
        telefono,
        email,
        direccion,
        avatarUrl,
        notifGps,
        notifAsistencia,
        notifRetrasos,
        notifPagos,
      },
    });

    setTimeout(() => {
      setSaving(false);
      toast.success('¡Perfil de apoderado actualizado con éxito!', {
        description: 'Tus datos y preferencias de notificación han sido guardados.',
      });
    }, 400);
  };

  const handleAvatarSelect = (url: string) => {
    setAvatarUrl(url);
    toast.success('Foto de perfil seleccionada');
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Header Profile Hero */}
      <div className="relative rounded-2xl bg-gradient-to-br from-navy via-slate-900 to-navy p-5 text-white shadow-md border border-white/10">
        <div className="flex items-center gap-4">
          <div className="relative group shrink-0">
            <img
              src={avatarUrl}
              alt={nombre}
              className="h-16 w-16 rounded-2xl object-cover ring-2 ring-amber-400 shadow-md bg-slate-800"
            />
            <button
              type="button"
              onClick={() => {
                const alternates = [
                  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=80',
                  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=240&q=80',
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80',
                ];
                const next = alternates[(alternates.indexOf(avatarUrl) + 1) % alternates.length];
                handleAvatarSelect(next || alternates[0]!);
              }}
              className="absolute -bottom-1 -right-1 p-1 rounded-full bg-amber-400 text-slate-950 shadow hover:bg-amber-500 transition-transform active:scale-90"
              title="Cambiar foto de perfil"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-extrabold text-white truncate">{nombre}</h2>
              <span title="Apoderado Verificado">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              </span>
            </div>
            <p className="text-xs text-amber-300 font-semibold truncate">Apoderado Titular · Nexus Go</p>
            <p className="text-[11px] text-slate-300 font-mono mt-0.5 truncate">Cédula: {cedula}</p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
          <span>Estudiante: <b className="text-white">{child?.nombre}</b></span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">Activo</span>
        </div>
      </div>

      {/* Child Enrolled Quick Card */}
      {child && (
        <div className="rounded-xl border bg-card p-3.5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <School className="h-3.5 w-3.5 text-amber-500" /> Estudiante a Cargo
            </span>
            {onOpenQr && (
              <button
                type="button"
                onClick={onOpenQr}
                className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline"
              >
                <QrCode className="h-3.5 w-3.5" /> Carnet QR
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-extrabold text-slate-950 text-sm shadow-xs">
              {child.nombre.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-extrabold text-foreground truncate">{child.nombre}</h4>
              <p className="text-[11px] text-muted-foreground truncate">{child.colegio} · {child.curso}</p>
              <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium truncate flex items-center gap-1 mt-0.5">
                <Bus className="h-3 w-3" /> Buseta {van?.patente} ({van?.chofer})
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Authorized Pickup Persons Card */}
      <div className="rounded-xl border bg-card p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <UserCheck className="h-3.5 w-3.5 text-amber-500" /> Personas Autorizadas para Retirar
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setAuthModalOpen(true)}
            className="h-7 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700"
          >
            Gestionar ({state.authorizedPersons?.length || 0})
          </Button>
        </div>

        <p className="text-[11px] text-muted-foreground">
          Adultos verificados con documento físico autorizados para recibir a {child?.nombre} en la parada de la buseta.
        </p>

        <div className="space-y-1.5">
          {(state.authorizedPersons || []).slice(0, 3).map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-xs">
              <div>
                <p className="font-bold text-foreground text-xs">{p.nombre}</p>
                <p className="text-[10px] text-muted-foreground">{p.parentesco} · Cédula: {p.cedula}</p>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Autorizado</span>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => setAuthModalOpen(true)}
          className="w-full text-xs font-semibold h-9 border-dashed border-amber-400/60 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10"
        >
          <UserPlus className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
          + Registrar o Gestionar Personas de Retiro
        </Button>
      </div>

      <AuthorizedPickupModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        alumnoId={child?.id}
      />

      {/* CTP Legal Contract Card */}
      <div className="rounded-xl border bg-card p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-amber-400/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Contrato de Transporte Escolar 2026
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Exigido por el Consejo de Transporte Público (CTP) y el MOPT
              </p>
            </div>
          </div>

          <span
            className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
              isContractSigned
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                : 'bg-amber-500/20 text-amber-800 dark:text-amber-300 animate-pulse'
            }`}
          >
            {isContractSigned ? '✓ Firmado' : 'Pendiente de Firma'}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-muted/40 text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Estudiante Titular:</span>
            <span className="font-bold text-foreground">{child?.nombre}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Estado Legal:</span>
            <span className="font-semibold text-foreground">
              {isContractSigned ? `Suscrito el ${contract?.signedAt} (${contract?.folioDigital})` : 'Pendiente de aceptación y firma'}
            </span>
          </div>
        </div>

        {onOpenContrato && (
          <Button
            type="button"
            onClick={onOpenContrato}
            className={`w-full text-xs font-bold h-9 rounded-xl cursor-pointer ${
              isContractSigned
                ? 'bg-muted hover:bg-muted/80 text-foreground border'
                : 'bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-xs'
            }`}
          >
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            {isContractSigned ? 'Ver y Descargar Contrato Digital Firmado (PDF/SVG)' : 'Ver y Firmar Contrato Digital en Pantalla'}
          </Button>
        )}
      </div>

      {/* Personal Info Form */}
      <div className="rounded-xl border bg-card p-4 shadow-xs space-y-3.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <User className="h-3.5 w-3.5 text-amber-500" /> Datos Personales
        </h3>

        <div className="space-y-1">
          <Label className="text-[11px] font-bold">Nombre Completo</Label>
          <Input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
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
          <Label className="text-[11px] font-bold">Correo Electrónico</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-9 text-xs"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[11px] font-bold">Dirección de Parada / Residencia</Label>
          <Input
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            className="h-9 text-xs"
          />
        </div>
      </div>

      {/* Push Notification Preferences */}
      <div className="rounded-xl border bg-card p-4 shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Bell className="h-3.5 w-3.5 text-amber-500" /> Preferencias de Notificaciones Push
        </h3>

        <div className="space-y-2.5 divide-y divide-border/60">
          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-xs font-extrabold text-foreground">Buseta a 500 metros</p>
              <p className="text-[10px] text-muted-foreground">Aviso cuando la buseta esté a 5 min de tu casa</p>
            </div>
            <Switch checked={notifGps} onCheckedChange={setNotifGps} />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-xs font-extrabold text-foreground">Subida y bajada (Check-in)</p>
              <p className="text-[10px] text-muted-foreground">Notificación en tiempo real del carnet QR</p>
            </div>
            <Switch checked={notifAsistencia} onCheckedChange={setNotifAsistencia} />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-xs font-extrabold text-foreground">Alertas de presa o demora</p>
              <p className="text-[10px] text-muted-foreground">Avisos urgentes enviados por el chofer</p>
            </div>
            <Switch checked={notifRetrasos} onCheckedChange={setNotifRetrasos} />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-xs font-extrabold text-foreground">Recordatorios de mensualidad</p>
              <p className="text-[10px] text-muted-foreground">Avisos de pago y comprobantes electrónicos</p>
            </div>
            <Switch checked={notifPagos} onCheckedChange={setNotifPagos} />
          </div>
        </div>
      </div>

      {/* PWA Mobile Installation Option */}
      <div className="rounded-xl border bg-muted/30 p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-400 text-slate-950 font-bold shrink-0">
            <Smartphone className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-foreground">Instalar App en el Móvil</h4>
            <p className="text-[10px] text-muted-foreground truncate">Acceso directo en tu pantalla sin navegador</p>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            toast.info('Para instalar: En iPhone toca Compartir ⎋ y "Agregar a Inicio". En Android: Menú Chrome > "Instalar app".');
          }}
          className="h-7 text-[11px] font-bold shrink-0"
        >
          Instalar
        </Button>
      </div>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full h-10 bg-amber-400 text-slate-950 font-bold hover:bg-amber-500 text-xs shadow-md rounded-xl active:scale-98 transition-all"
      >
        <Save className="h-4 w-4 mr-1.5" />
        {saving ? 'Guardando cambios...' : 'Guardar Datos de Perfil'}
      </Button>
    </div>
  );
}
