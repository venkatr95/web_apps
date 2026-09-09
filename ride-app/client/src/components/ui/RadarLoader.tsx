"use client";

import { motion } from "framer-motion";

export function RadarLoader({ label = "Finding your driver…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <div className="relative h-20 w-20">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute inset-0 rounded-full border-2 border-emerald-400/60"
            initial={{ scale: 0.3, opacity: 0.8 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              delay: i * 0.6,
              ease: "easeOut",
            }}
          />
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_12px_2px_rgba(52,211,153,0.7)]"
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </div>
      </div>
      <div className="text-sm font-medium text-zinc-300">{label}</div>
    </div>
  );
}

export function ScoreBar({ value }: { value: number }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/8">
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </div>
  );
}
