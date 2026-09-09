"use client";

import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, EmptyState, SectionLabel } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { api } from "@/lib/api";
import { useStore } from "@/lib/store";
import type { AdminStats, AllocationLog } from "@/lib/types";

export function AdminPanel() {
  const drivers = useStore((s) => s.drivers);
  const rides = useStore((s) => s.rides);
  const selectedDriverId = useStore((s) => s.selectedDriverId);
  const setSelectedDriverId = useStore((s) => s.setSelectedDriverId);
  const setFocusDriverId = useStore((s) => s.setFocusDriverId);
  const setTab = useStore((s) => s.setTab);
  const traffic = useStore((s) => s.traffic);
  const setTraffic = useStore((s) => s.setTraffic);
  const blockers = useStore((s) => s.blockers);
  const setBlockers = useStore((s) => s.setBlockers);
  const selectedBlockerId = useStore((s) => s.selectedBlockerId);
  const setSelectedBlockerId = useStore((s) => s.setSelectedBlockerId);
  const setFocusBlockerId = useStore((s) => s.setFocusBlockerId);
  const pushToast = useStore((s) => s.pushToast);
  const setDrivers = useStore((s) => s.setDrivers);
  const setRides = useStore((s) => s.setRides);

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [logs, setLogs] = useState<AllocationLog[]>([]);
  const [resetting, setResetting] = useState(false);
  const [autoConditions, setAutoConditions] = useState(true);
  const [conditionsNote, setConditionsNote] = useState("");

  useEffect(() => {
    const load = () => {
      api.stats().then(setStats).catch(() => {});
      api.logs().then(setLogs).catch(() => {});
      api.blockers().then(setBlockers).catch(() => {});
      api
        .conditions()
        .then((c) => {
          setAutoConditions(c.auto);
          setConditionsNote(c.note || "");
          if (c.traffic) setTraffic(c.traffic);
        })
        .catch(() => {});
    };
    load();
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, [setBlockers, setTraffic]);

  async function changeTraffic(t: string) {
    setTraffic(t);
    try {
      await api.setTraffic(t);
    } catch (e) {
      pushToast(e instanceof Error ? e.message : "Failed to set traffic", "danger");
    }
  }

  async function resetDemo() {
    setResetting(true);
    try {
      await api.reset();
      const [d, r, b] = await Promise.all([api.drivers(), api.listRides(), api.blockers()]);
      setDrivers(d);
      setRides(r);
      setBlockers(b);
      pushToast("Demo state reset", "success");
    } catch (e) {
      pushToast(e instanceof Error ? e.message : "Reset failed", "danger");
    } finally {
      setResetting(false);
    }
  }

  async function toggleBlocker(id: string, active: boolean) {
    try {
      await api.setBlockerActive(id, active);
      const list = await api.blockers();
      setBlockers(list);
      pushToast(active ? `Blocker ${id} enabled` : `Blocker ${id} disabled`, "info");
    } catch (e) {
      pushToast(e instanceof Error ? e.message : "Failed to toggle blocker", "danger");
    }
  }

  async function toggleAutoConditions(enabled: boolean) {
    setAutoConditions(enabled);
    try {
      await api.setAutoConditions(enabled);
      pushToast(
        enabled ? "Live traffic & events automation ON" : "Automation paused — manual control",
        "info"
      );
    } catch (e) {
      pushToast(e instanceof Error ? e.message : "Failed to update automation", "danger");
    }
  }

  function selectDriver(id: string) {
    setSelectedDriverId(id);
    setFocusDriverId(id);
    setTab("driver");
  }

  function focusBlocker(id: string) {
    setSelectedBlockerId(id);
    setFocusBlockerId(id);
  }

  const available = stats?.drivers_by_status?.available ?? 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <StatTile label="Surge" value={stats ? `${stats.surge}x` : "—"} />
        <StatTile label="Avg latency" value={stats?.avg_match_latency_ms != null ? `${stats.avg_match_latency_ms} ms` : "—"} />
        <StatTile label="Total rides" value={stats?.total_rides ?? "—"} />
        <StatTile label="Available drivers" value={available} />
      </div>

      <Card>
        <SectionLabel>Controls</SectionLabel>
        <div className="flex items-center gap-2">
          <select
            value={traffic}
            onChange={(e) => changeTraffic(e.target.value)}
            className="flex-1 rounded-lg border border-white/10 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 outline-none"
          >
            <option value="low">Low traffic</option>
            <option value="medium">Medium traffic</option>
            <option value="high">High traffic</option>
            <option value="severe">Severe traffic</option>
          </select>
          <motion.button
            whileTap={{ scale: 0.92, rotate: -90 }}
            disabled={resetting}
            onClick={resetDemo}
            title="Reset demo"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-zinc-300 hover:bg-white/[0.06] disabled:opacity-40"
          >
            <RotateCcw size={15} />
          </motion.button>
        </div>
        <label className="mt-3 flex cursor-pointer items-center gap-2.5 rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2.5">
          <input
            type="checkbox"
            checked={autoConditions}
            onChange={(e) => toggleAutoConditions(e.target.checked)}
            className="h-3.5 w-3.5 accent-emerald-500"
          />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-zinc-100">Auto traffic &amp; events</div>
            <div className="text-[11px] text-zinc-500">
              {conditionsNote || "Simulates live traffic, congestion, and event closures"}
            </div>
          </div>
        </label>
      </Card>

      <Card>
        <SectionLabel>Route blockers &amp; events</SectionLabel>
        <p className="mb-2 text-[11px] leading-relaxed text-zinc-500">
          Closures/events force detours; congestion raises cost. Click an issue to highlight it on
          the map; hover zones for tooltips. Active zones affect routing.
        </p>
        <div className="space-y-2">
          {blockers.length === 0 ? (
            <EmptyState>Loading blockers…</EmptyState>
          ) : (
            blockers.map((b) => {
              const selected = b.id === selectedBlockerId;
              return (
                <div
                  key={b.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => focusBlocker(b.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      focusBlocker(b.id);
                    }
                  }}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
                    selected
                      ? "border-emerald-400/50 bg-emerald-400/10 ring-1 ring-emerald-400/20"
                      : "border-white/8 bg-white/[0.02] hover:border-white/20"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={b.active}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => toggleBlocker(b.id, e.target.checked)}
                    className="mt-1 h-3.5 w-3.5 accent-emerald-500"
                    title={b.active ? "Disable issue" : "Enable issue"}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-100">{b.name}</span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase ${
                          b.type === "closure"
                            ? "bg-rose-500/15 text-rose-300"
                            : b.type === "event"
                              ? "bg-fuchsia-500/15 text-fuchsia-300"
                              : "bg-amber-500/15 text-amber-300"
                        }`}
                      >
                        {b.type}
                      </span>
                      {b.auto && (
                        <span className="rounded bg-sky-500/10 px-1.5 py-0.5 text-[10px] text-sky-300">
                          auto
                        </span>
                      )}
                      {!b.active && (
                        <span className="rounded bg-zinc-500/15 px-1.5 py-0.5 text-[10px] text-zinc-400">
                          off
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-[11px] text-zinc-500">
                      {b.description || b.id} · r={b.radius_km} km
                      {b.severity != null ? ` · sev ${b.severity}` : ""}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      <div>
        <SectionLabel>Fleet ({drivers.length})</SectionLabel>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <AnimatePresence initial={false}>
            {drivers.map((d) => (
              <motion.button
                layout
                key={d.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => selectDriver(d.id)}
                className={`rounded-xl border p-2.5 text-left transition-colors ${
                  d.id === selectedDriverId
                    ? "border-emerald-400/50 bg-emerald-400/5"
                    : "border-white/8 bg-white/[0.02] hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-100">{d.id}</span>
                  <StatusBadge status={d.status} />
                </div>
                <div className="mt-1 flex gap-2 text-[11px] text-zinc-500">
                  <span>{d.name}</span>
                  <span>★ {d.rating}</span>
                  <span>{d.vehicle}</span>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div>
        <SectionLabel>Ride queue ({rides.length})</SectionLabel>
        {rides.length ? (
          <div className="space-y-1.5">
            <AnimatePresence initial={false}>
              {rides.slice(0, 20).map((r) => (
                <motion.div
                  layout
                  key={r.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-200">{r.id}</span>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="mt-1 flex gap-2 text-[11px] text-zinc-500">
                    <span>{r.passenger}</span>
                    <span>{r.ride_type}</span>
                    <span>{r.driver_id || "—"}</span>
                    {r.match_latency_ms != null && <span>{r.match_latency_ms}ms</span>}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <EmptyState>No rides yet</EmptyState>
        )}
      </div>

      <div>
        <SectionLabel>Allocation logs</SectionLabel>
        {logs.length ? (
          <div className="space-y-1.5">
            {logs
              .slice()
              .reverse()
              .slice(0, 12)
              .map((l, idx) => (
                <div key={`${l.ride_id}-${l.timestamp}-${idx}`} className="rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2 text-[11px]">
                  <div className="flex items-center justify-between text-zinc-300">
                    <span className="font-semibold">
                      {l.phase} · {l.ride_id}
                    </span>
                    <span className="text-zinc-500">{new Date(l.timestamp * 1000).toLocaleTimeString()}</span>
                  </div>
                  <div className="mt-1 text-zinc-500">
                    Selected: <b className="text-zinc-300">{l.selected_driver || "—"}</b>
                  </div>
                  {!!l.candidates?.length && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {l.candidates.slice(0, 5).map((c) => (
                        <span key={c.driver_id} className="rounded bg-white/5 px-1.5 py-0.5 text-zinc-400">
                          {c.driver_id} {c.final_score}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        ) : (
          <EmptyState>No allocation logs yet</EmptyState>
        )}
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
      <div className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="mt-0.5 text-xl font-bold tabular-nums text-zinc-100">{value}</div>
    </div>
  );
}
