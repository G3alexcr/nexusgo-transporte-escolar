import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, Radio, CheckCircle2, AlertTriangle, CloudOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlatform } from './platform-provider';
import { toast } from 'sonner';
import { playNotificationSound } from '@/lib/sound-effects';

export function OfflineBanner() {
  const { state, dispatch } = usePlatform();
  const [isRealOnline, setIsRealOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Sync with real browser network events
  useEffect(() => {
    const handleOnline = () => {
      setIsRealOnline(true);
      if (state.offlineQueue.length > 0) {
        dispatch({ type: 'syncOfflineQueue' });
        playNotificationSound('push');
        toast.success(`Conexión restablecida: ${state.offlineQueue.length} registros sincronizados con el servidor.`);
      } else {
        dispatch({ type: 'setOfflineMode', enabled: false });
      }
    };

    const handleOffline = () => {
      setIsRealOnline(false);
      dispatch({ type: 'setOfflineMode', enabled: true });
      toast.warning('Se ha detectado pérdida de conexión a internet. Nexus Go operando en modo Offline local.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch, state.offlineQueue.length]);

  const toggleSimulatedOffline = () => {
    const nextState = !state.isOfflineMode;
    dispatch({ type: 'setOfflineMode', enabled: nextState });

    if (nextState) {
      toast.warning('Modo Sin Cobertura Celular activado (Simulación en ruta de montaña).', {
        description: 'Puedes pasar lista y escanear QR; todo se almacenará en la cola local segura.',
      });
    } else {
      if (state.offlineQueue.length > 0) {
        const count = state.offlineQueue.length;
        dispatch({ type: 'syncOfflineQueue' });
        playNotificationSound('push');
        toast.success(`¡Cobertura restablecida! Se sincronizaron ${count} registros con el servidor.`);
      } else {
        toast.success('Cobertura celular restablecida.');
      }
    }
  };

  const handleManualSync = () => {
    const count = state.offlineQueue.length;
    if (count === 0) {
      toast.info('No hay registros pendientes de sincronizar.');
      return;
    }
    dispatch({ type: 'syncOfflineQueue' });
    playNotificationSound('push');
    toast.success(`¡Sincronización completada! ${count} registros de asistencia actualizados en el servidor.`);
  };

  const queueCount = state.offlineQueue.length;

  return (
    <div className="w-full space-y-2">
      {/* Offline Status or Queued items warning bar */}
      {state.isOfflineMode ? (
        <div className="rounded-xl border-2 border-amber-500/80 bg-amber-500/10 p-3 sm:p-3.5 text-amber-950 dark:text-amber-200 animate-in fade-in slide-in-from-top-1">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500 text-slate-950 shrink-0 font-bold animate-pulse">
                <WifiOff className="h-4 w-4" />
              </span>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-100">
                    Modo Sin Cobertura Celular (Ruta Rural / Montaña)
                  </span>
                  <span className="text-[10px] font-mono bg-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                    Almacenamiento Local Activo
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 dark:text-amber-300">
                  {queueCount > 0
                    ? `Tienes ${queueCount} acción(es) de asistencia guardadas localmente en el dispositivo.`
                    : 'Puedes pasar lista y escanear carnés QR normalmente sin conexión a internet.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {queueCount > 0 && (
                <Button
                  size="sm"
                  onClick={handleManualSync}
                  className="h-8 px-3 text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white gap-1 rounded-lg shadow-xs"
                >
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Sincronizar ({queueCount})
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSimulatedOffline}
                className="h-8 px-2.5 text-xs font-bold border-amber-600/40 text-amber-900 dark:text-amber-200 hover:bg-amber-500/20 rounded-lg"
              >
                <Wifi className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                Restablecer Cobertura
              </Button>
            </div>
          </div>
        </div>
      ) : queueCount > 0 ? (
        <div className="rounded-xl border border-emerald-500/60 bg-emerald-500/10 p-3 text-emerald-950 dark:text-emerald-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs font-bold">Cobertura restablecida · {queueCount} registros pendientes en cola</p>
              <p className="text-[11px] text-muted-foreground">Presiona sincronizar para enviarlos a la plataforma central.</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleManualSync}
            className="h-8 px-3 bg-emerald-600 text-white font-bold hover:bg-emerald-700 text-xs rounded-lg"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Sincronizar Ahora
          </Button>
        </div>
      ) : null}

      {/* Simulator Switch Capsule Bar */}
      <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-muted/30 border border-border/40 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${state.isOfflineMode ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
          <span>Estado de red: <b className="text-foreground">{state.isOfflineMode ? '📵 Sin Cobertura (Offline)' : '📶 Conectado (4G/LTE CR)'}</b></span>
          {queueCount > 0 && (
            <span className="font-mono text-amber-600 dark:text-amber-400 font-bold ml-1">
              ({queueCount} pendientes)
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={toggleSimulatedOffline}
          className="text-[10px] font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer flex items-center gap-1"
        >
          {state.isOfflineMode ? (
            <>
              <Wifi className="h-3 w-3 text-emerald-500" /> Conectar Señal
            </>
          ) : (
            <>
              <CloudOff className="h-3 w-3 text-amber-500" /> Probar Modo Sin Señal
            </>
          )}
        </button>
      </div>
    </div>
  );
}
