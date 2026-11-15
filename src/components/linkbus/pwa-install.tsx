import { useState, useEffect } from 'react';
import { Download, Smartphone, X, CheckCircle2, Share, PlusSquare, QrCode, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SvgQrCode } from './qr-checkin';
import { toast } from 'sonner';

export function InstallAppButton({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1.5 rounded-lg bg-gold/15 px-2.5 py-1.5 text-xs font-bold text-gold hover:bg-gold hover:text-navy transition-all cursor-pointer ${className}`}
        title="Instalar Nexus Go como App móvil"
      >
        <Download className="h-3.5 w-3.5" />
        <span>Instalar App</span>
      </button>

      <InstallAppModal open={open} onOpenChange={setOpen} />
    </>
  );
}

export function InstallAppModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [currentUrl, setCurrentUrl] = useState('http://localhost:3050');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setCurrentUrl(window.location.href);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      (window as any).deferredPwaPrompt = e;
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleNativeInstall = async () => {
    const prompt = deferredPrompt || (typeof window !== 'undefined' && (window as any).deferredPwaPrompt);
    if (prompt) {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') {
        toast.success('¡Nexus Go instalada en tu dispositivo!');
        onOpenChange(false);
      }
    } else {
      toast.info('Para instalar en iPhone o Android, sigue los sencillos pasos indicados abajo.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent hideClose className="max-w-[340px] sm:max-w-md p-0 overflow-hidden rounded-2xl border shadow-2xl bg-card">
        {/* Header */}
        <div className="bg-gradient-to-r from-navy via-slate-900 to-navy text-white p-4 relative border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-amber-400 text-slate-950 font-black shadow-xs">
                <Smartphone className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-extrabold text-white">Instalar Nexus Go App</h3>
                <p className="text-[10px] text-amber-300">Aplicación móvil nativa (PWA)</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-6 w-6 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Quick Install Action Button */}
          <div className="rounded-xl border bg-muted/30 p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <p className="text-xs font-bold text-foreground flex items-center justify-center sm:justify-start gap-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Instalación Directa en 1 Clic
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Para Google Chrome, Microsoft Edge y navegadores Android
              </p>
            </div>
            <Button
              onClick={handleNativeInstall}
              className="w-full sm:w-auto h-8 bg-amber-400 text-slate-950 font-bold hover:bg-amber-500 text-xs px-3 rounded-lg shadow-sm shrink-0"
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              Instalar Ahora
            </Button>
          </div>

          {/* QR Code for Mobile Phones */}
          <div className="rounded-xl border p-3 flex flex-col items-center justify-center text-center bg-card">
            <p className="text-xs font-bold text-foreground mb-1">
              ¿Quieres abrirla en tu celular?
            </p>
            <p className="text-[10px] text-muted-foreground mb-2.5 max-w-xs">
              Apunta la cámara de tu teléfono a este código para abrir la app directamente en tu móvil:
            </p>
            <div className="p-2 rounded-xl bg-white shadow-inner border">
              <SvgQrCode value={currentUrl} size={110} />
            </div>
            <p className="text-[9px] font-mono text-muted-foreground mt-1.5 font-bold">
              {currentUrl}
            </p>
          </div>

          {/* Instructions for iPhone / Safari */}
          <div className="rounded-xl bg-muted/40 p-3.5 border space-y-2 text-xs">
            <p className="font-extrabold text-foreground flex items-center gap-1.5">
              <Smartphone className="h-3.5 w-3.5 text-amber-500" />
              Instrucciones para iPhone (Safari)
            </p>

            <div className="space-y-1.5 text-[11px] text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="grid h-4 w-4 place-items-center rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-[9px] shrink-0 mt-0.5">
                  1
                </span>
                <p>
                  Abre la página en <b>Safari</b> y toca el botón <b>Compartir</b> (<Share className="h-3 w-3 inline mx-0.5 text-blue-500" />).
                </p>
              </div>

              <div className="flex items-start gap-2">
                <span className="grid h-4 w-4 place-items-center rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-[9px] shrink-0 mt-0.5">
                  2
                </span>
                <p>
                  Baja en el menú y selecciona <b>"Agregar a inicio"</b> (<PlusSquare className="h-3 w-3 inline mx-0.5" />).
                </p>
              </div>

              <div className="flex items-start gap-2">
                <span className="grid h-4 w-4 place-items-center rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-[9px] shrink-0 mt-0.5">
                  3
                </span>
                <p>Toca <b>"Agregar"</b> arriba a la derecha. ¡Ya tendrás el icono de Nexus Go!</p>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full h-8 text-xs font-semibold"
            onClick={() => onOpenChange(false)}
          >
            Listo / Entendido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
