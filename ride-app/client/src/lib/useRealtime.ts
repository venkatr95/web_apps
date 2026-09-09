"use client";

import { useEffect, useRef } from "react";
import { WS_URL } from "./config";
import { scrollPanelToTop } from "./scrollPanel";
import { useStore } from "./store";
import type {
  BlockersPayload,
  DriverLocationPayload,
  DriverStatusPayload,
  RideOfferPayload,
  RidePayload,
  SnapshotPayload,
  TrafficPayload,
  WsMessage,
} from "./types";

export function useRealtime() {
  const wsRef = useRef<WebSocket | null>(null);
  const pingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    function connect() {
      if (cancelled) return;
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        useStore.getState().setConnected(true);
        pingRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) ws.send("ping");
        }, 20000);
      };

      ws.onclose = () => {
        useStore.getState().setConnected(false);
        if (pingRef.current) clearInterval(pingRef.current);
        if (!cancelled) retryRef.current = setTimeout(connect, 2000);
      };

      ws.onerror = () => ws.close();

      ws.onmessage = (ev) => {
        let msg: WsMessage;
        try {
          msg = JSON.parse(ev.data);
        } catch {
          return;
        }
        handleMessage(msg);
      };
    }

    connect();

    return () => {
      cancelled = true;
      if (pingRef.current) clearInterval(pingRef.current);
      if (retryRef.current) clearTimeout(retryRef.current);
      wsRef.current?.close();
    };
  }, []);
}

function handleMessage(msg: WsMessage) {
  const s = useStore.getState();
  switch (msg.type) {
    case "snapshot": {
      const p = msg.payload as SnapshotPayload;
      s.setDrivers(p.drivers || []);
      s.setRides(p.rides || []);
      if (p.blockers) s.setBlockers(p.blockers);
      break;
    }
    case "driver_location": {
      const p = msg.payload as DriverLocationPayload;
      s.upsertDriver({
        id: p.driver_id,
        latitude: p.latitude,
        longitude: p.longitude,
        ...(p.status ? { status: p.status as never } : {}),
        ...(p.heading !== undefined ? { heading: p.heading } : {}),
      });
      break;
    }
    case "driver_status": {
      const p = msg.payload as DriverStatusPayload;
      s.upsertDriver({ id: p.driver_id, status: p.status as never });
      break;
    }
    case "ride_created":
    case "ride_updated":
    case "ride_allocated":
    case "ride_completed": {
      const p = msg.payload as RidePayload;
      if (p.ride) {
        s.upsertRide(p.ride);
        if (msg.type === "ride_completed") {
          s.pushToast(`Ride ${p.ride.id} completed`, "success");
        }
        if (msg.type === "ride_allocated") {
          s.pushToast(`Ride ${p.ride.id} confirmed — driver on the way`, "success");
        }
      }
      break;
    }
    case "ride_offer": {
      const p = msg.payload as RideOfferPayload;
      if (p.ride) s.upsertRide(p.ride);
      // Always select the offered driver so the card appears under Driver
      if (p.driver_id) {
        s.setSelectedDriverId(p.driver_id);
        s.setFocusDriverId(p.driver_id);
      }
      if (p.ride?.id) s.setCurrentRideId(p.ride.id);
      s.setTab("driver");
      s.expandSheet("mid");
      scrollPanelToTop();
      s.pushToast(
        `New ride offer · ${p.ride?.id || "ride"} for ${p.driver_id} — tap to accept/reject`,
        "info",
        {
          kind: "driver_offer",
          rideId: p.ride?.id || "",
          driverId: p.driver_id,
          tab: "driver",
        }
      );
      break;
    }
    case "traffic_updated": {
      const p = msg.payload as TrafficPayload;
      s.setTraffic(p.traffic);
      break;
    }
    case "blockers_updated": {
      const p = msg.payload as BlockersPayload;
      if (p.blockers) s.setBlockers(p.blockers);
      break;
    }
    case "conditions_updated": {
      const p = msg.payload as {
        traffic?: string;
        blockers?: BlockersPayload["blockers"];
      };
      if (p.traffic) s.setTraffic(p.traffic);
      if (p.blockers) s.setBlockers(p.blockers);
      break;
    }
    case "system":
      break;
    default:
      break;
  }
}
