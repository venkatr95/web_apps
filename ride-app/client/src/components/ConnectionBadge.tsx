"use client";

import { motion } from "framer-motion";
import { useStore } from "@/lib/store";

export function ConnectionBadge() {
  const connected = useStore((s) => s.connected);
  return (
    <div
      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset ${
        connected ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/30" : "bg-rose-500/10 text-rose-400 ring-rose-500/30"
      }`}
    >
      <motion.span
        className="h-1.5 w-1.5 rounded-full bg-current"
        animate={connected ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
        transition={{ duration: 1.6, repeat: connected ? Infinity : 0 }}
      />
      {connected ? "Live" : "Reconnecting…"}
    </div>
  );
}
