"use client";

import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { MAPBOX_TOKEN } from "@/lib/config";
import { useStore } from "@/lib/store";
import type { Blocker, Driver, Ride } from "@/lib/types";
import { LocateFixed, Moon, Sun } from "lucide-react";
import { DriverMarker } from "./DriverMarker";
import { FLAG_ICON, PERSON_ICON } from "@/lib/mapIcons";

const MAP_STYLES = {
  dark: "mapbox://styles/mapbox/dark-v11",
  light: "mapbox://styles/mapbox/light-v11",
} as const;

const STATUS_COLOR: Record<string, string> = {
  offline: "#52525b",
  available: "#34d399",
  reserved: "#fbbf24",
  accepted: "#38bdf8",
  en_route: "#38bdf8",
  on_trip: "#a78bfa",
  busy: "#fbbf24",
};

const ROUTE_SRC = "route-src";
const ROUTE_LAYER = "route-layer";
const ROUTE_CASING = "route-casing";
const APPROACH_SRC = "approach-src";
const APPROACH_LAYER = "approach-layer";
const REMAINING_SRC = "remaining-src";
const REMAINING_LAYER = "remaining-layer";
const ALTS_SRC = "alts-src";
const ALTS_LAYER = "alts-layer";
const BLOCKERS_SRC = "blockers-src";
const BLOCKERS_FILL = "blockers-fill";
const BLOCKERS_LINE = "blockers-line";
const BLOCKERS_GLOW = "blockers-glow";

const ALT_COLORS = ["#38bdf8", "#a78bfa", "#fbbf24"];

const TYPE_LABEL: Record<string, string> = {
  closure: "Road closure",
  congestion: "Congestion",
  event: "Event",
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function blockerTooltipHtml(props: Record<string, unknown>): string {
  const name = String(props.name || "Issue");
  const type = String(props.type || "issue");
  const desc = String(props.description || "");
  const radius = Number(props.radius_km || 0);
  const severity = Number(props.severity || 0);
  const active = Number(props.active) === 1;
  const typeClass = ["closure", "event", "congestion"].includes(type) ? type : "congestion";
  return `
    <div class="blocker-tip-title">${escapeHtml(name)}</div>
    <div class="blocker-tip-meta">
      <span class="blocker-tip-badge ${typeClass}">${escapeHtml(TYPE_LABEL[type] || type)}</span>
      ${active ? "" : '<span class="blocker-tip-badge inactive">Inactive</span>'}
    </div>
    ${desc ? `<div class="blocker-tip-desc">${escapeHtml(desc)}</div>` : ""}
    <div class="blocker-tip-stats">Radius ${radius.toFixed(2)} km · Severity ${severity.toFixed(1)}</div>
  `;
}

function emptyLine(): GeoJSON.Feature {
  return {
    type: "Feature",
    properties: {},
    geometry: { type: "LineString", coordinates: [] },
  };
}

function circlePolygon(lon: number, lat: number, radiusKm: number, steps = 48): GeoJSON.Polygon {
  const coords: [number, number][] = [];
  const latRad = (lat * Math.PI) / 180;
  const dLat = radiusKm / 110.57;
  const dLon = radiusKm / (111.32 * Math.cos(latRad));
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    coords.push([lon + dLon * Math.cos(t), lat + dLat * Math.sin(t)]);
  }
  return { type: "Polygon", coordinates: [coords] };
}

function activeRideCoords(ride: Ride | undefined): {
  full: [number, number][];
  remaining: [number, number][];
  approach: [number, number][];
} {
  if (!ride) return { full: [], remaining: [], approach: [] };

  const progress = ride.route_progress_index ?? 0;
  const active = ride.active_route;

  let full: [number, number][] = [];
  let remaining: [number, number][] = [];
  let approach: [number, number][] = [];

  if (ride.status === "on_trip" && ride.route_to_destination?.coordinates?.length) {
    full = ride.route_to_destination.coordinates as [number, number][];
    remaining = full.slice(Math.min(progress, full.length - 1));
  } else if (
    ["allocated", "en_route", "accepted", "offered"].includes(ride.status) &&
    ride.route_to_pickup?.coordinates?.length
  ) {
    full = ride.route_to_pickup.coordinates as [number, number][];
    remaining = full.slice(Math.min(progress, full.length - 1));
    // Show trip route as preview dashed when available
    if (ride.route_to_destination?.coordinates?.length) {
      approach = ride.route_to_destination.coordinates as [number, number][];
    }
  } else if (active === "to_destination" && ride.route_to_destination?.coordinates?.length) {
    full = ride.route_to_destination.coordinates as [number, number][];
    remaining = full.slice(Math.min(progress, full.length - 1));
  } else if (ride.route_to_destination?.coordinates?.length) {
    // Pre-request preview not on ride — fall through
    full = ride.route_to_destination.coordinates as [number, number][];
  }

  return { full, remaining, approach };
}

