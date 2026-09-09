import { create } from "zustand";
import { PRESETS } from "./config";
import { scrollPanelToTop } from "./scrollPanel";
import type { Blocker, Driver, LatLon, Ride, RideType, TripStop } from "./types";

export type Tab = "passenger" | "driver" | "admin";
export type UiTheme = "dark" | "light";
export type GeoPermission = "unknown" | "prompt" | "granted" | "denied" | "unavailable";
/** Mobile bottom sheet snap: peek = map-first, mid = edit, full = max form */
export type MobileSheet = "peek" | "mid" | "full";

interface AppState {
  tab: Tab;
  setTab: (t: Tab) => void;

  connected: boolean;
  setConnected: (v: boolean) => void;

  /** Shared UI + map theme (light panel must not stay black). */
  uiTheme: UiTheme;
  setUiTheme: (t: UiTheme) => void;

  /** Mobile-only sheet height; desktop ignores. */
  mobileSheet: MobileSheet;
  setMobileSheet: (m: MobileSheet) => void;
  /** Collapse sheet so map is full-screen (push layout down). */
  expandMap: () => void;
  /** Open sheet for editing trip details. */
  expandSheet: (m?: MobileSheet) => void;

  drivers: Driver[];
  setDrivers: (d: Driver[]) => void;
  upsertDriver: (d: Partial<Driver> & { id: string }) => void;

  rides: Ride[];
  setRides: (r: Ride[]) => void;
  upsertRide: (r: Ride) => void;

  currentRideId: string | null;
  setCurrentRideId: (id: string | null) => void;

  selectedDriverId: string;
  setSelectedDriverId: (id: string) => void;

  rideType: RideType;
  setRideType: (t: RideType) => void;

  zone: string;
  setZone: (z: string) => void;

  pickup: LatLon;
  drop: LatLon;
  setPickup: (p: LatLon) => void;
  setDrop: (p: LatLon) => void;

  /** Intermediate stops, max 2. */
  stops: TripStop[];
  addStop: (s?: Partial<LatLon>) => void;
  updateStop: (id: string, p: LatLon) => void;
  removeStop: (id: string) => void;
  setStops: (s: TripStop[]) => void;

  pickMode: "pickup" | "drop" | `stop:${string}` | null;
  setPickMode: (m: "pickup" | "drop" | `stop:${string}` | null) => void;

  passengerName: string;
  setPassengerName: (n: string) => void;

  /** Browser geolocation */
  geoPermission: GeoPermission;
  setGeoPermission: (g: GeoPermission) => void;
  geoLoading: boolean;
  setGeoLoading: (v: boolean) => void;
  usingCurrentLocation: boolean;
  setUsingCurrentLocation: (v: boolean) => void;

  traffic: string;
  setTraffic: (t: string) => void;

  blockers: Blocker[];
  setBlockers: (b: Blocker[]) => void;

  selectedBlockerId: string | null;
  setSelectedBlockerId: (id: string | null) => void;

  focusBlockerId: string | null;
  setFocusBlockerId: (id: string | null) => void;

  matching: boolean;
  setMatching: (v: boolean) => void;

  toasts: ToastItem[];
  pushToast: (
    message: string,
    tone?: "info" | "success" | "danger",
    action?: ToastAction | null
  ) => void;
  dismissToast: (id: string) => void;
  /** Open Driver/Passenger panel and focus the ride that needs a response. */
  openRideAction: (action: ToastAction) => void;

  focusDriverId: string | null;
  setFocusDriverId: (id: string | null) => void;
}

export type ToastTone = "info" | "success" | "danger";

/** Click target for offer / confirm notifications. */
export interface ToastAction {
  kind: "driver_offer";
  rideId: string;
  driverId?: string | null;
  tab: Tab;
}

export interface ToastItem {
  id: string;
  message: string;
  tone: ToastTone;
  action?: ToastAction | null;
}

function newStopId() {
  return `stop_${Math.random().toString(36).slice(2, 9)}`;
}

