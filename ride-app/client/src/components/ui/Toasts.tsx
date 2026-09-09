"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ChevronRight, Info, XCircle } from "lucide-react";
import { useStore } from "@/lib/store";

const ICON = {
  info: Info,
  success: CheckCircle2,
  danger: XCircle,
};

const TONE = {
  info: "border-sky-500/30 bg-sky-950/90 text-sky-100",
  success: "border-emerald-500/30 bg-emerald-950/90 text-emerald-100",
  danger: "border-rose-500/30 bg-rose-950/90 text-rose-100",
};

export function Toasts() {
  const toasts = useStore((s) => s.toasts);
  const dismiss = useStore((s) => s.dismissToast);
  const openRideAction = useStore((s) => s.openRideAction);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICON[t.tone];
          const clickable = !!t.action;
          return (
            <motion.button
              key={t.id}
              type="button"
              layout
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={() => {
                if (t.action) openRideAction(t.action);
                dismiss(t.id);
              }}
              className={`pointer-events-auto flex w-full items-start gap-2 rounded-xl border px-3 py-2.5 text-left text-sm shadow-lg backdrop-blur-md ${TONE[t.tone]} ${
                clickable ? "cursor-pointer ring-1 ring-white/5 hover:brightness-110" : "cursor-default"
              }`}
            >
              <Icon size={16} className="mt-0.5 shrink-0 opacity-90" />
              <span className="min-w-0 flex-1 leading-snug">
                {t.message}
                {clickable && (
                  <span className="mt-1 flex items-center gap-0.5 text-[11px] font-semibold text-emerald-300/95">
                    Tap to open · Accept / Reject
                    <ChevronRight size={12} />
                  </span>
                )}
              </span>
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
