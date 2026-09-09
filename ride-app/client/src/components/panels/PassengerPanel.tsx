"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, EmptyState, SectionLabel } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { api } from "@/lib/api";
import { useStore } from "@/lib/store";
import type { FareEstimate, NearbyDriver, Ride } from "@/lib/types";
import { CancelRideModal } from "./CancelRideModal";
import { FareEstimateCard } from "./FareEstimateCard";
import { LocationPicker } from "./LocationPicker";
import { RankingList } from "./RankingList";
import { RideStatusCard } from "./RideStatusCard";
import { RideTypePicker } from "./RideTypePicker";
import { ShareRideButtons } from "./ShareRideButtons";

const TERMINAL = new Set(["completed", "cancelled", "no_drivers"]);

function isActiveRide(r: Ride) {
  return !TERMINAL.has(r.status);
}

export function PassengerPanel() {
  const pickup = useStore((s) => s.pickup);
  const drop = useStore((s) => s.drop);
  const stops = useStore((s) => s.stops);
  const rideType = useStore((s) => s.rideType);
  const zone = useStore((s) => s.zone);
  const setZone = useStore((s) => s.setZone);
  const passengerName = useStore((s) => s.passengerName);
  const setPassengerName = useStore((s) => s.setPassengerName);
  const rides = useStore((s) => s.rides);
  const currentRideId = useStore((s) => s.currentRideId);
  const setCurrentRideId = useStore((s) => s.setCurrentRideId);
  const upsertRide = useStore((s) => s.upsertRide);
  const pushToast = useStore((s) => s.pushToast);
  const uiTheme = useStore((s) => s.uiTheme);
  const light = uiTheme === "light";

  const [estimate, setEstimate] = useState<FareEstimate | null>(null);
  const [nearby, setNearby] = useState<NearbyDriver[]>([]);
  const [requesting, setRequesting] = useState(false);
  const [cancelRideId, setCancelRideId] = useState<string | null>(null);

  const nameKey = (passengerName || "Passenger").trim().toLowerCase();

  const myRides = useMemo(() => {
    return rides
      .filter((r) => {
        const pn = (r.passenger || "").trim().toLowerCase();
        return pn === nameKey || pn === "passenger" || r.id === currentRideId;
      })
      .sort((a, b) => {
        const aa = isActiveRide(a) ? 0 : 1;
        const ab = isActiveRide(b) ? 0 : 1;
        if (aa !== ab) return aa - ab;
        return 0;
      });
  }, [rides, nameKey, currentRideId]);

  const activeRides = useMemo(() => myRides.filter(isActiveRide), [myRides]);

  const currentRide: Ride | null =
    rides.find((r) => r.id === currentRideId) || activeRides[0] || null;

  useEffect(() => {
    if (currentRideId && rides.some((r) => r.id === currentRideId)) return;
    if (activeRides[0]) setCurrentRideId(activeRides[0].id);
  }, [currentRideId, rides, activeRides, setCurrentRideId]);

  const stopKey = stops.map((s) => `${s.lat},${s.lon}`).join("|");

  useEffect(() => {
    let cancelled = false;
    const stopCoords = stops.map((s) => [s.lat, s.lon] as [number, number]);
    api
      .fareEstimate({
        pickup_lat: pickup.lat,
        pickup_lon: pickup.lon,
        drop_lat: drop.lat,
        drop_lon: drop.lon,
        ride_type: rideType,
        stops: stopCoords.length ? stopCoords : undefined,
      })
      .then((data) => !cancelled && setEstimate(data))
      .catch(() => {});
    api
      .nearbyDrivers({ lat: pickup.lat, lon: pickup.lon, ride_type: rideType })
      .then((list) => !cancelled && setNearby(list))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [pickup.lat, pickup.lon, drop.lat, drop.lon, rideType, stopKey, stops]);

  async function requestRide() {
    setRequesting(true);
    try {
      const stopCoords = stops.slice(0, 2).map((s) => [s.lat, s.lon] as [number, number]);
      const ride = await api.requestRide({
        passenger: passengerName || "Passenger",
        pickup: [pickup.lat, pickup.lon],
        destination: [drop.lat, drop.lon],
        stops: stopCoords.length ? stopCoords : undefined,
        ride_type: rideType,
        zone,
      });
      upsertRide(ride);
      setCurrentRideId(ride.id);
      if (typeof window !== "undefined" && window.innerWidth < 640) {
        useStore.getState().expandSheet("mid");
      }
      pushToast(
        activeRides.length
          ? `Ride ${ride.id} booked (${activeRides.length + 1} active) · matching 15s–2 min`
          : `Ride ${ride.id} booked — finding a driver (15s–2 min)`,
        "success"
      );
    } catch (e) {
      pushToast(e instanceof Error ? e.message : "Request failed", "danger");
    } finally {
      setRequesting(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <SectionLabel>Passenger</SectionLabel>
        <input
          value={passengerName}
          onChange={(e) => setPassengerName(e.target.value)}
          placeholder="Your name"
          className={
            light
              ? "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-emerald-500"
              : "w-full rounded-lg border border-white/10 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-emerald-400/50"
          }
        />
      </Card>

      <Card>
        <SectionLabel>
          Trip · origin{stops.length ? `, ${stops.length} stop${stops.length > 1 ? "s" : ""}` : ""}{" "}
          &amp; destination
        </SectionLabel>
        <LocationPicker />
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wide text-zinc-500">Zone</span>
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className={
                light
                  ? "rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-700 outline-none"
                  : "rounded-lg border border-white/10 bg-zinc-900 px-2 py-1 text-xs text-zinc-300 outline-none"
              }
            >
              <option value="urban">Urban</option>
              <option value="suburban">Suburban</option>
              <option value="airport">Airport</option>
            </select>
          </div>
          {activeRides.length > 0 && (
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
              {activeRides.length} active ride{activeRides.length === 1 ? "" : "s"}
            </span>
          )}
        </div>
      </Card>

      <Card>
        <SectionLabel>Ride type</SectionLabel>
        <RideTypePicker />
      </Card>

      <FareEstimateCard estimate={estimate} />

      <button
        type="button"
        disabled={requesting}
        onClick={() => void requestRide()}
        className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-emerald-950 shadow-lg shadow-emerald-500/20 transition-opacity disabled:opacity-40 active:scale-[0.99]"
      >
        {requesting
          ? "Booking…"
          : activeRides.length
            ? "Book another ride"
            : "Book ride"}
      </button>
      <p className="text-center text-[11px] text-zinc-500">
        Matching takes 15 seconds–2 minutes. Cancel anytime with a reason (free while
        searching; €5 after 1 min of driver acceptance).
      </p>

      {myRides.length > 0 && (
        <div>
          <SectionLabel>Your rides ({myRides.length})</SectionLabel>
          <div className="space-y-1.5">
            {myRides.map((r) => {
              const selected = r.id === currentRide?.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setCurrentRideId(r.id);
                    if (typeof window !== "undefined" && window.innerWidth < 640) {
                      useStore.getState().expandMap();
                    }
                  }}
                  className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                    selected
                      ? "border-emerald-400/50 bg-emerald-400/10"
                      : light
                        ? "border-zinc-200 bg-zinc-50 hover:border-zinc-300"
                        : "border-white/8 bg-white/[0.02] hover:border-white/20"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-100">{r.id}</span>
                      <StatusBadge status={r.status} />
                    </div>
                    <div className="mt-0.5 truncate text-[11px] text-zinc-500">
                      {r.ride_type}
                      {r.driver_name ? ` · ${r.driver_name}` : ""}
                      {r.eta_minutes != null ? ` · ETA ${r.eta_minutes} min` : ""}
                      {r.cancel_penalty_eur
                        ? ` · fee €${r.cancel_penalty_eur}`
                        : ""}
                    </div>
                  </div>
                  {selected && (
                    <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
                      Map
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {currentRide ? (
        <div className="space-y-3">
          <RideStatusCard
            ride={currentRide}
            onCancel={() => setCancelRideId(currentRide.id)}
          />
          {isActiveRide(currentRide) && (
            <ShareRideButtons
              rideId={currentRide.id}
              trackingToken={currentRide.tracking_token}
              status={currentRide.status}
            />
          )}
        </div>
      ) : null}

      <div>
        <SectionLabel>Nearby ranked drivers</SectionLabel>
        <RankingList drivers={nearby} />
      </div>

      {!nearby.length && !activeRides.length && (
        <EmptyState>
          No active rides. Book one above — cancel with a reason anytime, or book
          another ride.
        </EmptyState>
      )}

      <CancelRideModal
        rideId={cancelRideId || ""}
        open={!!cancelRideId}
        onClose={() => setCancelRideId(null)}
        onCancelled={() => {
          if (cancelRideId) {
            const next = activeRides.find((r) => r.id !== cancelRideId);
            setCurrentRideId(next?.id ?? null);
          }
        }}
      />
    </div>
  );
}
