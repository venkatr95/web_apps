"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { formatEuro } from "@/lib/config";
import type { FareEstimate } from "@/lib/types";

export function FareEstimateCard({ estimate }: { estimate: FareEstimate | null }) {
  if (!estimate) return null;
  const { fare } = estimate;
  const surged = fare.surge_multiplier > 1;

  return (
    <motion.div
      key={`${estimate.distance_km}-${estimate.eta_minutes}-${fare.total}`}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border border-white/8 bg-gradient-to-br from-white/[0.05] to-white/[0.01] p-4"
    >
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          Fare estimate · {fare.ride_type}
        </div>
        {surged && (
          <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-400 ring-1 ring-inset ring-amber-500/30">
            <Zap size={11} /> {fare.surge_multiplier}x surge
          </span>
        )}
      </div>
      <div className="mt-1 text-3xl font-bold tracking-tight text-white">{formatEuro(fare.total)}</div>
      <div className="mt-1 text-sm text-zinc-400">
        {estimate.distance_km} km &middot; ~{estimate.eta_minutes} min trip
      </div>
    </motion.div>
  );
}
