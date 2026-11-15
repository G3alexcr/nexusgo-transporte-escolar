import { useEffect, useRef, useState } from 'react';
import { QrCode, ScanLine, CheckCircle2, ShieldCheck, UserCheck, X, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Alumno } from '@/lib/data';
import { usePlatform } from './platform-provider';
import { toast } from 'sonner';
import { playNotificationSound } from '@/lib/sound-effects';

// Visual SVG QR Pattern generator
export function SvgQrCode({ value, size = 160 }: { value: string; size?: number }) {
  // Deterministic pattern based on string value
  const seed = value.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const matrixSize = 21;
  const cells: boolean[][] = Array.from({ length: matrixSize }, () => Array(matrixSize).fill(false));

  // Finder patterns (3 corners)
  const drawFinder = (startX: number, startY: number) => {
    for (let x = 0; x < 7; x++) {
      for (let y = 0; y < 7; y++) {
        if (x === 0 || x === 6 || y === 0 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4)) {
          const row = cells[startY + y];
          if (row) row[startX + x] = true;
        }
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(matrixSize - 7, 0);
  drawFinder(0, matrixSize - 7);

  // Fill pseudo-data cells
  for (let y = 0; y < matrixSize; y++) {
    const row = cells[y];
    if (!row) continue;
    for (let x = 0; x < matrixSize; x++) {
      if (
        (x < 8 && y < 8) ||
        (x >= matrixSize - 8 && y < 8) ||
        (x < 8 && y >= matrixSize - 8)
      ) {
        continue;
      }
      row[x] = ((x * 7 + y * 13 + seed) % 3 === 0) || ((x + y + seed) % 5 === 0);
    }
  }

  const cellSize = size / matrixSize;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-lg bg-white p-2 shadow-inner">
      {cells.map((row, y) =>
        row.map((cell, x) =>
          cell ? (
            <rect
              key={`${x}-${y}`}
              x={x * cellSize}
              y={y * cellSize}
              width={cellSize + 0.3}
              height={cellSize + 0.3}
              fill="#0f172a"
              rx={0.5}
            />
          ) : null
        )
      )}
    </svg>
  );
}

// Student Digital ID Card (Carnet Digital Estudiantil)
export function StudentCardModal({
  open,
  onOpenChange,
  student,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Alumno;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent hideClose className="max-w-[295px] sm:max-w-[310px] p-0 overflow-hidden rounded-2xl border border-slate-700/50 shadow-2xl bg-card max-h-[85vh] overflow-y-auto">
        {/* Card Header with prominent close button */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-3 relative border-b border-white/10">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
              <ShieldCheck className="h-3.5 w-3.5" /> Credencial Digital
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded-full font-mono text-slate-300">2026-CR</span>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="h-6 w-6 rounded-full bg-white/15 hover:bg-white/30 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
                aria-label="Cerrar Carnet"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <div className="h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-xs shadow border border-white/20">
              {student.nombre.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs font-extrabold text-white leading-tight truncate">{student.nombre}</h3>
              <p className="text-[10px] text-amber-300 font-semibold truncate">{student.colegio} · {student.curso}</p>
            </div>
          </div>
        </div>

        {/* Card Body with QR Code */}
        <div className="p-3 space-y-2.5">
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-muted/40 border border-border/60">
            <SvgQrCode value={`LINKBUS-CR-STUDENT-${student.id}-${student.nombre}`} size={96} />
            <p className="text-[9px] font-mono text-muted-foreground mt-1 font-bold tracking-wider">
              ID: {student.id.toUpperCase()} · QR SEGURO
            </p>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <div className="rounded-lg border bg-muted/20 p-1.5">
              <p className="text-[8px] font-bold text-muted-foreground uppercase">Apoderado</p>
              <p className="font-bold text-foreground text-[10px] truncate mt-0.5">{student.apoderado}</p>
              <p className="text-[9px] font-mono text-amber-600 dark:text-amber-400 mt-0.5">{student.telefonoApoderado || '8841-9230'}</p>
            </div>
            <div className="rounded-lg border bg-muted/20 p-1.5">
              <p className="text-[8px] font-bold text-muted-foreground uppercase">Parada</p>
              <p className="font-bold text-foreground text-[10px] truncate mt-0.5">{student.direccion}</p>
              <p className="text-[8px] text-muted-foreground mt-0.5">Costa Rica</p>
            </div>
          </div>

          <p className="text-[9px] text-center text-muted-foreground leading-tight">
            Muestra este QR al chofer para registrar el check-in automático.
          </p>

          <Button
            size="sm"
            onClick={() => onOpenChange(false)}
            className="w-full h-8 bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 font-bold text-xs rounded-lg active:scale-98 transition-all"
          >
            Listo / Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Scanner Modal for Driver (Real Camera + Fallback List)
interface BarcodeDetectorLike {
  detect(source: HTMLVideoElement): Promise<Array<{ rawValue?: string }>>;
}

export function DriverQrScannerModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { state, dispatch } = usePlatform();
  const students = state.alumnos || [];
  const [scannedId, setScannedId] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleRecordCheckin = (alumno: Alumno) => {
    if (scannedId) return;
    setScannedId(alumno.id);
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const currentStatus = state.attendance[alumno.id]?.status || 'Pendiente';
    const nextStatus = currentStatus === 'A bordo' ? 'Entregado' : 'A bordo';

    if (state.isOfflineMode) {
      dispatch({
        type: 'queueOfflineAttendance',
        item: {
          id: `offline-qr-${Date.now()}-${alumno.id}`,
          type: 'attendance',
          alumnoId: alumno.id,
          alumnoNombre: alumno.nombre,
          status: nextStatus,
          time: timeStr,
          timestamp: Date.now(),
        },
      });
      playNotificationSound('qr_scan');
      toast.warning(`[Check-in QR Offline] ${alumno.nombre} ➔ "${nextStatus}"`, {
        description: 'Guardado en cola local (Sin señal). Se sincronizará automáticamente.',
      });
    } else {
      dispatch({
        type: 'attendance',
        id: alumno.id,
        status: nextStatus,
        time: timeStr,
      });
      playNotificationSound('qr_scan');
      toast.success(`¡Check-in QR Exitoso!`, {
        description: `${alumno.nombre} marcado como "${nextStatus}" (${timeStr} hrs)`,
      });
    }

    setTimeout(() => {
      setScannedId(null);
      onOpenChange(false);
    }, 1200);
  };

  useEffect(() => {
    if (!open) {
      setCameraActive(false);
      setCameraError(null);
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraError('Cámara no disponible en este navegador; usa la lista rápida abajo.');
      return;
    }

    let cancelled = false;
    let stream: MediaStream | null = null;
    let timerId: number | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
        setCameraActive(true);
        setCameraError(null);

        const DetectorCtor = (window as unknown as {
          BarcodeDetector?: new (opts: { formats: string[] }) => BarcodeDetectorLike;
        }).BarcodeDetector;

        if (!DetectorCtor) {
          setCameraError('Cámara activa (lector automático no soportado en este navegador; usa la lista rápida).');
          return;
        }

        const detector = new DetectorCtor({ formats: ['qr_code'] });
        const scanTick = async () => {
          if (cancelled || !videoRef.current) return;
          if (videoRef.current.readyState >= 2) {
            try {
              const codes = await detector.detect(videoRef.current);
              const raw = codes[0]?.rawValue?.trim();
              if (raw) {
                const matched = students.find(
                  (a) => raw.includes(a.id) || raw.toLowerCase().includes(a.nombre.toLowerCase()),
                );
                if (matched) {
                  handleRecordCheckin(matched);
                  return;
                }
              }
            } catch {
              // Ignore transient frame detection errors
            }
          }
          timerId = window.setTimeout(scanTick, 250);
        };
        timerId = window.setTimeout(scanTick, 350);
      } catch {
        if (!cancelled) {
          setCameraActive(false);
          setCameraError('No se pudo acceder a la cámara. Puedes marcar manualmente abajo.');
        }
      }
    };

    void startCamera();

    return () => {
      cancelled = true;
      if (timerId !== null) window.clearTimeout(timerId);
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [open, students.length]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[320px] sm:max-w-[340px] p-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-1.5 text-sm font-extrabold">
            <Camera className="h-4 w-4 text-amber-500" />
            Escáner QR de Buseta
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-1">
          {/* Real Camera Viewfinder */}
          <div className="relative aspect-square w-full max-w-[200px] mx-auto rounded-xl bg-slate-950 flex flex-col items-center justify-center overflow-hidden border-2 border-amber-400/60 shadow-inner">
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className={`absolute inset-0 h-full w-full object-cover ${cameraActive ? 'opacity-100' : 'opacity-0'}`}
            />
            <div className="absolute inset-3 border border-dashed border-white/50 rounded-lg pointer-events-none" />
            {!cameraActive && (
              <div className="relative z-10 flex flex-col items-center px-3 text-center">
                <ScanLine className="h-10 w-10 text-amber-400 animate-pulse" />
                <p className="mt-2 text-[10px] font-bold text-white/80">
                  {cameraError ?? 'Iniciando cámara...'}
                </p>
              </div>
            )}

            {scannedId && (
              <div className="absolute inset-0 z-20 bg-emerald-600/90 flex flex-col items-center justify-center text-white backdrop-blur-sm animate-in fade-in">
                <CheckCircle2 className="h-12 w-12 animate-bounce" />
                <p className="text-xs font-extrabold mt-1">¡Verificado!</p>
              </div>
            )}
          </div>
          {cameraActive && cameraError && (
            <p className="text-[10px] text-center text-amber-600 dark:text-amber-400 font-medium">
              {cameraError}
            </p>
          )}

          <div className="border-t pt-2">
            <p className="text-[11px] font-bold text-muted-foreground mb-1.5">
              Check-in rápido manual (o respaldo):
            </p>
            <div className="max-h-40 overflow-y-auto space-y-1 divide-y">
              {students.map((a) => {
                const currentStatus = state.attendance[a.id]?.status || 'Pendiente';
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => handleRecordCheckin(a)}
                    className="w-full flex items-center justify-between p-1.5 rounded-lg text-left text-[11px] font-bold hover:bg-muted transition-colors"
                  >
                    <div className="truncate pr-2">
                      <span className="truncate">{a.nombre}</span>
                      <p className="text-[9px] font-normal text-muted-foreground">{a.colegio}</p>
                    </div>
                    <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-800 dark:text-amber-300">
                      Check-in ({currentStatus})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="w-full h-8 text-xs font-semibold mt-1"
          >
            Cerrar Escáner
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
