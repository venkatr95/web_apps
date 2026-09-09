import { API_URL } from "./config";
import type {
  AdminStats,
  AllocationLog,
  Blocker,
  Driver,
  FareEstimate,
  NearbyDriver,
  Ride,
  RouteBundle,
  TrackSnapshot,
} from "./types";

class ApiError extends Error {}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(body.detail || JSON.stringify(body));
  }
  return res.json();
}

export const api = {
  health: () => request<Record<string, unknown>>("/api/health"),

  drivers: () => request<Driver[]>("/api/drivers"),

  nearbyDrivers: (params: { lat: number; lon: number; ride_type?: string; zone?: string }) => {
    const q = new URLSearchParams(
      Object.entries(params).reduce<Record<string, string>>((acc, [k, v]) => {
        if (v !== undefined && v !== null) acc[k] = String(v);
        return acc;
      }, {})
    );
    return request<NearbyDriver[]>(`/api/drivers/nearby?${q}`);
  },

  setDriverStatus: (driverId: string, status: string) =>
    request<Driver>(`/api/drivers/${driverId}/status`, {
      method: "POST",
      body: JSON.stringify({ status }),
    }),

  requestRide: (body: {
    passenger: string;
    pickup: [number, number];
    destination: [number, number];
    /** Intermediate stops [lat, lon], max 2 */
    stops?: [number, number][];
    ride_type: string;
    zone: string;
  }) =>
    request<Ride>("/api/ride/request", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  respondOffer: (rideId: string, accepted: boolean) =>
    request<Ride>("/api/ride/respond", {
      method: "POST",
      body: JSON.stringify({ ride_id: rideId, accepted }),
    }),

  getRide: (rideId: string) => request<Ride>(`/api/ride/${rideId}`),

  listRides: () => request<Ride[]>("/api/rides"),

  /** Public live tracking (shareable link). */
  trackRide: (token: string) => request<TrackSnapshot>(`/api/track/${token}`),

  cancelPreview: (rideId: string) =>
    request<{
      ride_id: string;
      penalty_applies: boolean;
      penalty_eur: number;
      free_cancel_until: number | null;
      cancel_penalty_after_sec: number;
      reasons: string[];
      can_cancel: boolean;
      status: string;
    }>(`/api/ride/${rideId}/cancel-preview`),

  /** Cancel with reason; accept_penalty required when late fee applies. */
  cancelRide: (rideId: string, reason: string, acceptPenalty = false) =>
    request<Ride>(`/api/ride/${rideId}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason, accept_penalty: acceptPenalty }),
    }),

  fareEstimate: (params: {
    pickup_lat: number;
    pickup_lon: number;
    drop_lat: number;
    drop_lon: number;
    ride_type: string;
    /** Intermediate stops as [lat, lon][] — re-estimates routed path */
    stops?: [number, number][];
  }) => {
    const { stops, ...rest } = params;
    const q = new URLSearchParams(
      Object.entries(rest).reduce<Record<string, string>>((acc, [k, v]) => {
        acc[k] = String(v);
        return acc;
      }, {})
    );
    if (stops?.length) {
      q.set(
        "stops",
        stops.map(([lat, lon]) => `${lat},${lon}`).join("|")
      );
    }
    return request<FareEstimate>(`/api/pricing/estimate?${q}`);
  },

  logs: () => request<AllocationLog[]>("/api/admin/logs"),

  stats: () => request<AdminStats>("/api/admin/stats"),

  setTraffic: (traffic: string) =>
    request<{ traffic: string }>("/api/admin/traffic", {
      method: "POST",
      body: JSON.stringify({ traffic }),
    }),

  blockers: () => request<Blocker[]>("/api/admin/blockers"),

  setBlockerActive: (blockerId: string, active: boolean) =>
    request<Blocker>(`/api/admin/blockers/${blockerId}`, {
      method: "POST",
      body: JSON.stringify({ active }),
    }),

  routePreview: (
    origin: [number, number],
    destination: [number, number],
    opts?: {
      waypoints?: [number, number][];
      ride_type?: string;
    }
  ) =>
    request<RouteBundle>("/api/route/preview", {
      method: "POST",
      body: JSON.stringify({
        origin,
        destination,
        waypoints: opts?.waypoints || [],
        ride_type: opts?.ride_type || "rideGo",
      }),
    }),

  features: () =>
    request<{
      bike_taxis: boolean;
      ride_types: string[];
      routing?: Record<string, unknown>;
    }>("/api/features"),

  selectRoute: (rideId: string, routeId: string, phase?: string) =>
    request<Ride>(`/api/ride/${rideId}/select-route`, {
      method: "POST",
      body: JSON.stringify({ route_id: routeId, phase: phase ?? null }),
    }),

  replanRoutes: (rideId: string) =>
    request<Ride>(`/api/ride/${rideId}/replan`, { method: "POST" }),

  setAutoConditions: (enabled: boolean) =>
    request<{ auto_conditions: boolean }>("/api/admin/auto-conditions", {
      method: "POST",
      body: JSON.stringify({ enabled }),
    }),

  conditions: () =>
    request<{
      traffic: string;
      auto: boolean;
      note: string;
      blockers: Blocker[];
    }>("/api/admin/conditions"),

  reset: () => request<{ status: string }>("/api/admin/reset", { method: "POST" }),
};

export { ApiError };
