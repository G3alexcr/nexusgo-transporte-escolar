import { useState, useEffect } from 'react';
import { Bus, Clock, MapPin, Navigation2, CheckCircle2, AlertCircle } from 'lucide-react';
import { playNotificationSound } from '@/lib/sound-effects';

export function LiveEtaWidget({
  status,
  driverName,
  vanPlate,
  childName,
  stopName = 'Guachipelín, Escazú',
}: {
  status: string;
  driverName: string;
  vanPlate: string;
  childName: string;
  stopName?: string;
}) {
  // Dynamic simulated progress: 0 to 100%
  const [secondsRemaining, setSecondsRemaining] = useState(320); // ~5 min 20s
  const [chimePlayed, setChimePlayed] = useState(false);

  useEffect(() => {
    if (status !== 'Buseta en camino') return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 10) return 10; // keep at bus stop arrived
        const next = prev - 4; // advance 4s per tick

        // Trigger sound when entering 1 minute / 300m threshold
        if (next <= 70 && !chimePlayed) {
          setChimePlayed(true);
          playNotificationSound('bus_approach');
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, chimePlayed]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${minutes}:${String(seconds).padStart(2, '0')}`;

  // Estimate distance based on remaining seconds (average 25 km/h city bus speed ~ 7 m/s)
  const metersRemaining = Math.max(80, Math.round(secondsRemaining * 6.5));
  const distanceFormatted =
    metersRemaining >= 1000
      ? `${(metersRemaining / 1000).toFixed(1)} km`
      : `${metersRemaining} metros`;

  // Status tiers
  const isArriving = secondsRemaining <= 60;
  const isApproaching = secondsRemaining > 60 && secondsRemaining <= 180;

  if (status === 'Llegado al colegio') {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500 text-white shadow-xs">
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Llegada Exitosa
            </span>
            <h4 className="text-sm font-extrabold text-foreground truncate">{childName} está en el colegio</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Entregado en acceso principal · Lincoln School</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'A bordo') {
    return (
      <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-600 text-white shadow-xs">
              <Bus className="h-4 w-4" />
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                A Bordo de la Buseta
              </span>
              <h4 className="text-xs font-extrabold text-foreground">En trayecto hacia Lincoln School</h4>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-600/20 text-blue-700 dark:text-blue-300">
            ETA: 07:35 AM
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Conductor: <b className="text-foreground">{driverName}</b> (Buseta {vanPlate})
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm space-y-3">
      {/* Top Banner with ETA countdown */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl font-black text-white shadow-xs transition-colors ${
              isArriving ? 'bg-rose-600 animate-pulse' : isApproaching ? 'bg-amber-500' : 'bg-slate-900 dark:bg-slate-800'
            }`}
          >
            <Navigation2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  isArriving
                    ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 font-extrabold animate-pulse'
                    : isApproaching
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 font-extrabold'
                    : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold'
                }`}
              >
                {isArriving
                  ? '¡Buseta en la esquina!'
                  : isApproaching
                  ? 'Aproximándose a tu parada'
                  : 'En ruta hacia tu casa'}
              </span>
            </div>
            <h3 className="text-sm font-extrabold text-foreground mt-0.5">
              Llegada en: <span className="font-mono text-base text-amber-600 dark:text-amber-400">{timeFormatted} min</span>
            </h3>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[10px] text-muted-foreground font-semibold">Distancia</p>
          <p className="text-xs font-mono font-extrabold text-foreground">{distanceFormatted}</p>
        </div>
      </div>

      {/* Dynamic Progress Bar */}
      <div>
        <div className="flex justify-between text-[10px] text-muted-foreground font-medium mb-1">
          <span>Salida del garaje</span>
          <span className="font-bold text-foreground">{stopName}</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 rounded-full ${
              isArriving ? 'bg-rose-500' : isApproaching ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(95, Math.max(15, 100 - (secondsRemaining / 320) * 85))}%` }}
          />
        </div>
      </div>

      {/* Advisory Note */}
      <div className="rounded-xl bg-muted/40 p-2.5 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          <span className="text-muted-foreground truncate">
            {isArriving
              ? 'Por favor salir con Sofía al punto de recogida.'
              : 'Preparar mochila y carnet QR para el abordaje.'}
          </span>
        </div>
        <span className="text-[10px] font-mono font-bold text-foreground shrink-0 ml-1">07:15 AM</span>
      </div>
    </div>
  );
}
