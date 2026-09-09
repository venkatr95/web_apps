"""
ride Driver Allocation Demo — FastAPI server.

Provides REST APIs, WebSocket live updates, matching pipeline,
driver simulation, and admin visibility.
"""

from __future__ import annotations

import asyncio
import math
import os
import random
import time
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from location_service import (
    estimate_eta_minutes,
    haversine_km,
    step_for_traffic,
)
from matching_engine import (
    CANCEL_PENALTY_AFTER_SEC,
    CANCEL_PENALTY_EUR,
    CANCEL_REASONS,
    MATCH_MAX_SEC,
    MATCH_MIN_SEC,
    MAX_RETRIES,
    OFFER_TIMEOUT_SEC,
    build_allocation_log,
    rank_drivers,
)
from pricing import VALID_RIDE_TYPES, compute_surge, estimate_fare
from routing import (
    PROFILE_CYCLING,
    PROFILE_DRIVING,
    advance_along_route,
    closest_index_on_route,
    follows_roads,
    is_bike_ride_type,
    pick_route_by_preference,
    plan_route_async,
    plan_routes_async,
    profile_for_ride_type,
    remaining_route_metrics,
)
from state import state

# Location tick interval during active trips (seconds)
TRIP_TICK_SEC = 5.0
# Base distance advanced per tick before traffic scaling (cars)
STEP_EN_ROUTE_KM = 0.10   # driver → pickup (~slower crawl)
STEP_ON_TRIP_KM = 0.14    # pickup → destination
# Bike taxis: slower crawl, extra care near pedestrians/cyclists
STEP_BIKE_EN_ROUTE_KM = 0.06
STEP_BIKE_ON_TRIP_KM = 0.08


def _env_flag(*names: str, default: bool = False) -> bool:
    """Parse boolean env flags; supports BIKE_TAXIS and bike-taxis style keys."""
    for name in names:
        for key in (name, name.replace("_", "-"), name.replace("-", "_")):
            raw = os.environ.get(key)
            if raw is None:
                continue
            return str(raw).strip().lower() in ("1", "true", "yes", "on")
    return default


# Feature flag: bike taxis (production/dev). Set BIKE_TAXIS=true or bike-taxis=true
# Default on for the demo; set BIKE_TAXIS=false to hide/disable the product.
BIKE_TAXIS_ENABLED = _env_flag("BIKE_TAXIS", "bike-taxis", default=True)


def allowed_ride_types() -> set[str]:
    types = set(VALID_RIDE_TYPES)
    if not BIKE_TAXIS_ENABLED:
        types.discard("bikeTaxi")
    return types

# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------


class RideRequest(BaseModel):
    passenger: str = "Passenger"
    pickup: list[float] = Field(..., min_length=2, max_length=2)
    destination: list[float] = Field(..., min_length=2, max_length=2)
    # Intermediate stops: each [lat, lon], max 2
    stops: list[list[float]] = Field(default_factory=list, max_length=2)
    ride_type: str = "rideGo"
    zone: str = "urban"
    idempotency_key: str | None = None


class DriverRespond(BaseModel):
    ride_id: str
    accepted: bool


class CancelRideBody(BaseModel):
    """Cancel a booked ride. Reason required. accept_penalty when late fee applies."""
    reason: str = Field(..., min_length=2, max_length=200)
    accept_penalty: bool = False


class DriverLocationUpdate(BaseModel):
    latitude: float
    longitude: float
    heading: float | None = None
    speed: float | None = None


class DriverStatusUpdate(BaseModel):
    status: str  # online -> available, offline


class TrafficUpdate(BaseModel):
    traffic: str  # low | medium | high | severe


class BlockerToggle(BaseModel):
    active: bool


class RoutePreviewRequest(BaseModel):
    origin: list[float] = Field(..., min_length=2, max_length=2)
    destination: list[float] = Field(..., min_length=2, max_length=2)
    # Intermediate stops [lat, lon], max 2 — re-optimizes full path through them
    waypoints: list[list[float]] = Field(default_factory=list, max_length=2)
    ride_type: str = "rideGo"


class SelectRouteRequest(BaseModel):
    route_id: str
    phase: str | None = None  # "to_pickup" | "to_destination" — default: active leg


class AutoConditionsUpdate(BaseModel):
    enabled: bool


class WSManager:
    def __init__(self) -> None:
        self.clients: list[WebSocket] = []

    async def connect(self, ws: WebSocket) -> None:
        await ws.accept()
        self.clients.append(ws)

    def disconnect(self, ws: WebSocket) -> None:
        if ws in self.clients:
            self.clients.remove(ws)

    async def broadcast(self, message: dict[str, Any]) -> None:
        dead: list[WebSocket] = []
        for ws in self.clients:
            try:
                await ws.send_json(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)


ws_manager = WSManager()


async def broadcast_event(event_type: str, payload: dict[str, Any]) -> None:
    msg = state.emit(event_type, payload)
    await ws_manager.broadcast(msg)


# ---------------------------------------------------------------------------
# Background tasks: offer timeouts, driver GPS simulation, movement
# ---------------------------------------------------------------------------


async def offer_timeout_loop() -> None:
    """Expire reservations, enforce matching window, re-offer next driver."""
    while True:
        try:
            expired = state.expire_reservations()
            for ride_id in expired:
                ride = state.get_ride(ride_id)
                if not ride or ride["status"] not in ("offered", "searching"):
                    continue
                state.append_timeline(
                    ride_id, "timeout", "Driver offer timed out — retrying"
                )
                await try_offer_next(ride_id)
            # Driver offer window
            for ride in state.list_rides():
                if ride["status"] != "offered":
                    continue
                exp = ride.get("offer_expires_at")
                if exp and time.time() > exp:
                    did = ride.get("driver_id")
                    if did:
                        state.release_driver(did, "available")
                    state.append_timeline(
                        ride["id"],
                        "timeout",
                        f"Offer to {did} expired after {OFFER_TIMEOUT_SEC}s",
                    )
                    await try_offer_next(ride["id"])
            # Matching window: min 15s, max 2 min for finding a driver
            now = time.time()
            for ride in state.list_rides():
                if ride["status"] not in ("searching", "offered"):
                    continue
                created = float(ride.get("created_at") or now)
                deadline = float(
                    ride.get("match_deadline_at") or (created + MATCH_MAX_SEC)
                )
                age = now - created
                if age >= MATCH_MAX_SEC or now >= deadline:
                    did = ride.get("driver_id")
                    if did and ride["status"] == "offered":
                        state.release_driver(did, "available")
                        await broadcast_event(
                            "driver_status",
                            {"driver_id": did, "status": "available"},
                        )
                    state.update_ride(
                        ride["id"],
                        status="no_drivers",
                        driver_id=None,
                        driver_name=None,
                        offer_expires_at=None,
                    )
                    state.append_timeline(
                        ride["id"],
                        "failed",
                        f"No driver found within {MATCH_MAX_SEC // 60} min matching window",
                    )
                    await broadcast_event(
                        "ride_updated", {"ride": state.get_ride(ride["id"])}
                    )
                elif ride["status"] == "searching" and age >= 1:
                    # Keep searching within the window
                    await try_offer_next(ride["id"])
        except Exception as e:
            print(f"[offer_timeout_loop] {e}")
        await asyncio.sleep(1)


async def driver_idle_and_wander_loop() -> None:
    """Cruise available drivers along their heading (like idle street patrol) and grow idle time."""
    while True:
        try:
            for d in state.snapshot_drivers():
                if d["status"] not in ("available", "online"):
                    continue
                # Turn gently rather than jumping heading around, then actually move
                # along that heading — independent random lat/lon jitter used to make
                # drivers vibrate in place instead of visibly cruising.
                heading = (d.get("heading") or random.uniform(0, 360)) + random.uniform(-25, 25)
                heading %= 360
                speed_kmh = random.uniform(14.0, 26.0)
                step_km = speed_kmh * (2 / 3600.0)  # distance covered in this 2s tick
                rad = math.radians(heading)
                lat_rad = math.radians(d["latitude"])
                lat = d["latitude"] + (step_km / 110.57) * math.cos(rad)
                lon = d["longitude"] + (step_km / (111.32 * max(math.cos(lat_rad), 0.15))) * math.sin(rad)
                idle = d.get("idle_minutes", 0) + (2 / 60.0)  # +2s worth
                updated = state.update_driver(
                    d["id"],
                    latitude=round(lat, 6),
                    longitude=round(lon, 6),
                    idle_minutes=round(idle, 2),
                    heading=round(heading, 1),
                    speed=round(speed_kmh, 1),
                )
                if updated:
                    await broadcast_event(
                        "driver_location",
                        {
                            "driver_id": d["id"],
                            "latitude": updated["latitude"],
                            "longitude": updated["longitude"],
                            "status": updated["status"],
                            "heading": updated.get("heading"),
                        },
                    )
        except Exception as e:
            print(f"[wander] {e}")
        await asyncio.sleep(2)


