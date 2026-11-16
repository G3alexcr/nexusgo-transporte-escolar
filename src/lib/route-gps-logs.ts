import { getSupabaseClient, isSupabaseConfigured } from "./supabase";

export type GpsRoutePoint = {
  lat: number;
  lng: number;
  t: string;
};

export type RouteGpsLog = {
  id: string;
  tenantId: string;
  vanId?: string | undefined;
  vanPatente: string;
  routeName: string;
  driverName?: string | undefined;
  startedAt: string;
  endedAt?: string | undefined;
  points: GpsRoutePoint[];
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function createRouteGpsLog(params: {
  tenantId: string;
  vanId?: string | undefined;
  vanPatente: string;
  routeName: string;
  driverName?: string | undefined;
}): Promise<string | null> {
  if (!isSupabaseConfigured() || !UUID_REGEX.test(params.tenantId)) return null;
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const id = crypto.randomUUID();
  const { error } = await supabase.from("route_gps_logs").insert({
    id,
    tenant_id: params.tenantId,
    van_id: params.vanId && UUID_REGEX.test(params.vanId) ? params.vanId : null,
    van_patente: params.vanPatente,
    route_name: params.routeName,
    driver_name: params.driverName ?? null,
    started_at: new Date().toISOString(),
    points: [],
  });

  if (error) {
    console.warn("[Nexus Go] Error iniciando grabación de recorrido GPS:", error.message);
    return null;
  }
  return id;
}

export async function updateRouteGpsLogPoints(
  logId: string,
  points: GpsRoutePoint[],
  endedAt?: string,
): Promise<void> {
  if (!isSupabaseConfigured() || !UUID_REGEX.test(logId)) return;
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const payload: Record<string, unknown> = { points };
  if (endedAt) payload["ended_at"] = endedAt;

  const { error } = await supabase.from("route_gps_logs").update(payload).eq("id", logId);
  if (error) {
    console.warn("[Nexus Go] Error guardando puntos GPS:", error.message);
  }
}

export async function fetchRouteGpsLogs(tenantId: string): Promise<RouteGpsLog[]> {
  if (!isSupabaseConfigured() || !UUID_REGEX.test(tenantId)) return [];
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("route_gps_logs")
    .select("id, tenant_id, van_id, van_patente, route_name, driver_name, started_at, ended_at, points")
    .eq("tenant_id", tenantId)
    .order("started_at", { ascending: false })
    .limit(100);

  if (error || !data) return [];

  return data.map((r) => ({
    id: r.id as string,
    tenantId: r.tenant_id as string,
    vanId: (r.van_id as string | null) ?? undefined,
    vanPatente: r.van_patente as string,
    routeName: r.route_name as string,
    driverName: (r.driver_name as string | null) ?? undefined,
    startedAt: r.started_at as string,
    endedAt: (r.ended_at as string | null) ?? undefined,
    points: Array.isArray(r.points) ? (r.points as GpsRoutePoint[]) : [],
  }));
}

export async function deleteRouteGpsLogsByRange(
  tenantId: string,
  fromDate: string,
  toDate: string,
): Promise<{ deletedCount: number; error?: string }> {
  if (!isSupabaseConfigured() || !UUID_REGEX.test(tenantId)) {
    return { deletedCount: 0, error: "Supabase no configurado o empresa inválida." };
  }
  const supabase = getSupabaseClient();
  if (!supabase) return { deletedCount: 0, error: "Cliente Supabase no disponible." };

  const startIso = new Date(`${fromDate}T00:00:00`).toISOString();
  const endIso = new Date(`${toDate}T23:59:59.999`).toISOString();

  const { data, error } = await supabase
    .from("route_gps_logs")
    .delete()
    .eq("tenant_id", tenantId)
    .gte("started_at", startIso)
    .lte("started_at", endIso)
    .select("id");

  if (error) {
    return { deletedCount: 0, error: error.message };
  }

  return { deletedCount: data?.length ?? 0 };
}
