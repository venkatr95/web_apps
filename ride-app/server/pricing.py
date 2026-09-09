"""Pricing service: base fare, distance/time components, surge."""

from __future__ import annotations

from typing import Any

RIDE_TYPES: dict[str, dict[str, float]] = {
    "rideGo": {
        "base": 3.5,
        "per_km": 1.15,
        "per_min": 0.25,
        "min_fare": 6.0,
    },
    "rideX": {
        "base": 5.0,
        "per_km": 1.5,
        "per_min": 0.30,
        "min_fare": 8.0,
    },
    "ridePremier": {
        "base": 8.0,
        "per_km": 2.0,
        "per_min": 0.40,
        "min_fare": 12.0,
    },
    # Two-wheeler product (feature-flagged via BIKE_TAXIS / bike-taxis)
    "bikeTaxi": {
        "base": 2.0,
        "per_km": 0.85,
        "per_min": 0.18,
        "min_fare": 4.0,
    },
}

# Canonical product ids accepted by request/pricing APIs
VALID_RIDE_TYPES = frozenset(RIDE_TYPES.keys())


def compute_surge(
    available_drivers: int,
    pending_requests: int,
    zone: str = "urban",
) -> float:
    """
    Simple demand/supply surge multiplier.
    Caps between 1.0x and 3.0x for demo safety.
    """
    if available_drivers <= 0:
        return 2.5
    ratio = pending_requests / max(available_drivers, 1)
    if ratio < 0.5:
        surge = 1.0
    elif ratio < 1.0:
        surge = 1.2
    elif ratio < 1.5:
        surge = 1.5
    elif ratio < 2.0:
        surge = 1.8
    else:
        surge = 2.2
    # Airport premium
    if zone == "airport":
        surge = min(surge + 0.2, 3.0)
    return round(min(max(surge, 1.0), 3.0), 2)


def estimate_fare(
    distance_km: float,
    eta_minutes: float,
    ride_type: str = "rideGo",
    surge: float = 1.0,
) -> dict[str, Any]:
    """Return full fare breakdown."""
    rates = RIDE_TYPES.get(ride_type, RIDE_TYPES["rideGo"])
    base = rates["base"]
    distance_fare = distance_km * rates["per_km"]
    time_fare = eta_minutes * rates["per_min"]
    subtotal = base + distance_fare + time_fare
    with_surge = subtotal * surge
    total = max(with_surge, rates["min_fare"] * surge)
    return {
        "ride_type": ride_type,
        "base_fare": round(base, 2),
        "distance_fare": round(distance_fare, 2),
        "time_fare": round(time_fare, 2),
        "subtotal": round(subtotal, 2),
        "surge_multiplier": surge,
        "min_fare": rates["min_fare"],
        "total": round(total, 2),
        "currency": "EUR",
    }
