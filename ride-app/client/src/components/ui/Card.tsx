"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useStore } from "@/lib/store";

export function Card({
  children,
  className,
  animate = true,
}: {
  children: ReactNode;
  className?: string;
  animate?: boolean;
}) {
  const light = useStore((s) => s.uiTheme === "light");
  const Comp = animate ? motion.div : "div";
  const motionProps = animate
    ? {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.25, ease: "easeOut" as const },
      }
    : {};
  return (
    <Comp
      className={clsx(
        "rounded-2xl border p-4 backdrop-blur-sm",
        light
          ? "border-zinc-200/90 bg-white/85 text-zinc-900 shadow-sm"
          : "border-white/8 bg-white/[0.03] text-zinc-100",
        className
      )}
      {...motionProps}
    >
      {children}
    </Comp>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
      {children}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  const light = useStore((s) => s.uiTheme === "light");
  return (
    <div
      className={clsx(
        "rounded-xl border border-dashed px-4 py-6 text-center text-sm",
        light ? "border-zinc-300 text-zinc-500" : "border-white/10 text-zinc-500"
      )}
    >
      {children}
    </div>
  );
}
