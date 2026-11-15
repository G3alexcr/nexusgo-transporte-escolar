import { useState, useMemo } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  ExternalLink,
  Bus,
  FileText,
  Eye,
  ShieldAlert,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/linkbus/shared';
import { BusetaFichaModal } from '@/components/linkbus/buseta-ficha-modal';
import { usePlatform } from './platform-provider';
import type { Van } from '@/lib/data';

export type AlertSeverity = 'critica' | 'preventiva' | 'ok';

export type ExpirationAlert = {
  id: string;
  van: Van;
  docType: 'Dekra RTV Semestral' | 'Permiso Especial CTP' | 'Póliza Colectiva INS';
  docNumber: string;
  vencimiento: string;
  daysRemaining: number;
  severity: AlertSeverity;
  actionText: string;
  externalLink?: string | undefined;
};

// Reference current date in Costa Rica simulator: November 13, 2026
const SIMULATED_TODAY = new Date(2026, 10, 13); // Month is 0-indexed (10 = Nov)

export function parseDateCR(dateStr?: string): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.split(/[\/\-]/);
  const p0 = parts[0];
  const p1 = parts[1];
  const p2 = parts[2];
  if (p0 && p1 && p2) {
    const d = parseInt(p0, 10);
    const m = parseInt(p1, 10) - 1;
    const y = parseInt(p2, 10);
    if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
      return new Date(y, m, d);
    }
  }
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export function getDaysRemaining(dateStr?: string, refDate = SIMULATED_TODAY): number {
  const d = parseDateCR(dateStr);
  if (!d) return 999;
  const diffTime = d.getTime() - refDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function computeVanAlerts(van: Van): ExpirationAlert[] {
  const alerts: ExpirationAlert[] = [];

  // 1. Dekra RTV Semestral
  if (van.dekraRtv) {
    const days = getDaysRemaining(van.dekraRtv);
    if (days <= 30) {
      alerts.push({
        id: `${van.id}-dekra`,
        van,
        docType: 'Dekra RTV Semestral',
        docNumber: van.dekraEstado || 'Hoja Verde',
        vencimiento: van.dekraRtv,
        daysRemaining: days,
        severity: days <= 15 ? 'critica' : 'preventiva',
        actionText: 'Agendar Cita Dekra',
        externalLink: 'https://www.dekra.cr/',
      });
    }
  }

  // 2. Permiso Especial CTP
  if (van.vencimientoCtp) {
    const days = getDaysRemaining(van.vencimientoCtp);
    if (days <= 30) {
      alerts.push({
        id: `${van.id}-ctp`,
        van,
        docType: 'Permiso Especial CTP',
        docNumber: van.permisoCtp || 'Permiso CTP',
        vencimiento: van.vencimientoCtp,
        daysRemaining: days,
        severity: days <= 15 ? 'critica' : 'preventiva',
        actionText: 'Renovar Permiso CTP',
        externalLink: 'https://www.ctp.go.cr/',
      });
    }
  }

  // 3. Póliza Colectiva INS
  if (van.vencimientoIns) {
    const days = getDaysRemaining(van.vencimientoIns);
    if (days <= 30) {
      alerts.push({
        id: `${van.id}-ins`,
        van,
        docType: 'Póliza Colectiva INS',
        docNumber: van.polizaIns || 'Póliza Colectiva',
        vencimiento: van.vencimientoIns,
        daysRemaining: days,
        severity: days <= 15 ? 'critica' : 'preventiva',
        actionText: 'Gestionar Póliza INS',
        externalLink: 'https://www.grupoins.com/',
      });
    }
  }

  return alerts;
}

export function ExpirationAlertsWidget({
  compact = false,
  className = '',
}: {
  compact?: boolean;
  className?: string;
}) {
  const { state } = usePlatform();
  const [selectedVanForFicha, setSelectedVanForFicha] = useState<Van | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critica' | 'preventiva'>('all');

  const allAlerts = useMemo(() => {
    const list: ExpirationAlert[] = [];
    state.vans.forEach((v) => {
      list.push(...computeVanAlerts(v));
    });
    // Sort critical first, then ascending by daysRemaining
    return list.sort((a, b) => {
      if (a.severity === 'critica' && b.severity !== 'critica') return -1;
      if (b.severity === 'critica' && a.severity !== 'critica') return 1;
      return a.daysRemaining - b.daysRemaining;
    });
  }, [state.vans]);

  const criticasCount = allAlerts.filter((a) => a.severity === 'critica').length;
  const preventivasCount = allAlerts.filter((a) => a.severity === 'preventiva').length;
  const alDiaVansCount = state.vans.filter(
    (v) => computeVanAlerts(v).length === 0
  ).length;

  const filteredAlerts = useMemo(() => {
    if (filterSeverity === 'critica') return allAlerts.filter((a) => a.severity === 'critica');
    if (filterSeverity === 'preventiva') return allAlerts.filter((a) => a.severity === 'preventiva');
    return allAlerts;
  }, [allAlerts, filterSeverity]);

  return (
    <div className={`rounded-2xl border bg-card p-4 sm:p-5 shadow-sm space-y-4 ${className}`}>
      {/* Header with Traffic Light Indicators */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Fiscalización Legal CTP & Tránsito CR
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-foreground flex items-center gap-2 mt-0.5">
            <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0" />
            <span>Semáforo Preventivo de Vencimientos CTP / Dekra / INS</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Alertas tempranas para evitar retención de unidades o retiro de placas por la Policía de Tránsito.
          </p>
        </div>

        {/* Traffic Light Summary Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setFilterSeverity(filterSeverity === 'critica' ? 'all' : 'critica')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
              criticasCount > 0
                ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 ring-1 ring-rose-500/20'
                : 'bg-muted text-muted-foreground'
            } ${filterSeverity === 'critica' ? 'ring-2 ring-rose-500' : ''}`}
            title="Ver alertas críticas (< 15 días)"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-rose-600 animate-pulse" />
            <span>{criticasCount} Críticas (&lt; 15 d)</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterSeverity(filterSeverity === 'preventiva' ? 'all' : 'preventiva')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
              preventivasCount > 0
                ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 ring-1 ring-amber-500/20'
                : 'bg-muted text-muted-foreground'
            } ${filterSeverity === 'preventiva' ? 'ring-2 ring-amber-500' : ''}`}
            title="Ver alertas preventivas (15 a 30 días)"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span>{preventivasCount} Preventivas (15-30 d)</span>
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span>{alDiaVansCount} Flota Al Día</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs if not compact */}
      {!compact && allAlerts.length > 0 && (
        <div className="flex items-center gap-1.5 text-xs font-bold border-b pb-2">
          <span className="text-muted-foreground flex items-center gap-1 text-[11px] mr-1">
            <Filter className="h-3 w-3" /> Filtrar:
          </span>
          <button
            type="button"
            onClick={() => setFilterSeverity('all')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              filterSeverity === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Todas ({allAlerts.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterSeverity('critica')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              filterSeverity === 'critica'
                ? 'bg-rose-600 text-white'
                : 'text-rose-700 dark:text-rose-300 hover:bg-rose-500/10'
            }`}
          >
            🔴 Críticas ({criticasCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterSeverity('preventiva')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              filterSeverity === 'preventiva'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'text-amber-800 dark:text-amber-300 hover:bg-amber-500/10'
            }`}
          >
            🟡 Preventivas ({preventivasCount})
          </button>
        </div>
      )}

      {/* Empty State: All Green */}
      {allAlerts.length === 0 ? (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/20 p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-emerald-800 dark:text-emerald-200">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <p className="text-xs sm:text-sm font-extrabold">
              ¡Toda la flota se encuentra en regla!
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Todos los permisos CTP, inspecciones Dekra RTV y pólizas INS cuentan con más de 30 días de vigencia activa.
          </p>
        </div>
      ) : (
        /* Alerts Grid */
        <div className={`grid gap-3 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
          {filteredAlerts.map((alert) => {
            const isCritica = alert.severity === 'critica';
            const days = alert.daysRemaining;

            return (
              <div
                key={alert.id}
                className={`rounded-xl border p-3.5 transition-all shadow-xs flex flex-col justify-between gap-3 ${
                  isCritica
                    ? 'border-rose-400/80 bg-gradient-to-r from-rose-50/80 to-rose-100/30 dark:from-rose-950/30 dark:to-rose-900/10 hover:border-rose-500'
                    : 'border-amber-400/80 bg-gradient-to-r from-amber-50/80 to-amber-100/30 dark:from-amber-950/30 dark:to-amber-900/10 hover:border-amber-500'
                }`}
              >
                <div className="space-y-2">
                  {/* Top Bar: Plate + Urgency Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="rounded-md border-2 border-slate-900 bg-white px-2 py-0.5 text-center shadow-2xs">
                        <span className="block text-[6px] font-black uppercase text-slate-600 leading-none">
                          COSTA RICA
                        </span>
                        <span className="block font-black font-mono text-xs text-slate-950 leading-tight">
                          {alert.van.patente}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-black text-foreground leading-tight">
                          {alert.van.marcaModelo || 'Toyota Coaster'}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          Chofer: <b>{alert.van.chofer.split(' ')[0]}</b> · {alert.van.colegio}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 ${
                        isCritica
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-amber-500 text-slate-950 font-black'
                      }`}
                    >
                      {isCritica ? (
                        <>
                          <AlertCircle className="h-3 w-3" />
                          <span>Crítica · {days <= 0 ? 'Vencida' : `${days} días`}</span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3" />
                          <span>{days} días</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Document & Consequence Information */}
                  <div className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-border/60 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground flex items-center gap-1.5">
                        <FileText className={`h-3.5 w-3.5 ${isCritica ? 'text-rose-600' : 'text-amber-500'}`} />
                        <span>{alert.docType}</span>
                      </span>
                      <span className="font-mono text-[11px] font-bold text-muted-foreground">
                        Vence: {alert.vencimiento}
                      </span>
                    </div>

                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      {isCritica ? (
                        <span className="font-semibold text-rose-700 dark:text-rose-300">
                          ⚠️ Peligro inminente de retención del vehículo o retiro de placas por Tránsito si opera sin renovación.
                        </span>
                      ) : (
                        <span className="text-amber-800 dark:text-amber-300 font-medium">
                          Agendar trámite de renovación para asegurar continuidad del servicio escolar.
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedVanForFicha(alert.van)}
                    className="h-7 text-xs font-bold gap-1 px-2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Eye className="h-3 w-3" />
                    <span>Ver Expediente</span>
                  </Button>

                  <div className="flex items-center gap-1.5">
                    {alert.externalLink && (
                      <Button
                        size="sm"
                        onClick={() => window.open(alert.externalLink, '_blank')}
                        className={`h-7 text-xs font-bold gap-1 px-2.5 rounded-lg cursor-pointer shadow-xs ${
                          isCritica
                            ? 'bg-rose-600 hover:bg-rose-700 text-white'
                            : 'bg-amber-400 hover:bg-amber-500 text-slate-950 font-black'
                        }`}
                      >
                        <span>{alert.actionText}</span>
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox / Modal for Van Ficha */}
      {selectedVanForFicha && (
        <BusetaFichaModal
          open={Boolean(selectedVanForFicha)}
          onOpenChange={(open) => {
            if (!open) setSelectedVanForFicha(null);
          }}
          van={selectedVanForFicha}
          mode="admin"
        />
      )}
    </div>
  );
}
