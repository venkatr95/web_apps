"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";

export function BootOverlay() {
  const ready = useStore((s) => s.connected || s.drivers.length > 0);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [forceHide, setForceHide] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setMinTimeElapsed(true), 550);
    const t2 = setTimeout(() => setForceHide(true), 6000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const show = !forceHide && !(ready && minTimeElapsed);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-4 bg-zinc-950"
        >
          <div className="relative h-16 w-16">
            <motion.div
              className="absolute inset-0 rounded-2xl border-2 border-emerald-400"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
              style={{ borderTopColor: "transparent", borderRightColor: "transparent" }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-xl font-black text-emerald-400">
              U
            </div>
          </div>
          <div className="text-sm font-medium text-zinc-400">Connecting to fleet…</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
