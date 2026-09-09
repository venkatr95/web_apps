"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { AdminPanel } from "@/components/panels/AdminPanel";
import { DriverPanel } from "@/components/panels/DriverPanel";
import { PassengerPanel } from "@/components/panels/PassengerPanel";
import { scrollPanelToTop } from "@/lib/scrollPanel";
import { useStore } from "@/lib/store";

export function PanelSwitcher() {
  const tab = useStore((s) => s.tab);

  // Every tab change pins the scroll container to the top
  useEffect(() => {
    scrollPanelToTop();
  }, [tab]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={tab}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.12, ease: "easeOut" }}
        onAnimationComplete={() => scrollPanelToTop()}
      >
        {tab === "passenger" && <PassengerPanel />}
        {tab === "driver" && <DriverPanel />}
        {tab === "admin" && <AdminPanel />}
      </motion.div>
    </AnimatePresence>
  );
}