export const useStore = create<AppState>((set, get) => ({
  tab: "passenger",
  setTab: (tab) => {
    set({ tab });
    // Always pin the panel to the top when switching Passenger / Driver / Admin
    scrollPanelToTop();
  },

  connected: false,
  setConnected: (connected) => set({ connected }),

  uiTheme: "dark",
  setUiTheme: (uiTheme) => set({ uiTheme }),

  mobileSheet: "mid",
  setMobileSheet: (mobileSheet) => set({ mobileSheet }),
  expandMap: () => set({ mobileSheet: "peek" }),
  expandSheet: (m = "mid") => set({ mobileSheet: m }),

  drivers: [],
  setDrivers: (drivers) => set({ drivers }),
  upsertDriver: (patch) =>
    set((s) => {
      const idx = s.drivers.findIndex((d) => d.id === patch.id);
      if (idx === -1) return s;
      const next = s.drivers.slice();
      next[idx] = { ...next[idx], ...patch };
      return { drivers: next };
    }),

  rides: [],
  setRides: (rides) => set({ rides }),
  upsertRide: (ride) =>
    set((s) => {
      const idx = s.rides.findIndex((r) => r.id === ride.id);
      const next = s.rides.slice();
      if (idx === -1) next.unshift(ride);
      else next[idx] = ride;
      return { rides: next };
    }),

  currentRideId: null,
  setCurrentRideId: (currentRideId) => set({ currentRideId }),

  selectedDriverId: "D101",
  setSelectedDriverId: (selectedDriverId) => set({ selectedDriverId }),

  rideType: "rideGo",
  setRideType: (rideType) => set({ rideType }),

  zone: "urban",
  setZone: (zone) => set({ zone }),

  pickup: {
    lat: PRESETS.marienplatz.lat,
    lon: PRESETS.marienplatz.lon,
    address: PRESETS.marienplatz.label,
  },
  drop: {
    lat: PRESETS.schwabing.lat,
    lon: PRESETS.schwabing.lon,
    address: PRESETS.schwabing.label,
  },
  setPickup: (pickup) => set({ pickup }),
  setDrop: (drop) => set({ drop }),

  stops: [],
  setStops: (stops) => set({ stops: stops.slice(0, 2) }),
  addStop: (partial) =>
    set((s) => {
      if (s.stops.length >= 2) return s;
      const mid = {
        lat: (s.pickup.lat + s.drop.lat) / 2,
        lon: (s.pickup.lon + s.drop.lon) / 2,
      };
      const stop: TripStop = {
        id: newStopId(),
        lat: partial?.lat ?? mid.lat,
        lon: partial?.lon ?? mid.lon,
        address: partial?.address ?? "New stop",
      };
      return { stops: [...s.stops, stop] };
    }),
  updateStop: (id, p) =>
    set((s) => ({
      stops: s.stops.map((x) => (x.id === id ? { ...x, ...p, id } : x)),
    })),
  removeStop: (id) =>
    set((s) => ({
      stops: s.stops.filter((x) => x.id !== id),
      pickMode: s.pickMode === `stop:${id}` ? null : s.pickMode,
    })),

  pickMode: null,
  setPickMode: (pickMode) => set({ pickMode }),

  passengerName: "",
  setPassengerName: (passengerName) => set({ passengerName }),

  geoPermission: "unknown",
  setGeoPermission: (geoPermission) => set({ geoPermission }),
  geoLoading: false,
  setGeoLoading: (geoLoading) => set({ geoLoading }),
  usingCurrentLocation: false,
  setUsingCurrentLocation: (usingCurrentLocation) => set({ usingCurrentLocation }),

  traffic: "medium",
  setTraffic: (traffic) => set({ traffic }),

  blockers: [],
  setBlockers: (blockers) => set({ blockers }),

  selectedBlockerId: null,
  setSelectedBlockerId: (selectedBlockerId) => set({ selectedBlockerId }),

  focusBlockerId: null,
  setFocusBlockerId: (focusBlockerId) => set({ focusBlockerId }),

  matching: false,
  setMatching: (matching) => set({ matching }),

  toasts: [],
  pushToast: (message, tone = "info", action = null) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { id, message, tone, action }] }));
    // Action toasts stay longer so the user can tap them
    const ms = action ? 12000 : 4500;
    setTimeout(() => get().dismissToast(id), ms);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  openRideAction: (action) => {
    if (action.driverId) {
      set({ selectedDriverId: action.driverId, focusDriverId: action.driverId });
    }
    set({
      tab: action.tab,
      currentRideId: action.rideId,
      mobileSheet: "mid",
    });
    // Offer / confirm UI sits at the top of the tab
    scrollPanelToTop();
  },

  focusDriverId: null,
  setFocusDriverId: (focusDriverId) => set({ focusDriverId }),
}));

export function currentRide(state: AppState): Ride | null {
  return state.rides.find((r) => r.id === state.currentRideId) || null;
}
