"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ScoreBar } from "@/components/ui/RadarLoader";
import type { NearbyDriver } from "@/lib/types";

const BREAKDOWN_LABELS: [string, keyof NonNullable<NearbyDriver["breakdown"]>][] = [
  ["ETA", "eta_score"],
  ["Distance", "distance_score"],
  ["Rating", "rating_score"],
  ["Accept", "acceptance_score"],
  ["Cancel", "cancellation_score"],
  ["Idle", "idle_score"],
];

export function RankingList({ drivers }: { drivers: NearbyDriver[] }) {
  if (!drivers.length) {
    return <div className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-zinc-500">No available drivers nearby</div>;
  }
  return (
    <div className="space-y-2">
      <AnimatePresence initial={false}>
        {drivers.map((d, i) => (
          <motion.div
            key={d.driver}
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, delay: i * 0.03 }}
            className="rounded-xl border border-white/8 bg-white/[0.02] p-3"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-zinc-100">
                {i === 0 && <span className="mr-1.5 text-emerald-400">#1</span>}
                {d.driver} <span className="font-normal text-zinc-500">· {d.name}</span>
              </span>
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
                {Math.round((d.score || 0) * 100)} pts
              </span>
            </div>
            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-zinc-400">
              <span>
                ETA <b className="text-zinc-200">{d.eta} min</b>
              </span>
              <span>
                Dist <b className="text-zinc-200">{d.distance_km} km</b>
              </span>
              <span>
                ★ <b className="text-zinc-200">{d.rating}</b>
              </span>
              <span>{d.vehicle}</span>
            </div>
            <div className="mt-2">
              <ScoreBar value={d.score || 0} />
            </div>
            {d.breakdown && (
              <div className="mt-2 space-y-1 border-t border-white/5 pt-2">
                {BREAKDOWN_LABELS.map(([label, key]) => (
                  <div key={key} className="flex items-center gap-2 text-[11px] text-zinc-500">
                    <span className="w-14 shrink-0">{label}</span>
                    <ScoreBar value={d.breakdown![key]} />
                    <span className="w-8 shrink-0 text-right tabular-nums text-zinc-400">
                      {d.breakdown![key].toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
