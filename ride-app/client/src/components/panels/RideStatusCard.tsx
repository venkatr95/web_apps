"use client";

import { Clock, Gauge } from "lucide-react";
import { useEffect, useState } from "react";
import { RadarLoader } from "@/components/ui/RadarLoader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatEuro } from "@/lib/config";
import type { Ride } from "@/lib/types";

const STATUS_TONE: Record<string, string> = {
  searching: "border-amber-500/30",
  offered: "border-amber-500/30",
  allocated: "border-sky-500/30",
  en_route: "border-sky-500/30",
  on_trip: "border-violet-500/30",
  completed: "border-emerald-500/30",
  cancelled: "border-rose-500/30",
  no_drivers: "border-rose-500/30",
};

export function RideStatusCard({
  ride,
  onCancel,
}: {
  ride: Ride;
  onCancel: () => void;
}) {
  const showCancel = !["completed", "cancelled", "no_drivers"].includes(ride.status);
  const isSearching = ride.status === "searching" || ride.status === "offered";
  const matchMax = ride.match_max_sec ?? 120;
  const matchMin = ride.match_min_sec ?? 15;
  const [matchLeft, setMatchLeft] = useState(0);
  const [freeCancelLeft, setFreeCancelLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!isSearching) {
      setMatchLeft(0);
      return;
    }
    const tick = () => {
      const deadline = ride.match_deadline_at ?? Date.now() / 1000 + matchMax;
      setMatchLeft(Math.max(0, Math.ceil(deadline - Date.now() / 1000)));
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [isSearching, ride.match_deadline_at, matchMax]);

  useEffect(() => {
    if (!ride.confirmed_at || !["allocated", "en_route", "on_trip"].includes(ride.status)) {
      setFreeCancelLeft(null);
      return;
    }
    const freeUntil = ride.confirmed_at + 60;
    const tick = () => {
      const left = Math.max(0, Math.ceil(freeUntil - Date.now() / 1000));
      setFreeCancelLeft(left);
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [ride.confirmed_at, ride.status]);

  return (
    <div
      className={`rounded-2xl border bg-white/[0.03] p-4 ${STATUS_TONE[ride.status] || "border-white/8"}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-semibold text-zinc-200">Ride {ride.id}</div>
        <StatusBadge status={ride.status} />
      </div>

      {isSearching && (
        <>
          <RadarLoader
            label={
              ride.status === "offered"
                ? "Driver deciding on your request…"
                : `Finding a driver (${matchMin}s–${Math.round(matchMax / 60)} min)…`
            }
          />
          {matchLeft > 0 && (
            <div className="mt-2 text-center text-[11px] tabular-nums text-zinc-500">
              Matching window · up to <b className="text-zinc-300">{matchLeft}s</b> left
            </div>
          )}
        </>
      )}

      {ride.driver_id && ["allocated", "en_route", "on_trip"].includes(ride.status) && (
        <div className="mt-3 flex items-center gap-3 rounded-xl bg-white/[0.03] p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-sm font-bold text-emerald-300">
            {ride.driver_id.slice(-2)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-zinc-100">
              {ride.driver_name || ride.driver_id}
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-400">
              <span className="flex items-center gap-1">
                <Gauge size={12} /> ETA {ride.eta_minutes ?? "—"} min
              </span>
              {ride.fare && <span>{formatEuro(ride.fare.total)}</span>}
            </div>
          </div>
        </div>
      )}

      {freeCancelLeft != null && freeCancelLeft > 0 && (
        <div className="mt-2 rounded-lg border border-sky-500/20 bg-sky-500/10 px-2.5 py-2 text-[11px] text-sky-200">
          Free cancellation for <b>{freeCancelLeft}s</b> · then €5 fee
        </div>
      )}
      {freeCancelLeft === 0 && ride.confirmed_at && (
        <div className="mt-2 rounded-lg border border-amber-500/25 bg-amber-500/10 px-2.5 py-2 text-[11px] text-amber-200">
          Cancel now incurs a <b>€5</b> fee
        </div>
      )}

      {ride.status === "cancelled" && (
        <div className="mt-2 rounded-lg border border-rose-500/20 bg-rose-500/10 px-2.5 py-2 text-[11px] text-rose-200">
          {ride.cancel_reason ? `Reason: ${ride.cancel_reason}` : "Cancelled"}
          {ride.cancel_penalty_eur != null && ride.cancel_penalty_eur > 0
            ? ` · Fee ${formatEuro(ride.cancel_penalty_eur)}`
            : ""}
        </div>
      )}

      {ride.match_latency_ms != null && (
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-zinc-500">
          <Clock size={11} /> Match latency:{" "}
          <b className="text-zinc-300">{ride.match_latency_ms} ms</b>
        </div>
      )}

      {(() => {
        const options =
          ride.status === "on_trip"
            ? ride.route_options_destination
            : ride.route_options_pickup;
        const route =
          ride.status === "on_trip"
            ? ride.route_to_destination
            : ride.route_to_pickup || ride.route_to_destination;
        if (!route && !options?.length) return null;
        const avoided = route?.blockers_avoided?.length
          ? ` · avoided ${route.blockers_avoided.join(", ")}`
          : "";
        return (
          <div className="mt-2 rounded-lg border border-emerald-500/15 bg-emerald-500/5 px-2.5 py-2 text-[11px] text-zinc-400">
            <div className="font-semibold text-emerald-300/90">
              {route?.label || "Optimized route"}
              {route
                ? ` · ${route.distance_km} km · ~${route.duration_adj_min ?? route.duration_min} min`
                : ""}
            </div>
            <div className="mt-0.5">
              {options?.length ? `${options.length} options · ` : ""}
              via {route?.source || "planner"}
              {avoided}
            </div>
          </div>
        );
      })()}

      {showCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="mt-3 w-full rounded-xl border border-rose-500/30 bg-rose-500/10 py-2 text-sm font-medium text-rose-300 transition-colors hover:bg-rose-500/20"
        >
          Cancel ride
        </button>
      )}

      {!!ride.timeline?.length && (
        <div className="mt-3 border-t border-white/5 pt-3">
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Timeline
          </div>
          <div className="space-y-1.5">
            {ride.timeline
              .slice()
              .reverse()
              .slice(0, 8)
              .map((t) => (
                <div key={`${t.ts}-${t.message}`} className="flex gap-2 text-xs">
                  <span className="shrink-0 tabular-nums text-zinc-600">
                    {new Date(t.ts * 1000).toLocaleTimeString()}
                  </span>
                  <span className="text-zinc-400">{t.message}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