def _ride_waypoints(ride: dict[str, Any]) -> list[tuple[float, float]]:
    """Intermediate stops for trip leg (max 2)."""
    out: list[tuple[float, float]] = []
    for s in (ride.get("stops") or [])[:2]:
        try:
            out.append((float(s["lat"]), float(s["lon"])))
        except (KeyError, TypeError, ValueError):
            continue
    return out


async def ensure_route(
    ride: dict[str, Any],
    phase: str,
    origin_lat: float,
    origin_lon: float,
    dest_lat: float,
    dest_lon: float,
    *,
    activate: bool = False,
    force: bool = False,
) -> dict[str, Any]:
    """
    Ensure ride has up to 3 optimized route options for the phase and a selected path.
    phase: 'to_pickup' | 'to_destination'
    activate: mark this leg active and reset progress.
    force: replan even if options already exist (live traffic/events change).
    Destination leg includes intermediate stops when present.
    Cars use driving (car streets); bike taxis use cycling profile.
    """
    field = "route_to_pickup" if phase == "to_pickup" else "route_to_destination"
    options_field = (
        "route_options_pickup" if phase == "to_pickup" else "route_options_destination"
    )
    existing = ride.get(field)
    existing_opts = ride.get(options_field) or []
    # Replan if we only have a non-street A→B stub
    needs_street = not follows_roads(existing)
    if (
        not force
        and not needs_street
        and existing
        and existing.get("coordinates")
        and len(existing["coordinates"]) >= 2
        and existing_opts
    ):
        if activate:
            state.update_ride(
                ride["id"],
                active_route=phase,
                route_progress_index=0,
                selected_route_id=existing.get("id") or ride.get("selected_route_id"),
            )
        return existing

    blockers = state.list_blockers()
    ride_type = ride.get("ride_type") or "rideGo"
    profile = profile_for_ride_type(ride_type)
    # Stops apply to passenger trip (pickup → …stops… → destination), not approach
    wps = _ride_waypoints(ride) if phase == "to_destination" else []
    bundle = await plan_routes_async(
        origin_lat,
        origin_lon,
        dest_lat,
        dest_lon,
        traffic=state.traffic,
        blockers=blockers,
        max_routes=3,
        waypoints=wps or None,
        profile=profile,
        ride_type=ride_type,
    )
    routes = bundle.get("routes") or []
    selected = bundle.get("selected")
    if not selected and routes:
        selected = routes[0]
    if not selected:
        # Last-resort straight line (offline only)
        selected = {
            "id": "opt_1",
            "label": "Recommended",
            "coordinates": [[origin_lon, origin_lat], [dest_lon, dest_lat]],
            "distance_km": haversine_km(origin_lat, origin_lon, dest_lat, dest_lon),
            "duration_min": 1.0,
            "duration_adj_min": 1.0,
            "source": "fallback",
            "follows_roads": False,
            "profile": profile,
        }
        routes = [selected]

    # Prefer keeping driver's previous choice if still present after replan
    prev_id = ride.get("selected_route_id")
    if force and prev_id and phase == ride.get("active_route"):
        for r in routes:
            if r.get("id") == prev_id:
                selected = r
                break

    fields: dict[str, Any] = {
        field: selected,
        options_field: routes,
        "route_conditions": bundle.get("conditions"),
        "selected_route_id": selected.get("id"),
        "routing_profile": profile,
    }
    if activate:
        fields["active_route"] = phase
        fields["route_progress_index"] = 0
    state.update_ride(ride["id"], **fields)

    mode = "bike" if profile == PROFILE_CYCLING else "car"
    labels = ", ".join(
        f"{r.get('label', r.get('id'))} ({r.get('duration_adj_min')}m)" for r in routes
    )
    msg = (
        f"{len(routes)} {mode} street route option(s) for {phase.replace('_', ' ')} "
        f"[traffic={state.traffic}, vru_care=on]: {labels}"
    )
    state.append_timeline(ride["id"], "route_planned", msg)
    return selected


def _traffic_speed_div() -> float:
    from location_service import TRAFFIC_FACTORS

    return TRAFFIC_FACTORS.get(state.traffic, 1.35)


def apply_route_selection(
    ride_id: str,
    route: dict[str, Any],
    phase: str,
    driver_lat: float | None = None,
    driver_lon: float | None = None,
    *,
    options: list[dict[str, Any]] | None = None,
    conditions: dict[str, Any] | None = None,
    recompute_metrics: bool = True,
) -> dict[str, Any] | None:
    """
    Set selected route as active path.
    When recompute_metrics is True (default), remaining distance/ETA are derived
    from the driver's snap point on the polyline under current traffic.
    """
    field = "route_to_pickup" if phase == "to_pickup" else "route_to_destination"
    options_field = (
        "route_options_pickup" if phase == "to_pickup" else "route_options_destination"
    )
    coords = route.get("coordinates") or []
    progress = 0
    if driver_lat is not None and driver_lon is not None and coords:
        progress = closest_index_on_route(coords, driver_lat, driver_lon)

    metrics = (
        remaining_route_metrics(route, progress, state.traffic)
        if recompute_metrics
        else {
            "distance_km": route.get("distance_km"),
            "duration_adj_min": route.get("duration_adj_min"),
        }
    )

    # Persist remaining metrics onto the active route object for UI consistency
    rem_dist = metrics.get("distance_km", route.get("distance_km"))
    rem_eta = metrics.get("duration_adj_min", route.get("duration_adj_min"))
    tags = route.get("tags") or ([route.get("label")] if route.get("label") else [])
    tag_bit = f" · {', '.join(str(t) for t in tags[:2])}" if tags else ""
    active_route = {
        **route,
        "distance_km": rem_dist,
        "duration_min": metrics.get("duration_min", route.get("duration_min")),
        "duration_adj_min": rem_eta,
        "summary": f"{rem_dist} km · ~{rem_eta} min{tag_bit} · traffic:{state.traffic}",
        "optimized": True,
        "recalculated": True,
    }

    fields: dict[str, Any] = {
        field: active_route,
        "selected_route_id": active_route.get("id"),
        "active_route": phase,
        "route_progress_index": progress,
        "distance_km": active_route.get("distance_km"),
        "eta_minutes": active_route.get("duration_adj_min"),
    }
    if options is not None:
        fields[options_field] = options
    if conditions is not None:
        fields["route_conditions"] = conditions
    return state.update_ride(ride_id, **fields)


def _recalc_ride_fare(ride: dict[str, Any], distance_km: float, eta_min: float) -> dict[str, Any]:
    """Refresh fare estimate from remaining (or trip) distance under current surge."""
    surge = compute_surge(
        state.available_count(),
        state.pending_count(),
        ride.get("zone") or "urban",
    )
    return estimate_fare(
        float(distance_km or 0.0),
        float(eta_min or 0.0),
        ride.get("ride_type") or "rideGo",
        surge,
    )


