import { useCallback, useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap, Polyline } from 'leaflet';
import { Calendar, Eye, MapPin, Radio, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from './auth-provider';
import { usePlatform } from './platform-provider';
import { Badge } from './shared';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  deleteRouteGpsLogsByRange,
  fetchRouteGpsLogs,
  type GpsRoutePoint,
  type RouteGpsLog,
} from '@/lib/route-gps-logs';

function RouteTraceMap({ points }: { points: GpsRoutePoint[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const lineRef = useRef<Polyline | null>(null);

  useEffect(() => {
    let active = true;
    if (!containerRef.current || points.length === 0) return;

    import('leaflet').then((L) => {
      if (!active || !containerRef.current) return;

      if (!mapRef.current) {
        const first = points[0]!;
        mapRef.current = L.map(containerRef.current, {
          center: [first.lat, first.lng],
          zoom: 15,
        });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap',
        }).addTo(mapRef.current);
      }

      if (lineRef.current) {
        lineRef.current.remove();
      }

      const latLngs = points.map((p) => [p.lat, p.lng] as [number, number]);
      lineRef.current = L.polyline(latLngs, {
        color: '#f59e0b',
        weight: 5,
        opacity: 0.9,
      }).addTo(mapRef.current);

      L.circleMarker(latLngs[0]!, { radius: 6, color: '#10b981', fillOpacity: 1 })
        .bindPopup('Inicio del recorrido')
        .addTo(mapRef.current);

      L.circleMarker(latLngs[latLngs.length - 1]!, { radius: 6, color: '#ef4444', fillOpacity: 1 })
        .bindPopup('Fin del recorrido')
        .addTo(mapRef.current);

      mapRef.current.fitBounds(lineRef.current.getBounds(), { padding: [24, 24] });
    });

    return () => {
      active = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        lineRef.current = null;
      }
    };
  }, [points]);

  if (points.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border bg-muted/30 text-sm text-muted-foreground">
        Este recorrido no registró puntos de movimiento GPS.
      </div>
    );
  }

  return <div ref={containerRef} className="h-80 w-full rounded-xl border overflow-hidden" />;
}

export function AdminGpsRoutesPanel() {
  const { profile } = useAuth();
  const { state, dispatch } = usePlatform();
  const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin';

  const todayStr = new Date().toISOString().slice(0, 10);
  const [logs, setLogs] = useState<RouteGpsLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate, setToDate] = useState(todayStr);
  const [selectedLog, setSelectedLog] = useState<RouteGpsLog | null>(null);

  const loadLogs = useCallback(async () => {
    if (!isAdmin || !state.currentTenantId) return;
    setLoading(true);
    try {
      const data = await fetchRouteGpsLogs(state.currentTenantId);
      setLogs(data);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, state.currentTenantId]);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  if (!isAdmin) return null;

  const recordingEnabled = Boolean(state.recordGpsRoutes);

  const handleToggleRecording = () => {
    const next = !recordingEnabled;
    dispatch({ type: 'setRecordGpsRoutes', enabled: next });
    toast.success(
      next
        ? 'Grabación de recorridos GPS activada para los próximos viajes'
        : 'Grabación de recorridos GPS desactivada',
    );
  };

  const handleDeleteByRange = async () => {
    if (!fromDate || !toDate) {
      toast.error('Selecciona la fecha inicial y final');
      return;
    }
    if (fromDate > toDate) {
      toast.error('La fecha inicial no puede ser mayor que la fecha final');
      return;
    }
    const ok = window.confirm(
      `¿Borrar todos los recorridos GPS guardados entre ${fromDate} y ${toDate}? Esta acción liberará espacio en la base de datos y no se puede deshacer.`,
    );
    if (!ok) return;

    setDeleting(true);
    try {
      const res = await deleteRouteGpsLogsByRange(state.currentTenantId, fromDate, toDate);
      if (res.error) {
        toast.error('No se pudieron borrar los recorridos', { description: res.error });
        return;
      }
      toast.success(`Se eliminaron ${res.deletedCount} recorrido(s) guardados`);
      await loadLogs();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mt-9 rounded-2xl border bg-card p-5 shadow-sm space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-extrabold text-foreground">Grabación de Recorridos GPS (Solo Admin)</h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Controla si deseas guardar la traza GPS de los viajes en la base de datos y limpia recorridos antiguos por fecha.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={recordingEnabled ? 'default' : 'outline'}
            onClick={handleToggleRecording}
            className={
              recordingEnabled
                ? 'gap-1.5 font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                : 'gap-1.5 font-bold text-xs cursor-pointer'
            }
          >
            <Radio className="h-3.5 w-3.5" />
            <span>{recordingEnabled ? 'Grabación Activada' : 'Grabar Recorridos: Desactivado'}</span>
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void loadLogs()}
            disabled={loading}
            className="gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </Button>
        </div>
      </div>

      {/* Borrado por rango de fechas */}
      <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-muted/30 p-3.5">
        <div className="flex items-center gap-2 text-xs font-bold text-foreground mr-2 self-center">
          <Calendar className="h-4 w-4 text-rose-500" />
          <span>Limpiar recorridos por rango de fecha:</span>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-muted-foreground" htmlFor="gps-from-date">
            Desde
          </label>
          <input
            id="gps-from-date"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="h-9 rounded-lg border bg-background px-2.5 text-xs font-medium"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-muted-foreground" htmlFor="gps-to-date">
            Hasta
          </label>
          <input
            id="gps-to-date"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="h-9 rounded-lg border bg-background px-2.5 text-xs font-medium"
          />
        </div>
        <Button
          type="button"
          size="sm"
          variant="destructive"
          disabled={deleting}
          onClick={() => void handleDeleteByRange()}
          className="h-9 gap-1.5 text-xs font-bold cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>{deleting ? 'Borrando...' : 'Borrar en rango'}</span>
        </Button>
      </div>

      {/* Lista de recorridos guardados */}
      {logs.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No hay recorridos GPS guardados en la base de datos.
        </p>
      ) : (
        <div className="divide-y rounded-xl border">
          {logs.map((log) => (
            <div key={log.id} className="flex flex-wrap items-center justify-between gap-3 p-3.5">
              <div>
                <p className="font-bold text-sm text-foreground">{log.routeName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Buseta <b className="font-mono text-foreground">{log.vanPatente}</b>
                  {log.driverName ? ` · Chofer: ${log.driverName}` : ''} ·{' '}
                  {new Date(log.startedAt).toLocaleString('es-CR')}
                  {log.endedAt ? ` – ${new Date(log.endedAt).toLocaleTimeString('es-CR')}` : ' (En curso)'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone="info">{log.points.length} puntos</Badge>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedLog(log)}
                  className="gap-1.5 text-xs font-bold cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Ver mapa</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={Boolean(selectedLog)} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold">
              {selectedLog?.routeName} · {selectedLog?.vanPatente}
            </DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Inicio: {new Date(selectedLog.startedAt).toLocaleString('es-CR')}
                {selectedLog.endedAt ? ` · Fin: ${new Date(selectedLog.endedAt).toLocaleString('es-CR')}` : ''} ·{' '}
                {selectedLog.points.length} puntos registrados
              </p>
              <RouteTraceMap points={selectedLog.points} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
