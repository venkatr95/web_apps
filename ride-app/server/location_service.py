"""Location service: Haversine distance, ETA estimation, geo filtering, step scaling.

Used by matching (nearby search / ETA) and by routing movement ticks.
Route optimization lives in routing.py — see docs/ROUTING.md.
"""

from __future__ import annotations

import math
from typing import Any

# Average urban speed assumptions (km/h)
DEFAULT_SPEED_KMH = 22.0
TRAFFIC_FACTORS = {
    "low": 1.0,
    "medium": 1.35,
    "high": 1.8,
    "severe": 2.4,
}


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance between two points in kilometers."""
    r = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = (
        math.sin(dphi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    )
    return 2 * r * math.asin(math.sqrt(a))


def estimate_eta_minutes(
    distance_km: float,
    traffic: str = "medium",
    speed_kmh: float | None = None,
) -> float:
    """Estimate travel time in minutes given distance and traffic conditions."""
    speed = speed_kmh or DEFAULT_SPEED_KMH
    factor = TRAFFIC_FACTORS.get(traffic, 1.35)
    effective_speed = max(speed / factor, 5.0)
    return (distance_km / effective_speed) * 60.0


def search_radius_km(zone: str = "urban") -> float:
    """Search radius by zone type."""
    return {"urban": 2.0, "suburban": 5.0, "airport": 8.0}.get(zone, 2.0)


def filter_nearby(
    drivers: list[dict[str, Any]],
    pickup_lat: float,
    pickup_lon: float,
    radius_km: float = 2.0,
    max_stale_seconds: float = 15.0,
    now_ts: float | None = None,
) -> list[dict[str, Any]]:
    """Return available drivers within radius with distance/ETA attached."""
    results: list[dict[str, Any]] = []
    for d in drivers:
        if d.get("status") != "available":
            continue
        # GPS staleness check (demo stores last_update optionally)
        last = d.get("last_update")
        if now_ts is not None and last is not None:
            if now_ts - last > max_stale_seconds:
                continue
        dist = haversine_km(
            pickup_lat, pickup_lon, d["latitude"], d["longitude"]
        )
        if dist <= radius_km:
            eta = estimate_eta_minutes(dist)
            results.append(
                {
                    **d,
                    "distance_km": round(dist, 3),
                    "eta_minutes": round(eta, 2),
                }
            )
    return results


def route_distance_km(points: list[tuple[float, float]]) -> float:
    """Sum haversine distance across consecutive points of a multi-stop route."""
    total = 0.0
    for (lat1, lon1), (lat2, lon2) in zip(points, points[1:]):
        total += haversine_km(lat1, lon1, lat2, lon2)
    return total


def move_toward(
    lat: float,
    lon: float,
    target_lat: float,
    target_lon: float,
    step_km: float = 0.05,
) -> tuple[float, float, float]:
    """
    Move a point toward a target by step_km.
    Returns (new_lat, new_lon, remaining_distance_km).
    """
    dist = haversine_km(lat, lon, target_lat, target_lon)
    if dist <= step_km or dist < 0.01:
        return target_lat, target_lon, 0.0
    # Linear interpolation in lat/lon (acceptable for short demo distances)
    ratio = step_km / dist
    new_lat = lat + (target_lat - lat) * ratio
    new_lon = lon + (target_lon - lon) * ratio
    remaining = haversine_km(new_lat, new_lon, target_lat, target_lon)
    return new_lat, new_lon, remaining


def step_for_traffic(
    base_step_km: float,
    traffic: str = "medium",
) -> float:
    """Scale a movement step down under heavier traffic (slower progress)."""
    factor = TRAFFIC_FACTORS.get(traffic, 1.35)
    return max(base_step_km / factor, 0.02)
