/**
 * Place search + reverse geocode for passenger address autofill.
 * Uses Mapbox Geocoding (same token as the map). Falls back to local PRESETS
 * when the token is missing or the network fails — still feels like autocomplete.
 */

import { MAPBOX_TOKEN, PRESETS } from "./config";
import type { PlaceSuggestion } from "./types";

const GEOCODE_BASE = "https://api.mapbox.com/geocoding/v5/mapbox.places";

/** Bias search toward the demo city (Munich). */
export const DEFAULT_PROXIMITY = { lat: 48.1374, lon: 11.5755 };

function presetSuggestions(query: string): PlaceSuggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return Object.entries(PRESETS).map(([k, v]) => ({
      id: `preset:${k}`,
      primary: v.label,
      secondary: `${v.lat.toFixed(4)}, ${v.lon.toFixed(4)} · preset`,
      full: v.label,
      lat: v.lat,
      lon: v.lon,
      source: "preset" as const,
    }));
  }
  return Object.entries(PRESETS)
    .filter(([k, v]) => v.label.toLowerCase().includes(q) || kMatch(k, q))
    .map(([k, v]) => ({
      id: `preset:${k}`,
      primary: v.label,
      secondary: `${v.lat.toFixed(4)}, ${v.lon.toFixed(4)} · preset`,
      full: v.label,
      lat: v.lat,
      lon: v.lon,
      source: "preset" as const,
    }));
}

function kMatch(key: string, q: string) {
  return key.toLowerCase().replace(/_/g, " ").includes(q);
}

/**
 * Autocomplete search — Google Maps–style suggestions while typing.
 */
export async function searchPlaces(
  query: string,
  opts?: {
    proximity?: { lat: number; lon: number };
    limit?: number;
    signal?: AbortSignal;
  }
): Promise<PlaceSuggestion[]> {
  const q = query.trim();
  const limit = opts?.limit ?? 6;
  const proximity = opts?.proximity || DEFAULT_PROXIMITY;
  const local = presetSuggestions(q).slice(0, limit);

  if (q.length < 2) {
    return local;
  }

  if (!MAPBOX_TOKEN || MAPBOX_TOKEN.includes("your_mapbox")) {
    return local;
  }

  try {
    const params = new URLSearchParams({
      access_token: MAPBOX_TOKEN,
      autocomplete: "true",
      limit: String(limit),
      // address-like results first, then POIs and places
      types: "address,poi,place,locality,neighborhood,district",
      language: "en",
      proximity: `${proximity.lon},${proximity.lat}`,
      // Soft bias to Germany (demo metro); still returns global if needed
      country: "de",
    });
    const url = `${GEOCODE_BASE}/${encodeURIComponent(q)}.json?${params}`;
    const res = await fetch(url, { signal: opts?.signal });
    if (!res.ok) return local;

    const data = (await res.json()) as {
      features?: Array<{
        id: string;
        place_name?: string;
        text?: string;
        center?: [number, number];
        context?: Array<{ text?: string }>;
        properties?: { address?: string };
      }>;
    };

    const remote: PlaceSuggestion[] = (data.features || [])
      .filter((f) => f.center && f.center.length >= 2)
      .map((f) => {
        const [lon, lat] = f.center as [number, number];
        const full = f.place_name || f.text || q;
        const parts = full.split(",").map((s) => s.trim());
        const primary = parts[0] || full;
        const secondary = parts.slice(1).join(", ") || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
        return {
          id: f.id,
          primary,
          secondary,
          full,
          lat,
          lon,
          source: "mapbox" as const,
        };
      });

    // Merge: Mapbox first, then presets not already covered by name
    const seen = new Set(remote.map((r) => r.full.toLowerCase()));
    const extras = local.filter((p) => !seen.has(p.full.toLowerCase()));
    return [...remote, ...extras].slice(0, limit);
  } catch (e) {
    if ((e as Error)?.name === "AbortError") return [];
    return local;
  }
}

/**
 * Reverse geocode lat/lon → address string (for map-tap / preset fill).
 */
export async function reverseGeocode(
  lat: number,
  lon: number,
  signal?: AbortSignal
): Promise<string> {
  // Exact preset match first
  for (const v of Object.values(PRESETS)) {
    if (Math.abs(v.lat - lat) < 0.00025 && Math.abs(v.lon - lon) < 0.00025) {
      return v.label;
    }
  }

  if (!MAPBOX_TOKEN || MAPBOX_TOKEN.includes("your_mapbox")) {
    return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
  }

  try {
    const params = new URLSearchParams({
      access_token: MAPBOX_TOKEN,
      limit: "1",
      language: "en",
      types: "address,poi,place,locality,neighborhood",
    });
    const url = `${GEOCODE_BASE}/${lon},${lat}.json?${params}`;
    const res = await fetch(url, { signal });
    if (!res.ok) return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
    const data = (await res.json()) as {
      features?: Array<{ place_name?: string; text?: string }>;
    };
    const name = data.features?.[0]?.place_name || data.features?.[0]?.text;
    return name || `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
  }
}