async def live_conditions_loop() -> None:
    """
    Automatically evolve traffic, congestion severity, and event closures.
    When conditions change, replan route options for active rides.
    """
    levels = ["low", "medium", "high", "severe"]
    while True:
        try:
            if state.auto_conditions:
                changed = False
                note_bits: list[str] = []

                # Traffic drifts with mild randomness (peak bias)
                if random.random() < 0.45:
                    idx = levels.index(state.traffic) if state.traffic in levels else 1
                    step = random.choice([-1, 0, 0, 1])
                    new_idx = max(0, min(len(levels) - 1, idx + step))
                    if levels[new_idx] != state.traffic:
                        state.traffic = levels[new_idx]
                        changed = True
                    note_bits.append(f"traffic={state.traffic}")

                # Auto-managed blockers: flip events / severity
                for b in state.list_blockers():
                    if not b.get("auto"):
                        continue
                    if b.get("type") in ("event", "closure") and random.random() < 0.28:
                        new_active = not b.get("active", False)
                        # Prefer short-lived events: 60% chance to deactivate if active
                        if b.get("active") and random.random() < 0.55:
                            new_active = False
                        elif not b.get("active") and random.random() < 0.35:
                            new_active = True
                        if new_active != b.get("active"):
                            state.set_blocker_active(b["id"], new_active)
                            changed = True
                            note_bits.append(
                                f"{b['name']}={'ON' if new_active else 'OFF'}"
                            )
                    elif b.get("type") == "congestion" and random.random() < 0.4:
                        sev = float(b.get("severity", 1.0))
                        sev = max(0.8, min(2.0, sev + random.uniform(-0.2, 0.25)))
                        if abs(sev - float(b.get("severity", 1.0))) > 0.05:
                            state.upsert_blocker({**b, "severity": round(sev, 2)})
                            changed = True

                if not note_bits:
                    note_bits.append(f"traffic={state.traffic}")
                state.conditions_note = "Live: " + "; ".join(note_bits[:4])

                if changed:
                    await broadcast_event(
                        "traffic_updated", {"traffic": state.traffic}
                    )
                    await broadcast_event(
                        "blockers_updated", {"blockers": state.list_blockers()}
                    )
                    await broadcast_event(
                        "conditions_updated",
                        {
                            "traffic": state.traffic,
                            "note": state.conditions_note,
                            "blockers": state.list_blockers(),
                            "auto": state.auto_conditions,
                        },
                    )
                    # Replan options for active trips from current driver position
                    for ride in state.list_rides():
                        if ride["status"] not in ("allocated", "en_route", "on_trip"):
                            continue
                        did = ride.get("driver_id")
                        driver = state.get_driver(did) if did else None
                        if not driver:
                            continue
                        phase = (
                            "to_destination"
                            if ride["status"] == "on_trip"
                            else "to_pickup"
                        )
                        if phase == "to_pickup":
                            dest_lat, dest_lon = ride["pickup_lat"], ride["pickup_lon"]
                        else:
                            dest_lat = ride["destination_lat"]
                            dest_lon = ride["destination_lon"]
                        prev_id = ride.get("selected_route_id")
                        selected = await ensure_route(
                            ride,
                            phase,
                            driver["latitude"],
                            driver["longitude"],
                            dest_lat,
                            dest_lon,
                            activate=True,
                            force=True,
                        )
                        # Snap progress onto chosen path
                        apply_route_selection(
                            ride["id"],
                            selected,
                            phase,
                            driver["latitude"],
                            driver["longitude"],
                        )
                        if prev_id and selected.get("id") != prev_id:
                            state.append_timeline(
                                ride["id"],
                                "route_updated",
                                f"Live conditions changed — routes recalculated "
                                f"(now {selected.get('label')})",
                            )
                        await broadcast_event(
                            "ride_updated",
                            {"ride": state.get_ride(ride["id"])},
                        )
        except Exception as e:
            print(f"[live_conditions] {e}")
        await asyncio.sleep(40)


async def trip_movement_loop() -> None:
    """
    Every TRIP_TICK_SEC, advance en_route / on_trip drivers along the
    optimized road route (not a straight line).
    """
    while True:
        try:
            for ride in state.list_rides():
                if ride["status"] not in ("allocated", "en_route", "on_trip"):
                    continue
                did = ride.get("driver_id")
                if not did:
                    continue
                driver = state.get_driver(did)
                if not driver:
                    continue

                bike = is_bike_ride_type(ride.get("ride_type"))
                if ride["status"] in ("allocated", "en_route"):
                    had_route = bool(ride.get("route_to_pickup"))
                    route = await ensure_route(
                        ride,
                        "to_pickup",
                        driver["latitude"],
                        driver["longitude"],
                        ride["pickup_lat"],
                        ride["pickup_lon"],
                        activate=not had_route,
                    )
                    ride = state.get_ride(ride["id"]) or ride
                    idx = int(ride.get("route_progress_index") or 0)
                    coords = route.get("coordinates") or []
                    base_step = STEP_BIKE_EN_ROUTE_KM if bike else STEP_EN_ROUTE_KM
                    step = step_for_traffic(base_step, state.traffic)
                    # Extra caution near pedestrians/cyclists
                    if route.get("vru_care_hits"):
                        step *= 0.75
                    new_lat, new_lon, new_idx, remaining, heading = advance_along_route(
                        coords, idx, step
                    )
                    cruise = 14.0 if bike else 22.0
                    speed = max(cruise / _traffic_speed_div(), 6.0 if bike else 8.0)
                    state.update_driver(
                        did,
                        latitude=round(new_lat, 6),
                        longitude=round(new_lon, 6),
                        status="en_route",
                        speed=round(speed, 1),
                        heading=round(heading, 1),
                    )
                    state.update_ride(
                        ride["id"],
                        route_progress_index=new_idx,
                        active_route="to_pickup",
                    )

                    status_changed = False
                    if ride["status"] == "allocated":
                        state.update_ride(ride["id"], status="en_route")
                        state.append_timeline(
                            ride["id"],
                            "en_route",
                            f"{driver['name']} en route to pickup along optimized path",
                        )
                        status_changed = True

                    if status_changed or not had_route:
                        await broadcast_event(
                            "ride_updated",
                            {"ride": state.get_ride(ride["id"])},
                        )

                    await broadcast_event(
                        "driver_location",
                        {
                            "driver_id": did,
                            "latitude": new_lat,
                            "longitude": new_lon,
                            "status": "en_route",
                            "heading": heading,
                            "ride_id": ride["id"],
                            "route_progress_index": new_idx,
                            "remaining_km": round(remaining, 3),
                        },
                    )
                    if remaining < 0.05:
                        trip_route = await ensure_route(
                            state.get_ride(ride["id"]) or ride,
                            "to_destination",
                            ride["pickup_lat"],
                            ride["pickup_lon"],
                            ride["destination_lat"],
                            ride["destination_lon"],
                            activate=True,
                        )
                        state.update_ride(
                            ride["id"],
                            status="on_trip",
                            distance_km=trip_route.get("distance_km"),
                            eta_minutes=trip_route.get("duration_adj_min"),
                        )
                        # Snap driver onto start of trip route
                        tcoords = trip_route.get("coordinates") or []
                        if tcoords:
                            state.update_driver(
                                did,
                                latitude=round(tcoords[0][1], 6),
                                longitude=round(tcoords[0][0], 6),
                                status="on_trip",
                            )
                        else:
                            state.update_driver(did, status="on_trip")
                        state.append_timeline(
                            ride["id"],
                            "picked_up",
                            "Passenger picked up — trip started on optimized route",
                        )
                        await broadcast_event(
                            "ride_updated",
                            {"ride": state.get_ride(ride["id"])},
                        )

                elif ride["status"] == "on_trip":
                    had_route = bool(ride.get("route_to_destination"))
                    if not had_route:
                        await ensure_route(
                            ride,
                            "to_destination",
                            driver["latitude"],
                            driver["longitude"],
                            ride["destination_lat"],
                            ride["destination_lon"],
                            activate=True,
                        )
                        ride = state.get_ride(ride["id"]) or ride
                        await broadcast_event(
                            "ride_updated",
                            {"ride": ride},
                        )

                    route = ride.get("route_to_destination") or {}
                    coords = route.get("coordinates") or []
                    idx = int(ride.get("route_progress_index") or 0)
                    base_step = STEP_BIKE_ON_TRIP_KM if bike else STEP_ON_TRIP_KM
                    step = step_for_traffic(base_step, state.traffic)
                    if route.get("vru_care_hits"):
                        step *= 0.75
                    new_lat, new_lon, new_idx, remaining, heading = advance_along_route(
                        coords, idx, step
                    )
                    cruise = 16.0 if bike else 28.0
                    speed = max(cruise / _traffic_speed_div(), 7.0 if bike else 10.0)
                    state.update_driver(
                        did,
                        latitude=round(new_lat, 6),
                        longitude=round(new_lon, 6),
                        status="on_trip",
                        speed=round(speed, 1),
                        heading=round(heading, 1),
                    )
                    state.update_ride(ride["id"], route_progress_index=new_idx)
                    await broadcast_event(
                        "driver_location",
                        {
                            "driver_id": did,
                            "latitude": new_lat,
                            "longitude": new_lon,
                            "status": "on_trip",
                            "heading": heading,
                            "ride_id": ride["id"],
                            "route_progress_index": new_idx,
                            "remaining_km": round(remaining, 3),
                        },
                    )
                    if remaining < 0.08:
                        state.update_ride(ride["id"], status="completed")
                        state.release_driver(did, "available")
                        state.append_timeline(
                            ride["id"],
                            "completed",
                            "Ride completed successfully",
                        )
                        await broadcast_event(
                            "ride_completed",
                            {"ride": state.get_ride(ride["id"])},
                        )
                        await broadcast_event(
                            "driver_status",
                            {
                                "driver_id": did,
                                "status": "available",
                            },
                        )
        except Exception as e:
            print(f"[trip_movement] {e}")
        await asyncio.sleep(TRIP_TICK_SEC)


