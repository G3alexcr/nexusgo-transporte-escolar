import { useState, useEffect } from 'react';
import { Bell, Bus, CheckCircle2, AlertTriangle, CreditCard, Route, Check, Trash2, Send, ShieldAlert, Sparkles, X, Volume2, VolumeX, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { usePlatform } from './platform-provider';
import { useAuth } from './auth-provider';
import { filterNotificationsForUser, type PushNotification } from '@/lib/platform-state';
import { toast } from 'sonner';
import { playNotificationSound, soundEffects } from '@/lib/sound-effects';

export function NotificationBellButton({ onClick }: { onClick: () => void }) {
  const { state } = usePlatform();
  const { profile } = useAuth();
  const visibleNotifs = filterNotificationsForUser(
    state.notifications || [],
    profile?.role,
    profile?.alumnoId || state.selectedAlumnoId,
  );
  const unreadCount = visibleNotifs.filter((n) => !n.read).length;

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative p-2 rounded-xl bg-muted/60 hover:bg-muted active:scale-95 transition-all text-foreground cursor-pointer"
      title="Notificaciones push"
      aria-label="Ver notificaciones"
    >
      <Bell className="h-4 w-4" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 px-1 items-center justify-center rounded-full bg-rose-600 text-[9px] font-black text-white shadow-sm animate-in zoom-in">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
}

export function NotificationModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { state, dispatch } = usePlatform();
  const { profile } = useAuth();
  const [filter, setFilter] = useState<'all' | 'unread' | 'gps' | 'attendance'>('all');
  const [pushPermission, setPushPermission] = useState<string>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushPermission(Notification.permission);
    }
  }, []);

  const handleRequestPush = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setPushPermission(perm);
        if (perm === 'granted') {
          toast.success('¡Notificaciones Push Web Activadas!', {
            description: 'Recibirás avisos en vivo de la buseta incluso en segundo plano.',
          });
          new Notification('Nexus Go Costa Rica', {
            body: '¡Notificaciones push vinculadas con éxito! Tu buseta está en camino.',
            icon: '/favicon.ico',
          });
        } else {
          toast.info('Permiso no concedido para notificaciones del navegador');
        }
      } catch (err) {
        toast.error('No fue posible solicitar permisos en este navegador');
      }
    } else {
      toast.info('Tu navegador no soporta Web Push Notifications directas');
    }
  };

  const handleSimulatePush = () => {
    const sampleAlerts: Omit<PushNotification, 'id'>[] = [
      {
        title: '⚠️ Buseta a 3 minutos',
        body: 'Don Jorge Muñoz está doblando por la entrada principal de Guachipelín.',
        time: 'Ahora',
        type: 'gps',
        read: false,
      },
      {
        title: '✅ Check-in Seguro',
        body: 'Sofía Rojas Gómez ha subido a la buseta escolar.',
        time: 'Ahora',
        type: 'attendance',
        read: false,
      },
      {
        title: '⚠️ Aviso de Tráfico',
        body: 'Retraso de 10 min por presa en la rotonda de Multiplaza.',
        time: 'Ahora',
        type: 'sos',
        read: false,
      },
    ];

    const pick = sampleAlerts[Math.floor(Math.random() * sampleAlerts.length)];
    if (!pick) return;

    const newNotif: PushNotification = {
      ...pick,
      id: crypto.randomUUID(),
    };

    dispatch({ type: 'addNotification', notification: newNotif });

    // Play appropriate sound
    if (pick.type === 'sos') {
      playNotificationSound('sos_alert');
    } else if (pick.type === 'gps') {
      playNotificationSound('bus_approach');
    } else {
      playNotificationSound('push');
    }

    // Native browser notification if allowed
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(pick.title, {
          body: pick.body,
          icon: '/favicon.ico',
        });
      } catch (e) {
        // ignore
      }
    }

    toast.info(pick.title, {
      description: pick.body,
    });
  };

  const visibleNotifications = filterNotificationsForUser(
    state.notifications || [],
    profile?.role,
    profile?.alumnoId || state.selectedAlumnoId,
  );

  const notifications = visibleNotifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'gps') return n.type === 'gps' || n.type === 'route';
    if (filter === 'attendance') return n.type === 'attendance';
    return true;
  });

  const getIcon = (type: PushNotification['type']) => {
    switch (type) {
      case 'gps':
        return <Bus className="h-4 w-4 text-blue-500" />;
      case 'attendance':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'sos':
        return <ShieldAlert className="h-4 w-4 text-rose-500" />;
      case 'payment':
        return <CreditCard className="h-4 w-4 text-amber-500" />;
      case 'route':
      default:
        return <Route className="h-4 w-4 text-purple-500" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent hideClose className="max-w-[340px] sm:max-w-md p-0 overflow-hidden rounded-2xl border shadow-2xl bg-card max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-navy via-slate-900 to-navy text-white p-3.5 border-b border-white/10 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-400 text-slate-950 font-bold">
                <Bell className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-extrabold text-white leading-tight">Centro de Notificaciones</h3>
                <p className="text-[10px] text-amber-300 font-medium">Alertas push en tiempo real</p>
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

          {/* Web Push Permission Banner */}
          <div className="mt-3 rounded-xl bg-white/10 p-2.5 flex items-center justify-between gap-2 text-xs">
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-white flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-400" />
                Push en tu Móvil / Navegador
              </p>
              <p className="text-[9px] text-slate-300 truncate">
                {pushPermission === 'granted' ? '● Push Activas (Permitidas)' : 'Activa notificaciones automáticas'}
              </p>
            </div>
            {pushPermission !== 'granted' ? (
              <Button
                size="sm"
                onClick={handleRequestPush}
                className="h-7 px-2.5 text-[10px] font-bold bg-amber-400 text-slate-950 hover:bg-amber-500 rounded-lg shrink-0"
              >
                Activar Push
              </Button>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                Activo
              </span>
            )}
          </div>

          {/* Sound Effects Quick Player */}
          <div className="mt-2.5 rounded-xl bg-slate-950/40 border border-white/10 p-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-amber-300 flex items-center gap-1">
                <Volume2 className="h-3 w-3 text-amber-400" />
                Sonidos de Notificación (Web Audio)
              </span>
              <span className="text-[9px] text-slate-300">Toca para probar</span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              <button
                type="button"
                onClick={() => { playNotificationSound('bus_approach'); toast.info('Sonido: Buseta aproximándose'); }}
                className="px-1.5 py-1 rounded-lg bg-white/10 hover:bg-amber-400 hover:text-slate-950 active:scale-95 text-[10px] font-bold text-white transition-all text-center truncate"
                title="Aviso de buseta aproximándose"
              >
                🚌 Buseta
              </button>
              <button
                type="button"
                onClick={() => { playNotificationSound('sos_alert'); toast.error('Sonido: Alerta SOS / Emergencia'); }}
                className="px-1.5 py-1 rounded-lg bg-rose-500/30 hover:bg-rose-500 active:scale-95 text-[10px] font-bold text-white transition-all text-center truncate"
                title="Alerta de emergencia SOS / Presa"
              >
                🚨 SOS
              </button>
              <button
                type="button"
                onClick={() => { playNotificationSound('absence_alert'); toast.warning('Sonido: Aviso de inasistencia'); }}
                className="px-1.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 active:scale-95 text-[10px] font-bold text-white transition-all text-center truncate"
                title="Aviso de inasistencia del alumno"
              >
                📋 Inasist.
              </button>
              <button
                type="button"
                onClick={() => { playNotificationSound('push'); toast.info('Sonido: Notificación Push'); }}
                className="px-1.5 py-1 rounded-lg bg-white/10 hover:bg-amber-400 hover:text-slate-950 active:scale-95 text-[10px] font-bold text-white transition-all text-center truncate"
                title="Chime de notificación push"
              >
                🔔 Push
              </button>
            </div>
          </div>
        </div>

        {/* Filter Bar & Quick Actions */}
        <div className="p-3 border-b bg-muted/30 shrink-0 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 overflow-x-auto text-xs py-0.5">
            {[
              { id: 'all', label: 'Todas' },
              { id: 'unread', label: 'No leídas' },
              { id: 'gps', label: 'Buseta' },
              { id: 'attendance', label: 'Asistencia' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setFilter(t.id as any)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                  filter === t.id
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'bg-muted hover:text-foreground text-muted-foreground'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch({ type: 'markAllNotificationsRead' })}
            className="h-7 text-[10px] font-bold text-muted-foreground hover:text-foreground shrink-0"
            title="Marcar todas como leídas"
          >
            <Check className="h-3 w-3 mr-0.5" />
            Leídas
          </Button>
        </div>

        {/* Notification List (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto opacity-30 mb-2" />
              <p className="text-xs font-bold">Sin notificaciones pendientes</p>
              <p className="text-[10px] mt-0.5">Recibirás avisos cuando la buseta inicie su recorrido.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => dispatch({ type: 'markNotificationRead', id: n.id })}
                className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                  !n.read
                    ? 'bg-amber-500/5 border-amber-400/40 shadow-xs'
                    : 'bg-card border-border/60 opacity-80'
                }`}
              >
                <div className="mt-0.5 p-1.5 rounded-lg bg-muted shrink-0">
                  {getIcon(n.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-extrabold text-foreground truncate">{n.title}</h4>
                    <span className="text-[9px] font-mono text-muted-foreground shrink-0">{n.time}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{n.body}</p>
                </div>
                {!n.read && (
                  <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0 mt-1.5" title="No leída" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t bg-muted/20 shrink-0 flex items-center justify-between gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleSimulatePush}
            className="h-8 text-[11px] font-bold text-amber-600 border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40"
          >
            <Send className="h-3 w-3 mr-1" />
            Simular Alerta Push
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => dispatch({ type: 'clearNotifications' })}
            className="h-8 text-[11px] font-bold text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Limpiar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
