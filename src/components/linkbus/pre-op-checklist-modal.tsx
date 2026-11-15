import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ClipboardCheck,
  Bus,
  Gauge,
  Lightbulb,
  FileText,
  Flame,
  DoorOpen,
  Disc,
  Download,
  Sparkles,
} from 'lucide-react';
import { Badge } from './shared';
import { generatePreOpCertificateSvg } from '@/lib/document-samples';
import { playNotificationSound } from '@/lib/sound-effects';
import type { Van } from '@/lib/data';
import type { PreOpInspection } from '@/lib/platform-state';

interface PreOpChecklistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  van: Van;
  driverName?: string | undefined;
  routeName?: string | undefined;
  onComplete: (inspection: PreOpInspection) => void;
  existingInspection?: PreOpInspection | undefined;
}

export function PreOpChecklistModal({
  open,
  onOpenChange,
  van,
  driverName = 'Carlos Solís Morales',
  routeName,
  onComplete,
  existingInspection,
}: PreOpChecklistModalProps) {
  const [luces, setLuces] = useState(true);
  const [cinturones, setCinturones] = useState(true);
  const [extintorBotiquin, setExtintorBotiquin] = useState(true);
  const [puertaEmergencia, setPuertaEmergencia] = useState(true);
  const [llantasCombustible, setLlantasCombustible] = useState(true);
  const [documentacionFisica, setDocumentacionFisica] = useState(true);
  const [km, setKm] = useState(existingInspection?.kilometraje || 142350);
  const [observaciones, setObservaciones] = useState(
    existingInspection?.observaciones || 'Unidad limpia, desinfectada y lista para recorrido escolar matutino.'
  );

  const allChecked =
    luces &&
    cinturones &&
    extintorBotiquin &&
    puertaEmergencia &&
    llantasCombustible &&
    documentacionFisica;

  const handleCheckAll = () => {
    setLuces(true);
    setCinturones(true);
    setExtintorBotiquin(true);
    setPuertaEmergencia(true);
    setLlantasCombustible(true);
    setDocumentacionFisica(true);
    toast.success('Todos los puntos marcados como conformes');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!allChecked) {
      toast.error('Atención de Seguridad CTP', {
        description: 'Todos los puntos críticos deben estar conformes para habilitar el traslado de estudiantes.',
      });
      return;
    }

    const now = new Date();
    const timeFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const folio = existingInspection?.folioDigital || `CTP-PREOP-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const inspection: PreOpInspection = {
      fechaHora: timeFormatted,
      vanPlaca: van.patente,
      choferNombre: driverName,
      luces,
      cinturones,
      extintorBotiquin,
      puertaEmergencia,
      llantasCombustible,
      documentacionFisica,
      kilometraje: Number(km) || 142350,
      observaciones: observaciones.trim() || undefined,
      resultado: 'Aprobada',
      folioDigital: folio,
    };

    onComplete(inspection);
    playNotificationSound('push');
    toast.success('¡Inspección Pre-Operativa Registrada!', {
      description: `Constancia digital ${folio} emitida. Buseta ${van.patente} autorizada para ruta.`,
    });
    onOpenChange(false);
  };

  const checklistItems = [
    {
      id: 'luces',
      label: 'Luces, Direccionales, Freno e Intermitentes',
      desc: 'Altas, bajas, reversa, direccionales y rotativa ámbar escolar en óptimo funcionamiento.',
      checked: luces,
      toggle: () => setLuces(!luces),
      icon: Lightbulb,
    },
    {
      id: 'cinturones',
      label: 'Cinturones de Seguridad Funcionales',
      desc: 'Cinturones retráctiles o de 2 puntos en cada butaca de estudiantes, chofer y asistente.',
      checked: cinturones,
      toggle: () => setCinturones(!cinturones),
      icon: ShieldCheck,
    },
    {
      id: 'extintorBotiquin',
      label: 'Extintor ABC Vigente con Precinto y Botiquín',
      desc: 'Manómetro en zona verde, carga anual al día y botiquín de primeros auxilios abastecido.',
      checked: extintorBotiquin,
      toggle: () => setExtintorBotiquin(!extintorBotiquin),
      icon: Flame,
    },
    {
      id: 'puertaEmergencia',
      label: 'Salida / Puerta de Emergencia Rotulada',
      desc: 'Mecanismo de apertura rápida sin trabas, martillo rompecristales y rótulo visible.',
      checked: puertaEmergencia,
      toggle: () => setPuertaEmergencia(!puertaEmergencia),
      icon: DoorOpen,
    },
    {
      id: 'llantasCombustible',
      label: 'Estado de Llantas y Nivel de Combustible',
      desc: 'Labrado mayor a 2mm, presión correcta, sin abultamientos y combustible para la jornada.',
      checked: llantasCombustible,
      toggle: () => setLlantasCombustible(!llantasCombustible),
      icon: Disc,
    },
    {
      id: 'documentacionFisica',
      label: 'Documentación Reglamentaria a Bordo',
      desc: 'Permiso CTP vigente, Dekra RTV, Póliza INS y Marchamo en el parabrisas.',
      checked: documentacionFisica,
      toggle: () => setDocumentacionFisica(!documentacionFisica),
      icon: FileText,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[200] max-w-2xl max-h-[92vh] overflow-y-auto p-0 rounded-2xl border bg-card">
        <DialogHeader className="p-5 pb-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-400 text-slate-950 font-black">
                <ClipboardCheck className="h-5 w-5" />
              </span>
              <div>
                <DialogTitle className="text-lg font-black text-white">
                  Checklist Pre-Operativo Matutino
                </DialogTitle>
                <p className="text-xs text-slate-300">
                  Inspección técnica obligatoria previa al traslado de estudiantes (CTP / MOPT)
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-1 rounded-full">
              Buseta {van.patente}
            </span>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Quick Context Card */}
          <div className="rounded-xl border bg-muted/40 p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Bus className="h-4 w-4 text-amber-500 shrink-0" />
              <span>
                Conductor: <b>{driverName}</b> · Licencia C-2 Profesional
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleCheckAll}
                className="h-7 text-[11px] font-black bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20 rounded-lg cursor-pointer gap-1"
              >
                <Sparkles className="h-3 w-3" />
                <span>Marcar Todo Conforme (30 seg)</span>
              </Button>
            </div>
          </div>

          {/* Checklist Items list */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <Label className="font-extrabold text-foreground">
                Puntos de Inspección Visual y Técnica (6 de 6 requeridos):
              </Label>
              <span className="text-[11px] text-muted-foreground font-semibold">
                {checklistItems.filter((i) => i.checked).length} / 6 Aprobados
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {checklistItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    onClick={item.toggle}
                    className={`rounded-xl border p-3 flex items-start gap-3 cursor-pointer transition-all ${
                      item.checked
                        ? 'border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20'
                        : 'border-border bg-card hover:bg-muted/50'
                    }`}
                  >
                    <div className="pt-0.5 shrink-0">
                      <div
                        className={`grid h-5 w-5 place-items-center rounded-md border text-white transition-colors ${
                          item.checked
                            ? 'bg-emerald-600 border-emerald-600'
                            : 'border-muted-foreground bg-transparent'
                        }`}
                      >
                        {item.checked && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <Icon className={`h-3.5 w-3.5 ${item.checked ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                          {item.label}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                            item.checked
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                              : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {item.checked ? 'Conforme' : 'Pendiente'}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Odometer and Observations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t">
            <div className="space-y-1">
              <Label className="text-xs font-bold flex items-center gap-1">
                <Gauge className="h-3.5 w-3.5 text-amber-500" />
                Odómetro Inicial (Kilometraje)
              </Label>
              <Input
                type="number"
                value={km}
                onChange={(e) => setKm(Number(e.target.value))}
                className="h-9 text-xs font-mono font-bold"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold">Observaciones / Novedad Operativa</Label>
              <Input
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Ej. Buseta desinfectada, presión correcta"
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Legal / CTP Warning */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-muted/30 p-2.5 text-[11px] text-muted-foreground leading-relaxed flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              Al firmar digitalmente, el conductor certifica bajo fe de juramento que la unidad cumple con la normativa CTP y Tránsito para la seguridad de los estudiantes a bordo.
            </span>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs font-bold rounded-xl cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs h-10 px-5 rounded-xl cursor-pointer gap-2 shadow-sm"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>
                {routeName ? `Firmar Constancia & Iniciar ${routeName.split('·')[0] || 'Ruta'}` : 'Firmar Constancia Pre-Operativa CTP'}
              </span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface PreOpCertificateViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inspection: PreOpInspection;
  van?: Van | undefined;
}

export function PreOpCertificateViewerModal({
  open,
  onOpenChange,
  inspection,
  van,
}: PreOpCertificateViewerModalProps) {
  const certSvg = generatePreOpCertificateSvg(
    inspection.folioDigital,
    inspection.vanPlaca,
    inspection.choferNombre,
    inspection.fechaHora,
    inspection.kilometraje,
    van?.colegio || 'Lincoln School'
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[200] max-w-2xl max-h-[92vh] overflow-y-auto p-0 rounded-2xl border bg-card">
        <DialogHeader className="p-5 pb-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500 text-white font-black">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <DialogTitle className="text-lg font-black text-white">
                  Constancia Digital de Inspección CTP
                </DialogTitle>
                <p className="text-xs text-slate-300">
                  Folio Oficial: <b>{inspection.folioDigital}</b> · Buseta <b>{inspection.vanPlaca}</b>
                </p>
              </div>
            </div>
            <Badge tone="ok">Aprobada</Badge>
          </div>
        </DialogHeader>

        <div className="p-5 space-y-4">
          <div className="rounded-xl border bg-slate-100 dark:bg-slate-900/60 p-2 flex flex-col items-center">
            <div className="max-h-[420px] overflow-y-auto w-full flex justify-center p-2 rounded-lg bg-white dark:bg-slate-950 border shadow-xs">
              <img
                src={certSvg}
                alt="Constancia de Inspección Pre-Operativa CTP"
                className="max-h-[400px] object-contain rounded"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 bg-muted/20 border-t flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const link = document.createElement('a');
              link.href = certSvg;
              link.download = `inspeccion_${inspection.folioDigital}.svg`;
              link.click();
              toast.success('Constancia CTP descargada exitosamente');
            }}
            className="text-xs font-bold rounded-xl cursor-pointer gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Descargar Constancia SVG</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs font-bold rounded-xl cursor-pointer"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