@asynccontextmanager
async def lifespan(app: FastAPI):
    tasks = [
        asyncio.create_task(offer_timeout_loop()),
        asyncio.create_task(driver_idle_and_wander_loop()),
        asyncio.create_task(trip_movement_loop()),
        asyncio.create_task(live_conditions_loop()),
    ]
    yield
    for t in tasks:
        t.cancel()


app = FastAPI(
    title="ride Driver Allocation Demo",
    description="Production-style ride matching & driver allocation demonstration",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Matching / offer pipeline
# ---------------------------------------------------------------------------


def _match_age_sec(ride: dict[str, Any]) -> float:
    return max(0.0, time.time() - float(ride.get("created_at") or time.time()))


async def try_offer_next(ride_id: str) -> dict[str, Any] | None:
    """Offer ride to next ranked candidate within the matching window."""
    ride = state.get_ride(ride_id)
    if not ride:
        return None
    if ride["status"] in (
        "allocated",
        "en_route",
        "on_trip",
        "completed",
        "cancelled",
        "no_drivers",
    ):
        return ride
    # Already waiting on a live offer
    if ride["status"] == "offered" and ride.get("offer_expires_at"):
        if time.time() <= float(ride["offer_expires_at"]):
            return ride

    age = _match_age_sec(ride)
    if age >= MATCH_MAX_SEC:
        state.update_ride(ride_id, status="no_drivers", driver_id=None, driver_name=None)
        state.append_timeline(
            ride_id,
            "failed",
            f"No driver found within {MATCH_MAX_SEC // 60} min",
        )
        await broadcast_event("ride_updated", {"ride": state.get_ride(ride_id)})
        return state.get_ride(ride_id)

    attempts = ride.get("offer_attempts") or []
    tried_ids = {a["driver_id"] for a in attempts}
    ranked = ride.get("ranked_candidates") or []

    # Refresh ranking if empty or pool exhausted (re-search within window)
    need_refresh = not ranked or all(c["id"] in tried_ids for c in ranked)
    if need_refresh:
        ranked_full = rank_drivers(
            state.snapshot_drivers(),
            ride["pickup_lat"],
            ride["pickup_lon"],
            zone=state.zone,
            ride_type=ride.get("ride_type"),
            traffic=state.traffic,
        )
        slim = [
            {
                "id": c["id"],
                "name": c.get("name"),
                "distance_km": c.get("distance_km"),
                "eta_minutes": c.get("eta_minutes"),
                "final_score": c.get("final_score"),
                "score_breakdown": c.get("score_breakdown"),
                "rating": c.get("rating"),
                "vehicle": c.get("vehicle"),
                "status": c.get("status"),
            }
            for c in ranked_full
        ]
        state.update_ride(ride_id, ranked_candidates=slim)
        state.add_allocation_log(
            build_allocation_log(ride_id, ranked_full, None, "initial_rank")
        )
        ranked = slim
        # Allow re-offering drivers not currently reserved when we refresh
        tried_ids = {
            a["driver_id"]
            for a in attempts
            if a.get("result") in ("rejected", "reserve_failed")
            or (
                a.get("result") == "timeout"
                and time.time() - float(a.get("ts") or 0) < 30
            )
        }

    next_candidate = None
    for c in ranked:
        if c["id"] not in tried_ids and c.get("status", "available") in (
            "available",
            "reserved",
        ):
            live = state.get_driver(c["id"])
            if live and live["status"] == "available":
                next_candidate = c
                break

    retry_count = ride.get("retry_count", 0)
    if not next_candidate:
        # Stay in searching until min window, then keep trying until max
        if age < MATCH_MIN_SEC:
            state.update_ride(
                ride_id,
                status="searching",
                driver_id=None,
                driver_name=None,
                offer_expires_at=None,
            )
            return state.get_ride(ride_id)
        if age < MATCH_MAX_SEC and retry_count < MAX_RETRIES:
            state.update_ride(
                ride_id,
                status="searching",
                driver_id=None,
                driver_name=None,
                offer_expires_at=None,
            )
            return state.get_ride(ride_id)
        state.update_ride(ride_id, status="no_drivers", driver_id=None, driver_name=None)
        state.append_timeline(
            ride_id,
            "failed",
            "No available drivers in matching window",
        )
        await broadcast_event("ride_updated", {"ride": state.get_ride(ride_id)})
        return state.get_ride(ride_id)

    did = next_candidate["id"]
    ok = state.reserve_driver(did, ride_id)
    if not ok:
        # Mark as tried and recurse
        attempts.append(
            {
                "driver_id": did,
                "result": "reserve_failed",
                "ts": time.time(),
            }
        )
        state.update_ride(
            ride_id,
            offer_attempts=attempts,
            retry_count=retry_count + 1,
        )
        return await try_offer_next(ride_id)

    driver = state.get_driver(did)
    offer_expires = time.time() + OFFER_TIMEOUT_SEC
    attempts.append(
        {
            "driver_id": did,
            "result": "offered",
            "score": next_candidate.get("final_score"),
            "ts": time.time(),
        }
    )
    state.update_ride(
        ride_id,
        status="offered",
        driver_id=did,
        driver_name=driver["name"] if driver else did,
        eta_minutes=next_candidate.get("eta_minutes"),
        distance_km=next_candidate.get("distance_km"),
        offer_attempts=attempts,
        retry_count=retry_count + 1,
        offer_expires_at=offer_expires,
    )
    state.append_timeline(
        ride_id,
        "offered",
        f"Offered to {did} (score={next_candidate.get('final_score')})",
    )
    state.add_allocation_log(
        build_allocation_log(ride_id, ranked, did, "offer")
    )

    await broadcast_event(
        "ride_offer",
        {
            "ride": state.get_ride(ride_id),
            "driver_id": did,
            "timeout_sec": OFFER_TIMEOUT_SEC,
            "score": next_candidate.get("final_score"),
            "breakdown": next_candidate.get("score_breakdown"),
        },
    )
    await broadcast_event(
        "driver_status",
        {"driver_id": did, "status": "reserved", "ride_id": ride_id},
    )
    return state.get_ride(ride_id)


# ---------------------------------------------------------------------------
# REST API
# ---------------------------------------------------------------------------


@app.get("/api/health")
def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "drivers": len(state.snapshot_drivers()),
        "available": state.available_count(),
        "pending_rides": state.pending_count(),
        "traffic": state.traffic,
        "zone": state.zone,
        "features": {
            "bike_taxis": BIKE_TAXIS_ENABLED,
        },
        "ride_types": sorted(allowed_ride_types()),
    }


@app.get("/api/features")
def features() -> dict[str, Any]:
    """Feature flags for client configuration (dev + production)."""
    return {
        "bike_taxis": BIKE_TAXIS_ENABLED,
        "bike-taxis": BIKE_TAXIS_ENABLED,
        "ride_types": sorted(allowed_ride_types()),
        "routing": {
            "car_profile": PROFILE_DRIVING,
            "bike_profile": PROFILE_CYCLING,
            "vru_care": True,
            "street_following": True,
        },
    }


