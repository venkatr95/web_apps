"""
Matching engine: candidate search, score normalization, weighted ranking,
sequential offer with timeout/retry.

Product weights and pipeline: PRD.md §9.
Navigation after accept is separate — see routing.py and docs/ROUTING.md.
"""

from __future__ import annotations

import time
from typing import Any

from location_service import filter_nearby, search_radius_km

# PRD weights
WEIGHTS = {
    "eta": 0.35,
    "distance": 0.20,
    "rating": 0.15,
    "acceptance": 0.10,
    "cancellation": 0.10,
    "idle": 0.10,
}

MAX_RETRIES = 12
OFFER_TIMEOUT_SEC = 10
# Matching window for finding a driver (passenger already booked)
MATCH_MIN_SEC = 15   # do not fail before this
MATCH_MAX_SEC = 120  # give up after 2 minutes
# Free cancel until this many seconds after driver acceptance; then €5 penalty
CANCEL_PENALTY_AFTER_SEC = 60
CANCEL_PENALTY_EUR = 5.0
RESERVE_TTL_SEC = 15

CANCEL_REASONS = [
    "Changed plans",
    "Wait too long",
    "Found alternative transport",
    "Wrong pickup or destination",
    "Booked by mistake",
    "Driver too far",
    "Booking another ride instead",
    "Other",
]


def _normalize_lower_better(values: list[float]) -> list[float]:
    """Normalize so lower raw values score higher (ETA, distance, cancel)."""
    if not values:
        return []
    lo, hi = min(values), max(values)
    if hi == lo:
        return [1.0] * len(values)
    return [(hi - v) / (hi - lo) for v in values]


def _normalize_higher_better(values: list[float]) -> list[float]:
    """Normalize so higher raw values score higher (rating, accept, idle)."""
    if not values:
        return []
    lo, hi = min(values), max(values)
    if hi == lo:
        return [1.0] * len(values)
    return [(v - lo) / (hi - lo) for v in values]


def score_candidates(candidates: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """
    Compute weighted scores for each candidate.
    Returns candidates sorted by final_score descending with score breakdown.
    """
    if not candidates:
        return []

    etas = [c["eta_minutes"] for c in candidates]
    dists = [c["distance_km"] for c in candidates]
    ratings = [c.get("rating", 4.5) for c in candidates]
    accepts = [c.get("acceptance_rate", 0.9) for c in candidates]
    cancels = [c.get("cancellation_rate", 0.05) for c in candidates]
    idles = [c.get("idle_minutes", 0) for c in candidates]

    n_eta = _normalize_lower_better(etas)
    n_dist = _normalize_lower_better(dists)
    n_rating = _normalize_higher_better(ratings)
    n_accept = _normalize_higher_better(accepts)
    n_cancel = _normalize_lower_better(cancels)  # lower cancel rate is better
    n_idle = _normalize_higher_better(idles)  # longer idle = more fair

    scored: list[dict[str, Any]] = []
    for i, c in enumerate(candidates):
        breakdown = {
            "eta_score": round(n_eta[i], 4),
            "distance_score": round(n_dist[i], 4),
            "rating_score": round(n_rating[i], 4),
            "acceptance_score": round(n_accept[i], 4),
            "cancellation_score": round(n_cancel[i], 4),
            "idle_score": round(n_idle[i], 4),
        }
        final = (
            WEIGHTS["eta"] * n_eta[i]
            + WEIGHTS["distance"] * n_dist[i]
            + WEIGHTS["rating"] * n_rating[i]
            + WEIGHTS["acceptance"] * n_accept[i]
            + WEIGHTS["cancellation"] * n_cancel[i]
            + WEIGHTS["idle"] * n_idle[i]
        )
        scored.append(
            {
                **c,
                "score_breakdown": breakdown,
                "final_score": round(final, 4),
            }
        )

    scored.sort(key=lambda x: x["final_score"], reverse=True)
    return scored


def rank_drivers(
    drivers: list[dict[str, Any]],
    pickup_lat: float,
    pickup_lon: float,
    zone: str = "urban",
    ride_type: str | None = None,
    traffic: str = "medium",
) -> list[dict[str, Any]]:
    """
    Full ranking pipeline:
    1. Filter by radius + available status
    2. Optionally filter by vehicle type
    3. Score and rank
    """
    radius = search_radius_km(zone)
    nearby = filter_nearby(drivers, pickup_lat, pickup_lon, radius_km=radius)

    # Re-attach traffic-aware ETA if needed (filter_nearby uses medium default)
    from location_service import estimate_eta_minutes

    for c in nearby:
        c["eta_minutes"] = round(
            estimate_eta_minutes(c["distance_km"], traffic=traffic), 2
        )

    if ride_type:
        filtered = [c for c in nearby if c.get("vehicle") == ride_type]
        # Fall back to all nearby if no vehicle match
        if filtered:
            nearby = filtered

    return score_candidates(nearby)


def build_allocation_log(
    ride_id: str,
    ranked: list[dict[str, Any]],
    selected_id: str | None,
    phase: str,
) -> dict[str, Any]:
    """Structured allocation decision log for admin UI."""
    return {
        "ride_id": ride_id,
        "timestamp": time.time(),
        "phase": phase,
        "selected_driver": selected_id,
        "candidates": [
            {
                "driver_id": c["id"],
                "name": c.get("name"),
                "distance_km": c.get("distance_km"),
                "eta_minutes": c.get("eta_minutes"),
                "final_score": c.get("final_score"),
                "score_breakdown": c.get("score_breakdown"),
                "status": c.get("status"),
            }
            for c in ranked
        ],
        "weights": WEIGHTS,
        "max_retries": MAX_RETRIES,
        "offer_timeout_sec": OFFER_TIMEOUT_SEC,
    }
