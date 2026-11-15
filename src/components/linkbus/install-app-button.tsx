import { useEffect, useState } from "react";
import { CheckCircle2, Download, Share, Smartphone } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallAppButton({ compact = false }: { compact?: boolean }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      Boolean((window.navigator as { standalone?: boolean }).standalone);
    if (standalone) {
      setIsInstalled(true);
    }

    const ua = window.navigator.userAgent || "";
    setIsIos(/iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setGuideOpen(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      return;
    }
    setGuideOpen(true);
  };

  if (isInstalled) {
    return compact ? null : (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-[11px] font-bold text-emerald-300">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
        <span>App instalada</span>
      </div>
    );
  }

  return (
    <>
      {compact ? (
        <button
          type="button"
          onClick={() => void handleInstallClick()}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-amber-400 px-3 py-1.5 text-[11px] font-extrabold text-slate-950 shadow-sm hover:bg-amber-500 transition-colors cursor-pointer"
        >
          <Download className="h-3.5 w-3.5 shrink-0" />
          <span>Instalar App</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => void handleInstallClick()}
          className="group w-full flex items-center justify-between gap-2.5 rounded-xl border border-amber-400/40 bg-gradient-to-r from-amber-400/20 via-amber-400/10 to-transparent px-3.5 py-2.5 text-left transition-all hover:border-amber-400 hover:bg-amber-400 hover:text-slate-950 cursor-pointer shadow-sm"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-amber-400 text-slate-950 shadow-xs">
              <Smartphone className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-extrabold leading-tight truncate text-amber-300 group-hover:text-slate-950">
                Instalar App
              </p>
              <p className="text-[10px] text-slate-400 group-hover:text-slate-800 truncate">
                Teléfono, tablet o PC
              </p>
            </div>
          </div>
          <Download className="h-4 w-4 shrink-0 text-amber-300 group-hover:text-slate-950 transition-transform group-hover:translate-y-0.5" />
        </button>
      )}

      <Dialog open={guideOpen} onOpenChange={setGuideOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-extrabold">
              <Smartphone className="h-5 w-5 text-amber-500" />
              Instalar Nexus Go en tu dispositivo
            </DialogTitle>
            <DialogDescription className="text-xs">
              Úsala como aplicación nativa con acceso rápido y alertas en tiempo real.
            </DialogDescription>
          </DialogHeader>

          {isIos ? (
            <ol className="space-y-2.5 text-xs text-foreground py-1">
              <li className="flex items-start gap-2.5 rounded-xl bg-muted/60 p-3">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-amber-400 text-[11px] font-black text-slate-950">1</span>
                <span>
                  Toca el botón <Share className="inline h-3.5 w-3.5 mx-0.5 text-sky-500" /> <strong>Compartir</strong> en la barra inferior de Safari.
                </span>
              </li>
              <li className="flex items-start gap-2.5 rounded-xl bg-muted/60 p-3">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-amber-400 text-[11px] font-black text-slate-950">2</span>
                <span>
                  Selecciona <strong>“Agregar a pantalla de inicio”</strong> y presiona <strong>Agregar</strong>.
                </span>
              </li>
            </ol>
          ) : (
            <ol className="space-y-2.5 text-xs text-foreground py-1">
              <li className="flex items-start gap-2.5 rounded-xl bg-muted/60 p-3">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-amber-400 text-[11px] font-black text-slate-950">1</span>
                <span>
                  Abre el menú de tu navegador (<strong>⋮</strong> en Chrome/Android o el ícono de instalar en la barra de direcciones en PC).
                </span>
              </li>
              <li className="flex items-start gap-2.5 rounded-xl bg-muted/60 p-3">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-amber-400 text-[11px] font-black text-slate-950">2</span>
                <span>
                  Elige <strong>“Instalar aplicación”</strong> o <strong>“Agregar a pantalla principal”</strong>.
                </span>
              </li>
            </ol>
          )}

          <div className="flex justify-end">
            <Button type="button" size="sm" onClick={() => setGuideOpen(false)} className="rounded-xl text-xs font-bold">
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