@app.get("/api/drivers")
def list_drivers() -> list[dict[str, Any]]:
    return state.snapshot_drivers()


@app.get("/api/drivers/nearby")
def nearby_drivers(
    lat: float,
    lon: float,
    ride_type: str | None = None,
    zone: str | None = None,
) -> list[dict[str, Any]]:
    # Must be registered before /api/drivers/{driver_id}
    ranked = rank_drivers(
        state.snapshot_drivers(),
        lat,
        lon,
        zone=zone or state.zone,
        ride_type=ride_type,
        traffic=state.traffic,
    )
    return [
        {
            "driver": c["id"],
            "name": c.get("name"),
            "eta": c.get("eta_minutes"),
            "distance_km": c.get("distance_km"),
            "rating": c.get("rating"),
            "score": c.get("final_score"),
            "vehicle": c.get("vehicle"),
            "breakdown": c.get("score_breakdown"),
        }
        for c in ranked
    ]


@app.get("/api/drivers/{driver_id}")
def get_driver(driver_id: str) -> dict[str, Any]:
    d = state.get_driver(driver_id)
    if not d:
        raise HTTPException(404, "Driver not found")
    return d


@app.post("/api/drivers/{driver_id}/status")
async def set_driver_status(driver_id: str, body: DriverStatusUpdate) -> dict[str, Any]:
    if body.status not in ("available", "offline", "online"):
        raise HTTPException(400, "status must be available|offline|online")
    status = "available" if body.status == "online" else body.status
    d = state.get_driver(driver_id)
    if not d:
        raise HTTPException(404, "Driver not found")
    if d["status"] in ("reserved", "en_route", "on_trip", "accepted") and status == "offline":
        raise HTTPException(400, "Cannot go offline while on active ride")
    updated = state.set_driver_status(driver_id, status)
    await broadcast_event(
        "driver_status",
        {"driver_id": driver_id, "status": status},
    )
    return updated  # type: ignore


@app.post("/api/drivers/{driver_id}/location")
async def update_location(
    driver_id: str, body: DriverLocationUpdate
) -> dict[str, Any]:
    d = state.get_driver(driver_id)
    if not d:
        raise HTTPException(404, "Driver not found")
    fields: dict[str, Any] = {
        "latitude": body.latitude,
        "longitude": body.longitude,
    }
    if body.heading is not None:
        fields["heading"] = body.heading
    if body.speed is not None:
        fields["speed"] = body.speed
    updated = state.update_driver(driver_id, **fields)
    await broadcast_event(
        "driver_location",
        {
            "driver_id": driver_id,
            "latitude": body.latitude,
            "longitude": body.longitude,
            "status": updated["status"] if updated else d["status"],
        },
    )
    return updated  # type: ignore


@app.post("/api/ride/request")
async def request_ride(body: RideRequest) -> dict[str, Any]:
    t0 = time.perf_counter()
    allowed = allowed_ride_types()
    if body.ride_type not in allowed:
        if body.ride_type == "bikeTaxi" and not BIKE_TAXIS_ENABLED:
            raise HTTPException(
                400,
                "bikeTaxi is disabled — set BIKE_TAXIS=true (or bike-taxis=true) to enable",
            )
        raise HTTPException(400, f"Invalid ride_type (allowed: {sorted(allowed)})")

    # Normalize intermediate stops (max 2)
    stop_dicts: list[dict[str, Any]] = []
    for s in (body.stops or [])[:2]:
        if len(s) >= 2:
            stop_dicts.append({"lat": float(s[0]), "lon": float(s[1])})

    ride = state.create_ride(
        passenger=body.passenger,
        pickup=body.pickup,
        destination=body.destination,
        ride_type=body.ride_type,
        idempotency_key=body.idempotency_key,
        stops=stop_dicts,
    )

    # Trip distance/ETA on street network for this vehicle profile
    wps = [(s["lat"], s["lon"]) for s in stop_dicts]
    trip_route = await plan_route_async(
        body.pickup[0],
        body.pickup[1],
        body.destination[0],
        body.destination[1],
        traffic=state.traffic,
        blockers=state.list_blockers(),
        waypoints=wps or None,
        ride_type=body.ride_type,
    )
    trip_dist = float(trip_route.get("distance_km") or 0.0)
    if trip_dist <= 0:
        # Fallback chain of Haversine legs
        pts = [body.pickup] + [[s["lat"], s["lon"]] for s in stop_dicts] + [body.destination]
        trip_dist = 0.0
        for i in range(len(pts) - 1):
            trip_dist += haversine_km(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1])
    trip_eta = float(
        trip_route.get("duration_adj_min")
        or estimate_eta_minutes(trip_dist, traffic=state.traffic)
    )
    surge = compute_surge(
        state.available_count(),
        state.pending_count(),
        zone=body.zone or state.zone,
    )
    fare = estimate_fare(trip_dist, trip_eta, body.ride_type, surge)
    state.update_ride(
        ride["id"],
        fare=fare,
        distance_km=round(trip_dist, 3),
        eta_minutes=round(trip_eta, 1),
    )
    state.zone = body.zone or state.zone

    await broadcast_event("ride_created", {"ride": state.get_ride(ride["id"])})

    # Run matching
    result = await try_offer_next(ride["id"])
    latency_ms = round((time.perf_counter() - t0) * 1000, 2)
    if result:
        result = state.update_ride(ride["id"], match_latency_ms=latency_ms) or result
        result["match_latency_ms"] = latency_ms

    await broadcast_event("ride_updated", {"ride": result})
    return result or state.get_ride(ride["id"])  # type: ignore


@app.post("/api/ride/respond")
async def driver_respond(body: DriverRespond) -> dict[str, Any]:
    ride = state.get_ride(body.ride_id)
    if not ride:
        raise HTTPException(404, "Ride not found")
    if ride["status"] != "offered":
        raise HTTPException(400, f"Ride not in offered state ({ride['status']})")

    did = ride.get("driver_id")
    if not did:
        raise HTTPException(400, "No driver offered")

    attempts = ride.get("offer_attempts") or []

    if body.accepted:
        # Passenger already booked — allocate immediately on driver accept
        driver = state.get_driver(did)
        now = time.time()
        state.update_driver(did, status="accepted", idle_minutes=0)
        for a in reversed(attempts):
            if a["driver_id"] == did and a["result"] == "offered":
                a["result"] = "accepted"
                break
        state.update_ride(
            body.ride_id,
            status="allocated",
            offer_attempts=attempts,
            offer_expires_at=None,
            confirmed_at=now,
            driver_name=driver["name"] if driver else did,
        )
        state.append_timeline(
            body.ride_id,
            "accepted",
            f"Driver {did} accepted the ride",
        )
        state.add_allocation_log(
            build_allocation_log(
                body.ride_id,
                ride.get("ranked_candidates") or [],
                did,
                "accepted",
            )
        )
        if driver:
            await ensure_route(
                state.get_ride(body.ride_id) or ride,
                "to_pickup",
                driver["latitude"],
                driver["longitude"],
                ride["pickup_lat"],
                ride["pickup_lon"],
                activate=True,
            )
            await ensure_route(
                state.get_ride(body.ride_id) or ride,
                "to_destination",
                ride["pickup_lat"],
                ride["pickup_lon"],
                ride["destination_lat"],
                ride["destination_lon"],
                activate=False,
            )
        updated = state.get_ride(body.ride_id)
        await broadcast_event("ride_allocated", {"ride": updated})
        await broadcast_event(
            "driver_status",
            {"driver_id": did, "status": "accepted", "ride_id": body.ride_id},
        )
        return updated  # type: ignore

    # Rejected
    for a in reversed(attempts):
        if a["driver_id"] == did and a["result"] == "offered":
            a["result"] = "rejected"
            break
    state.release_driver(did, "available")
    state.update_ride(
        body.ride_id,
        status="searching",
        driver_id=None,
        driver_name=None,
        offer_attempts=attempts,
        offer_expires_at=None,
    )
    state.append_timeline(
        body.ride_id,
        "rejected",
        f"Driver {did} rejected — offering next candidate",
    )
    await broadcast_event(
        "driver_status",
        {"driver_id": did, "status": "available"},
    )
    result = await try_offer_next(body.ride_id)
    await broadcast_event("ride_updated", {"ride": result})
    return result  # type: ignore


