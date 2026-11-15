import { useState, useRef, useEffect } from 'react';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Download,
  Eye,
  Eraser,
  PenTool,
  Clock,
  AlertCircle,
  Bus,
  School,
  User,
  CreditCard,
  X,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { usePlatform } from './platform-provider';
import { generateStudentContractSvg } from '@/lib/document-samples';
import { crc, type Alumno, type Van } from '@/lib/data';
import { playNotificationSound } from '@/lib/sound-effects';
import { uploadCanvasToStorage } from '@/lib/supabase-storage';

export interface ContratoTransporteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alumno: Alumno;
  van?: Van | undefined;
}

export function ContratoTransporteModal({ open, onOpenChange, alumno, van }: ContratoTransporteModalProps) {
  const { state, dispatch } = usePlatform();
  const contract = state.contracts[alumno.id];

  const activeVan =
    van ||
    state.vans.find(
      (v) =>
        v.colegio.toLowerCase().includes(alumno.colegio.toLowerCase()) ||
        alumno.colegio.toLowerCase().includes(v.colegio.toLowerCase())
    ) ||
    state.vans[0];

  const parentName = alumno.apoderado || state.parentProfile?.nombre || 'Carla Pérez Monge';
  const defaultCedula = state.parentProfile?.cedula || '1-1240-0899';

  const [cedulaInput, setCedulaInput] = useState(defaultCedula);
  const [apoderadoInput, setApoderadoInput] = useState(parentName);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | undefined>(undefined);
  const [viewerOpen, setViewerOpen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize canvas when modal opens
  useEffect(() => {
    if (open && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [open, contract?.signed]);

  const clearSignature = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawn(false);
      setSignatureDataUrl(undefined);
    }
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    if ('touches' in e) {
      const touch = e.touches[0];
      if (!touch) return { x: 0, y: 0 };
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCanvasCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    if (!isDrawing || !canvasRef.current) return;
    setIsDrawing(false);
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      setSignatureDataUrl(dataUrl);
    } catch {
      // ignore
    }
  };

  const handleSignContract = async () => {
    if (!acceptedTerms) {
      toast.error('Debe marcar la casilla de aceptación de términos del contrato.');
      return;
    }
    if (!cedulaInput.trim()) {
      toast.error('Por favor indique el número de cédula del apoderado titular.');
      return;
    }

    let uploadedSignatureUrl: string | undefined = hasDrawn ? signatureDataUrl : undefined;
    if (hasDrawn && canvasRef.current) {
      const toastId = toast.loading('Guardando firma en Supabase Storage...');
      try {
        uploadedSignatureUrl = await uploadCanvasToStorage(canvasRef.current, {
          tenantId: state.currentTenantId,
          folder: 'contracts',
          filename: `firma-${alumno.id}.png`,
        });
        setSignatureDataUrl(uploadedSignatureUrl);
        toast.dismiss(toastId);
      } catch {
        toast.dismiss(toastId);
      }
    }

    dispatch({
      type: 'signStudentContract',
      alumnoId: alumno.id,
      signedBy: apoderadoInput.trim() || parentName,
      cedulaApoderado: cedulaInput.trim(),
      signatureDataUrl: uploadedSignatureUrl,
    });

    playNotificationSound('push');
    toast.success('¡Contrato de Transporte Escolar firmado con éxito!', {
      description: `Comprobante digital registrado bajo el folio oficial ${contract?.folioDigital || 'CTP-CTR-2026-0814'}.`,
    });
  };

  const downloadContract = () => {
    const folio = contract?.folioDigital || 'CTP-CTR-2026-0814';
    const svgData = generateStudentContractSvg(
      folio,
      alumno.nombre,
      contract?.signedBy || apoderadoInput,
      contract?.cedulaApoderado || cedulaInput,
      alumno.colegio,
      activeVan?.chofer || 'Carlos Solís Morales',
      activeVan?.patente || 'SJ-4821',
      alumno.monto,
      contract?.signedAt || '15/02/2026 09:30 AM',
      contract?.signatureDataUrl || signatureDataUrl
    );

    const a = document.createElement('a');
    a.href = svgData;
    a.download = `Contrato_LinkBus_${alumno.nombre.replace(/\s+/g, '_')}_${folio}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    toast.success('Contrato oficial descargado en formato vectorial / imprimible');
  };

  const isSigned = contract?.signed;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="z-[200] max-w-2xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 rounded-2xl">
          <DialogHeader className="border-b pb-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full">
                Consejo de Transporte Público (CTP) · Costa Rica
              </span>
              <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded shrink-0">
                {contract?.folioDigital || 'CTP-CTR-2026'}
              </span>
            </div>
            <DialogTitle className="text-lg sm:text-xl font-black text-foreground flex items-center gap-2 mt-1">
              <FileText className="h-5 w-5 text-amber-500 shrink-0" />
              <span>Contrato de Transporte de Estudiantes 2026</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Instrumento legal formal suscrito conforme al Decreto Ejecutivo N° 35249-MOPT, Ley de Tránsito N° 9078 y normativas del CTP.
            </DialogDescription>
          </DialogHeader>

          {/* Status banner */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between gap-2.5 ${
              isSigned
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {isSigned ? (
                <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
              )}
              <div>
                <p className="text-xs font-black">
                  {isSigned ? 'Contrato Legal Firmado y Vigente' : 'Contrato Pendiente de Firma Digital'}
                </p>
                <p className="text-[11px] opacity-90">
                  {isSigned
                    ? `Suscrito por ${contract?.signedBy} el ${contract?.signedAt} · Folio ${contract?.folioDigital}`
                    : 'Requiere la aceptación y firma del apoderado legal para iniciar el ciclo lectivo.'}
                </p>
              </div>
            </div>

            {isSigned && (
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white shrink-0">
                ✓ Al Día CTP
              </span>
            )}
          </div>

          {/* Parties & Service Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Operator Box */}
            <div className="rounded-xl border bg-muted/30 p-3 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Bus className="h-3 w-3 text-amber-500" /> Operador de Transporte
              </span>
              <p className="font-extrabold text-foreground">{activeVan?.chofer || 'Carlos Solís Morales'}</p>
              <p className="text-[11px] text-muted-foreground">
                Buseta Placa: <b className="text-foreground">{activeVan?.patente || 'SJ-4821'}</b> · {activeVan?.marcaModelo || 'Toyota Coaster'}
              </p>
              <p className="text-[10.5px] text-emerald-700 dark:text-emerald-300 font-semibold">
                ✓ Permiso CTP {activeVan?.permisoCtp || 'CTP-TE-2024-8841'} · Dekra y Póliza INS al día
              </p>
            </div>

            {/* Student & Guardian Box */}
            <div className="rounded-xl border bg-muted/30 p-3 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3 text-sky-500" /> Estudiante & Apoderado
              </span>
              <p className="font-extrabold text-foreground">
                {alumno.nombre} ({alumno.curso})
              </p>
              <p className="text-[11px] text-muted-foreground">
                Colegio: <b className="text-foreground">{alumno.colegio}</b>
              </p>
              <p className="text-[11px] text-muted-foreground">
                Parada Acordada: <b className="text-foreground">{alumno.direccion}</b>
              </p>
              <p className="text-[10.5px] font-bold text-amber-700 dark:text-amber-400">
                Tarifa Mensual Pactada: {crc(alumno.monto)}
              </p>
            </div>
          </div>

          {/* Contract Clauses Box (Scrollable) */}
          <div className="rounded-xl border bg-card p-3.5 space-y-2.5">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
                Cláusulas Reglamentarias del Servicio
              </h4>
              <span className="text-[10px] text-muted-foreground font-mono">6 Cláusulas CTP</span>
            </div>

            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1 text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed scrollbar-thin">
              <div className="p-2 rounded-lg bg-muted/40">
                <p className="font-bold text-foreground">PRIMERA: Objeto del Servicio y Rutas</p>
                <p className="text-muted-foreground mt-0.5">
                  El transportista se compromete al traslado seguro y puntual del estudiante desde el punto de parada convenido ({alumno.direccion}) hasta el centro educativo ({alumno.colegio}) y su posterior retorno.
                </p>
              </div>

              <div className="p-2 rounded-lg bg-muted/40">
                <p className="font-bold text-foreground">SEGUNDA: Horarios y Tolerancia en Parada</p>
                <p className="text-muted-foreground mt-0.5">
                  El estudiante deberá encontrarse preparado en el punto acordado con al menos 5 minutos de antelación. La tolerancia máxima de espera en parada será de <b>3 minutos</b> para preservar la puntualidad de la ruta.
                </p>
              </div>

              <div className="p-2 rounded-lg bg-muted/40">
                <p className="font-bold text-foreground">TERCERA: Seguridad a Bordo y Asistente Acreditada</p>
                <p className="text-muted-foreground mt-0.5">
                  Es obligatorio el uso ininterrumpido del cinturón de seguridad de tres puntos. La unidad cuenta con asistente acreditada ante el CTP. Queda prohibido pararse o sacar las manos con el vehículo en movimiento.
                </p>
              </div>

              <div className="p-2 rounded-lg bg-muted/40">
                <p className="font-bold text-foreground">CUARTA: Cobertura de Póliza Colectiva INS</p>
                <p className="text-muted-foreground mt-0.5">
                  El estudiante cuenta con cobertura completa bajo la Póliza Colectiva de Accidentes Estudiantiles del Instituto Nacional de Seguros (INS) y Seguro de Responsabilidad Civil por lesión o daños.
                </p>
              </div>

              <div className="p-2 rounded-lg bg-muted/40">
                <p className="font-bold text-foreground">QUINTA: Retiro y Entrega de Menores</p>
                <p className="text-muted-foreground mt-0.5">
                  El estudiante únicamente será entregado al apoderado titular o a las personas formalmente registradas en el módulo de Personas Autorizadas de la aplicación Nexus Go con cédula en mano.
                </p>
              </div>

              <div className="p-2 rounded-lg bg-muted/40">
                <p className="font-bold text-foreground">SEXTA: Condiciones de Pago y Cancelación</p>
                <p className="text-muted-foreground mt-0.5">
                  La cuota mensual de {crc(alumno.monto)} deberá cancelarse dentro de los primeros 5 días hábiles de cada mes mediante transferencia o SINPE Móvil oficial del transportista.
                </p>
              </div>
            </div>
          </div>

          {/* Signature Section */}
          {isSigned ? (
            <div className="rounded-xl border border-emerald-400/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" /> Constancia de Firma Digital Registrada
                </span>
                <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                  {contract.folioDigital}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Firmante Legal:</p>
                  <p className="font-bold text-foreground">{contract.signedBy}</p>
                  <p className="text-[11px] text-muted-foreground font-mono">Cédula: {contract.cedulaApoderado}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Fecha y Hora: <b className="text-foreground">{contract.signedAt}</b>
                  </p>
                </div>

                <div className="h-20 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 p-2 flex items-center justify-center relative overflow-hidden">
                  {contract.signatureDataUrl ? (
                    <img
                      src={contract.signatureDataUrl}
                      alt="Firma Digital"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-center">
                      <p className="font-mono text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        {contract.signedBy}
                      </p>
                      <span className="text-[9px] text-muted-foreground">Firma Digital Verificada</span>
                    </div>
                  )}
                  <div className="absolute bottom-1 right-2 text-[8px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    Sello Digital CTP
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-emerald-200 dark:border-emerald-800 flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={downloadContract}
                  className="gap-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Descargar Comprobante / Contrato (PDF / SVG)</span>
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setViewerOpen(true)}
                  className="gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Ver Documento Completo</span>
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    dispatch({ type: 'resetStudentContract', alumnoId: alumno.id });
                    toast.info('Se ha reabierto el contrato para una nueva firma digital.');
                  }}
                  className="text-[10px] text-muted-foreground underline hover:text-foreground cursor-pointer ml-auto"
                >
                  Volver a firmar
                </button>
              </div>
            </div>
          ) : (
            /* Signing pad */
            <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20 p-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <PenTool className="h-4 w-4 text-amber-500" /> Firma en Pantalla o Aceptación Registrada
                </span>
                <span className="text-[10px] text-muted-foreground">Dibuja con dedo o ratón</span>
              </div>

              {/* Identification inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold">Nombre Completo del Apoderado</Label>
                  <Input
                    value={apoderadoInput}
                    onChange={(e) => setApoderadoInput(e.target.value)}
                    placeholder="Ej. Carla Pérez Monge"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold">Cédula de Identidad (Nacional / DIMEX)</Label>
                  <Input
                    value={cedulaInput}
                    onChange={(e) => setCedulaInput(e.target.value)}
                    placeholder="1-1240-0899"
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Canvas Signature Pad */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] font-bold">Trazar Firma Manuscrita (Opcional)</Label>
                  {hasDrawn && (
                    <button
                      type="button"
                      onClick={clearSignature}
                      className="text-[10px] text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Eraser className="h-3 w-3" /> Limpiar Trazo
                    </button>
                  )}
                </div>

                <div className="rounded-xl border-2 border-dashed border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 overflow-hidden relative shadow-inner">
                  <canvas
                    ref={canvasRef}
                    width={560}
                    height={120}
                    className="w-full h-28 touch-none cursor-crosshair bg-white dark:bg-slate-900"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                  {!hasDrawn && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-muted-foreground/60 text-xs">
                      <span>✍️ Firme aquí con su dedo o puntero del ratón</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Legal terms checkbox */}
              <div className="flex items-start gap-2.5 pt-1">
                <Checkbox
                  id="accept-terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(Boolean(checked))}
                  className="mt-0.5"
                />
                <label
                  htmlFor="accept-terms"
                  className="text-xs font-medium text-foreground leading-snug cursor-pointer select-none"
                >
                  Declaro bajo fe de juramento que soy el apoderado legal de <b>{alumno.nombre}</b>, acepto expresamente todas las cláusulas de prestación del servicio de transporte escolar 2026, normas de seguridad y condiciones de pago.
                </label>
              </div>

              <Button
                onClick={handleSignContract}
                disabled={!acceptedTerms}
                className="w-full h-10 font-bold text-xs rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 cursor-pointer shadow-sm gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Firmar y Registrar Contrato Oficial CTP</span>
              </Button>
            </div>
          )}

          <DialogFooter className="border-t pt-3 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1 text-center sm:text-left">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              Certificación respaldada por Nexus Go conforme a la Ley N° 8454
            </span>
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="text-xs font-bold rounded-xl">
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Viewer Lightbox Modal */}
      {viewerOpen && (
        <ContratoViewerModal
          open={viewerOpen}
          onOpenChange={setViewerOpen}
          alumno={alumno}
          van={activeVan}
        />
      )}
    </>
  );
}

export function ContratoViewerModal({
  open,
  onOpenChange,
  alumno,
  van,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alumno: Alumno;
  van?: Van | undefined;
}) {
  const { state } = usePlatform();
  const contract = state.contracts[alumno.id];
  const folio = contract?.folioDigital || 'CTP-CTR-2026-0814';

  const svgSrc = generateStudentContractSvg(
    folio,
    alumno.nombre,
    contract?.signedBy || alumno.apoderado,
    contract?.cedulaApoderado || '1-1240-0899',
    alumno.colegio,
    van?.chofer || 'Carlos Solís Morales',
    van?.patente || 'SJ-4821',
    alumno.monto,
    contract?.signedAt || '15/02/2026 09:30 AM',
    contract?.signatureDataUrl
  );

  const download = () => {
    const a = document.createElement('a');
    a.href = svgSrc;
    a.download = `Contrato_CTP_${alumno.nombre.replace(/\s+/g, '_')}_${folio}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Documento oficial descargado');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[200] max-w-3xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 rounded-2xl">
        <DialogHeader className="border-b pb-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-400/10 px-2 py-0.5 rounded-full">
              Expediente Legal CTP
            </span>
            <span className="text-[10px] font-mono font-bold text-muted-foreground">{folio}</span>
          </div>
          <DialogTitle className="text-base sm:text-lg font-black text-foreground">
            Contrato de Transporte Escolar · {alumno.nombre}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Documento legal digitalizado y sellado por el Consejo de Transporte Público (CTP).
          </DialogDescription>
        </DialogHeader>

        <div className="my-2 rounded-xl overflow-hidden border border-border bg-slate-100 dark:bg-slate-900 shadow-inner flex items-center justify-center p-2 sm:p-4">
          <img src={svgSrc} alt="Contrato Escolar CTP" className="max-h-[600px] w-auto shadow-md rounded-lg" />
        </div>

        <DialogFooter className="border-t pt-3 flex flex-row items-center justify-between gap-2">
          <Button
            size="sm"
            onClick={download}
            className="gap-1.5 text-xs font-bold rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-500 cursor-pointer shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Descargar Contrato (PDF / SVG)</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="text-xs font-bold rounded-xl">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
