"use client";

import { Car, LayoutDashboard, User } from "lucide-react";
import { useStore, type Tab } from "@/lib/store";

const TABS: { id: Tab; label: string; icon: typeof User }[] = [
  { id: "passenger", label: "Passenger", icon: User },
  { id: "driver", label: "Driver", icon: Car },
  { id: "admin", label: "Admin", icon: LayoutDashboard },
];

export function TabBar() {
  const tab = useStore((s) => s.tab);
  const setTab = useStore((s) => s.setTab);
  const setSelectedDriverId = useStore((s) => s.setSelectedDriverId);
  const setCurrentRideId = useStore((s) => s.setCurrentRideId);
  const expandSheet = useStore((s) => s.expandSheet);
  const light = useStore((s) => s.uiTheme === "light");
  const rides = useStore((s) => s.rides);
  const selectedDriverId = useStore((s) => s.selectedDriverId);

  const activeOffer =
    rides.find((r) => r.status === "offered" && r.driver_id === selectedDriverId) ||
    rides.find((r) => r.status === "offered");
  const driverNeedsAction = !!activeOffer;

  function go(next: Tab) {
    if (next === "driver" && activeOffer) {
      if (activeOffer.driver_id) setSelectedDriverId(activeOffer.driver_id);
      setCurrentRideId(activeOffer.id);
      expandSheet("mid");
    }
    setTab(next);
  }

  return (
    <div
      className={
        light
          ? "flex gap-1 rounded-xl bg-zinc-100 p-1 ring-1 ring-zinc-200/80"
          : "flex gap-1 rounded-xl bg-white/[0.04] p-1"
      }
    >
      {TABS.map((t) => {
        const Icon = t.icon;
        const active = tab === t.id;
        const badge = t.id === "driver" ? driverNeedsAction : false;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => go(t.id)}
            className="relative flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[11px] font-semibold transition-colors sm:px-3 sm:text-xs"
          >
            {/* Static pill — no layoutId spring (avoids tab jump artifacts on mobile) */}
            <span
              className={
                active
                  ? light
                    ? "absolute inset-0 rounded-lg bg-white shadow-sm ring-1 ring-zinc-200/80"
                    : "absolute inset-0 rounded-lg bg-white"
                  : "absolute inset-0 rounded-lg"
              }
              aria-hidden
            />
            <span
              className={`relative z-10 flex items-center gap-1.5 ${
                active ? "text-zinc-950" : light ? "text-zinc-500" : "text-zinc-400"
              }`}
            >
              <Icon size={14} />
              <span>{t.label}</span>
              {badge && (
                <span
                  className={`inline-flex items-center gap-0.5 ${
                    active ? "text-amber-700" : "text-amber-400"
                  }`}
                  aria-label="Action needed"
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      active ? "bg-amber-600" : "bg-amber-400 animate-pulse"
                    }`}
                  />
                  {t.id === "driver" && !active && (
                    <span className="text-[9px] font-bold uppercase">Offer</span>
                  )}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