@app.post("/api/driver/accept")
async def accept_shorthand(ride_id: str, driver_id: str) -> dict[str, Any]:
    ride = state.get_ride(ride_id)
    if not ride:
        raise HTTPException(404, "Ride not found")
    if ride.get("driver_id") != driver_id:
        raise HTTPException(400, "Offer not for this driver")
    return await driver_respond(DriverRespond(ride_id=ride_id, accepted=True))


@app.post("/api/driver/reject")
async def reject_shorthand(ride_id: str, driver_id: str) -> dict[str, Any]:
    ride = state.get_ride(ride_id)
    if not ride:
        raise HTTPException(404, "Ride not found")
    if ride.get("driver_id") != driver_id:
        raise HTTPException(400, "Offer not for this driver")
    return await driver_respond(DriverRespond(ride_id=ride_id, accepted=False))


def cancel_penalty_info(ride: dict[str, Any]) -> dict[str, Any]:
    """Whether a late-cancel fee applies (after 1 min of driver confirmation)."""
    status = ride.get("status") or ""
    confirmed_at = ride.get("confirmed_at")
    free_until = None
    penalty = 0.0
    applies = False
    if status in ("allocated", "en_route", "on_trip") and confirmed_at:
        free_until = float(confirmed_at) + CANCEL_PENALTY_AFTER_SEC
        if time.time() >= free_until:
            applies = True
            penalty = CANCEL_PENALTY_EUR
    return {
        "penalty_applies": applies,
        "penalty_eur": penalty if applies else 0.0,
        "free_cancel_until": free_until,
        "cancel_penalty_after_sec": CANCEL_PENALTY_AFTER_SEC,
        "reasons": CANCEL_REASONS,
        "can_cancel": status
        not in ("completed", "cancelled", "no_drivers"),
        "status": status,
    }


@app.get("/api/ride/{ride_id}/cancel-preview")
def cancel_preview(ride_id: str) -> dict[str, Any]:
    ride = state.get_ride(ride_id)
    if not ride:
        raise HTTPException(404, "Ride not found")
    info = cancel_penalty_info(ride)
    return {"ride_id": ride_id, **info}


@app.get("/api/ride/{ride_id}")
def get_ride(ride_id: str) -> dict[str, Any]:
    r = state.get_ride(ride_id)
    if not r:
        raise HTTPException(404, "Ride not found")
    return r


@app.get("/api/rides")
def list_rides() -> list[dict[str, Any]]:
    return state.list_rides()


def _active_track_route(ride: dict[str, Any]) -> dict[str, Any] | None:
    status = ride.get("status") or "searching"
    if status == "on_trip":
        return ride.get("route_to_destination")
    if status in ("allocated", "en_route", "accepted", "offered"):
        return ride.get("route_to_pickup") or ride.get("route_to_destination")
    return ride.get("route_to_destination") or ride.get("route_to_pickup")


