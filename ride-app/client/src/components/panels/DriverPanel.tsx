"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, MapPin, Navigation, RefreshCw, Star, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Card, EmptyState, SectionLabel } from "@/components/ui/Card";
import { CountdownRing } from "@/components/ui/CountdownRing";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { api } from "@/lib/api";
import { formatEuro } from "@/lib/config";
import { scrollPanelToTop } from "@/lib/scrollPanel";
import { useStore } from "@/lib/store";
import type { Ride, RouteInfo } from "@/lib/types";

export function DriverPanel() {
  const drivers = useStore((s) => s.drivers);
  const rides = useStore((s) => s.rides);
  const selectedDriverId = useStore((s) => s.selectedDriverId);
  const setSelectedDriverId = useStore((s) => s.setSelectedDriverId);
  const setFocusDriverId = useStore((s) => s.setFocusDriverId);
  const currentRideId = useStore((s) => s.currentRideId);
  const setCurrentRideId = useStore((s) => s.setCurrentRideId);
  const upsertRide = useStore((s) => s.upsertRide);
  const upsertDriver = useStore((s) => s.upsertDriver);
  const pushToast = useStore((s) => s.pushToast);
  const traffic = useStore((s) => s.traffic);

  const offerAnchorRef = useRef<HTMLDivElement>(null);

  const driver = drivers.find((d) => d.id === selectedDriverId);
  const fleetOffer = rides.find((r) => r.status === "offered");
  const liveOffer =
    rides.find((r) => r.status === "offered" && r.driver_id === selectedDriverId) ||
    null;

  // When a ride is offered to another driver, switch selection so the card shows under Driver
  useEffect(() => {
    if (liveOffer) return;
    if (!fleetOffer?.driver_id) return;
    if (fleetOffer.driver_id === selectedDriverId) return;
    setSelectedDriverId(fleetOffer.driver_id);
    setFocusDriverId(fleetOffer.driver_id);
    setCurrentRideId(fleetOffer.id);
  }, [
    liveOffer,
    fleetOffer?.id,
    fleetOffer?.driver_id,
    selectedDriverId,
    setSelectedDriverId,
    setFocusDriverId,
    setCurrentRideId,
  ]);

  // New offer → pin panel to top so Accept/Reject is immediately visible
  useEffect(() => {
    if (!liveOffer) return;
    scrollPanelToTop();
    const t = window.setTimeout(() => scrollPanelToTop(), 50);
    const t2 = window.setTimeout(() => scrollPanelToTop(), 200);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, [liveOffer?.id]);

  const myActiveRides = rides.filter(
    (r) =>
      r.driver_id === selectedDriverId &&
      ["allocated", "en_route", "on_trip"].includes(r.status)
  );
  const activeRide =
    myActiveRides.find((r) => r.id === currentRideId) || myActiveRides[0];
  const fleetActiveCount = rides.filter((r) =>
    ["searching", "offered", "allocated", "en_route", "on_trip"].includes(r.status)
  ).length;

  const [secondsLeft, setSecondsLeft] = useState(0);
  const [responding, setResponding] = useState(false);
  const [routeBusy, setRouteBusy] = useState(false);

  const offerExpiresAt = liveOffer?.offer_expires_at;

  useEffect(() => {
    const tick = () => {
      const left = offerExpiresAt
        ? Math.max(0, Math.ceil(offerExpiresAt - Date.now() / 1000))
        : 0;
      setSecondsLeft(left);
    };
    const immediate = setTimeout(tick, 0);
    const id = setInterval(tick, 250);
    return () => {
      clearTimeout(immediate);
      clearInterval(id);
    };
  }, [offerExpiresAt]);

  async function respond(accepted: boolean) {
    const target = liveOffer;
    if (!target) return;
    setResponding(true);
    try {
      const ride = await api.respondOffer(target.id, accepted);
      upsertRide(ride);
      if (accepted) setCurrentRideId(ride.id);
      pushToast(
        accepted ? `Ride ${target.id} accepted — head to pickup` : `Ride ${target.id} rejected`,
        accepted ? "success" : "info"
      );
    } catch (e) {
      pushToast(e instanceof Error ? e.message : "Response failed", "danger");
    } finally {
      setResponding(false);
    }
  }

  async function setStatus(status: "available" | "offline") {
    if (!driver) return;
    try {
      const updated = await api.setDriverStatus(driver.id, status);
      upsertDriver(updated);
    } catch (e) {
      pushToast(e instanceof Error ? e.message : "Status update failed", "danger");
    }
  }

  async function selectRoute(ride: Ride, route: RouteInfo) {
    if (!route.id) return;
    setRouteBusy(true);
    try {
      const phase =
        ride.status === "on_trip" ? "to_destination" : "to_pickup";
      const updated = await api.selectRoute(ride.id, route.id, phase);
      upsertRide(updated);
      setCurrentRideId(updated.id);
      const active =
        updated.status === "on_trip"
          ? updated.route_to_destination
          : updated.route_to_pickup;
      const dist = active?.distance_km ?? updated.distance_km;
      const eta = active?.duration_adj_min ?? updated.eta_minutes;
      pushToast(
        `Re-optimized → ${active?.label || route.label || route.id}` +
          (dist != null && eta != null ? ` · ${dist} km · ~${eta} min` : ""),
        "success"
      );
    } catch (e) {
      pushToast(e instanceof Error ? e.message : "Could not select route", "danger");
    } finally {
      setRouteBusy(false);
    }
  }

  async function replan(ride: Ride) {
    setRouteBusy(true);
    try {
      const updated = await api.replanRoutes(ride.id);
      upsertRide(updated);
      setCurrentRideId(updated.id);
      const active =
        updated.status === "on_trip"
          ? updated.route_to_destination
          : updated.route_to_pickup;
      pushToast(
        `Routes re-optimized from current position` +
          (active?.distance_km != null
            ? ` · ${active.distance_km} km · ~${active.duration_adj_min} min`
            : ""),
        "info"
      );
    } catch (e) {
      pushToast(e instanceof Error ? e.message : "Replan failed", "danger");
    } finally {
      setRouteBusy(false);
    }
  }

  const routeOptions: RouteInfo[] = activeRide
    ? activeRide.status === "on_trip"
      ? activeRide.route_options_destination || []
      : activeRide.route_options_pickup || []
    : [];
  const selectedRouteId =
    activeRide?.selected_route_id ||
    (activeRide?.status === "on_trip"
      ? activeRide.route_to_destination?.id
      : activeRide?.route_to_pickup?.id) ||
    null;

  return (
    <div className="space-y-4">
      {/* Offer first under Driver — always visible when a ride is offered */}
      <div ref={offerAnchorRef} id="driver-ride-offer">
        <AnimatePresence initial={false}>
          {liveOffer && (
            <motion.div
              key={liveOffer.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative overflow-hidden rounded-2xl border border-amber-500/50 bg-gradient-to-br from-amber-500/25 via-zinc-900 to-zinc-900 p-4 shadow-lg shadow-amber-900/30"
            >
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-amber-400/90">
                Driver notification
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-amber-200">New ride offer</div>
                  <div className="mt-0.5 text-xs text-zinc-400">
                    Respond before the timer ends
                  </div>
                </div>
                <CountdownRing
                  secondsLeft={secondsLeft}
                  totalSeconds={liveOffer.offer_timeout_sec || 10}
                  size={52}
                />
              </div>

              <button
                type="button"
                onClick={() => setCurrentRideId(liveOffer.id)}
                className="mt-3 w-full rounded-xl border border-amber-400/25 bg-black/25 px-3 py-2.5 text-left transition hover:border-amber-400/45 hover:bg-black/35"
              >
                <div className="text-sm font-semibold text-zinc-100">
                  Ride {liveOffer.id}
                  <span className="ml-1.5 text-xs font-normal text-zinc-400">
                    · {liveOffer.passenger} · {liveOffer.ride_type}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-3 text-xs text-zinc-400">
                  <span>
                    Pickup ETA{" "}
                    <b className="text-zinc-200">{liveOffer.eta_minutes ?? "—"} min</b>
                  </span>
                  {liveOffer.fare && (
                    <span>
                      Fare{" "}
                      <b className="text-zinc-200">{formatEuro(liveOffer.fare.total)}</b>
                    </span>
                  )}
                  <span>
                    Driver <b className="text-zinc-200">{selectedDriverId}</b>
                  </span>
                </div>
                <div className="mt-1 text-[10px] text-amber-300/80">
                  Tap ride details · use Accept / Reject below
                </div>
              </button>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={responding || secondsLeft <= 0}
                  onClick={() => respond(true)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-2.5 text-sm font-bold text-emerald-950 transition-opacity disabled:opacity-40"
                >
                  <Check size={15} /> Accept
                </button>
                <button
                  type="button"
                  disabled={responding}
                  onClick={() => respond(false)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-rose-500/15 py-2.5 text-sm font-bold text-rose-300 ring-1 ring-inset ring-rose-500/40 transition-opacity disabled:opacity-40"
                >
                  <X size={15} /> Reject
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Card>
        <SectionLabel>Driver</SectionLabel>
        <select
          value={selectedDriverId}
          onChange={(e) => {
            setSelectedDriverId(e.target.value);
            setFocusDriverId(e.target.value);
          }}
          className="w-full rounded-lg border border-white/10 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 outline-none"
        >
          {drivers.map((d) => (
            <option key={d.id} value={d.id}>
              {d.id} — {d.name} ({d.status})
              {rides.some((r) => r.status === "offered" && r.driver_id === d.id)
                ? " · OFFER"
                : ""}
            </option>
          ))}
        </select>
        {fleetActiveCount > 0 && (
          <p className="mt-2 text-[11px] text-zinc-500">
            Fleet has <b className="text-zinc-300">{fleetActiveCount}</b> concurrent ride
            {fleetActiveCount === 1 ? "" : "s"} in progress.
          </p>
        )}
        {myActiveRides.length > 1 && (
          <div className="mt-2 space-y-1">
            {myActiveRides.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setCurrentRideId(r.id)}
                className={`w-full rounded-lg border px-2 py-1.5 text-left text-[11px] ${
                  r.id === activeRide?.id
                    ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
                    : "border-white/8 text-zinc-400 hover:border-white/20"
                }`}
              >
                {r.id} · {r.status} · {r.passenger}
              </button>
            ))}
          </div>
        )}
      </Card>

      {activeRide && (
        <Card>
          <div className="mb-2 flex items-center justify-between gap-2">
            <SectionLabel>
              <span className="inline-flex items-center gap-1.5">
                <Navigation size={12} /> Routes · {activeRide.id}
              </span>
            </SectionLabel>
            <button
              type="button"
              disabled={routeBusy}
              onClick={() => replan(activeRide)}
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-[11px] font-semibold text-zinc-300 hover:bg-white/[0.06] disabled:opacity-40"
            >
              <RefreshCw size={12} className={routeBusy ? "animate-spin" : ""} />
              Replan
            </button>
          </div>
          <p className="mb-2 text-[11px] leading-relaxed text-zinc-500">
            Best options under live traffic (<b className="text-zinc-300">{traffic}</b>),
            closures &amp; events. Tapping a route re-optimizes from your current GPS and
            recalculates remaining distance, ETA, and fare.
          </p>
          {routeOptions.length === 0 ? (
            <EmptyState>Planning routes…</EmptyState>
          ) : (
            <div className="space-y-2">
              {routeOptions.map((r, i) => {
                const selected = r.id === selectedRouteId || (!selectedRouteId && i === 0);
                return (
                  <button
                    key={r.id || i}
                    type="button"
                    disabled={routeBusy || selected}
                    onClick={() => selectRoute(activeRide, r)}
                    className={`w-full rounded-xl border px-3 py-2.5 text-left transition-colors ${
                      selected
                        ? "border-emerald-400/50 bg-emerald-400/10"
                        : "border-white/10 bg-white/[0.02] hover:border-sky-400/40 hover:bg-sky-400/5"
                    } disabled:opacity-80`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ background: ROUTE_COLORS[i % ROUTE_COLORS.length] }}
                        />
                        <span className="text-xs font-bold text-zinc-100">
                          {r.label || `Option ${i + 1}`}
                        </span>
                        {selected && (
                          <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                            Active
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] tabular-nums text-zinc-400">
                        {r.distance_km} km · ~{r.duration_adj_min ?? r.duration_min} min
                      </span>
                    </div>
                    {r.summary && (
                      <div className="mt-1 text-[11px] leading-snug text-zinc-500">{r.summary}</div>
                    )}
                    {!!r.tags?.length && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {r.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-zinc-400"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {driver ? (
        <Card key={driver.id}>
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-zinc-100">
              {driver.id} · {driver.name}
            </div>
            <StatusBadge status={driver.status} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-400">
            <span className="flex items-center gap-1">
              <Star size={12} className="text-amber-400" /> {driver.rating}
            </span>
            <span>Accept {(driver.acceptance_rate * 100).toFixed(0)}%</span>
            <span>Cancel {(driver.cancellation_rate * 100).toFixed(0)}%</span>
            <span>Idle {driver.idle_minutes?.toFixed?.(1) ?? driver.idle_minutes} min</span>
          </div>
          <div className="mt-2 text-xs text-zinc-500">
            {driver.vehicle} {driver.vehicle_number ? `· ${driver.vehicle_number}` : ""}
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-zinc-500">
            <MapPin size={12} /> {driver.latitude.toFixed(4)}, {driver.longitude.toFixed(4)}
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setStatus("available")}
              disabled={driver.status === "available"}
              className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] py-2 text-xs font-semibold text-zinc-200 transition-colors hover:bg-white/[0.08] disabled:opacity-30"
            >
              Go Online
            </button>
            <button
              onClick={() => setStatus("offline")}
              disabled={driver.status === "offline"}
              className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] py-2 text-xs font-semibold text-zinc-200 transition-colors hover:bg-white/[0.08] disabled:opacity-30"
            >
              Go Offline
            </button>
          </div>
        </Card>
      ) : (
        <EmptyState>Select a driver</EmptyState>
      )}
    </div>
  );
}

const ROUTE_COLORS = ["#34d399", "#38bdf8", "#a78bfa"];
