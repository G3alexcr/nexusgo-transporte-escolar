import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_VERSION, applyAppUpdate, isNewerVersion } from "@/lib/app-version";

const CHECK_INTERVAL_MS = 2 * 60 * 1000;

export function VersionUpdateModal() {
  const [newVersion, setNewVersion] = useState<string | null>(null);
  const [dismissedVersion, setDismissedVersion] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const checkForUpdate = useCallback(async () => {
    if (typeof window === "undefined") return;
    try {
      const res = await fetch(`/version.json?t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (!res.ok) return;
      const data = (await res.json()) as { version?: string };
      const remote = typeof data?.version === "string" ? data.version.trim() : "";
      if (remote && isNewerVersion(remote, APP_VERSION)) {
        setNewVersion(remote);
      }
    } catch {
      // Ignore transient offline/network errors
    }
  }, []);

  useEffect(() => {
    void checkForUpdate();
    const timer = window.setInterval(() => {
      void checkForUpdate();
    }, CHECK_INTERVAL_MS);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void checkForUpdate();
      }
    };
    const handleFocus = () => {
      void checkForUpdate();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleFocus);
    };
  }, [checkForUpdate]);

  if (!newVersion || dismissedVersion === newVersion) return null;

  const handleUpdate = async () => {
    setUpdating(true);
    await applyAppUpdate();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/45 backdrop-blur-[2px] p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nexus-update-title"
    >
      <div className="w-full max-w-sm rounded-2xl border bg-card text-card-foreground shadow-2xl p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-400/20 text-amber-600 dark:text-amber-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 id="nexus-update-title" className="text-sm font-extrabold text-foreground">
                Nueva actualización disponible
              </h3>
              <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                v{APP_VERSION} → v{newVersion}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDismissedVersion(newVersion)}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
            aria-label="Cerrar aviso de actualización"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Hay una versión más reciente de <strong>Nexus Go</strong>. Actualiza ahora para limpiar la caché y cargar las últimas mejoras.
        </p>

        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={updating}
            onClick={() => setDismissedVersion(newVersion)}
            className="text-xs font-bold"
          >
            Después
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={updating}
            onClick={() => void handleUpdate()}
            className="gap-1.5 rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-500 text-xs font-extrabold cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${updating ? "animate-spin" : ""}`} />
            <span>{updating ? "Actualizando..." : "Actualizar ahora"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
