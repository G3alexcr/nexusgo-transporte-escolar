import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  type Dispatch,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  emptyPlatformState,
  initialPlatformState,
  platformReducer,
  type PlatformAction,
  type PlatformState,
  type PushNotification,
} from "@/lib/platform-state";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { loadPlatformStateFromSupabase, syncActionToSupabase } from "@/lib/supabase-sync";
import { subscribeVanTelemetry } from "@/lib/realtime-telemetry";
import {
  clearOfflineQueueFromIdb,
  loadOfflineQueueFromIdb,
  saveOfflineQueueToIdb,
} from "@/lib/offline-idb";
import { showServiceWorkerNotification } from "@/lib/pwa-push";
import { useAuth } from "./auth-provider";

const PlatformContext = createContext<{ state: PlatformState; dispatch: Dispatch<PlatformAction> } | null>(null);

function isTestEnv(): boolean {
  return (
    (typeof import.meta !== "undefined" && import.meta.env?.MODE === "test") ||
    (typeof process !== "undefined" && Boolean(process.env?.["VITEST"]))
  );
}

function getInitialState(): PlatformState {
  const baseState = !isTestEnv() && isSupabaseConfigured() ? emptyPlatformState : initialPlatformState;

  if (typeof window !== "undefined") {
    try {
      const params = new URLSearchParams(window.location.search);
      const tenantParam = params.get("tenant");
      if (tenantParam) {
        return {
          ...baseState,
          currentTenantId: tenantParam,
        };
      }
    } catch {
      // Fallback
    }
  }
  return baseState;
}

export function PlatformProvider({ children }: { children: ReactNode }) {
  const { session, profile } = useAuth();
  const [state, rawDispatch] = useReducer(platformReducer, undefined, getInitialState);
  const stateRef = useRef(state);
  stateRef.current = state;
  const lastGpsSyncRef = useRef<Record<string, number>>({});

  const targetTenantId = profile?.tenantId ?? state.currentTenantId;

  useEffect(() => {
    if (isTestEnv()) return;
    let cancelled = false;
    void loadOfflineQueueFromIdb().then((items) => {
      if (!cancelled && items.length > 0) {
        const nextState = platformReducer(stateRef.current, { type: "hydrateOfflineQueue", items });
        stateRef.current = nextState;
        rawDispatch({ type: "hydrateOfflineQueue", items });
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isTestEnv() || !isSupabaseConfigured() || !session) return;
    let cancelled = false;

    void loadPlatformStateFromSupabase(targetTenantId).then((remotePatch) => {
      if (!cancelled && remotePatch) {
        if (profile?.role === "superadmin") {
          remotePatch.isSuperAdmin = true;
        }
        if (profile?.role === "apoderado" && profile.alumnoId) {
          remotePatch.selectedAlumnoId = profile.alumnoId;
        }
        if (profile?.role === "chofer" && profile.choferId) {
          remotePatch.selectedDriverId = profile.choferId;
        }
        rawDispatch({ type: "hydrateFromRemote", state: remotePatch });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [session, targetTenantId, profile?.role, profile?.alumnoId, profile?.choferId]);

  useEffect(() => {
    if (isTestEnv()) return;
    return subscribeVanTelemetry(targetTenantId, (payload) => {
      if (payload.active) {
        rawDispatch({
          type: "updateVanLocation",
          vanId: payload.vanId,
          lat: payload.lat,
          lng: payload.lng,
        });
      } else {
        rawDispatch({
          type: "updateVanLocation",
          vanId: payload.vanId,
          clear: true,
        });
      }
    });
  }, [targetTenantId]);

  useEffect(() => {
    if (isTestEnv() || !isSupabaseConfigured() || !session) return;
    const supabase = getSupabaseClient();
    if (!supabase || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetTenantId)) return;

    const channel = supabase
      .channel(`nexusgo-live-${targetTenantId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `tenant_id=eq.${targetTenantId}` },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          const id = String(row["id"] ?? "");
          if (!id || stateRef.current.notifications.some((n) => n.id === id)) return;
          const notif: PushNotification = {
            id,
            title: String(row["title"] ?? "Aviso Nexus Go"),
            body: String(row["body"] ?? ""),
            time: String(row["time"] ?? ""),
            type: (row["type"] as PushNotification["type"]) ?? "route",
            read: Boolean(row["read"]),
          };
          rawDispatch({ type: "addNotification", notification: notif });
          toast.info(notif.title, { description: notif.body });
          const targetUrl = profile?.role === "chofer" || profile?.role === "asistente" ? "/chofer" : "/apoderado";
          void showServiceWorkerNotification(notif.title, notif.body, targetUrl);
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notices", filter: `tenant_id=eq.${targetTenantId}` },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          const id = String(row["id"] ?? "");
          if (!id || stateRef.current.notices.some((n) => n.id === id)) return;
          rawDispatch({
            type: "hydrateFromRemote",
            state: {
              notices: [{ id, message: String(row["message"] ?? ""), time: String(row["time"] ?? "") }, ...stateRef.current.notices],
            },
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "attendance", filter: `tenant_id=eq.${targetTenantId}` },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          const alumnoId = String(row["alumno_id"] ?? "");
          if (!alumnoId) return;
          rawDispatch({
            type: "hydrateFromRemote",
            state: {
              attendance: {
                ...stateRef.current.attendance,
                [alumnoId]: {
                  status: (row["status"] as "Pendiente" | "A bordo" | "Entregado" | "Ausente") ?? "Pendiente",
                  subida: String(row["subida"] ?? "—"),
                  bajada: String(row["bajada"] ?? "—"),
                },
              },
            },
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [session, targetTenantId, profile?.role]);

  const dispatch: Dispatch<PlatformAction> = useCallback((action) => {
    const nextState = platformReducer(stateRef.current, action);
    stateRef.current = nextState;
    rawDispatch(action);

    if (!isTestEnv()) {
      if (action.type === "queueOfflineAttendance") {
        void saveOfflineQueueToIdb(nextState.offlineQueue);
      } else if (action.type === "syncOfflineQueue" || action.type === "clearOfflineQueue") {
        void clearOfflineQueueFromIdb();
      }

      if (action.type === "addNotification") {
        void showServiceWorkerNotification(action.notification.title, action.notification.body, "/apoderado");
      } else if (action.type === "notice") {
        void showServiceWorkerNotification("Aviso de Ruta Nexus Go", action.message, "/apoderado");
      } else if (action.type === "syncOfflineQueue" && stateRef.current.offlineQueue.length === 0 && nextState.notifications[0]) {
        void showServiceWorkerNotification(nextState.notifications[0].title, nextState.notifications[0].body, "/chofer");
      }
    }

    if (
      !isTestEnv() &&
      isSupabaseConfigured() &&
      action.type !== "hydrateFromRemote" &&
      action.type !== "hydrateOfflineQueue"
    ) {
      if (action.type === "updateVanLocation") {
        const now = Date.now();
        const prev = lastGpsSyncRef.current[action.vanId] ?? 0;
        if (now - prev >= 10000) {
          lastGpsSyncRef.current[action.vanId] = now;
          void syncActionToSupabase(action, nextState);
        }
      } else {
        void syncActionToSupabase(action, nextState);
      }
    }
  }, []);

  return <PlatformContext.Provider value={{ state, dispatch }}>{children}</PlatformContext.Provider>;
}

export function usePlatform() {
  const value = useContext(PlatformContext);
  if (!value) throw new Error("PlatformProvider is required");
  return value;
}