def build_public_track_payload(
    ride: dict[str, Any],
    *,
    street_route: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Sanitized live-tracking view safe to share with anyone who has the token."""
    status = ride.get("status") or "searching"
    progress = int(ride.get("route_progress_index") or 0)

    route = street_route or _active_track_route(ride)

    route_public: dict[str, Any] | None = None
    remaining_coords: list[list[float]] = []
    if route and route.get("coordinates"):
        coords = route["coordinates"]
        idx = max(0, min(progress, len(coords) - 1))
        # If we replaced a stub with street geometry, show full remaining path
        if street_route is not None and not follows_roads(_active_track_route(ride)):
            remaining_coords = coords
            idx = 0
        else:
            remaining_coords = (
                coords[idx:] if status in ("en_route", "on_trip", "allocated") else coords
            )
        route_public = {
            "id": route.get("id"),
            "label": route.get("label"),
            "summary": route.get("summary"),
            "distance_km": route.get("distance_km"),
            "duration_adj_min": route.get("duration_adj_min") or route.get("duration_min"),
            "coordinates": coords,
            "remaining_coordinates": remaining_coords if len(remaining_coords) >= 2 else coords,
            "source": route.get("source"),
            "follows_roads": follows_roads(route),
            "profile": route.get("profile") or profile_for_ride_type(ride.get("ride_type")),
        }

    driver_public: dict[str, Any] | None = None
    did = ride.get("driver_id")
    if did and status not in ("cancelled", "completed", "no_drivers", "searching"):
        driver = state.get_driver(did)
        if driver:
            driver_public = {
                "id": driver.get("id"),
                "name": driver.get("name") or ride.get("driver_name") or did,
                "latitude": driver.get("latitude"),
                "longitude": driver.get("longitude"),
                "heading": driver.get("heading"),
                "vehicle": driver.get("vehicle"),
                "vehicle_number": driver.get("vehicle_number"),
                "status": driver.get("status"),
            }
        elif ride.get("driver_name"):
            driver_public = {
                "id": did,
                "name": ride.get("driver_name"),
                "latitude": None,
                "longitude": None,
            }

    terminal = status in ("completed", "cancelled", "no_drivers")
    profile = profile_for_ride_type(ride.get("ride_type"))
    return {
        "ride_id": ride.get("id"),
        "tracking_token": ride.get("tracking_token"),
        "status": status,
        "passenger": ride.get("passenger"),
        "ride_type": ride.get("ride_type"),
        "routing_profile": profile,
        "pickup": {"lat": ride.get("pickup_lat"), "lon": ride.get("pickup_lon")},
        "destination": {
            "lat": ride.get("destination_lat"),
            "lon": ride.get("destination_lon"),
        },
        "eta_minutes": ride.get("eta_minutes"),
        "distance_km": ride.get("distance_km"),
        "fare": ride.get("fare"),
        "driver": driver_public,
        "route": route_public,
        "timeline": [
            {
                "event": t.get("event"),
                "ts": t.get("ts"),
                "message": t.get("message"),
            }
            for t in (ride.get("timeline") or [])[-12:]
        ],
        "updated_at": ride.get("updated_at"),
        "created_at": ride.get("created_at"),
        "is_active": not terminal,
        "share_message": (
            f"Track my RideMatch trip {ride.get('id')}: "
            f"status {status}"
            + (
                f", ETA ~{ride.get('eta_minutes')} min"
                if ride.get("eta_minutes") is not None
                else ""
            )
        ),
    }


async def _street_route_for_tracking(ride: dict[str, Any]) -> dict[str, Any] | None:
    """
    When the stored path is a straight A→B map line (or offline stub), replan
    street-following geometry for the public tracking map.
    """
    existing = _active_track_route(ride)
    if follows_roads(existing):
        return None

    status = ride.get("status") or "searching"
    ride_type = ride.get("ride_type") or "rideGo"
    profile = profile_for_ride_type(ride_type)

    did = ride.get("driver_id")
    driver = state.get_driver(did) if did else None

    if status in ("allocated", "en_route", "accepted", "offered") and driver:
        origin = (float(driver["latitude"]), float(driver["longitude"]))
        dest = (float(ride["pickup_lat"]), float(ride["pickup_lon"]))
        wps = None
    elif status == "on_trip":
        if driver:
            origin = (float(driver["latitude"]), float(driver["longitude"]))
        else:
            origin = (float(ride["pickup_lat"]), float(ride["pickup_lon"]))
        dest = (float(ride["destination_lat"]), float(ride["destination_lon"]))
        wps = _ride_waypoints(ride) or None
    else:
        origin = (float(ride["pickup_lat"]), float(ride["pickup_lon"]))
        dest = (float(ride["destination_lat"]), float(ride["destination_lon"]))
        wps = _ride_waypoints(ride) or None

    planned = await plan_route_async(
        origin[0],
        origin[1],
        dest[0],
        dest[1],
        traffic=state.traffic,
        blockers=state.list_blockers(),
        waypoints=wps,
        profile=profile,
        ride_type=ride_type,
    )
    if not planned or not planned.get("coordinates"):
        return None
    if not follows_roads(planned) and len(planned.get("coordinates") or []) < 3:
        return None
    return planned


@app.get("/api/track/{token}")
async def track_ride(token: str) -> dict[str, Any]:
    """
    Public live-tracking endpoint. Anyone with the unguessable token can poll
    status, driver GPS, and the active street-following route.
    If the ride only has a two-point map stub, directions are fetched on the fly.
    """
    ride = state.get_ride_by_tracking_token(token)
    if not ride:
        raise HTTPException(404, "Tracking link not found or ride expired")
    street = await _street_route_for_tracking(ride)
    return build_public_track_payload(ride, street_route=street)


@app.post("/api/ride/{ride_id}/cancel")
async def cancel_ride(ride_id: str, body: CancelRideBody) -> dict[str, Any]:
    """
    Cancel a request or confirmed ride. Reason is required.
    After 1 minute past driver acceptance, a €5 fee applies unless accept_penalty=true.
    Searching/offered cancellations are free (still require a reason).
    """
    ride = state.get_ride(ride_id)
    if not ride:
        raise HTTPException(404, "Ride not found")
    if ride["status"] in ("completed", "cancelled"):
        raise HTTPException(400, "Ride already finished")

    reason = (body.reason or "").strip()
    if len(reason) < 2:
        raise HTTPException(400, "Please provide a cancellation reason")

    info = cancel_penalty_info(ride)
    penalty = 0.0
    if info["penalty_applies"]:
        if not body.accept_penalty:
            raise HTTPException(
                400,
                f"Cancellation after 1 min of confirmation incurs a "
                f"€{CANCEL_PENALTY_EUR:.0f} fee. Confirm to proceed.",
            )
        penalty = CANCEL_PENALTY_EUR

    did = ride.get("driver_id")
    if did and ride["status"] in (
        "offered",
        "allocated",
        "en_route",
        "on_trip",
        "reserved",
    ):
        state.release_driver(did, "available")
        await broadcast_event(
            "driver_status", {"driver_id": did, "status": "available"}
        )

    msg = f"Ride cancelled by passenger: {reason}"
    if penalty > 0:
        msg += f" · cancellation fee €{penalty:.2f}"

    state.update_ride(
        ride_id,
        status="cancelled",
        cancel_reason=reason,
        cancel_penalty_eur=penalty if penalty > 0 else None,
        offer_expires_at=None,
    )
    state.append_timeline(ride_id, "cancelled", msg)
    updated = state.get_ride(ride_id)
    await broadcast_event("ride_updated", {"ride": updated})
    return updated  # type: ignore


@app.get("/api/pricing/estimate")
async def pricing_estimate(
    pickup_lat: float,
    pickup_lon: float,
    drop_lat: float,
    drop_lon: float,
    ride_type: str = "rideGo",
    # Optional intermediate stops: "lat,lon|lat,lon" (max 2) — re-estimates full path
    stops: str | None = None,
) -> dict[str, Any]:
    wps: list[tuple[float, float]] = []
    if stops:
        for part in stops.split("|")[:2]:
            part = part.strip()
            if not part:
                continue
            bits = part.split(",")
            if len(bits) >= 2:
                wps.append((float(bits[0]), float(bits[1])))

    if ride_type not in allowed_ride_types():
        if ride_type == "bikeTaxi" and not BIKE_TAXIS_ENABLED:
            raise HTTPException(400, "bikeTaxi disabled (set BIKE_TAXIS=true)")
        raise HTTPException(400, f"Invalid ride_type")
    route = await plan_route_async(
        pickup_lat,
        pickup_lon,
        drop_lat,
        drop_lon,
        traffic=state.traffic,
        blockers=state.list_blockers(),
        waypoints=wps or None,
        ride_type=ride_type,
    )
    dist = float(route.get("distance_km") or 0.0)
    if dist <= 0:
        chain = [(pickup_lat, pickup_lon)] + wps + [(drop_lat, drop_lon)]
        dist = 0.0
        for i in range(len(chain) - 1):
            dist += haversine_km(chain[i][0], chain[i][1], chain[i + 1][0], chain[i + 1][1])
    eta = float(
        route.get("duration_adj_min")
        or estimate_eta_minutes(dist, traffic=state.traffic)
    )
    surge = compute_surge(
        state.available_count(), state.pending_count(), zone=state.zone
    )
    fare = estimate_fare(dist, eta, ride_type, surge)
    return {
        "distance_km": round(dist, 2),
        "eta_minutes": round(eta, 1),
        "surge": surge,
        "fare": fare,
        "stop_count": len(wps),
        "route_source": route.get("source"),
        "follows_roads": follows_roads(route),
        "profile": route.get("profile") or profile_for_ride_type(ride_type),
    }


@app.get("/api/admin/logs")
def allocation_logs() -> list[dict[str, Any]]:
    return state.list_allocation_logs()


@app.get("/api/admin/stats")
def admin_stats() -> dict[str, Any]:
    drivers = state.snapshot_drivers()
    rides = state.list_rides()
    by_status: dict[str, int] = {}
    for d in drivers:
        by_status[d["status"]] = by_status.get(d["status"], 0) + 1
    ride_status: dict[str, int] = {}
    for r in rides:
        ride_status[r["status"]] = ride_status.get(r["status"], 0) + 1
    completed = [r for r in rides if r["status"] == "completed"]
    latencies = [
        r["match_latency_ms"]
        for r in rides
        if r.get("match_latency_ms") is not None
    ]
    return {
        "drivers_by_status": by_status,
        "rides_by_status": ride_status,
        "total_rides": len(rides),
        "completed_rides": len(completed),
        "avg_match_latency_ms": round(sum(latencies) / len(latencies), 2)
        if latencies
        else None,
        "surge": compute_surge(
            state.available_count(), state.pending_count(), state.zone
        ),
        "traffic": state.traffic,
        "zone": state.zone,
        "weights": {
            "eta": 0.35,
            "distance": 0.20,
            "rating": 0.15,
            "acceptance": 0.10,
            "cancellation": 0.10,
            "idle": 0.10,
        },
    }


@app.post("/api/admin/traffic")
async def set_traffic(body: TrafficUpdate) -> dict[str, str]:
    if body.traffic not in ("low", "medium", "high", "severe"):
        raise HTTPException(400, "Invalid traffic level")
    state.traffic = body.traffic
    await broadcast_event("traffic_updated", {"traffic": body.traffic})
    return {"traffic": body.traffic}


@app.get("/api/admin/blockers")
def list_blockers() -> list[dict[str, Any]]:
    return state.list_blockers()


@app.post("/api/admin/blockers/{blocker_id}")
async def toggle_blocker(blocker_id: str, body: BlockerToggle) -> dict[str, Any]:
    updated = state.set_blocker_active(blocker_id, body.active)
    if not updated:
        raise HTTPException(404, "Blocker not found")
    await broadcast_event(
        "blockers_updated",
        {"blockers": state.list_blockers()},
    )
    return updated


@app.post("/api/route/preview")
async def route_preview(body: RoutePreviewRequest) -> dict[str, Any]:
    """Compute up to 3 street-following routes under current traffic + blockers.

    Cars use OSRM driving (car streets); bikeTaxi uses cycling when enabled.
    Optional `waypoints` (max 2) re-optimizes the full path.
    """
    ride_type = body.ride_type or "rideGo"
    if ride_type == "bikeTaxi" and not BIKE_TAXIS_ENABLED:
        ride_type = "rideGo"
    wps: list[tuple[float, float]] = []
    for s in (body.waypoints or [])[:2]:
        if len(s) >= 2:
            wps.append((float(s[0]), float(s[1])))
    bundle = await plan_routes_async(
        body.origin[0],
        body.origin[1],
        body.destination[0],
        body.destination[1],
        traffic=state.traffic,
        blockers=state.list_blockers(),
        max_routes=3,
        waypoints=wps or None,
        ride_type=ride_type,
    )
    return bundle


@app.post("/api/ride/{ride_id}/select-route")
async def select_ride_route(ride_id: str, body: SelectRouteRequest) -> dict[str, Any]:
    """
    Driver picks / switches a route alternative.

    Does NOT merely snap onto a stale polyline: re-runs full multi-route
    optimization from the driver's current GPS under live traffic & blockers,
    then selects the option that best matches the driver's preferred strategy
    (Fastest / Shortest / Avoids events / corridor), and recalculates remaining
    distance, ETA, and fare.
    """
    ride = state.get_ride(ride_id)
    if not ride:
        raise HTTPException(404, "Ride not found")
    if ride["status"] not in ("allocated", "en_route", "on_trip"):
        raise HTTPException(400, "Ride is not in an active navigation state")

    phase = body.phase or ride.get("active_route") or (
        "to_destination" if ride["status"] == "on_trip" else "to_pickup"
    )
    if phase not in ("to_pickup", "to_destination"):
        raise HTTPException(400, "phase must be to_pickup or to_destination")

    options = (
        ride.get("route_options_pickup")
        if phase == "to_pickup"
        else ride.get("route_options_destination")
    ) or []
    preferred = next((r for r in options if r.get("id") == body.route_id), None)
    if not preferred:
        raise HTTPException(404, f"Route {body.route_id} not in options for {phase}")

    did = ride.get("driver_id")
    driver = state.get_driver(did) if did else None
    if not driver:
        raise HTTPException(400, "No driver assigned")

    if phase == "to_pickup":
        dest_lat, dest_lon = ride["pickup_lat"], ride["pickup_lon"]
    else:
        dest_lat, dest_lon = ride["destination_lat"], ride["destination_lon"]

    origin_lat = float(driver["latitude"])
    origin_lon = float(driver["longitude"])

    # Full re-optimization from current position under live conditions
    ride_type = ride.get("ride_type") or "rideGo"
    bundle = await plan_routes_async(
        origin_lat,
        origin_lon,
        dest_lat,
        dest_lon,
        traffic=state.traffic,
        blockers=state.list_blockers(),
        max_routes=3,
        ride_type=ride_type,
    )
    routes = bundle.get("routes") or []
    if not routes:
        raise HTTPException(502, "Could not recompute routes for selection")

    selected = pick_route_by_preference(routes, preferred) or routes[0]

    apply_route_selection(
        ride_id,
        selected,
        phase,
        origin_lat,
        origin_lon,
        options=routes,
        conditions=bundle.get("conditions"),
        recompute_metrics=True,
    )

    updated = state.get_ride(ride_id) or ride
    fare = _recalc_ride_fare(
        updated,
        float(updated.get("distance_km") or selected.get("distance_km") or 0.0),
        float(updated.get("eta_minutes") or selected.get("duration_adj_min") or 0.0),
    )
    # For en-route-to-pickup, keep trip-leg fare if we still have destination metrics;
    # on_trip fare tracks remaining path. Always refresh with remaining active-leg stats.
    state.update_ride(ride_id, fare=fare)

    labels = ", ".join(
        f"{r.get('label', r.get('id'))} ({r.get('distance_km')} km / {r.get('duration_adj_min')}m)"
        for r in routes
    )
    state.append_timeline(
        ride_id,
        "route_selected",
        f"Route switched → re-optimized from current GPS for "
        f"{selected.get('label', body.route_id)} preference "
        f"({selected.get('distance_km')} km remaining, "
        f"~{selected.get('duration_adj_min')} min, traffic={state.traffic}). "
        f"Options: {labels}",
    )
    updated = state.get_ride(ride_id)
    await broadcast_event("ride_updated", {"ride": updated})
    return updated  # type: ignore


@app.post("/api/ride/{ride_id}/replan")
async def replan_ride_routes(ride_id: str) -> dict[str, Any]:
    """Recompute up to 3 routes from the driver's current position."""
    ride = state.get_ride(ride_id)
    if not ride:
        raise HTTPException(404, "Ride not found")
    if ride["status"] not in ("allocated", "en_route", "on_trip"):
        raise HTTPException(400, "Ride is not active")
    did = ride.get("driver_id")
    driver = state.get_driver(did) if did else None
    if not driver:
        raise HTTPException(400, "No driver assigned")

    phase = "to_destination" if ride["status"] == "on_trip" else "to_pickup"
    if phase == "to_pickup":
        dest_lat, dest_lon = ride["pickup_lat"], ride["pickup_lon"]
    else:
        dest_lat, dest_lon = ride["destination_lat"], ride["destination_lon"]

    prev_selected_id = ride.get("selected_route_id")
    options_field = (
        "route_options_pickup" if phase == "to_pickup" else "route_options_destination"
    )
    prev_options = ride.get(options_field) or []
    preference = next(
        (r for r in prev_options if r.get("id") == prev_selected_id),
        prev_options[0] if prev_options else None,
    )

    ride_type = ride.get("ride_type") or "rideGo"
    bundle = await plan_routes_async(
        driver["latitude"],
        driver["longitude"],
        dest_lat,
        dest_lon,
        traffic=state.traffic,
        blockers=state.list_blockers(),
        max_routes=3,
        ride_type=ride_type,
    )
    routes = bundle.get("routes") or []
    if not routes:
        raise HTTPException(502, "Could not recompute routes")

    selected = pick_route_by_preference(routes, preference) or routes[0]
    apply_route_selection(
        ride_id,
        selected,
        phase,
        driver["latitude"],
        driver["longitude"],
        options=routes,
        conditions=bundle.get("conditions"),
        recompute_metrics=True,
    )

    updated = state.get_ride(ride_id) or ride
    fare = _recalc_ride_fare(
        updated,
        float(updated.get("distance_km") or selected.get("distance_km") or 0.0),
        float(updated.get("eta_minutes") or selected.get("duration_adj_min") or 0.0),
    )
    state.update_ride(ride_id, fare=fare)

    state.append_timeline(
        ride_id,
        "route_planned",
        f"Driver requested replan from current GPS — "
        f"{selected.get('label')} selected "
        f"({selected.get('distance_km')} km, ~{selected.get('duration_adj_min')} min, "
        f"traffic={state.traffic}, profile={profile_for_ride_type(ride_type)})",
    )
    updated = state.get_ride(ride_id)
    await broadcast_event("ride_updated", {"ride": updated})
    return updated  # type: ignore


@app.post("/api/admin/auto-conditions")
async def set_auto_conditions(body: AutoConditionsUpdate) -> dict[str, Any]:
    state.auto_conditions = body.enabled
    await broadcast_event(
        "conditions_updated",
        {
            "traffic": state.traffic,
            "note": state.conditions_note,
            "blockers": state.list_blockers(),
            "auto": state.auto_conditions,
        },
    )
    return {"auto_conditions": state.auto_conditions}


@app.get("/api/admin/conditions")
def get_conditions() -> dict[str, Any]:
    return {
        "traffic": state.traffic,
        "auto": state.auto_conditions,
        "note": state.conditions_note,
        "blockers": state.list_blockers(),
    }


@app.post("/api/admin/reset")
async def reset_demo() -> dict[str, str]:
    state.reset_demo()
    await broadcast_event("system", {"message": "Demo reset"})
    await broadcast_event(
        "blockers_updated",
        {"blockers": state.list_blockers()},
    )
    await broadcast_event(
        "conditions_updated",
        {
            "traffic": state.traffic,
            "note": state.conditions_note,
            "blockers": state.list_blockers(),
            "auto": state.auto_conditions,
        },
    )
    return {"status": "reset"}


@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket) -> None:
    await ws_manager.connect(ws)
    try:
        # Send initial snapshot
        await ws.send_json(
            {
                "type": "snapshot",
                "payload": {
                    "drivers": state.snapshot_drivers(),
                    "rides": state.list_rides(),
                    "blockers": state.list_blockers(),
                    "stats": {
                        "traffic": state.traffic,
                        "available": state.available_count(),
                        "auto_conditions": state.auto_conditions,
                        "conditions_note": state.conditions_note,
                    },
                },
                "ts": time.time(),
            }
        )
        while True:
            # Keep alive; client may send pings
            data = await ws.receive_text()
            if data == "ping":
                await ws.send_json({"type": "pong", "ts": time.time()})
    except WebSocketDisconnect:
        ws_manager.disconnect(ws)
    except Exception:
        ws_manager.disconnect(ws)


# ---------------------------------------------------------------------------
# Static frontend
# ---------------------------------------------------------------------------

from pathlib import Path

CLIENT_DIR = Path(__file__).resolve().parent.parent / "client"

if CLIENT_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(CLIENT_DIR)), name="static")

    @app.get("/")
    def index() -> FileResponse:
        return FileResponse(str(CLIENT_DIR / "index.html"))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
