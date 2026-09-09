"use client";

import clsx from "clsx";
import { ChevronUp, Map as MapIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef } from "react";
import { BootOverlay } from "@/components/BootOverlay";
import { ConnectionBadge } from "@/components/ConnectionBadge";
import { PanelSwitcher } from "@/components/PanelSwitcher";
import { RealtimeProvider } from "@/components/RealtimeProvider";
import { TabBar } from "@/components/TabBar";
import { Toasts } from "@/components/ui/Toasts";
import { useStore, type MobileSheet } from "@/lib/store";

const MapView = dynamic(() => import("@/components/map/MapView").then((m) => m.MapView), {
  ssr: false,
});

const SHEET_ORDER: MobileSheet[] = ["peek", "mid", "full"];

/**
 * Snap heights as CSS vars only — no layout thrash from content remount.
 * peek is intentionally compact so map stays usable without growing the page.
 */
function sheetVisibleHeight(mode: MobileSheet): string {
  switch (mode) {
    case "peek":
      return "min(7.5rem, 22dvh)";
    case "mid":
      return "min(48dvh, 420px)";
    case "full":
      return "min(88dvh, 720px)";
  }
}

export default function Home() {
  const uiTheme = useStore((s) => s.uiTheme);
  const light = uiTheme === "light";
  const mobileSheet = useStore((s) => s.mobileSheet);
  const setMobileSheet = useStore((s) => s.setMobileSheet);
  const expandMap = useStore((s) => s.expandMap);
  const expandSheet = useStore((s) => s.expandSheet);
  const currentRideId = useStore((s) => s.currentRideId);
  const rides = useStore((s) => s.rides);
  const selectedDriverId = useStore((s) => s.selectedDriverId);
  const tab = useStore((s) => s.tab);
  const currentRide = rides.find((r) => r.id === currentRideId);

  const openOffer =
    rides.find((r) => r.status === "offered" && r.driver_id === selectedDriverId) ||
    rides.find((r) => r.status === "offered");
  const needsDriverAction = !!openOffer;
  const actionHint =
    needsDriverAction && tab === "driver"
      ? `Accept offer ${openOffer?.id || ""}`.trim()
      : needsDriverAction
        ? `Offer ${openOffer?.id} — open Driver`
        : null;

  const dragStartY = useRef<number | null>(null);

  // Stable CSS var for map chrome offset — set immediately, no mid-transition thrash
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--mobile-sheet-h", sheetVisibleHeight(mobileSheet));
    return () => {
      root.style.removeProperty("--mobile-sheet-h");
    };
  }, [mobileSheet]);

  // Prevent iOS rubber-band scroll of the whole page (causes map jumps)
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      document.documentElement.style.overflow = "";
    };
  }, []);

  const cycleSheet = useCallback(
    (dir: 1 | -1) => {
      const i = SHEET_ORDER.indexOf(mobileSheet);
      const next = SHEET_ORDER[Math.max(0, Math.min(SHEET_ORDER.length - 1, i + dir))];
      setMobileSheet(next);
    },
    [mobileSheet, setMobileSheet]
  );

  function onHandlePointerDown(e: React.PointerEvent) {
    dragStartY.current = e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onHandlePointerUp(e: React.PointerEvent) {
    if (dragStartY.current == null) return;
    const dy = e.clientY - dragStartY.current;
    dragStartY.current = null;
    if (dy > 48) cycleSheet(-1);
    else if (dy < -48) cycleSheet(1);
  }

  const peek = mobileSheet === "peek";

  return (
    <div
      data-ui-theme={uiTheme}
      data-mobile-sheet={mobileSheet}
      className={clsx(
        "relative h-dvh w-full overflow-hidden overscroll-none touch-manipulation",
        light ? "bg-zinc-100 text-zinc-900" : "bg-zinc-950 text-zinc-100"
      )}
    >
      <RealtimeProvider />
      <BootOverlay />
      <Toasts />

      {/* Map fills viewport once — sheet overlays, never resizes the map root */}
      <div className="absolute inset-0">
        <MapView />
      </div>

      {/* Top bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-2 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:p-4">
        <div
          className={clsx(
            "pointer-events-auto flex items-center gap-2 rounded-xl px-3 py-2 backdrop-blur-md ring-1",
            light
              ? "bg-white/90 text-zinc-900 ring-zinc-200/80 shadow-sm"
              : "bg-zinc-950/70 text-zinc-100 ring-white/10"
          )}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-sm font-black text-emerald-950">
            U
          </div>
          <div className="text-sm font-bold tracking-tight">RideMatch</div>
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => expandMap()}
            className={clsx(
              "flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-semibold backdrop-blur-md ring-1 transition active:scale-95 sm:hidden",
              peek
                ? light
                  ? "bg-emerald-600 text-white ring-emerald-500"
                  : "bg-emerald-500 text-emerald-950 ring-emerald-400/50"
                : light
                  ? "bg-white/90 text-zinc-800 ring-zinc-200 shadow-sm"
                  : "bg-zinc-950/70 text-zinc-100 ring-white/10"
            )}
            title="Full map — push panel down"
          >
            <MapIcon size={15} />
            Map
          </button>
          <ConnectionBadge />
        </div>
      </div>

      {/* Desktop left panel */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden p-4 sm:flex sm:items-start">
        <div
          className={clsx(
            "pointer-events-auto flex h-[calc(100dvh-2rem)] w-[min(400px,calc(100vw-2rem))] flex-col rounded-2xl shadow-2xl backdrop-blur-xl",
            light
              ? "bg-white/95 text-zinc-900 ring-1 ring-zinc-200/90"
              : "bg-zinc-950/85 text-zinc-100 ring-1 ring-white/10"
          )}
        >
          <div className="shrink-0 p-3 pb-0">
            <TabBar />
          </div>
          <div data-panel-scroll className="flex-1 overflow-y-auto overscroll-contain p-3">
            <PanelSwitcher />
          </div>
        </div>
      </div>

      {/* Mobile bottom sheet — height snaps only; content stays mounted to avoid jumps */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col justify-end sm:hidden">
        {/* Action chip when peeking with pending accept/confirm */}
        {peek && actionHint && (
          <div className="pointer-events-auto mb-2 flex justify-center px-3">
            <button
              type="button"
              onClick={() => {
                const st = useStore.getState();
                if (openOffer) {
                  st.openRideAction({
                    kind: "driver_offer",
                    rideId: openOffer.id,
                    driverId: openOffer.driver_id,
                    tab: "driver",
                  });
                } else {
                  expandSheet("mid");
                }
              }}
              className={clsx(
                "flex max-w-full items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold shadow-lg ring-1 backdrop-blur-md active:scale-95",
                light
                  ? "bg-emerald-600 text-white ring-emerald-500"
                  : "bg-emerald-500 text-emerald-950 ring-emerald-400/40"
              )}
            >
              <ChevronUp size={16} />
              <span className="truncate">{actionHint}</span>
            </button>
          </div>
        )}

        {peek && !actionHint && (
          <div className="pointer-events-auto mb-2 flex justify-center px-3">
            <button
              type="button"
              onClick={() => expandSheet("mid")}
              className={clsx(
                "flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold shadow-lg ring-1 backdrop-blur-md active:scale-95",
                light
                  ? "bg-white text-zinc-900 ring-zinc-200"
                  : "bg-zinc-900/95 text-zinc-100 ring-white/15"
              )}
            >
              <ChevronUp size={16} />
              {currentRide ? `Ride ${currentRide.id}` : "Trip details"}
            </button>
          </div>
        )}

        <div
          className={clsx(
            "pointer-events-auto flex w-full flex-col overflow-hidden rounded-t-3xl shadow-[0_-8px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl",
            // Instant snap height — no animated height (eliminates reflow/map jump)
            "transition-none",
            light
              ? "bg-white/98 text-zinc-900 ring-1 ring-zinc-200/90"
              : "bg-zinc-950/95 text-zinc-100 ring-1 ring-white/10"
          )}
          style={{
            height: sheetVisibleHeight(mobileSheet),
            maxHeight: sheetVisibleHeight(mobileSheet),
          }}
        >
          {/* Drag handle */}
          <div
            className="flex shrink-0 cursor-grab touch-none flex-col items-center pb-1 pt-2 active:cursor-grabbing"
            onPointerDown={onHandlePointerDown}
            onPointerUp={onHandlePointerUp}
            onPointerCancel={() => {
              dragStartY.current = null;
            }}
            role="slider"
            aria-valuetext={mobileSheet}
            aria-label="Resize panel"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp") cycleSheet(1);
              if (e.key === "ArrowDown") cycleSheet(-1);
            }}
          >
            <div
              className={clsx(
                "h-1 w-10 rounded-full",
                light ? "bg-zinc-300" : "bg-white/25"
              )}
            />
            <div className="mt-1.5 flex w-full items-center justify-between px-4">
              <span
                className={clsx(
                  "text-[10px] font-medium uppercase tracking-wide",
                  light ? "text-zinc-400" : "text-zinc-500"
                )}
              >
                {peek ? "Map view" : mobileSheet === "mid" ? "Half sheet" : "Expanded"}
              </span>
              <div className="flex items-center gap-1">
                {(["peek", "mid", "full"] as MobileSheet[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMobileSheet(m)}
                    className={clsx(
                      "h-1.5 rounded-full",
                      mobileSheet === m
                        ? "w-4 bg-emerald-500"
                        : light
                          ? "w-1.5 bg-zinc-300"
                          : "w-1.5 bg-white/20"
                    )}
                    aria-label={`Sheet ${m}`}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => expandMap()}
                  className={clsx(
                    "ml-2 rounded-lg px-2 py-1 text-[10px] font-semibold",
                    light
                      ? "bg-zinc-100 text-zinc-600"
                      : "bg-white/10 text-zinc-300"
                  )}
                >
                  Full map
                </button>
              </div>
            </div>
          </div>

          {/*
            Always mount panel content. In peek mode we clip it and show a compact
            summary row so opening the sheet never remounts forms (no layout jump).
          */}
          {peek ? (
            <div className="flex flex-1 items-center gap-3 overflow-hidden px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">
                  {actionHint
                    ? actionHint
                    : currentRide
                      ? `${currentRide.id} · ${currentRide.status.replace(/_/g, " ")}`
                      : "Plan your trip"}
                </div>
                <div
                  className={clsx(
                    "truncate text-[11px]",
                    light ? "text-zinc-500" : "text-zinc-400"
                  )}
                >
                  {actionHint ? "Tap Open to respond" : "Swipe up or tap Open"}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const st = useStore.getState();
                  if (openOffer) {
                    st.openRideAction({
                      kind: "driver_offer",
                      rideId: openOffer.id,
                      driverId: openOffer.driver_id,
                      tab: "driver",
                    });
                  } else {
                    expandSheet(currentRide ? "mid" : "full");
                  }
                }}
                className="shrink-0 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-bold text-emerald-950 active:scale-95"
              >
                Open
              </button>
            </div>
          ) : (
            <>
              <div className="shrink-0 px-3 pb-1">
                <TabBar />
              </div>
              <div
                data-panel-scroll
                className={clsx(
                  "min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1",
                  light ? "scrollbar-light" : ""
                )}
              >
                <PanelSwitcher />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
