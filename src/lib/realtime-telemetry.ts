import { useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabaseClient, isSupabaseConfigured } from "./supabase";

export type TelemetryPayload = {
  tenantId: string;
  vanId: string;
  lat: number;
  lng: number;
  speed?: number | null;
  heading?: number | null;
  accuracy?: number | null;
  active: boolean;
  timestamp: number;
};

export type GpsBroadcastStatus =
  | "idle"
  | "acquiring"
  | "active"
  | "denied"
  | "unsupported"
  | "error";

const EVENT_NAME = "van-location";

function channelName(tenantId: string): string {
  return `linkbus-telemetry:${tenantId || "default"}`;
}

// Cache active broadcast channels per tenant so watchPosition ticks reuse the same socket channel
const activeChannels = new Map<string, RealtimeChannel>();

function getOrCreateChannel(tenantId: string): RealtimeChannel | null {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const name = channelName(tenantId);
  const existing = activeChannels.get(name);
  if (existing) return existing;

  const ch = supabase.channel(name, {
    config: {
      broadcast: { self: false },
    },
  });
  ch.subscribe();
  activeChannels.set(name, ch);
  return ch;
}

export async function publishVanTelemetry(payload: TelemetryPayload): Promise<void> {
  // 1. Local browser BroadcastChannel (works across tabs even without Supabase)
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    try {
      const bc = new BroadcastChannel(channelName(payload.tenantId));
      bc.postMessage(payload);
      bc.close();
    } catch {
      // Ignore BroadcastChannel errors in restricted contexts
    }
  }

  // 2. Supabase Realtime Broadcast (ephemeral WebSocket pub/sub, no DB history stored)
  const ch = getOrCreateChannel(payload.tenantId);
  if (ch) {
    try {
      await ch.send({
        type: "broadcast",
        event: EVENT_NAME,
        payload,
      });
    } catch {
      // Non-blocking: telemetry drop should never crash driver UI
    }
  }
}

export function subscribeVanTelemetry(
  tenantId: string,
  onLocation: (payload: TelemetryPayload) => void,
): () => void {
  const name = channelName(tenantId);
  let bc: BroadcastChannel | null = null;
  let supabaseChannel: RealtimeChannel | null = null;

  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    try {
      bc = new BroadcastChannel(name);
      bc.onmessage = (event: MessageEvent<TelemetryPayload>) => {
        if (event.data && typeof event.data.vanId === "string") {
          onLocation(event.data);
        }
      };
    } catch {
      bc = null;
    }
  }

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      supabaseChannel = supabase
        .channel(`${name}:sub:${Math.random().toString(36).slice(2, 8)}`)
        .on("broadcast", { event: EVENT_NAME }, ({ payload }) => {
          const data = payload as TelemetryPayload | undefined;
          if (data && typeof data.vanId === "string") {
            onLocation(data);
          }
        })
        .subscribe();
    }
  }

  return () => {
    if (bc) {
      bc.close();
    }
    if (supabaseChannel) {
      const supabase = getSupabaseClient();
      if (supabase) {
        void supabase.removeChannel(supabaseChannel);
      }
    }
  };
}

export function useDriverGpsBroadcast({
  enabled,
  tenantId,
  vanId,
  onLocalLocation,
}: {
  enabled: boolean;
  tenantId: string;
  vanId?: string | undefined;
  onLocalLocation?: ((lat: number, lng: number) => void) | undefined;
}) {
  const [status, setStatus] = useState<GpsBroadcastStatus>(enabled ? "acquiring" : "idle");
  const [lastCoords, setLastCoords] = useState<{
    lat: number;
    lng: number;
    accuracy: number | null;
    timestamp: number;
  } | null>(null);

  const lastEmitAt = useRef<number>(0);
  const onLocalRef = useRef(onLocalLocation);
  onLocalRef.current = onLocalLocation;

  useEffect(() => {
    if (!enabled || !vanId) {
      setStatus("idle");
      if (vanId && lastEmitAt.current > 0) {
        void publishVanTelemetry({
          tenantId,
          vanId,
          lat: 0,
          lng: 0,
          active: false,
          timestamp: Date.now(),
        });
        lastEmitAt.current = 0;
      }
      return;
    }

    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setStatus("unsupported");
      return;
    }

    setStatus("acquiring");
    let disposed = false;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (disposed) return;
        const { latitude, longitude, speed, heading, accuracy } = pos.coords;
        const now = Date.now();

        setStatus("active");
        setLastCoords({
          lat: latitude,
          lng: longitude,
          accuracy: accuracy ?? null,
          timestamp: now,
        });
        onLocalRef.current?.(latitude, longitude);

        // Throttle network broadcast to at most once every 1.5 seconds
        if (now - lastEmitAt.current >= 1500) {
          lastEmitAt.current = now;
          void publishVanTelemetry({
            tenantId,
            vanId,
            lat: latitude,
            lng: longitude,
            speed: speed ?? null,
            heading: heading ?? null,
            accuracy: accuracy ?? null,
            active: true,
            timestamp: now,
          });
        }
      },
      (err) => {
        if (disposed) return;
        if (err.code === err.PERMISSION_DENIED) {
          setStatus("denied");
        } else {
          setStatus("error");
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 10000,
      },
    );

    return () => {
      disposed = true;
      navigator.geolocation.clearWatch(watchId);
    };
  }, [enabled, tenantId, vanId]);

  return { status, lastCoords };
}