export function MapView() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const pickupMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const dropMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const driverMarkersRef = useRef<Map<string, DriverMarker>>(new Map());
  const blockerPopupRef = useRef<mapboxgl.Popup | null>(null);
  const blockerHandlersBoundRef = useRef(false);
  const loadedRef = useRef(false);
  const uiTheme = useStore((s) => s.uiTheme);
  const setUiTheme = useStore((s) => s.setUiTheme);
  const mapTheme = uiTheme;
  const stopMarkersRef = useRef<mapboxgl.Marker[]>([]);
  /** Street-following preview polyline (idle map) — never a bare A→B chord. */
  const previewCoordsRef = useRef<[number, number][]>([]);
  const previewKeyRef = useRef("");

  function bindBlockerInteractions(map: mapboxgl.Map) {
    if (blockerHandlersBoundRef.current) return;
    blockerHandlersBoundRef.current = true;

    if (!blockerPopupRef.current) {
      blockerPopupRef.current = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 14,
        maxWidth: "280px",
        className: "blocker-popup",
      });
    }

    const showTip = (e: mapboxgl.MapLayerMouseEvent) => {
      const f = e.features?.[0];
      if (!f?.properties || !blockerPopupRef.current) return;
      map.getCanvas().style.cursor = "pointer";
      blockerPopupRef.current
        .setLngLat(e.lngLat)
        .setHTML(blockerTooltipHtml(f.properties as Record<string, unknown>))
        .addTo(map);
    };

    const moveTip = (e: mapboxgl.MapLayerMouseEvent) => {
      if (!blockerPopupRef.current) return;
      blockerPopupRef.current.setLngLat(e.lngLat);
      if (e.features?.[0]?.properties) {
        blockerPopupRef.current.setHTML(
          blockerTooltipHtml(e.features[0].properties as Record<string, unknown>)
        );
      }
    };

    const hideTip = () => {
      map.getCanvas().style.cursor = "";
      blockerPopupRef.current?.remove();
    };

    // Single interactive layer avoids mouseenter/leave thrash between stacked fills
    map.on("mouseenter", BLOCKERS_FILL, showTip);
    map.on("mousemove", BLOCKERS_FILL, moveTip);
    map.on("mouseleave", BLOCKERS_FILL, hideTip);
  }

  function addRouteLayers(map: mapboxgl.Map) {
    if (!map.getSource(ROUTE_SRC)) {
      map.addSource(ROUTE_SRC, { type: "geojson", data: emptyLine() });
    }
    if (!map.getLayer(ROUTE_CASING)) {
      map.addLayer({
        id: ROUTE_CASING,
        type: "line",
        source: ROUTE_SRC,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#0f172a",
          "line-width": 7,
          "line-opacity": 0.45,
        },
      });
    }
    if (!map.getLayer(ROUTE_LAYER)) {
      map.addLayer({
        id: ROUTE_LAYER,
        type: "line",
        source: ROUTE_SRC,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#94a3b8",
          "line-width": 3,
          "line-opacity": 0.55,
        },
      });
    }

    if (!map.getSource(REMAINING_SRC)) {
      map.addSource(REMAINING_SRC, { type: "geojson", data: emptyLine() });
    }
    if (!map.getLayer(REMAINING_LAYER)) {
      map.addLayer({
        id: REMAINING_LAYER,
        type: "line",
        source: REMAINING_SRC,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#34d399",
          "line-width": 4,
          "line-opacity": 0.95,
        },
      });
    }

    if (!map.getSource(APPROACH_SRC)) {
      map.addSource(APPROACH_SRC, { type: "geojson", data: emptyLine() });
    }
    if (!map.getLayer(APPROACH_LAYER)) {
      map.addLayer({
        id: APPROACH_LAYER,
        type: "line",
        source: APPROACH_SRC,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#38bdf8",
          "line-width": 3,
          "line-opacity": 0.85,
          "line-dasharray": [1.2, 1.6],
        },
      });
    }

    if (!map.getSource(ALTS_SRC)) {
      map.addSource(ALTS_SRC, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
    }
    if (!map.getLayer(ALTS_LAYER)) {
      map.addLayer({
        id: ALTS_LAYER,
        type: "line",
        source: ALTS_SRC,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": ["get", "color"],
          "line-width": 3,
          "line-opacity": 0.55,
          "line-dasharray": [1.5, 1.2],
        },
      });
    }

    if (!map.getSource(BLOCKERS_SRC)) {
      map.addSource(BLOCKERS_SRC, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
    }

    const typeColor: mapboxgl.ExpressionSpecification = [
      "match",
      ["get", "type"],
      "closure",
      "#f43f5e",
      "event",
      "#e879f9",
      "congestion",
      "#f59e0b",
      "#a1a1aa",
    ];
    const lineColor: mapboxgl.ExpressionSpecification = [
      "match",
      ["get", "type"],
      "closure",
      "#fb7185",
      "event",
      "#f0abfc",
      "congestion",
      "#fbbf24",
      "#a1a1aa",
    ];

    if (!map.getLayer(BLOCKERS_GLOW)) {
      map.addLayer({
        id: BLOCKERS_GLOW,
        type: "line",
        source: BLOCKERS_SRC,
        filter: ["==", ["get", "selected"], 1],
        paint: {
          "line-color": lineColor,
          "line-width": 10,
          "line-opacity": 0.35,
          "line-blur": 4,
        },
      });
    }
    if (!map.getLayer(BLOCKERS_FILL)) {
      map.addLayer({
        id: BLOCKERS_FILL,
        type: "fill",
        source: BLOCKERS_SRC,
        paint: {
          "fill-color": typeColor,
          "fill-opacity": [
            "case",
            ["==", ["get", "selected"], 1],
            0.48,
            ["==", ["get", "active"], 1],
            0.24,
            0.1,
          ],
        },
      });
    }
    if (!map.getLayer(BLOCKERS_LINE)) {
      map.addLayer({
        id: BLOCKERS_LINE,
        type: "line",
        source: BLOCKERS_SRC,
        paint: {
          "line-color": lineColor,
          "line-width": [
            "case",
            ["==", ["get", "selected"], 1],
            4.5,
            2,
          ],
          "line-opacity": [
            "case",
            ["==", ["get", "selected"], 1],
            1,
            ["==", ["get", "active"], 1],
            0.85,
            0.45,
          ],
          "line-dasharray": [2, 1.5],
        },
      });
    }

    bindBlockerInteractions(map);
  }

  function recenterMap() {
    const map = mapRef.current;
    if (!map) return;
    const { pickup, drop, rides, currentRideId } = useStore.getState();
    const isDesktop = window.innerWidth >= 640;
    const bounds = new mapboxgl.LngLatBounds();
    const ride = rides.find((r) => r.id === currentRideId);
    const { full, remaining, approach } = activeRideCoords(ride);
    const pts = [...full, ...remaining, ...approach];
    if (pts.length >= 2) {
      pts.forEach(([lon, lat]) => bounds.extend([lon, lat]));
    } else {
      bounds.extend([pickup.lon, pickup.lat]);
      bounds.extend([drop.lon, drop.lat]);
    }
    map.fitBounds(bounds, {
      padding: isDesktop
        ? { top: 90, bottom: 90, left: 420, right: 90 }
        : { top: 90, bottom: 320, left: 60, right: 60 },
      maxZoom: 15,
      duration: 300,
    });
  }

  function switchTheme(theme: "dark" | "light") {
    const map = mapRef.current;
    setUiTheme(theme);
    containerRef.current?.classList.toggle("map-light", theme === "light");
    if (!map) return;
    loadedRef.current = false;
    blockerHandlersBoundRef.current = false;
    blockerPopupRef.current?.remove();
    map.once("style.load", () => {
      addRouteLayers(map);
      loadedRef.current = true;
      syncPickupDrop();
      syncDrivers(useStore.getState().drivers);
      syncRoutes();
      syncBlockers(useStore.getState().blockers);
    });
    map.setStyle(MAP_STYLES[theme]);
  }

  // Init map once
  useEffect(() => {
    if (!containerRef.current || !MAPBOX_TOKEN) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    const { pickup } = useStore.getState();
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: MAP_STYLES.dark,
      center: [pickup.lon, pickup.lat],
      zoom: 12.2,
      attributionControl: false,
      fadeDuration: 100,
      // Mapbox's own default dragPan/scrollZoom physics are already well-tuned;
      // a previous attempt to hand-tune them (custom easing, slower wheel rate)
      // made pan/zoom feel worse, not smoother. Leave them at their defaults.
    });
    mapRef.current = map;

    // Pan-only with pointer: no zoom on click / double-click / shift-drag box.
    // Zoom stays available via scroll wheel, pinch, and the +/- nav control.
    map.dragPan.enable();
    map.doubleClickZoom.disable();
    map.boxZoom.disable();
    map.touchZoomRotate.disableRotation();
    map.touchPitch.disable();

    map.addControl(new mapboxgl.NavigationControl({ showCompass: true, visualizePitch: true }), "top-right");
    map.addControl(new mapboxgl.AttributionControl({ compact: true }));

    // Driver markers glide between GPS ticks via a CSS transition on the
    // Mapbox-positioned wrapper (see .driver-marker-root) — but Mapbox rewrites
    // that same transform on every pan/zoom/rotate frame too, so during a camera
    // move the transition chases a constantly moving target and markers appear
    // to lag/displace from the map underneath them. Suspend the transition for
    // the duration of any camera move (user-driven or programmatic flyTo/fitBounds)
    // so markers track the map exactly, then resume it once the camera settles.
    map.on("movestart", () => containerRef.current?.classList.add("map-camera-moving"));
    map.on("moveend", () => containerRef.current?.classList.remove("map-camera-moving"));

    map.on("load", () => {
      loadedRef.current = true;
      addRouteLayers(map);
      syncPickupDrop();
      syncDrivers(useStore.getState().drivers);
      syncRoutes();
      syncBlockers(useStore.getState().blockers);
    });

    map.on("click", (e) => {
      // Prefer selecting a road issue when the click hits a blocker zone
      if (map.getLayer(BLOCKERS_FILL)) {
        const hits = map.queryRenderedFeatures(e.point, { layers: [BLOCKERS_FILL] });
        if (hits.length && hits[0].properties?.id) {
          const id = String(hits[0].properties.id);
          // Selecting on the map highlights; admin list also flies the camera
          useStore.getState().setSelectedBlockerId(id);
          return;
        }
      }

      const { pickMode, setPickup, setDrop, updateStop, setSelectedBlockerId } =
        useStore.getState();
      if (!pickMode) {
        // Clear issue highlight when clicking empty map
        setSelectedBlockerId(null);
        return;
      }
      const lat = e.lngLat.lat;
      const lon = e.lngLat.lng;
      // Immediate pin move; reverse-geocode fills address (Google Maps–style)
      if (pickMode === "pickup") setPickup({ lat, lon, address: "Locating…" });
      else if (pickMode === "drop") setDrop({ lat, lon, address: "Locating…" });
      else if (pickMode.startsWith("stop:")) {
        const stopId = pickMode.slice(5);
        updateStop(stopId, { lat, lon, address: "Locating…" });
      }
      useStore.getState().setPickMode(null);
      void import("@/lib/geocode").then(({ reverseGeocode }) =>
        reverseGeocode(lat, lon).then((address) => {
          const st = useStore.getState();
          if (pickMode === "pickup") st.setPickup({ lat, lon, address });
          else if (pickMode === "drop") st.setDrop({ lat, lon, address });
          else if (pickMode.startsWith("stop:")) {
            st.updateStop(pickMode.slice(5), { lat, lon, address });
          }
        })
      );
    });

    const markers = driverMarkersRef.current;
    return () => {
      markers.forEach((m) => m.remove());
      markers.clear();
      blockerPopupRef.current?.remove();
      blockerPopupRef.current = null;
      blockerHandlersBoundRef.current = false;
      map.remove();
      mapRef.current = null;
      loadedRef.current = false;
    };
  }, []);

  function syncPickupDrop() {
    const map = mapRef.current;
    if (!map) return;
    const { pickup, drop, stops } = useStore.getState();

    if (!pickupMarkerRef.current) {
      const el = document.createElement("div");
      el.className = "pin-marker";
      el.innerHTML = `<div class="pin-bg pin-pickup"></div><div class="pin-icon">${PERSON_ICON}</div>`;
      pickupMarkerRef.current = new mapboxgl.Marker({ element: el, anchor: "bottom" });
    }
    pickupMarkerRef.current.setLngLat([pickup.lon, pickup.lat]).addTo(map);

    if (!dropMarkerRef.current) {
      const el = document.createElement("div");
      el.className = "pin-marker";
      el.innerHTML = `<div class="pin-bg pin-drop"></div><div class="pin-icon">${FLAG_ICON}</div>`;
      dropMarkerRef.current = new mapboxgl.Marker({ element: el, anchor: "bottom" });
    }
    dropMarkerRef.current.setLngLat([drop.lon, drop.lat]).addTo(map);

    // Intermediate stop markers (max 2)
    stopMarkersRef.current.forEach((m) => m.remove());
    stopMarkersRef.current = stops.map((s, i) => {
      const el = document.createElement("div");
      el.className = "pin-marker pin-stop";
      el.innerHTML = `<div class="pin-bg pin-stop-bg"></div><div class="pin-stop-num">${i + 1}</div>`;
      return new mapboxgl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([s.lon, s.lat])
        .addTo(map);
    });
  }

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

  function setAltRoutes(ride: Ride | undefined) {
    const map = mapRef.current;
    if (!map || !map.getSource(ALTS_SRC)) return;
    const src = map.getSource(ALTS_SRC) as mapboxgl.GeoJSONSource;
    if (!ride || !["allocated", "en_route", "on_trip"].includes(ride.status)) {
      src.setData({ type: "FeatureCollection", features: [] });
      return;
    }
    const options =
      ride.status === "on_trip"
        ? ride.route_options_destination || []
        : ride.route_options_pickup || [];
    const selectedId =
      ride.selected_route_id ||
      (ride.status === "on_trip" ? ride.route_to_destination?.id : ride.route_to_pickup?.id);

    const features: GeoJSON.Feature[] = options
      .filter((r) => r.id !== selectedId && (r.coordinates?.length || 0) >= 2)
      .map((r, i) => ({
        type: "Feature",
        properties: {
          id: r.id,
          label: r.label,
          color: ALT_COLORS[i % ALT_COLORS.length],
        },
        geometry: {
          type: "LineString",
          coordinates: r.coordinates as [number, number][],
        },
      }));
    src.setData({ type: "FeatureCollection", features });
  }

  function syncRoutes() {
    const map = mapRef.current;
    if (!map || !map.getSource(ROUTE_SRC)) return;
    const { rides, currentRideId, pickup, drop } = useStore.getState();
    // Prefer the current ride, else any active ride with options (driver view)
    let ride = rides.find((r) => r.id === currentRideId);
    if (!ride) {
      ride = rides.find((r) =>
        ["allocated", "en_route", "on_trip"].includes(r.status)
      );
    }

    if (
      !ride ||
      !["offered", "allocated", "en_route", "on_trip"].includes(ride.status)
    ) {
      // Idle preview: prefer OSRM street geometry; fall back to waypoints only
      const { stops } = useStore.getState();
      const street = previewCoordsRef.current;
      const preview: [number, number][] =
        street.length >= 2
          ? street
          : [
              [pickup.lon, pickup.lat],
              ...stops.map((s) => [s.lon, s.lat] as [number, number]),
              [drop.lon, drop.lat],
            ];
      setLine(ROUTE_SRC, preview);
      setLine(REMAINING_SRC, []);
      setLine(APPROACH_SRC, []);
      setAltRoutes(undefined);
      return;
    }

    const { full, remaining, approach } = activeRideCoords(ride);
    setAltRoutes(ride);

    if (ride.status === "on_trip") {
      setLine(ROUTE_SRC, full);
      setLine(REMAINING_SRC, remaining.length >= 2 ? remaining : full);
      setLine(APPROACH_SRC, []);
    } else {
      setLine(ROUTE_SRC, approach.length >= 2 ? approach : []);
      setLine(REMAINING_SRC, remaining.length >= 2 ? remaining : full);
      if (!full.length && ride.driver_id) {
        const driver = useStore.getState().drivers.find((d) => d.id === ride.driver_id);
        if (driver) {
          setLine(APPROACH_SRC, [
            [driver.longitude, driver.latitude],
            [ride.pickup_lon, ride.pickup_lat],
          ]);
        } else {
          setLine(APPROACH_SRC, []);
        }
      } else {
        setLine(APPROACH_SRC, []);
      }
    }
  }

  function syncBlockers(blockers: Blocker[]) {
    const map = mapRef.current;
    if (!map || !map.getSource(BLOCKERS_SRC)) return;
    const selectedId = useStore.getState().selectedBlockerId;
    // Active issues always; inactive only when selected so admin can still locate them
    const features: GeoJSON.Feature[] = blockers
      .filter((b) => b.active || b.id === selectedId)
      .map((b) => ({
        type: "Feature",
        properties: {
          id: b.id,
          name: b.name,
          type: b.type,
          description: b.description || "",
          radius_km: b.radius_km,
          severity: b.severity,
          active: b.active ? 1 : 0,
          selected: b.id === selectedId ? 1 : 0,
        },
        geometry: circlePolygon(b.lon, b.lat, Math.max(b.radius_km, 0.15)),
      }));
    const src = map.getSource(BLOCKERS_SRC) as mapboxgl.GeoJSONSource;
    src.setData({ type: "FeatureCollection", features });
  }

  function focusBlockerOnMap(blockerId: string) {
    const map = mapRef.current;
    if (!map) return;
    const b = useStore.getState().blockers.find((x) => x.id === blockerId);
    if (!b) return;
    const pad = Math.max(0.35, b.radius_km * 2.2);
    const dLat = pad / 110.57;
    const dLon = pad / (111.32 * Math.cos((b.lat * Math.PI) / 180));
    const bounds = new mapboxgl.LngLatBounds(
      [b.lon - dLon, b.lat - dLat],
      [b.lon + dLon, b.lat + dLat]
    );
    const isDesktop = window.innerWidth >= 640;
    map.fitBounds(bounds, {
      padding: isDesktop
        ? { top: 100, bottom: 100, left: 420, right: 100 }
        : { top: 100, bottom: 300, left: 60, right: 60 },
      maxZoom: 14.5,
      duration: 450,
    });
  }

  function syncDrivers(drivers: Driver[]) {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    const seen = new Set<string>();
    const { selectedDriverId, setSelectedDriverId, setTab } = useStore.getState();

    drivers.forEach((d) => {
      seen.add(d.id);
      let marker = driverMarkersRef.current.get(d.id);
      let isNew = false;
      if (!marker) {
        marker = new DriverMarker(d.id, () => {
          setSelectedDriverId(d.id);
          setTab("driver");
        });
        isNew = true;
        driverMarkersRef.current.set(d.id, marker);
      }
      marker.update({
        lngLat: [d.longitude, d.latitude],
        color: STATUS_COLOR[d.status] || "#71717a",
        label: d.id,
        selected: d.id === selectedDriverId,
        heading: d.heading,
        vehicle: d.vehicle,
      });
      if (isNew) {
        marker.mount(map);
      }
    });

    driverMarkersRef.current.forEach((marker, id) => {
      if (!seen.has(id)) {
        marker.remove();
        driverMarkersRef.current.delete(id);
      }
    });
  }

  // Fetch street-following preview for idle map (cars on driving, bikes on cycling)
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const loadPreview = () => {
      const { pickup, drop, stops, rideType, rides, currentRideId } = useStore.getState();
      const active = rides.find(
        (r) =>
          r.id === currentRideId &&
          ["offered", "allocated", "en_route", "on_trip"].includes(r.status)
      );
      if (active) return;

      const key = [
        pickup.lat.toFixed(5),
        pickup.lon.toFixed(5),
        drop.lat.toFixed(5),
        drop.lon.toFixed(5),
        stops.map((s) => `${s.lat.toFixed(5)},${s.lon.toFixed(5)}`).join("|"),
        rideType,
      ].join(":");
      if (key === previewKeyRef.current && previewCoordsRef.current.length >= 2) {
        syncRoutes();
        return;
      }

      timer = setTimeout(() => {
        void api
          .routePreview([pickup.lat, pickup.lon], [drop.lat, drop.lon], {
            waypoints: stops.slice(0, 2).map((s) => [s.lat, s.lon] as [number, number]),
            ride_type: rideType,
          })
          .then((bundle) => {
            if (cancelled) return;
            const coords =
              (bundle.selected?.coordinates as [number, number][] | undefined) ||
              (bundle.routes?.[0]?.coordinates as [number, number][] | undefined) ||
              [];
            if (coords.length >= 2) {
              previewKeyRef.current = key;
              previewCoordsRef.current = coords;
              syncRoutes();
            }
          })
          .catch(() => {
            /* keep last good street preview or waypoint chord */
          });
      }, 280);
    };

    loadPreview();
    const unsub = useStore.subscribe((s, prev) => {
      if (
        s.pickup !== prev.pickup ||
        s.drop !== prev.drop ||
        s.stops !== prev.stops ||
        s.rideType !== prev.rideType ||
        s.rides !== prev.rides ||
        s.currentRideId !== prev.currentRideId
      ) {
        loadPreview();
      }
    });
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Subscribe to store changes
  useEffect(() => {
    const unsub1 = useStore.subscribe((s, prev) => {
      if (s.drivers !== prev.drivers) {
        syncDrivers(s.drivers);
        // Re-draw fallback approach if still waiting for route geometry
        if (s.drivers !== prev.drivers) syncRoutes();
      }
      if (s.selectedDriverId !== prev.selectedDriverId) syncDrivers(s.drivers);
    });
    const unsub2 = useStore.subscribe((s, prev) => {
      if (
        s.pickup !== prev.pickup ||
        s.drop !== prev.drop ||
        s.stops !== prev.stops
      ) {
        syncPickupDrop();
        syncRoutes();
      }
    });
    const unsub3 = useStore.subscribe((s, prev) => {
      if (s.rides !== prev.rides || s.currentRideId !== prev.currentRideId) syncRoutes();
    });
    const unsub4 = useStore.subscribe((s, prev) => {
      if (s.blockers !== prev.blockers || s.selectedBlockerId !== prev.selectedBlockerId) {
        syncBlockers(s.blockers);
      }
    });
    return () => {
      unsub1();
      unsub2();
      unsub3();
      unsub4();
    };
  }, []);

  // Focus on selected driver
  useEffect(() => {
    return useStore.subscribe((s, prev) => {
      if (s.focusDriverId && s.focusDriverId !== prev.focusDriverId) {
        const d = s.drivers.find((x) => x.id === s.focusDriverId);
        if (d && mapRef.current) {
          mapRef.current.flyTo({ center: [d.longitude, d.latitude], zoom: 14, duration: 300 });
        }
        useStore.getState().setFocusDriverId(null);
      }
    });
  }, []);

  // Focus / highlight road issues from admin list (or map click + focus)
  useEffect(() => {
    return useStore.subscribe((s, prev) => {
      if (s.focusBlockerId && s.focusBlockerId !== prev.focusBlockerId) {
        syncBlockers(s.blockers);
        focusBlockerOnMap(s.focusBlockerId);
        useStore.getState().setFocusBlockerId(null);
      }
    });
  }, []);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-zinc-950 p-8 text-center text-zinc-400">
        <div className="text-lg font-semibold text-zinc-200">Mapbox token missing</div>
        <p className="max-w-sm text-sm">
          Set <code className="rounded bg-white/10 px-1.5 py-0.5 text-zinc-200">NEXT_PUBLIC_MAPBOX_TOKEN</code> in{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-zinc-200">client/.env.local</code> to enable the
          live map.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} data-map-theme={mapTheme} className="h-full w-full" />
      {/*
        Map chrome above the sheet. Bottom offset is a CSS var that snaps with the
        sheet (no transition) so controls don't jitter or lag.
      */}
      <div className="pointer-events-none absolute bottom-[calc(var(--mobile-sheet-h,0px)+0.75rem)] right-3 z-10 flex flex-col gap-2.5 sm:bottom-8 sm:right-4">
        <button
          type="button"
          onClick={() => switchTheme(mapTheme === "dark" ? "light" : "dark")}
          title={mapTheme === "dark" ? "Switch to light map" : "Switch to dark map"}
          aria-label={mapTheme === "dark" ? "Switch to light map" : "Switch to dark map"}
          className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900/95 text-zinc-200 shadow-lg ring-1 ring-white/10 active:scale-95"
        >
          {mapTheme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button
          type="button"
          onClick={recenterMap}
          title="Recenter map"
          aria-label="Recenter map"
          className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900/95 text-emerald-400 shadow-lg ring-1 ring-white/10 active:scale-95"
        >
          <LocateFixed size={20} />
        </button>
      </div>
    </div>
  );
}
