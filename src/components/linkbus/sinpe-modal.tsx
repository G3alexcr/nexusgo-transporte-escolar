import { useState, useRef } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Upload,
  CheckCircle2,
  XCircle,
  Smartphone,
  Eye,
  FileCheck,
  Building2,
  Receipt,
  Download,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { Badge } from './shared';
import { usePlatform } from './platform-provider';
import { generateSinpeVoucherSvg, generateDigitalReceiptSvg } from '@/lib/document-samples';
import { playNotificationSound } from '@/lib/sound-effects';
import { uploadFileToStorage } from '@/lib/supabase-storage';
import type { Alumno } from '@/lib/data';
import type { MonthlyPayment } from '@/lib/platform-state';

export const BANCOS_CR = [
  'BAC Credomatic',
  'Banco Nacional (BNCR)',
  'Banco de Costa Rica (BCR)',
  'Banco Popular y de Desarrollo Comunal',
  'Banco Promerica',
  'Scotiabank Costa Rica',
  'Banco Davivienda',
  'Coopeande',
  'Mucap',
];

interface ReportarSinpeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alumno: Alumno;
  choferNombre?: string | undefined;
  choferTelefono?: string | undefined;
  onSuccess: (data: { banco: string; comprobanteRef: string; comprobanteFoto?: string | undefined; monto: number }) => void;
}

export function ReportarSinpeModal({
  open,
  onOpenChange,
  alumno,
  choferNombre = 'Carlos Solís Morales',
  choferTelefono = '8841-2390',
  onSuccess,
}: ReportarSinpeModalProps) {
  const [banco, setBanco] = useState('BAC Credomatic');
  const [comprobanteRef, setComprobanteRef] = useState(
    `SINPE-${Math.floor(1000000 + Math.random() * 9000000)}`
  );
  const [monto, setMonto] = useState(alumno.monto || 65000);
  const [uploadedFoto, setUploadedFoto] = useState<string | null>(null);
  const [useGeneratedVoucher, setUseGeneratedVoucher] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { state } = usePlatform();

  // Generate real-time authentic BCCR SVG voucher
  const generatedVoucherSvg = generateSinpeVoucherSvg(
    banco,
    comprobanteRef.trim() || 'SINPE-PENDIENTE',
    Number(monto) || 65000,
    alumno.apoderado,
    choferNombre,
    choferTelefono
  );

  const activeVoucherPreview = uploadedFoto || generatedVoucherSvg;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor selecciona un archivo de imagen (PNG, JPG, WebP)');
        return;
      }
      const toastId = toast.loading('Subiendo comprobante a Supabase Storage...');
      try {
        const publicUrl = await uploadFileToStorage(file, {
          tenantId: state.currentTenantId,
          folder: 'sinpe',
          filename: file.name,
        });
        setUploadedFoto(publicUrl);
        setUseGeneratedVoucher(false);
        toast.success('Comprobante subido exitosamente', { id: toastId });
      } catch {
        toast.error('No se pudo subir el comprobante', { id: toastId });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comprobanteRef.trim()) {
      toast.error('Por favor ingresa el número de referencia o comprobante SINPE');
      return;
    }

    onSuccess({
      banco,
      comprobanteRef: comprobanteRef.trim(),
      comprobanteFoto: activeVoucherPreview,
      monto: Number(monto) || alumno.monto,
    });

    playNotificationSound('push');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[200] max-w-2xl max-h-[92vh] overflow-y-auto p-0 rounded-2xl border bg-card">
        <DialogHeader className="p-5 pb-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <Smartphone className="h-5 w-5" />
            </span>
            <div>
              <DialogTitle className="text-lg font-black text-white">
                Reportar Pago por SINPE Móvil
              </DialogTitle>
              <p className="text-xs text-slate-300">
                Adjunta la referencia y comprobante emitido por tu banco en Costa Rica
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Destination Account Reminder */}
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-50/70 dark:bg-emerald-950/30 p-3.5 space-y-1.5 text-xs">
            <div className="flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-300">
              <span className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" /> Datos de Recepción SINPE Móvil
              </span>
              <span className="text-[10px] bg-emerald-200 dark:bg-emerald-800 px-2 py-0.5 rounded-full">
                Transportista Autorizado
              </span>
            </div>
            <p className="text-foreground">
              Número SINPE: <b className="font-mono text-sm text-emerald-700 dark:text-emerald-300">+506 {choferTelefono}</b>
            </p>
            <p className="text-muted-foreground">
              Titular de la cuenta: <b>{choferNombre}</b> · Servicio de transporte para <b>{alumno.nombre}</b> ({alumno.colegio}).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Bank Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Banco de Origen (Costa Rica)</Label>
              <Select value={banco} onValueChange={setBanco}>
                <SelectTrigger className="h-10 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BANCOS_CR.map((b) => (
                    <SelectItem key={b} value={b} className="text-xs">
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reference Number */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Número de Comprobante / Referencia</Label>
              <Input
                value={comprobanteRef}
                onChange={(e) => setComprobanteRef(e.target.value)}
                placeholder="Ej. SINPE-8491203"
                className="h-10 text-xs font-mono font-bold"
                required
              />
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Monto Transferido (₡ CRC)</Label>
              <Input
                type="number"
                value={monto}
                onChange={(e) => setMonto(Number(e.target.value))}
                className="h-10 text-xs font-bold"
                required
              />
            </div>

            {/* Student reminder */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Estudiante & Mes</Label>
              <Input
                value={`${alumno.nombre} · Octubre 2026`}
                disabled
                className="h-10 text-xs bg-muted font-medium"
              />
            </div>
          </div>

          {/* Screenshot / Voucher Attachment Mode */}
          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold">Captura de Pantalla / Comprobante Bancario</Label>
              <div className="flex items-center gap-2 text-xs">
                {uploadedFoto && (
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedFoto(null);
                      setUseGeneratedVoucher(true);
                    }}
                    className="text-amber-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" /> Usar comprobante generado
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="h-11 border-dashed font-bold text-xs gap-2 rounded-xl cursor-pointer hover:bg-muted"
              >
                <Upload className="h-4 w-4 text-slate-500" />
                <span>{uploadedFoto ? 'Cambiar Foto / Captura' : 'Subir Captura de tu Banco / SMS'}</span>
              </Button>

              <p className="text-[11px] text-muted-foreground leading-tight">
                {uploadedFoto
                  ? 'Captura personalizada cargada desde tu dispositivo.'
                  : 'Puedes subir una foto real de la app de tu banco, o enviar el comprobante electrónico generado.'}
              </p>
            </div>

            {/* Interactive Live Voucher Preview */}
            <div className="mt-3 rounded-xl border bg-muted/30 p-2 overflow-hidden flex flex-col items-center">
              <div className="flex items-center justify-between w-full px-2 py-1 text-[11px] text-muted-foreground font-semibold">
                <span>Vista Previa del Comprobante a Enviar</span>
                <span className="text-emerald-600 font-bold">● Válido para Verificación</span>
              </div>
              <div className="max-h-60 overflow-y-auto w-full flex justify-center p-1 rounded-lg bg-white dark:bg-slate-900 border shadow-xs">
                <img
                  src={activeVoucherPreview}
                  alt="Comprobante SINPE"
                  className="max-h-56 object-contain rounded"
                />
              </div>
            </div>
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
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-10 px-5 rounded-xl cursor-pointer gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Confirmar y Enviar Comprobante</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface SinpeComprobanteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alumno: Alumno;
  payment?: MonthlyPayment | undefined;
  choferNombre?: string | undefined;
  isApprover?: boolean | undefined;
  onApprove?: (() => void) | undefined;
  onReject?: ((motivo?: string | undefined) => void) | undefined;
}

