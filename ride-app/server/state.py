"""In-memory application state with reservation locks and event log."""

from __future__ import annotations

import json
import threading
import time
import uuid
from copy import deepcopy
from pathlib import Path
from typing import Any

from matching_engine import (
    MATCH_MAX_SEC,
    MATCH_MIN_SEC,
    MAX_RETRIES,
    OFFER_TIMEOUT_SEC,
    RESERVE_TTL_SEC,
)
from routing import default_blockers

DATA_DIR = Path(__file__).parent / "data"


class AppState:
    def __init__(self) -> None:
        self._lock = threading.RLock()
        self.drivers: dict[str, dict[str, Any]] = {}
        self.rides: dict[str, dict[str, Any]] = {}
        self.reservations: dict[str, dict[str, Any]] = {}  # driver_id -> info
        self.allocation_logs: list[dict[str, Any]] = []
        self.event_log: list[dict[str, Any]] = []
        self.traffic: str = "medium"
        self.zone: str = "urban"
        self.auto_conditions: bool = True  # live traffic + events simulation
        self.blockers: list[dict[str, Any]] = default_blockers()
        self.conditions_note: str = "Live conditions: medium traffic"
        self.ws_clients: list[Any] = []
        self._load_drivers()

    def _load_drivers(self) -> None:
        path = DATA_DIR / "drivers.json"
        with open(path, encoding="utf-8") as f:
            raw = json.load(f)
        now = time.time()
        for d in raw:
            d = dict(d)
            d["last_update"] = now
            d["reserved_until"] = None
            d["current_ride_id"] = None
            self.drivers[d["id"]] = d

    def reset_demo(self) -> None:
        with self._lock:
            self.rides.clear()
            self.reservations.clear()
            self.allocation_logs.clear()
            self.event_log.clear()
            self.drivers.clear()
            self.blockers = default_blockers()
            self.traffic = "medium"
            self.auto_conditions = True
            self.conditions_note = "Live conditions: medium traffic"
            self._load_drivers()
            self._emit("system", {"message": "Demo state reset"})

    def list_blockers(self) -> list[dict[str, Any]]:
        with self._lock:
            return deepcopy(self.blockers)

    def set_blocker_active(self, blocker_id: str, active: bool) -> dict[str, Any] | None:
        with self._lock:
            for b in self.blockers:
                if b["id"] == blocker_id:
                    b["active"] = active
                    return deepcopy(b)
            return None

    def upsert_blocker(self, blocker: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            for i, b in enumerate(self.blockers):
                if b["id"] == blocker["id"]:
                    self.blockers[i] = {**b, **blocker}
                    return deepcopy(self.blockers[i])
            self.blockers.append(blocker)
            return deepcopy(blocker)

    def snapshot_drivers(self) -> list[dict[str, Any]]:
        with self._lock:
            return [deepcopy(d) for d in self.drivers.values()]

    def get_driver(self, driver_id: str) -> dict[str, Any] | None:
        with self._lock:
            d = self.drivers.get(driver_id)
            return deepcopy(d) if d else None

    def update_driver(self, driver_id: str, **fields: Any) -> dict[str, Any] | None:
        with self._lock:
            d = self.drivers.get(driver_id)
            if not d:
                return None
            d.update(fields)
            d["last_update"] = time.time()
            return deepcopy(d)

    def set_driver_status(self, driver_id: str, status: str) -> dict[str, Any] | None:
        return self.update_driver(driver_id, status=status)

    def available_count(self) -> int:
        with self._lock:
            return sum(1 for d in self.drivers.values() if d["status"] == "available")

    def pending_count(self) -> int:
        with self._lock:
            return sum(
                1
                for r in self.rides.values()
                if r["status"] in ("searching", "offered")
            )

    # --- Reservations (distributed-lock simulation) ---

    def reserve_driver(self, driver_id: str, ride_id: str) -> bool:
        """Atomic reservation with TTL. Returns False if unavailable."""
        with self._lock:
            d = self.drivers.get(driver_id)
            if not d or d["status"] != "available":
                return False
            existing = self.reservations.get(driver_id)
            if existing and existing["expires_at"] > time.time():
                return False
            now = time.time()
            self.reservations[driver_id] = {
                "ride_id": ride_id,
                "expires_at": now + RESERVE_TTL_SEC,
                "reserved_at": now,
            }
            d["status"] = "reserved"
            d["reserved_until"] = now + RESERVE_TTL_SEC
            d["current_ride_id"] = ride_id
            return True

    def release_driver(self, driver_id: str, to_status: str = "available") -> None:
        with self._lock:
            self.reservations.pop(driver_id, None)
            d = self.drivers.get(driver_id)
            if d:
                d["status"] = to_status
                d["reserved_until"] = None
                if to_status == "available":
                    d["current_ride_id"] = None
                    d["idle_minutes"] = 0

    def expire_reservations(self) -> list[str]:
        """Release timed-out reservations; return affected ride IDs."""
        expired_rides: list[str] = []
        now = time.time()
        with self._lock:
            to_drop: list[str] = []
            for did, res in self.reservations.items():
                if res["expires_at"] <= now:
                    to_drop.append(did)
                    expired_rides.append(res["ride_id"])
            for did in to_drop:
                res = self.reservations.pop(did)
                d = self.drivers.get(did)
                if d and d["status"] == "reserved":
                    d["status"] = "available"
                    d["reserved_until"] = None
                    d["current_ride_id"] = None
        return expired_rides

    # --- Rides ---

    def create_ride(
        self,
        passenger: str,
        pickup: list[float],
        destination: list[float],
        ride_type: str = "rideGo",
        idempotency_key: str | None = None,
        stops: list[dict[str, Any]] | None = None,
    ) -> dict[str, Any]:
        with self._lock:
            if idempotency_key:
                for r in self.rides.values():
                    if r.get("idempotency_key") == idempotency_key:
                        return deepcopy(r)
            ride_id = f"R{uuid.uuid4().hex[:6].upper()}"
            tracking_token = uuid.uuid4().hex
            clean_stops: list[dict[str, Any]] = []
            for s in (stops or [])[:2]:
                if not s:
                    continue
                clean_stops.append(
                    {
                        "lat": float(s["lat"] if isinstance(s, dict) else s[0]),
                        "lon": float(s["lon"] if isinstance(s, dict) else s[1]),
                        "address": (s.get("address") if isinstance(s, dict) else None),
                    }
                )
            ride = {
                "id": ride_id,
                "tracking_token": tracking_token,
                "passenger": passenger,
                "pickup_lat": pickup[0],
                "pickup_lon": pickup[1],
                "destination_lat": destination[0],
                "destination_lon": destination[1],
                "stops": clean_stops,
                "ride_type": ride_type,
                "status": "searching",
                "driver_id": None,
                "driver_name": None,
                "eta_minutes": None,
                "distance_km": None,
                "fare": None,
                "offer_attempts": [],
                "retry_count": 0,
                "max_retries": MAX_RETRIES,
                "offer_timeout_sec": OFFER_TIMEOUT_SEC,
                "ranked_candidates": [],
                # Optimized road routes (populated after accept / trip start)
                "route_to_pickup": None,
                "route_to_destination": None,
                "route_options_pickup": [],
                "route_options_destination": [],
                "selected_route_id": None,
                "route_conditions": None,
                "active_route": None,  # "to_pickup" | "to_destination"
                "route_progress_index": 0,
                "timeline": [
                    {
                        "event": "requested",
                        "ts": time.time(),
                        "message": "Ride request received",
                    }
                ],
                "created_at": time.time(),
                "updated_at": time.time(),
                "idempotency_key": idempotency_key,
                "offer_expires_at": None,
                # Matching window (passenger already booked — no second confirm)
                "match_min_sec": MATCH_MIN_SEC,
                "match_max_sec": MATCH_MAX_SEC,
                "match_deadline_at": time.time() + MATCH_MAX_SEC,
                "confirmed_at": None,  # set when driver accepts → allocated
                "cancel_reason": None,
                "cancel_penalty_eur": None,
            }
            self.rides[ride_id] = ride
            return deepcopy(ride)

    def get_ride(self, ride_id: str) -> dict[str, Any] | None:
        with self._lock:
            r = self.rides.get(ride_id)
            return deepcopy(r) if r else None

    def get_ride_by_tracking_token(self, token: str) -> dict[str, Any] | None:
        """Public tracking lookup by unguessable token (not ride id)."""
        if not token:
            return None
        with self._lock:
            for r in self.rides.values():
                if r.get("tracking_token") == token:
                    return deepcopy(r)
            return None

    def list_rides(self) -> list[dict[str, Any]]:
        with self._lock:
            rides = [deepcopy(r) for r in self.rides.values()]
        rides.sort(key=lambda x: x["created_at"], reverse=True)
        return rides

    def update_ride(self, ride_id: str, **fields: Any) -> dict[str, Any] | None:
        with self._lock:
            r = self.rides.get(ride_id)
            if not r:
                return None
            r.update(fields)
            r["updated_at"] = time.time()
            return deepcopy(r)

    def append_timeline(self, ride_id: str, event: str, message: str) -> None:
        with self._lock:
            r = self.rides.get(ride_id)
            if r:
                r["timeline"].append(
                    {"event": event, "ts": time.time(), "message": message}
                )
                r["updated_at"] = time.time()

    def add_allocation_log(self, log: dict[str, Any]) -> None:
        with self._lock:
            self.allocation_logs.append(log)
            # Keep last 100
            if len(self.allocation_logs) > 100:
                self.allocation_logs = self.allocation_logs[-100:]

    def list_allocation_logs(self) -> list[dict[str, Any]]:
        with self._lock:
            return list(reversed(self.allocation_logs[-50:]))

    def _emit(self, event_type: str, payload: dict[str, Any]) -> None:
        entry = {
            "type": event_type,
            "payload": payload,
            "ts": time.time(),
        }
        self.event_log.append(entry)
        if len(self.event_log) > 200:
            self.event_log = self.event_log[-200:]

    def emit(self, event_type: str, payload: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            self._emit(event_type, payload)
            return {"type": event_type, "payload": payload, "ts": time.time()}


state = AppState()
