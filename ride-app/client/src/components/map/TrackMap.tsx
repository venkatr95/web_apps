"use client";

import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { LocateFixed } from "lucide-react";
import { useCallback, useEffect, useRef, type MutableRefObject } from "react";
import { MAPBOX_TOKEN } from "@/lib/config";
import type { TrackSnapshot } from "@/lib/types";
import { FLAG_ICON, PERSON_ICON } from "@/lib/mapIcons";

const ROUTE_SRC = "track-route";
const ROUTE_LAYER = "track-route-layer";
const REMAIN_SRC = "track-remain";
const REMAIN_LAYER = "track-remain-layer";

function asLngLat(coords: number[][] | undefined): [number, number][] {
  if (!coords?.length) return [];
  return coords
    .filter((c) => c.length >= 2)
    .map((c) => [c[0], c[1]] as [number, number]);
}

/**
 * Live tracking map.
 * Critical UX: never re-fitBounds on every poll — that yanks the whole
 * viewport while the user is panning. Auto-frame only once (and when the
 * user taps Recenter). Driver pin updates in place without moving the camera.
 */
export function TrackMap({ snapshot }: { snapshot: TrackSnapshot }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const pickupRef = useRef<mapboxgl.Marker | null>(null);
  const dropRef = useRef<mapboxgl.Marker | null>(null);
  const driverRef = useRef<mapboxgl.Marker | null>(null);
  const loadedRef = useRef(false);
  /** After first frame, stay put unless user asks to recenter. */
  const framedRef = useRef(false);
  /** User panned/zoomed — do not auto-follow. */
  const userMovedRef = useRef(false);
  const programmaticMoveRef = useRef(false);
  const snapRef = useRef(snapshot);
  snapRef.current = snapshot;

  const fitToRide = useCallback((s: TrackSnapshot, duration = 0) => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;

    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend([s.pickup.lon, s.pickup.lat]);
    bounds.extend([s.destination.lon, s.destination.lat]);
    if (s.driver?.longitude != null && s.driver?.latitude != null) {
      bounds.extend([s.driver.longitude, s.driver.latitude]);
    }
    const remain = asLngLat(
      (s.route?.remaining_coordinates as number[][] | undefined) ||
        (s.route?.coordinates as number[][] | undefined)
    );
    remain.forEach(([lon, lat]) => bounds.extend([lon, lat]));
    if (bounds.isEmpty()) return;

    programmaticMoveRef.current = true;
    map.fitBounds(bounds, {
      padding: { top: 110, bottom: 300, left: 48, right: 48 },
      maxZoom: 14.5,
      duration,
    });
    // Clear programmatic flag after animation settles
    const clear = () => {
      programmaticMoveRef.current = false;
      map.off("moveend", clear);
    };
    if (duration > 0) map.once("moveend", clear);
    else {
      // next frame so movestart from fitBounds can still see the flag
      requestAnimationFrame(() => {
        programmaticMoveRef.current = false;
      });
    }
    framedRef.current = true;
    userMovedRef.current = false;
  }, []);

  useEffect(() => {
    if (!containerRef.current || !MAPBOX_TOKEN) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [snapshot.pickup.lon, snapshot.pickup.lat],
      zoom: 12.5,
      attributionControl: false,
      fadeDuration: 0,
    });
    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new mapboxgl.AttributionControl({ compact: true }));

    // Smooth pan only — no double-click zoom thrash on mobile
    map.doubleClickZoom.disable();
    map.boxZoom.disable();
    map.touchZoomRotate.disableRotation();
    map.touchPitch.disable();

    // Suspend marker CSS glide while camera moves so pins don't lag off the basemap
    map.on("movestart", () => containerRef.current?.classList.add("map-camera-moving"));
    map.on("moveend", () => containerRef.current?.classList.remove("map-camera-moving"));

    // Mark user interaction so we never yank the viewport back
    const markUser = () => {
      if (programmaticMoveRef.current) return;
      userMovedRef.current = true;
    };
    map.on("dragstart", markUser);
    map.on("zoomstart", markUser);
    map.on("rotatestart", markUser);
    map.on("pitchstart", markUser);

    map.on("load", () => {
      loadedRef.current = true;
      map.addSource(ROUTE_SRC, {
        type: "geojson",
        data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [] } },
      });
      map.addLayer({
        id: ROUTE_LAYER,
        type: "line",
        source: ROUTE_SRC,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#64748b", "line-width": 4, "line-opacity": 0.5 },
      });
      map.addSource(REMAIN_SRC, {
        type: "geojson",
        data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [] } },
      });
      map.addLayer({
        id: REMAIN_LAYER,
        type: "line",
        source: REMAIN_SRC,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#34d399", "line-width": 5, "line-opacity": 0.95 },
      });
      paint(snapRef.current, { allowFrame: true });
    });

    return () => {
      pickupRef.current?.remove();
      dropRef.current?.remove();
      driverRef.current?.remove();
      map.remove();
      mapRef.current = null;
      loadedRef.current = false;
      framedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loadedRef.current || !mapRef.current) return;
    // Poll updates: redraw geometry/pins only — never re-frame camera
    paint(snapshot, { allowFrame: false });
  }, [snapshot]);

  function setLine(sourceId: string, coordinates: [number, number][]) {
    const map = mapRef.current;
    if (!map) return;
    const src = map.getSource(sourceId) as mapboxgl.GeoJSONSource | undefined;
    if (!src) return;
    src.setData({
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: coordinates.length >= 2 ? coordinates : [],
      },
    });
  }

  function ensurePin(
    ref: MutableRefObject<mapboxgl.Marker | null>,
    lon: number,
    lat: number,
    kind: "pickup" | "drop" | "driver",
    label?: string
  ) {
    const map = mapRef.current;
    if (!map) return;
    if (!ref.current) {
      const el = document.createElement("div");
      if (kind === "driver") {
        el.className = "driver-marker-root";
        el.innerHTML = `<div class="driver-dot" style="background:#34d399;box-shadow:0 0 0 3px rgba(52,211,153,0.35)"></div>
          <div class="driver-label">${label || "DRV"}</div>`;
      } else {
        el.className = "pin-marker";
        const icon = kind === "pickup" ? PERSON_ICON : FLAG_ICON;
        el.innerHTML = `<div class="pin-bg pin-${kind === "pickup" ? "pickup" : "drop"}"></div><div class="pin-icon">${icon}</div>`;
      }
      ref.current = new mapboxgl.Marker({
        element: el,
        anchor: kind === "driver" ? "center" : "bottom",
      });
    } else if (kind === "driver" && label) {
      const labelEl = ref.current.getElement().querySelector(".driver-label");
      if (labelEl && labelEl.textContent !== label) labelEl.textContent = label;
    }
    ref.current.setLngLat([lon, lat]).addTo(map);
  }

  function paint(s: TrackSnapshot, opts: { allowFrame: boolean }) {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;

    ensurePin(pickupRef, s.pickup.lon, s.pickup.lat, "pickup");
    ensurePin(dropRef, s.destination.lon, s.destination.lat, "drop");

    if (
      s.driver?.latitude != null &&
      s.driver?.longitude != null &&
      Number.isFinite(s.driver.latitude) &&
      Number.isFinite(s.driver.longitude)
    ) {
      ensurePin(
        driverRef,
        s.driver.longitude,
        s.driver.latitude,
        "driver",
        (s.driver.name || "DRV").slice(0, 8)
      );
    } else {
      driverRef.current?.remove();
      driverRef.current = null;
    }

    const full = asLngLat(s.route?.coordinates as number[][] | undefined);
    const remain = asLngLat(
      (s.route?.remaining_coordinates as number[][] | undefined) || full
    );
    setLine(ROUTE_SRC, full);
    setLine(REMAIN_SRC, remain.length >= 2 ? remain : full);

    // Frame once on load only — never on poll updates
    if (opts.allowFrame && !framedRef.current) {
      fitToRide(s, 0);
    }
  }

  function onRecenter() {
    userMovedRef.current = false;
    fitToRide(snapRef.current, 450);
  }

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-zinc-950 p-6 text-center text-sm text-zinc-400">
        Mapbox token missing — tracking status still updates above.
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      <button
        type="button"
        onClick={onRecenter}
        title="Recenter on ride"
        aria-label="Recenter on ride"
        className="absolute bottom-[calc(min(42dvh,340px)+1rem)] right-3 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900/95 text-emerald-400 shadow-lg ring-1 ring-white/10 transition active:scale-95 sm:bottom-8 sm:right-4"
      >
        <LocateFixed size={20} />
      </button>
    </div>
  );
}