export function SinpeComprobanteModal({
  open,
  onOpenChange,
  alumno,
  payment,
  choferNombre = 'Carlos Solís Morales',
  isApprover = false,
  onApprove,
  onReject,
}: SinpeComprobanteModalProps) {
  const [rejectPrompt, setRejectPrompt] = useState(false);
  const [rejectReason, setRejectReason] = useState(
    'El comprobante no coincide con los fondos acreditados en la cuenta bancaria.'
  );
  const [viewingReceipt, setViewingReceipt] = useState(false);

  const status = payment?.status || alumno.pago;
  const banco = payment?.banco || 'BAC Credomatic';
  const comprobanteRef = payment?.comprobanteRef || 'SINPE-9941203';
  const monto = payment?.montoReportado || alumno.monto || 65000;
  const fechaReporte = payment?.fechaReporte || '13/11/2026, 18:45';
  const reciboNum = payment?.reciboNumero || 'LB-REC-2026-8812';

  // SVG images
  const voucherImage =
    payment?.comprobanteFoto ||
    generateSinpeVoucherSvg(
      banco,
      comprobanteRef,
      monto,
      alumno.apoderado,
      choferNombre,
      '8841-2390',
      fechaReporte
    );

  const receiptImage = generateDigitalReceiptSvg(
    reciboNum,
    alumno.nombre,
    alumno.apoderado,
    monto,
    'Octubre 2026',
    payment?.fechaAprobado,
    payment?.aprobadoPor || choferNombre,
    'SJ-4821',
    alumno.colegio
  );

  const handleConfirmReject = () => {
    if (onReject) {
      onReject(rejectReason);
      toast.info('Comprobante marcado con observación para la familia');
      setRejectPrompt(false);
      onOpenChange(false);
    }
  };

  const handleConfirmApprove = () => {
    if (onApprove) {
      onApprove();
      playNotificationSound('push');
      toast.success('¡Pago Aprobado con Éxito!', {
        description: `Recibo oficial emitido y registrado para ${alumno.nombre}.`,
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[200] max-w-2xl max-h-[92vh] overflow-y-auto p-0 rounded-2xl border bg-card">
        <DialogHeader className="p-5 pb-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-400 text-slate-950">
                {viewingReceipt ? <Receipt className="h-5 w-5" /> : <FileCheck className="h-5 w-5" />}
              </span>
              <div>
                <DialogTitle className="text-lg font-black text-white">
                  {viewingReceipt ? 'Recibo Oficial Digital de Mensualidad' : 'Comprobante de Pago SINPE Móvil'}
                </DialogTitle>
                <p className="text-xs text-slate-300">
                  Estudiante: <b>{alumno.nombre}</b> · {alumno.colegio}
                </p>
              </div>
            </div>
            <Badge tone={status === 'Pagado' ? 'ok' : status === 'En Verificación' ? 'warn' : 'bad'}>
              {status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="p-5 space-y-4">
          {/* Status Alert Banner */}
          {status === 'En Verificación' && (
            <div className="rounded-xl border border-amber-400/50 bg-amber-50 dark:bg-amber-950/30 p-3.5 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <p className="font-extrabold text-amber-900 dark:text-amber-300">
                  Comprobante en Espera de Verificación
                </p>
                <p className="text-muted-foreground">
                  El apoderado reportó una transferencia SINPE por <b>₡{monto.toLocaleString('es-CR')}</b> desde <b>{banco}</b> el {fechaReporte}.
                  {isApprover
                    ? ' Revisa el número de referencia y valida los fondos en tu cuenta bancaria antes de aprobar.'
                    : ' El transportista está validando el depósito en su cuenta.'}
                </p>
              </div>
            </div>
          )}

          {status === 'Pagado' && (
            <div className="rounded-xl border border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/30 p-3.5 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 text-xs">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold text-emerald-900 dark:text-emerald-300">
                    Pago Verificado y Aprobado
                  </p>
                  <p className="text-muted-foreground">
                    Aprobado por: <b>{payment?.aprobadoPor || choferNombre}</b> {payment?.fechaAprobado ? `el ${payment.fechaAprobado}` : ''}.
                  </p>
                  <p className="font-mono text-emerald-700 dark:text-emerald-400 font-bold mt-0.5">
                    Recibo Oficial: #{reciboNum}
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setViewingReceipt(!viewingReceipt)}
                className="shrink-0 text-xs font-bold rounded-xl cursor-pointer border-emerald-400/50"
              >
                {viewingReceipt ? 'Ver Comprobante Banco' : 'Ver Recibo Emitido'}
              </Button>
            </div>
          )}

          {/* Quick Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs bg-muted/40 p-3 rounded-xl border">
            <div>
              <span className="text-muted-foreground text-[10px] uppercase font-bold">Banco Emisor:</span>
              <p className="font-bold text-foreground truncate">{banco}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] uppercase font-bold">Referencia SINPE:</span>
              <p className="font-mono font-bold text-foreground truncate">{comprobanteRef}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] uppercase font-bold">Monto:</span>
              <p className="font-extrabold text-foreground">₡{monto.toLocaleString('es-CR')}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] uppercase font-bold">Apoderado:</span>
              <p className="font-bold text-foreground truncate">{alumno.apoderado}</p>
            </div>
          </div>

          {/* Document Viewer (Voucher or Digital Receipt) */}
          <div className="rounded-xl border bg-slate-100 dark:bg-slate-900/60 p-2 flex flex-col items-center">
            <div className="max-h-[360px] overflow-y-auto w-full flex justify-center p-2 rounded-lg bg-white dark:bg-slate-950 border shadow-xs">
              <img
                src={viewingReceipt ? receiptImage : voucherImage}
                alt={viewingReceipt ? 'Recibo Digital' : 'Comprobante SINPE'}
                className="max-h-[340px] object-contain rounded"
              />
            </div>
          </div>

          {/* Rejection Prompt Form if active */}
          {rejectPrompt && isApprover && (
            <div className="rounded-xl border border-rose-400/50 bg-rose-50 dark:bg-rose-950/30 p-3.5 space-y-2 text-xs">
              <p className="font-extrabold text-rose-800 dark:text-rose-300">
                Motivo de Rechazo u Observación para el Apoderado
              </p>
              <Input
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="h-9 text-xs bg-white dark:bg-slate-900"
                placeholder="Escribe el motivo..."
              />
              <div className="flex justify-end gap-2 pt-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setRejectPrompt(false)}
                  className="text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleConfirmReject}
                  className="text-xs font-bold rounded-xl cursor-pointer"
                >
                  Confirmar Rechazo
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-4 bg-muted/20 border-t flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const link = document.createElement('a');
                link.href = viewingReceipt ? receiptImage : voucherImage;
                link.download = viewingReceipt ? `recibo_${reciboNum}.svg` : `comprobante_${comprobanteRef}.svg`;
                link.click();
                toast.success('Archivo descargado');
              }}
              className="text-xs font-bold rounded-xl cursor-pointer gap-1"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Descargar</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {isApprover && status === 'En Verificación' && (
              <>
                {!rejectPrompt && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setRejectPrompt(true)}
                    className="text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl cursor-pointer gap-1"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Rechazar</span>
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={handleConfirmApprove}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs h-10 px-4 rounded-xl cursor-pointer gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Aprobar Pago & Emitir Recibo</span>
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs font-bold rounded-xl cursor-pointer"
            >
              Cerrar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
