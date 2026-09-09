"use client";

import { motion } from "framer-motion";

export function CountdownRing({
  secondsLeft,
  totalSeconds,
  size = 64,
}: {
  secondsLeft: number;
  totalSeconds: number;
  size?: number;
}) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(1, secondsLeft / totalSeconds));
  const danger = secondsLeft <= 3;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={4}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={danger ? "#f43f5e" : "#f59e0b"}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: circumference * (1 - pct) }}
          transition={{ duration: 0.9, ease: "linear" }}
        />
      </svg>
      <div
        className={`absolute inset-0 flex items-center justify-center text-sm font-bold tabular-nums ${
          danger ? "text-rose-400" : "text-amber-400"
        }`}
      >
        {secondsLeft}s
      </div>
    </div>
  );
}
