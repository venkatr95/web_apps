"use client";

import { useEffect } from "react";
import { api } from "@/lib/api";
import { useRealtime } from "@/lib/useRealtime";
import { useStore } from "@/lib/store";

export function RealtimeProvider() {
  useRealtime();

  useEffect(() => {
    api.drivers().then((d) => useStore.getState().setDrivers(d)).catch(() => {});
    api.listRides().then((r) => useStore.getState().setRides(r)).catch(() => {});
  }, []);

  return null;
}
