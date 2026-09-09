"use client";

import clsx from "clsx";
import { Crosshair, LocateFixed, MapPinPlus, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AddressAutocomplete } from "@/components/ui/AddressAutocomplete";
import { PRESETS } from "@/lib/config";
import { DEFAULT_PROXIMITY } from "@/lib/geocode";
import {
  geolocationSupported,
  queryGeoPermission,
  resolveCurrentLocation,
} from "@/lib/geolocation";
import { useStore } from "@/lib/store";
import type { PlaceSuggestion } from "@/lib/types";

const MAX_STOPS = 2;

export function LocationPicker() {
  const pickup = useStore((s) => s.pickup);
  const drop = useStore((s) => s.drop);
  const stops = useStore((s) => s.stops);
  const setPickup = useStore((s) => s.setPickup);
  const setDrop = useStore((s) => s.setDrop);
  const addStop = useStore((s) => s.addStop);
  const updateStop = useStore((s) => s.updateStop);
  const removeStop = useStore((s) => s.removeStop);
  const pickMode = useStore((s) => s.pickMode);
  const setPickMode = useStore((s) => s.setPickMode);
  const geoPermission = useStore((s) => s.geoPermission);
  const setGeoPermission = useStore((s) => s.setGeoPermission);
  const geoLoading = useStore((s) => s.geoLoading);
  const setGeoLoading = useStore((s) => s.setGeoLoading);
  const usingCurrentLocation = useStore((s) => s.usingCurrentLocation);
  const setUsingCurrentLocation = useStore((s) => s.setUsingCurrentLocation);
  const pushToast = useStore((s) => s.pushToast);
  const uiTheme = useStore((s) => s.uiTheme);
  const light = uiTheme === "light";

  const [originText, setOriginText] = useState(pickup.address || "");
  const [destText, setDestText] = useState(drop.address || "");
  const [stopTexts, setStopTexts] = useState<Record<string, string>>({});
  const lastPickupAddr = useRef(pickup.address);
  const lastDropAddr = useRef(drop.address);
  const askedRef = useRef(false);

  useEffect(() => {
    if (pickup.address != null && pickup.address !== lastPickupAddr.current) {
      lastPickupAddr.current = pickup.address;
      setOriginText(pickup.address);
    }
  }, [pickup.address]);

  useEffect(() => {
    if (drop.address != null && drop.address !== lastDropAddr.current) {
      lastDropAddr.current = drop.address;
      setDestText(drop.address);
    }
  }, [drop.address]);

  useEffect(() => {
    setStopTexts((prev) => {
      const next = { ...prev };
      for (const s of stops) {
        if (s.address != null && next[s.id] !== s.address) next[s.id] = s.address;
        if (next[s.id] == null) next[s.id] = s.address || "";
      }
      for (const id of Object.keys(next)) {
        if (!stops.some((s) => s.id === id)) delete next[id];
      }
      return next;
    });
  }, [stops]);

  // Detect permission on mount; do not auto-prompt (user must approve via button)
  useEffect(() => {
    void queryGeoPermission().then(setGeoPermission);
  }, [setGeoPermission]);

  // Soft prompt once: if permission already granted, offer to use GPS as origin
  useEffect(() => {
    if (askedRef.current) return;
    if (geoPermission === "granted" && !usingCurrentLocation) {
      askedRef.current = true;
      // Auto-fill when already granted (returning user)
      void useCurrentLocation(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoPermission]);

  async function useCurrentLocation(silent = false) {
    if (!geolocationSupported()) {
      setGeoPermission("unavailable");
      if (!silent) pushToast("Location is not available on this device", "danger");
      return;
    }
    setGeoLoading(true);
    try {
      const loc = await resolveCurrentLocation();
      lastPickupAddr.current = loc.address;
      setOriginText(loc.address || "");
      setPickup(loc);
      setUsingCurrentLocation(true);
      setGeoPermission("granted");
      setPickMode(null);
      if (!silent) pushToast("Origin set to your current location", "success");
    } catch (e) {
      const err = e as GeolocationPositionError | Error;
      const code = "code" in err ? err.code : 0;
      if (code === 1) {
        setGeoPermission("denied");
        if (!silent) pushToast("Location permission denied — type an address or pick on map", "danger");
      } else {
        setGeoPermission("prompt");
        if (!silent) {
          pushToast(
            err instanceof Error ? err.message : "Could not get current location",
            "danger"
          );
        }
      }
      setUsingCurrentLocation(false);
    } finally {
      setGeoLoading(false);
    }
  }

  function applyOrigin(place: PlaceSuggestion) {
    const address = place.full;
    lastPickupAddr.current = address;
    setOriginText(address);
    setPickup({ lat: place.lat, lon: place.lon, address });
    setUsingCurrentLocation(false);
    setPickMode(null);
  }

  function applyDest(place: PlaceSuggestion) {
    const address = place.full;
    lastDropAddr.current = address;
    setDestText(address);
    setDrop({ lat: place.lat, lon: place.lon, address });
    setPickMode(null);
  }

  function applyStop(id: string, place: PlaceSuggestion) {
    updateStop(id, { lat: place.lat, lon: place.lon, address: place.full });
    setStopTexts((t) => ({ ...t, [id]: place.full }));
    setPickMode(null);
  }

  function applyPreset(which: "pickup" | "drop" | string, key: string) {
    const p = PRESETS[key];
    if (!p) return;
    const place: PlaceSuggestion = {
      id: `preset:${key}`,
      primary: p.label,
      secondary: "preset",
      full: p.label,
      lat: p.lat,
      lon: p.lon,
      source: "preset",
    };
    if (which === "pickup") applyOrigin(place);
    else if (which === "drop") applyDest(place);
    else applyStop(which, place);
  }

  const showGeoBanner =
    geoPermission !== "granted" || !usingCurrentLocation;

  return (
    <div className="space-y-2">
      {showGeoBanner && (
        <div
          className={clsx(
            "flex flex-col gap-2 rounded-xl border px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between",
            light
              ? "border-sky-200 bg-sky-50 text-sky-900"
              : "border-sky-500/25 bg-sky-500/10 text-sky-200"
          )}
        >
          <div className="text-[11px] leading-snug sm:text-xs">
            {geoPermission === "denied" ? (
              <>Location blocked in browser settings. Enable it or enter an address.</>
            ) : geoPermission === "unavailable" ? (
              <>Geolocation unavailable — enter origin address or pick on map.</>
            ) : (
              <>
                Use your <b>current location</b> as origin? Requires your approval.
              </>
            )}
          </div>
          {geoPermission !== "unavailable" && geoPermission !== "denied" && (
            <button
              type="button"
              disabled={geoLoading}
              onClick={() => void useCurrentLocation(false)}
              className={clsx(
                "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50",
                light
                  ? "bg-sky-600 text-white hover:bg-sky-700"
                  : "bg-sky-500 text-sky-950 hover:bg-sky-400"
              )}
            >
              <LocateFixed size={14} className={geoLoading ? "animate-pulse" : ""} />
              {geoLoading ? "Locating…" : "Use my location"}
            </button>
          )}
        </div>
      )}

      <Row
        light={light}
        icon={<span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400" />}
        label="Origin address"
        placeholder="Search pickup or use current location…"
        value={originText}
        onChangeValue={(t) => {
          setOriginText(t);
          setUsingCurrentLocation(false);
        }}
        onSelectPlace={applyOrigin}
        proximity={DEFAULT_PROXIMITY}
        active={pickMode === "pickup"}
        onPickMap={() => setPickMode(pickMode === "pickup" ? null : "pickup")}
        onPreset={(key) => applyPreset("pickup", key)}
        coordsHint={`${pickup.lat.toFixed(5)}, ${pickup.lon.toFixed(5)}`}
        badge={usingCurrentLocation ? "GPS" : undefined}
        onUseGps={() => void useCurrentLocation(false)}
        geoLoading={geoLoading}
      />

      {stops.map((s, i) => (
        <Row
          key={s.id}
          light={light}
          icon={
            <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-400/90 text-[9px] font-bold text-amber-950">
              {i + 1}
            </span>
          }
          label={`Stop ${i + 1}`}
          placeholder="Search stop address…"
          value={stopTexts[s.id] ?? s.address ?? ""}
          onChangeValue={(t) => setStopTexts((prev) => ({ ...prev, [s.id]: t }))}
          onSelectPlace={(p) => applyStop(s.id, p)}
          proximity={{ lat: pickup.lat, lon: pickup.lon }}
          active={pickMode === `stop:${s.id}`}
          onPickMap={() =>
            setPickMode(pickMode === `stop:${s.id}` ? null : `stop:${s.id}`)
          }
          onPreset={(key) => applyPreset(s.id, key)}
          coordsHint={`${s.lat.toFixed(5)}, ${s.lon.toFixed(5)}`}
          onRemove={() => removeStop(s.id)}
        />
      ))}

      {stops.length < MAX_STOPS && (
        <button
          type="button"
          onClick={() => addStop()}
          className={clsx(
            "flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed py-2 text-xs font-semibold transition-colors",
            light
              ? "border-zinc-300 text-zinc-600 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-800"
              : "border-white/15 text-zinc-400 hover:border-emerald-400/40 hover:bg-emerald-400/5 hover:text-emerald-300"
          )}
        >
          <Plus size={14} /> Add stop ({stops.length}/{MAX_STOPS})
        </button>
      )}

      <Row
        light={light}
        icon={<span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-sm bg-rose-400" />}
        label="Destination address"
        placeholder="Search drop-off address…"
        value={destText}
        onChangeValue={setDestText}
        onSelectPlace={applyDest}
        proximity={{ lat: pickup.lat, lon: pickup.lon }}
        active={pickMode === "drop"}
        onPickMap={() => setPickMode(pickMode === "drop" ? null : "drop")}
        onPreset={(key) => applyPreset("drop", key)}
        coordsHint={`${drop.lat.toFixed(5)}, ${drop.lon.toFixed(5)}`}
      />

      {pickMode && (
        <div
          className={clsx(
            "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs",
            light ? "bg-amber-50 text-amber-800" : "bg-amber-500/10 text-amber-300"
          )}
        >
          <Crosshair size={13} /> Tap the map to set{" "}
          {pickMode === "pickup"
            ? "origin"
            : pickMode === "drop"
              ? "destination"
              : "stop"}{" "}
          — address autofills from live GPS coords
        </div>
      )}
    </div>
  );
}

function Row({
  light,
  icon,
  label,
  placeholder,
  value,
  onChangeValue,
  onSelectPlace,
  proximity,
  active,
  onPickMap,
  onPreset,
  coordsHint,
  badge,
  onRemove,
  onUseGps,
  geoLoading,
}: {
  light: boolean;
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  value: string;
  onChangeValue: (t: string) => void;
  onSelectPlace: (p: PlaceSuggestion) => void;
  proximity: { lat: number; lon: number };
  active: boolean;
  onPickMap: () => void;
  onPreset: (key: string) => void;
  coordsHint: string;
  badge?: string;
  onRemove?: () => void;
  onUseGps?: () => void;
  geoLoading?: boolean;
}) {
  return (
    <div
      className={clsx(
        "rounded-xl border px-3 py-2.5 transition-colors",
        active
          ? light
            ? "border-emerald-500 bg-emerald-50"
            : "border-emerald-400/50 bg-emerald-400/5"
          : light
            ? "border-zinc-200 bg-zinc-50"
            : "border-white/8 bg-white/[0.02]"
      )}
    >
      <div className="flex items-start gap-2.5">
        {icon}
        <div className="min-w-0 flex-1">
          <AddressAutocomplete
            label={label}
            placeholder={placeholder}
            value={value}
            onChangeValue={onChangeValue}
            onSelectPlace={onSelectPlace}
            proximity={proximity}
            active={active}
          />
          {badge && (
            <span
              className={clsx(
                "mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold",
                light ? "bg-emerald-100 text-emerald-800" : "bg-emerald-500/15 text-emerald-300"
              )}
            >
              {badge}
            </span>
          )}
        </div>
        <div className="flex shrink-0 flex-col gap-1.5 pt-3">
          <select
            className={clsx(
              "max-w-[7.5rem] rounded-lg border px-1.5 py-1 text-[11px] outline-none",
              light
                ? "border-zinc-200 bg-white text-zinc-700"
                : "border-white/10 bg-zinc-900 text-zinc-300"
            )}
            value=""
            title="Quick presets"
            onChange={(e) => {
              const key = e.target.value;
              if (key) onPreset(key);
              e.target.value = "";
            }}
          >
            <option value="">Preset…</option>
            {Object.entries(PRESETS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
          <div className="flex gap-1">
            {onUseGps && (
              <button
                type="button"
                disabled={geoLoading}
                onClick={onUseGps}
                title="Use current GPS location"
                className={clsx(
                  "flex h-7 flex-1 items-center justify-center rounded-lg border text-[11px] font-medium transition-colors disabled:opacity-40",
                  light
                    ? "border-zinc-200 text-zinc-600 hover:border-sky-400 hover:text-sky-700"
                    : "border-white/10 text-zinc-400 hover:border-sky-400/40 hover:text-sky-300"
                )}
              >
                <LocateFixed size={13} />
              </button>
            )}
            <button
              type="button"
              onClick={onPickMap}
              className={clsx(
                "flex h-7 flex-1 items-center justify-center gap-1 rounded-lg border text-[11px] font-medium transition-colors",
                active
                  ? light
                    ? "border-emerald-600 bg-emerald-100 text-emerald-800"
                    : "border-emerald-400 bg-emerald-400/20 text-emerald-300"
                  : light
                    ? "border-zinc-200 text-zinc-600 hover:border-zinc-400"
                    : "border-white/10 text-zinc-400 hover:border-white/25 hover:text-zinc-200"
              )}
              title="Pick on map"
            >
              <MapPinPlus size={13} /> Map
            </button>
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                title="Remove stop"
                className={clsx(
                  "flex h-7 w-7 items-center justify-center rounded-lg border transition-colors",
                  light
                    ? "border-rose-200 text-rose-600 hover:bg-rose-50"
                    : "border-rose-500/30 text-rose-300 hover:bg-rose-500/10"
                )}
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>
      </div>
      <div
        className={clsx(
          "mt-1.5 pl-5 text-[10px] tabular-nums",
          light ? "text-zinc-400" : "text-zinc-600"
        )}
      >
        {coordsHint}
      </div>
    </div>
  );
}
