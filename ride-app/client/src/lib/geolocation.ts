/**
 * Browser geolocation helpers for default origin = current location.
 * Requires explicit user approval (browser permission prompt).
 */

import { reverseGeocode } from "./geocode";
import type { LatLon } from "./types";
import type { GeoPermission } from "./store";

export function geolocationSupported(): boolean {
  return typeof navigator !== "undefined" && "geolocation" in navigator;
}

export async function queryGeoPermission(): Promise<GeoPermission> {
  if (!geolocationSupported()) return "unavailable";
  try {
    // Permissions API not available on all browsers (e.g. some Safari)
    const perms = navigator.permissions;
    if (!perms?.query) return "prompt";
    const status = await perms.query({ name: "geolocation" as PermissionName });
    if (status.state === "granted") return "granted";
    if (status.state === "denied") return "denied";
    return "prompt";
  } catch {
    return "prompt";
  }
}

export function requestCurrentPosition(options?: PositionOptions): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!geolocationSupported()) {
      reject(new Error("Geolocation is not supported on this device"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 30_000,
      ...options,
    });
  });
}

/**
 * Resolve current GPS to LatLon + reverse-geocoded address.
 * Call only after user action that grants location access.
 */
export async function resolveCurrentLocation(): Promise<LatLon> {
  const pos = await requestCurrentPosition();
  const lat = pos.coords.latitude;
  const lon = pos.coords.longitude;
  const address = await reverseGeocode(lat, lon);
  return { lat, lon, address };
}
