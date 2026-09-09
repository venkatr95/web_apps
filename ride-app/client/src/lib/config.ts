/**
 * Environment-aware API config.
 *
 * - `next dev`  → development → localhost:8000
 * - Vercel / `next build` → production → Render API
 *
 * Override anytime with NEXT_PUBLIC_API_URL / NEXT_PUBLIC_WS_URL
 * (see .env.development, .env.production, .env.local).
 */

const isProd = process.env.NODE_ENV === "production";

/** Render production API (must match render.yaml service name). */
export const PROD_API_URL = "https://ridematch-app.onrender.com";

/** Local FastAPI default. */
export const DEV_API_URL = "http://localhost:8000";

function stripSlash(url: string): string {
  return url.replace(/\/$/, "");
}

function httpToWs(url: string): string {
  if (url.startsWith("https://")) return "wss://" + url.slice("https://".length);
  if (url.startsWith("http://")) return "ws://" + url.slice("http://".length);
  if (url.startsWith("wss://") || url.startsWith("ws://")) return url;
  return url;
}

const resolvedApi = stripSlash(
  process.env.NEXT_PUBLIC_API_URL || (isProd ? PROD_API_URL : DEV_API_URL)
);

export const API_URL = resolvedApi;

export const WS_URL = stripSlash(
  process.env.NEXT_PUBLIC_WS_URL || `${httpToWs(resolvedApi)}/ws`
);

export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

/** True when built/served as production (Vercel, next start). */
export const IS_PROD = isProd;

/**
 * Bike taxi product flag (dev + production).
 * Set NEXT_PUBLIC_BIKE_TAXIS=true (pairs with server BIKE_TAXIS / bike-taxis).
 * Defaults on when unset so local demo matches production flag=true.
 */
export const BIKE_TAXIS_ENABLED = (() => {
  const raw = process.env.NEXT_PUBLIC_BIKE_TAXIS;
  if (raw === undefined || raw === "") return true;
  const v = String(raw).toLowerCase();
  return v === "true" || v === "1" || v === "yes" || v === "on";
})();

export const PRESETS: Record<string, { lat: number; lon: number; label: string }> = {
  marienplatz: { lat: 48.1374, lon: 11.5755, label: "Marienplatz" },
  airport: { lat: 48.3538, lon: 11.7861, label: "MUC Airport" },
  schwabing: { lat: 48.1620, lon: 11.5865, label: "Schwabing" },
  maxvorstadt: { lat: 48.1456, lon: 11.5650, label: "Maxvorstadt" },
  olympiapark: { lat: 48.1731, lon: 11.5466, label: "Olympiapark" },
  hauptbahnhof: { lat: 48.1402, lon: 11.5584, label: "Hauptbahnhof" },
  pasing: { lat: 48.1485, lon: 11.4615, label: "Pasing" },
  freising: { lat: 48.4029, lon: 11.7489, label: "Freising" },
  starnberg: { lat: 47.9972, lon: 11.3407, label: "Starnberg" },
  dachau: { lat: 48.2602, lon: 11.4342, label: "Dachau" },
};

/** Format amount as Euro (de-DE style, e.g. 12,50 €). */
export function formatEuro(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

/** Absolute public tracking URL for a ride token (client-side). */
export function trackingUrl(token: string): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}/track/${token}`;
  }
  return `/track/${token}`;
}

export function shareTextForRide(rideId: string, url: string, status?: string): string {
  const st = status ? ` (status: ${status})` : "";
  return `Track my RideMatch trip ${rideId}${st}:\n${url}`;
}

/** Match coords to a preset key (within ~20 m). */
export function matchPresetKey(lat: number, lon: number): string {
  const eps = 0.0002;
  for (const [k, v] of Object.entries(PRESETS)) {
    if (Math.abs(v.lat - lat) < eps && Math.abs(v.lon - lon) < eps) return k;
  }
  return "";
}

export type ConfigRideType = "rideGo" | "rideX" | "ridePremier" | "bikeTaxi";

const BASE_RIDE_TYPES: {
  type: ConfigRideType;
  label: string;
  sub: string;
}[] = [
  { type: "rideGo", label: "rideGo", sub: "Affordable, everyday rides" },
  { type: "rideX", label: "rideX", sub: "More room, extra comfort" },
  { type: "ridePremier", label: "ridePremier", sub: "Top-rated drivers, premium cars" },
  {
    type: "bikeTaxi",
    label: "bikeTaxi",
    sub: "Fast two-wheeler · cycle-friendly streets",
  },
];

/** Ride types shown in the picker (bikeTaxi only when flag is on). */
export const RIDE_TYPES = BASE_RIDE_TYPES.filter(
  (rt) => rt.type !== "bikeTaxi" || BIKE_TAXIS_ENABLED
);
