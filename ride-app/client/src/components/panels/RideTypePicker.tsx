"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import { Bike, Car, Crown, Sparkles } from "lucide-react";
import { BIKE_TAXIS_ENABLED, RIDE_TYPES } from "@/lib/config";
import { useStore } from "@/lib/store";
import type { RideType } from "@/lib/types";
import { useEffect } from "react";

const ICON: Record<RideType, typeof Car> = {
  rideGo: Car,
  rideX: Sparkles,
  ridePremier: Crown,
  bikeTaxi: Bike,
};

export function RideTypePicker() {
  const rideType = useStore((s) => s.rideType);
  const setRideType = useStore((s) => s.setRideType);

  // If bike taxis are disabled but store still has bikeTaxi, reset
  useEffect(() => {
    if (rideType === "bikeTaxi" && !BIKE_TAXIS_ENABLED) {
      setRideType("rideGo");
    }
  }, [rideType, setRideType]);

  const cols =
    RIDE_TYPES.length >= 4
      ? "grid-cols-2 sm:grid-cols-4"
      : "grid-cols-3";

  return (
    <div className={clsx("grid gap-2", cols)}>
      {RIDE_TYPES.map((rt) => {
        const Icon = ICON[rt.type];
        const selected = rideType === rt.type;
        const isBike = rt.type === "bikeTaxi";
        return (
          <motion.button
            key={rt.type}
            onClick={() => setRideType(rt.type)}
            whileTap={{ scale: 0.96 }}
            title={rt.sub}
            className={clsx(
              "relative flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-center transition-colors",
              selected
                ? isBike
                  ? "border-sky-400/60 bg-sky-400/10"
                  : "border-emerald-400/60 bg-emerald-400/10"
                : "border-white/8 bg-white/[0.02] hover:border-white/20"
            )}
          >
            <Icon
              size={18}
              className={
                selected
                  ? isBike
                    ? "text-sky-300"
                    : "text-emerald-300"
                  : "text-zinc-400"
              }
            />
            <span
              className={clsx(
                "text-xs font-semibold",
                selected
                  ? isBike
                    ? "text-sky-200"
                    : "text-emerald-200"
                  : "text-zinc-200"
              )}
            >
              {rt.label}
            </span>
            {isBike && (
              <span className="text-[9px] font-medium uppercase tracking-wide text-sky-400/80">
                2-wheeler
              </span>
            )}
            {selected && (
              <motion.div
                layoutId="ride-type-ring"
                className={clsx(
                  "pointer-events-none absolute inset-0 rounded-xl ring-2",
                  isBike ? "ring-sky-400/60" : "ring-emerald-400/60"
                )}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
