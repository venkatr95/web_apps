"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatEuro, shareTextForRide, trackingUrl } from "@/lib/config";
import type { TrackSnapshot } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ShareRideButtons } from "@/components/panels/ShareRideButtons";

const TrackMap = dynamic(
  () => import("@/components/map/TrackMap").then((m) => m.TrackMap),
  { ssr: false, loading: () => <div className="h-full w-full animate-pulse bg-zinc-900" /> }
);

export default function TrackPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token || "";
  const [snap, setSnap] = useState<TrackSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    const load = async () => {
      try {
        const data = await api.trackRide(token);
        if (!cancelled) {
          setSnap(data);
          setError(null);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Tracking link not found");
          setLoading(false);
        }
      }
    };

    load();
    const id = setInterval(load, 3000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [token]);

  if (loading) {
    return (
      <div className="flex h-dvh items-center justify-center bg-zinc-950 text-zinc-400">
        Loading live tracking…
      </div>
    );
  }

  if (error || !snap) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-2 bg-zinc-950 p-6 text-center">
        <div className="text-lg font-semibold text-zinc-100">Tracking unavailable</div>
        <p className="max-w-sm text-sm text-zinc-500">{error || "Unknown error"}</p>
      </div>
    );
  }

  const url = trackingUrl(token);

  return (
    <div className="relative h-dvh w-full overflow-hidden overscroll-none bg-zinc-950 text-zinc-100 touch-manipulation">
      {/* Map is fixed; overlays never reflow the canvas */}
      <div className="absolute inset-0">
        <TrackMap snapshot={snap} />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:p-4">
        <div className="pointer-events-auto mx-auto flex max-w-lg items-center justify-between gap-3 rounded-2xl bg-zinc-950/85 px-3 py-2.5 shadow-xl ring-1 ring-white/10 backdrop-blur-xl">
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Live tracking
            </div>
            <div className="truncate text-sm font-bold text-zinc-100">
              {snap.ride_id}
              {snap.passenger ? ` · ${snap.passenger}` : ""}
            </div>
          </div>
          <StatusBadge status={String(snap.status)} />
        </div>
      </div>

      {/*
        Bottom card is capped and scrollable so it never grows the viewport or
        pushes the map. Map pan stays free underneath.
      */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4">
        <div className="pointer-events-auto mx-auto max-h-[min(42dvh,340px)] max-w-lg overflow-y-auto overscroll-contain rounded-2xl bg-zinc-950/90 p-4 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl">
          <div className="grid grid-cols-3 gap-2 text-center">
            <Stat label="ETA" value={snap.eta_minutes != null ? `${snap.eta_minutes} min` : "—"} />
            <Stat
              label="Distance"
              value={snap.distance_km != null ? `${snap.distance_km} km` : "—"}
            />
            <Stat
              label="Fare"
              value={snap.fare?.total != null ? formatEuro(snap.fare.total) : "—"}
            />
          </div>

          {snap.driver && (
            <div className="mt-2 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Driver
              </div>
              <div className="mt-0.5 text-sm font-semibold text-zinc-100">
                {snap.driver.name || snap.driver.id || "Assigned"}
              </div>
              <div className="text-[11px] text-zinc-500">
                {[snap.driver.vehicle, snap.driver.vehicle_number].filter(Boolean).join(" · ") ||
                  "On the way"}
              </div>
            </div>
          )}

          {snap.route?.summary && (
            <div className="mt-2 rounded-xl border border-emerald-500/15 bg-emerald-500/5 px-3 py-2 text-[11px] text-zinc-400">
              <span className="font-semibold text-emerald-300/90">
                {snap.route.label || "Route"}
              </span>
              {" · "}
              {snap.route.summary}
              {snap.route.follows_roads === false && (
                <span className="mt-1 block text-[10px] text-amber-400/90">
                  Fetching street directions…
                </span>
              )}
              {snap.route.follows_roads && snap.route.profile && (
                <span className="mt-1 block text-[10px] text-zinc-500">
                  {snap.route.profile === "cycling"
                    ? "Bike path · careful near pedestrians"
                    : "Driving directions · car streets only"}
                </span>
              )}
            </div>
          )}
          {snap.ride_type === "bikeTaxi" && (
            <div className="mt-2 rounded-xl border border-sky-500/20 bg-sky-500/5 px-3 py-2 text-[11px] text-sky-200/90">
              bikeTaxi · cycle-friendly streets · yield to pedestrians
            </div>
          )}

          <div className="mt-2">
            <ShareRideButtons
              rideId={snap.ride_id}
              trackingToken={token}
              status={String(snap.status)}
            />
          </div>

          <p className="mt-2 text-center text-[10px] text-zinc-600">
            Live updates · pan freely · use recenter to reframe
          </p>
          <p className="sr-only">{shareTextForRide(snap.ride_id, url, String(snap.status))}</p>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.03] px-2 py-2">
      <div className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="mt-0.5 text-sm font-bold tabular-nums text-zinc-100">{value}</div>
    </div>
  );
}
