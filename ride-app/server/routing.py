"""
Route planner: optimized road-following paths with traffic & blockers.

Strategy:
1. Prefer OSRM road-network geometry by vehicle profile:
   - cars → /driving (car streets only; not footways / pure cycleways)
   - bike taxis → /cycling (cycle-friendly streets; careful with pedestrians)
2. Score candidates by distance, traffic-adjusted duration, and blocker penalties.
3. Hard blockers (closures/events) force detours via intermediate waypoints.
4. Soft congestion + pedestrian-care zones raise cost; traffic scales ETA.
5. Greedy diversity → up to 3 labeled options (Recommended / Fastest / Shortest / …).
6. Geometric fallback only when OSRM is unreachable (marked follows_roads=false).

Full algorithm, APIs, and future scope: docs/ROUTING.md
"""

from __future__ import annotations

import json
import math
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from typing import Any

from location_service import TRAFFIC_FACTORS, haversine_km

OSRM_HOST = "https://router.project-osrm.org/route/v1"
OSRM_TIMEOUT_SEC = 5.0
# Sample spacing along the polyline so movement looks continuous on the map.
SAMPLE_SPACING_KM = 0.04  # ~40 m

# Cost weights for multi-criteria route selection
W_DURATION = 0.55
W_DISTANCE = 0.25
W_BLOCKER = 0.20

# Soft congestion multiplies cost; hard closure is nearly infinite unless detoured.
CLOSURE_PENALTY = 1e6
CONGESTION_BASE_PENALTY = 8.0  # minutes-equivalent
# Extra soft cost for car/bike paths that cut near dense pedestrian zones.
PEDESTRIAN_CARE_PENALTY = 6.0  # minutes-equivalent

# OSRM / product routing profiles
PROFILE_DRIVING = "driving"
PROFILE_CYCLING = "cycling"

PROFILE_META: dict[str, dict[str, Any]] = {
    PROFILE_DRIVING: {
        "osrm": "driving",
        "base_speed_kmh": 22.0,
        "label": "car",
        "follows": "car streets",
        # Cars must not treat pure pedestrian corridors as free space.
        "respect_vru": True,
    },
    PROFILE_CYCLING: {
        "osrm": "cycling",
        "base_speed_kmh": 15.0,
        "label": "bike",
        "follows": "cycle-friendly streets",
        "respect_vru": True,
    },
}

# Soft zones where vehicles must slow / prefer alternatives (pedestrians & cyclists).
DEFAULT_PEDESTRIAN_CARE_ZONES: list[dict[str, Any]] = [
    {
        "id": "VRU_MARIENPLATZ",
        "name": "Marienplatz pedestrian core",
        "lat": 48.1374,
        "lon": 11.5755,
        "radius_km": 0.22,
        "severity": 1.4,
    },
    {
        "id": "VRU_VIKTUALIEN",
        "name": "Viktualienmarkt walkers",
        "lat": 48.1351,
        "lon": 11.5762,
        "radius_km": 0.18,
        "severity": 1.2,
    },
    {
        "id": "VRU_ENGLISCHER_PATHS",
        "name": "Englischer Garten paths (walkers/cyclists)",
        "lat": 48.1525,
        "lon": 11.5917,
        "radius_km": 0.45,
        "severity": 1.3,
    },
    {
        "id": "VRU_ISAR_BANKS",
        "name": "Isar embankment cycle/ped paths",
        "lat": 48.1350,
        "lon": 11.5880,
        "radius_km": 0.30,
        "severity": 1.1,
    },
]

_executor = ThreadPoolExecutor(max_workers=4)


def profile_for_ride_type(ride_type: str | None) -> str:
    """Map product ride_type → OSRM-style routing profile."""
    rt = (ride_type or "rideGo").strip().lower()
    if rt in ("biketaxi", "bike_taxi", "bike-taxi", "bike", "bicycle", "scooter"):
        return PROFILE_CYCLING
    return PROFILE_DRIVING


def is_bike_ride_type(ride_type: str | None) -> bool:
    return profile_for_ride_type(ride_type) == PROFILE_CYCLING


def base_speed_for_profile(profile: str) -> float:
    meta = PROFILE_META.get(profile) or PROFILE_META[PROFILE_DRIVING]
    return float(meta["base_speed_kmh"])


def follows_roads(route: dict[str, Any] | None) -> bool:
    """True when geometry came from the road network (not a geometric A→B stub)."""
    if not route:
        return False
    if route.get("follows_roads") is True:
        return True
    if route.get("source") == "osrm":
        return True
    coords = route.get("coordinates") or []
    # Two endpoints only = straight map line, not street geometry.
    if len(coords) < 3:
        return False
    return False


def bearing_deg(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Initial bearing from point 1 to point 2 (degrees, 0–360)."""
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dlon = math.radians(lon2 - lon1)
    x = math.sin(dlon) * math.cos(phi2)
    y = math.cos(phi1) * math.sin(phi2) - math.sin(phi1) * math.cos(phi2) * math.cos(dlon)
    return (math.degrees(math.atan2(x, y)) + 360.0) % 360.0


def _offset_point(
    lat: float, lon: float, distance_km: float, bearing: float
) -> tuple[float, float]:
    """Move `distance_km` from (lat, lon) along `bearing` degrees."""
    r = 6371.0
    br = math.radians(bearing)
    phi1 = math.radians(lat)
    lam1 = math.radians(lon)
    phi2 = math.asin(
        math.sin(phi1) * math.cos(distance_km / r)
        + math.cos(phi1) * math.sin(distance_km / r) * math.cos(br)
    )
    lam2 = lam1 + math.atan2(
        math.sin(br) * math.sin(distance_km / r) * math.cos(phi1),
        math.cos(distance_km / r) - math.sin(phi1) * math.sin(phi2),
    )
    return math.degrees(phi2), math.degrees(lam2)


def densify_polyline(
    coords: list[list[float]], spacing_km: float = SAMPLE_SPACING_KM
) -> list[list[float]]:
    """
    Densify [lon, lat] polyline so consecutive points are ~spacing_km apart.
    """
    if len(coords) < 2:
        return list(coords)
    out: list[list[float]] = [coords[0]]
    for i in range(1, len(coords)):
        lon1, lat1 = coords[i - 1]
        lon2, lat2 = coords[i]
        seg = haversine_km(lat1, lon1, lat2, lon2)
        if seg < 1e-6:
            continue
        n = max(1, int(math.ceil(seg / spacing_km)))
        for j in range(1, n + 1):
            t = j / n
            out.append([lon1 + (lon2 - lon1) * t, lat1 + (lat2 - lat1) * t])
    return out


def polyline_length_km(coords: list[list[float]]) -> float:
    total = 0.0
    for i in range(1, len(coords)):
        lon1, lat1 = coords[i - 1]
        lon2, lat2 = coords[i]
        total += haversine_km(lat1, lon1, lat2, lon2)
    return total


def point_to_segment_km(
    lat: float, lon: float, lat1: float, lon1: float, lat2: float, lon2: float
) -> float:
    """Approx min distance from point to segment (planar in local km)."""
    # Local equirectangular projection around the point
    mid_lat = math.radians((lat + lat1 + lat2) / 3.0)
    kx = 111.32 * math.cos(mid_lat)
    ky = 110.57
    px, py = lon * kx, lat * ky
    ax, ay = lon1 * kx, lat1 * ky
    bx, by = lon2 * kx, lat2 * ky
    abx, aby = bx - ax, by - ay
    apx, apy = px - ax, py - ay
    ab2 = abx * abx + aby * aby
    if ab2 < 1e-12:
        return math.hypot(px - ax, py - ay)
    t = max(0.0, min(1.0, (apx * abx + apy * aby) / ab2))
    cx, cy = ax + t * abx, ay + t * aby
    return math.hypot(px - cx, py - cy)


def route_blocker_stats(
    coords: list[list[float]], blockers: list[dict[str, Any]]
) -> dict[str, Any]:
    """How severely a route intersects each blocker."""
    hits: list[dict[str, Any]] = []
    hard_hit = False
    soft_penalty = 0.0
    if not blockers or len(coords) < 2:
        return {"hits": hits, "hard_hit": False, "soft_penalty": 0.0}

    for b in blockers:
        if not b.get("active", True):
            continue
        blat, blon = b["lat"], b["lon"]
        radius = float(b.get("radius_km", 0.3))
        btype = b.get("type", "congestion")
        severity = float(b.get("severity", 1.0))
        min_d = min(
            point_to_segment_km(
                blat,
                blon,
                coords[i][1],
                coords[i][0],
                coords[i + 1][1],
                coords[i + 1][0],
            )
            for i in range(len(coords) - 1)
        )
        if min_d > radius:
            continue
        depth = 1.0 - (min_d / radius)  # 0 at edge, 1 at center
        hits.append(
            {
                "id": b.get("id"),
                "type": btype,
                "depth": round(depth, 3),
                "min_distance_km": round(min_d, 4),
            }
        )
        if btype in ("closure", "event"):
            hard_hit = True
            soft_penalty += CLOSURE_PENALTY
        else:
            soft_penalty += CONGESTION_BASE_PENALTY * severity * depth

    return {"hits": hits, "hard_hit": hard_hit, "soft_penalty": soft_penalty}


def score_route(
    distance_km: float,
    duration_min: float,
    traffic: str,
    blocker_stats: dict[str, Any],
) -> float:
    """Lower is better. Combines traffic-adjusted time, distance, blockers."""
    tf = TRAFFIC_FACTORS.get(traffic, 1.35)
    adj_duration = duration_min * tf
    # Normalize-ish magnitudes for demo-scale city trips
    d_norm = distance_km / 5.0
    t_norm = adj_duration / 15.0
    b_norm = min(blocker_stats.get("soft_penalty", 0.0) / 20.0, 50.0)
    return W_DURATION * t_norm + W_DISTANCE * d_norm + W_BLOCKER * b_norm


def _osrm_profile_name(profile: str) -> str:
    meta = PROFILE_META.get(profile) or PROFILE_META[PROFILE_DRIVING]
    return str(meta.get("osrm") or "driving")


def _fetch_osrm(
    waypoints: list[tuple[float, float]],
    alternatives: bool = True,
    profile: str = PROFILE_DRIVING,
) -> list[dict[str, Any]]:
    """
    waypoints: list of (lat, lon).
    Returns list of candidate routes with geometry as [lon, lat] coords.

    Uses vehicle-appropriate OSRM profile so cars stay on car streets and
    bike taxis use cycle-friendly network (not motorways / pure footpaths).
    """
    if len(waypoints) < 2:
        return []
    osrm_profile = _osrm_profile_name(profile)
    coords_str = ";".join(f"{lon},{lat}" for lat, lon in waypoints)
    # continue_straight helps cars avoid illegal U-turns through pedestrian islands
    cont = "true" if profile == PROFILE_DRIVING else "false"
    url = (
        f"{OSRM_HOST}/{osrm_profile}/{coords_str}"
        f"?overview=full&geometries=geojson&steps=false"
        f"&continue_straight={cont}"
        f"&alternatives={'true' if alternatives and len(waypoints) == 2 else 'false'}"
    )
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "ride-alg-demo/1.0"})
        with urllib.request.urlopen(req, timeout=OSRM_TIMEOUT_SEC) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, json.JSONDecodeError, OSError):
        return []

    if data.get("code") != "Ok":
        return []
    out: list[dict[str, Any]] = []
    for r in data.get("routes") or []:
        geom = r.get("geometry") or {}
        coords = geom.get("coordinates") or []
        if len(coords) < 2:
            continue
        out.append(
            {
                "coordinates": coords,  # [lon, lat]
                "distance_km": float(r.get("distance", 0)) / 1000.0,
                "duration_min": float(r.get("duration", 0)) / 60.0,
                "source": "osrm",
                "follows_roads": True,
                "profile": profile,
            }
        )
    return out


def pedestrian_care_stats(
    coords: list[list[float]],
    zones: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    """Soft penalty when a path clips dense pedestrian / shared-use areas."""
    zones = zones if zones is not None else DEFAULT_PEDESTRIAN_CARE_ZONES
    hits: list[dict[str, Any]] = []
    soft = 0.0
    if not zones or len(coords) < 2:
        return {"hits": hits, "soft_penalty": 0.0}
    for z in zones:
        zlat, zlon = float(z["lat"]), float(z["lon"])
        radius = float(z.get("radius_km", 0.2))
        severity = float(z.get("severity", 1.0))
        min_d = min(
            point_to_segment_km(
                zlat,
                zlon,
                coords[i][1],
                coords[i][0],
                coords[i + 1][1],
                coords[i + 1][0],
            )
            for i in range(len(coords) - 1)
        )
        if min_d > radius:
            continue
        depth = 1.0 - (min_d / radius)
        hits.append(
            {
                "id": z.get("id"),
                "name": z.get("name"),
                "depth": round(depth, 3),
            }
        )
        soft += PEDESTRIAN_CARE_PENALTY * severity * depth
    return {"hits": hits, "soft_penalty": soft}


def _fallback_path(
    origin_lat: float,
    origin_lon: float,
    dest_lat: float,
    dest_lon: float,
    blockers: list[dict[str, Any]],
    profile: str = PROFILE_DRIVING,
) -> dict[str, Any]:
    """
    Offline-only geometric path when OSRM is unreachable.
    Marked follows_roads=false — never preferred over real street geometry.
    """
    points: list[tuple[float, float]] = [(origin_lat, origin_lon)]

    br = bearing_deg(origin_lat, origin_lon, dest_lat, dest_lon)
    # Perpendicular offset ~8% of total distance
    total = max(haversine_km(origin_lat, origin_lon, dest_lat, dest_lon), 0.2)
    arc = total * 0.08
    p1 = _offset_point(
        origin_lat + (dest_lat - origin_lat) * 0.33,
        origin_lon + (dest_lon - origin_lon) * 0.33,
        arc,
        (br + 90) % 360,
    )
    p2 = _offset_point(
        origin_lat + (dest_lat - origin_lat) * 0.66,
        origin_lon + (dest_lon - origin_lon) * 0.66,
        arc * 0.7,
        (br - 90) % 360,
    )
    points.extend([p1, p2])

    # Detour around closures that the chord would hit
    for b in blockers:
        if not b.get("active", True) or b.get("type") not in ("closure", "event"):
            continue
        min_d = point_to_segment_km(
            b["lat"], b["lon"], origin_lat, origin_lon, dest_lat, dest_lon
        )
        if min_d > float(b.get("radius_km", 0.3)) * 1.2:
            continue
        detour = _offset_point(
            b["lat"],
            b["lon"],
            float(b.get("radius_km", 0.3)) * 1.8,
            (br + 90) % 360,
        )
        points.append(detour)

    points.append((dest_lat, dest_lon))

    o = points[0]
    d = points[-1]
    mids = points[1:-1]

    def progress(p: tuple[float, float]) -> float:
        return (p[0] - o[0]) * (d[0] - o[0]) + (p[1] - o[1]) * (d[1] - o[1])

    mids.sort(key=progress)
    ordered = [o] + mids + [d]
    coords = [[lon, lat] for lat, lon in ordered]
    coords = densify_polyline(coords)
    dist = polyline_length_km(coords)
    speed = base_speed_for_profile(profile)
    duration = (dist / max(speed, 5.0)) * 60.0
    return {
        "coordinates": coords,
        "distance_km": dist,
        "duration_min": duration,
        "source": "fallback",
        "follows_roads": False,
        "profile": profile,
    }


def _detour_waypoints(
    origin: tuple[float, float],
    dest: tuple[float, float],
    blockers: list[dict[str, Any]],
) -> list[list[tuple[float, float]]]:
    """Generate OSRM waypoint sets that skirt hard closures."""
    sets: list[list[tuple[float, float]]] = []
    br = bearing_deg(origin[0], origin[1], dest[0], dest[1])
    for b in blockers:
        if not b.get("active", True) or b.get("type") not in ("closure", "event"):
            continue
        min_d = point_to_segment_km(
            b["lat"], b["lon"], origin[0], origin[1], dest[0], dest[1]
        )
        # Always consider detours for active closures/events near the corridor
        if min_d > float(b.get("radius_km", 0.3)) * 2.5:
            continue
        base_r = float(b.get("radius_km", 0.3))
        for mult in (1.8, 2.5, 3.5):
            r = base_r * mult
            for side in (90, -90, 60, -60, 120, -120):
                via = _offset_point(b["lat"], b["lon"], r, (br + side) % 360)
                sets.append([origin, via, dest])
    return sets


def _score_candidate(
    c: dict[str, Any],
    traffic: str,
    blockers: list[dict[str, Any]],
    profile: str = PROFILE_DRIVING,
) -> dict[str, Any]:
    dense = densify_polyline(c["coordinates"])
    dist = polyline_length_km(dense) if dense else c["distance_km"]
    speed = base_speed_for_profile(profile)
    base_duration = c["duration_min"]
    if c.get("source") == "fallback" or c.get("distance_km", 0) <= 0:
        base_duration = (dist / max(speed, 5.0)) * 60.0
    elif abs(dist - c["distance_km"]) / max(c["distance_km"], 0.01) > 0.15:
        base_duration = c["duration_min"] * (dist / max(c["distance_km"], 0.01))

    # Bikes are more sensitive to traffic density in shared urban corridors
    if profile == PROFILE_CYCLING:
        base_duration *= 1.08

    bstats = route_blocker_stats(dense, blockers)
    vru = pedestrian_care_stats(dense)
    # Fold VRU care into soft blocker penalty so cars/bikes prefer calmer streets
    combined = {
        "hits": bstats["hits"],
        "hard_hit": bstats["hard_hit"],
        "soft_penalty": float(bstats.get("soft_penalty") or 0.0)
        + float(vru.get("soft_penalty") or 0.0),
    }
    cost = score_route(dist, base_duration, traffic, combined)
    # Prefer real road geometry over geometric stubs when ranking
    if c.get("source") != "osrm" and not c.get("follows_roads"):
        cost += 50.0
    tf = TRAFFIC_FACTORS.get(traffic, 1.35)
    return {
        "coordinates": dense,
        "distance_km": round(dist, 3),
        "duration_min": round(base_duration, 2),
        "duration_adj_min": round(base_duration * tf, 2),
        "source": c.get("source") or "fallback",
        "follows_roads": bool(c.get("follows_roads") or c.get("source") == "osrm"),
        "profile": profile,
        "cost": round(cost, 4),
        "blocker_hits": bstats["hits"],
        "hard_hit": bstats["hard_hit"],
        "vru_care_hits": vru.get("hits") or [],
        "vru_care": True,
    }


def _sample_polyline(coords: list[list[float]], n: int = 5) -> list[list[float]]:
    if not coords:
        return []
    if len(coords) == 1:
        return [coords[0]] * n
    return [coords[i * (len(coords) - 1) // (n - 1)] for i in range(n)]


def corridor_affinity(a: dict[str, Any], b: dict[str, Any]) -> float:
    """
    Higher = more similar corridors (0..1 scale-ish).
    Used when re-matching a preferred alternative after a mid-ride replan.
    """
    ca = a.get("coordinates") or []
    cb = b.get("coordinates") or []
    if len(ca) < 2 or len(cb) < 2:
        return 0.0
    samples_a = _sample_polyline(ca, 5)
    samples_b = _sample_polyline(cb, 5)
    diffs = [
        haversine_km(sa[1], sa[0], sb[1], sb[0])
        for sa, sb in zip(samples_a, samples_b)
    ]
    avg = sum(diffs) / len(diffs)
    # ~0 km avg → 1.0; 2+ km avg → ~0
    return max(0.0, 1.0 - avg / 2.0)


def _routes_similar(a: dict[str, Any], b: dict[str, Any]) -> bool:
    """True if two scored routes are effectively the same corridor."""
    da, db = a.get("distance_km") or 0.0, b.get("distance_km") or 0.0
    if max(da, db) < 0.05:
        return True
    if abs(da - db) / max(da, db) > 0.18:
        return False
    return corridor_affinity(a, b) >= (1.0 - 0.35 / 2.0)


def pick_route_by_preference(
    routes: list[dict[str, Any]],
    preference: dict[str, Any] | None,
) -> dict[str, Any] | None:
    """
    Choose a route from a freshly optimized set that best matches the driver's
    preferred alternative (by tag strategy, then corridor geometry).
    """
    if not routes:
        return None
    if not preference:
        return routes[0]

    tags: set[str] = set(preference.get("tags") or [])
    label = preference.get("label")
    if label:
        tags.add(str(label))

    # Prefer strategy tags in this order when the driver picked that style
    for key in ("Fastest", "Shortest", "Avoids events", "Recommended"):
        if key not in tags:
            continue
        for r in routes:
            rtags = set(r.get("tags") or [])
            if r.get("label") == key or key in rtags:
                return r

    # Geometric match against the previously offered corridor
    pref_coords = preference.get("coordinates") or []
    if pref_coords:
        pref_proxy = {
            "coordinates": pref_coords,
            "distance_km": preference.get("distance_km") or 0.0,
        }
        best = max(routes, key=lambda r: corridor_affinity(r, pref_proxy))
        if corridor_affinity(best, pref_proxy) > 0.15:
            return best

    return routes[0]


def remaining_route_metrics(
    route: dict[str, Any],
    from_index: int = 0,
    traffic: str = "medium",
    profile: str | None = None,
) -> dict[str, float]:
    """Distance/duration for the remaining polyline from `from_index`."""
    coords = route.get("coordinates") or []
    prof = profile or route.get("profile") or PROFILE_DRIVING
    speed = base_speed_for_profile(str(prof))
    if not coords:
        return {
            "distance_km": float(route.get("distance_km") or 0.0),
            "duration_min": float(route.get("duration_min") or 0.0),
            "duration_adj_min": float(route.get("duration_adj_min") or 0.0),
        }
    idx = max(0, min(from_index, len(coords) - 1))
    remaining = coords[idx:]
    if len(remaining) < 2:
        return {"distance_km": 0.0, "duration_min": 0.0, "duration_adj_min": 0.0}

    dist = polyline_length_km(remaining)
    full_dist = float(route.get("distance_km") or 0.0) or polyline_length_km(coords)
    full_dur = float(route.get("duration_min") or 0.0)
    if full_dist > 1e-6 and full_dur > 0:
        dur = full_dur * (dist / full_dist)
    else:
        dur = (dist / max(speed, 5.0)) * 60.0
    tf = TRAFFIC_FACTORS.get(traffic, 1.35)
    return {
        "distance_km": round(dist, 3),
        "duration_min": round(dur, 2),
        "duration_adj_min": round(dur * tf, 2),
    }


def _diversity_via_waypoints(
    origin: tuple[float, float],
    dest: tuple[float, float],
) -> list[list[tuple[float, float]]]:
    """Extra via-point sets to force geometrically distinct corridors."""
    br = bearing_deg(origin[0], origin[1], dest[0], dest[1])
    total = max(haversine_km(origin[0], origin[1], dest[0], dest[1]), 0.4)
    sets: list[list[tuple[float, float]]] = []
    for frac, side, mult in (
        (0.45, 90, 0.18),
        (0.45, -90, 0.18),
        (0.35, 70, 0.28),
        (0.55, -70, 0.28),
        (0.5, 180, 0.12),
    ):
        mid_lat = origin[0] + (dest[0] - origin[0]) * frac
        mid_lon = origin[1] + (dest[1] - origin[1]) * frac
        via = _offset_point(mid_lat, mid_lon, total * mult, (br + side) % 360)
        sets.append([origin, via, dest])
    return sets


def _label_top_routes(
    picked: list[dict[str, Any]],
    blockers: list[dict[str, Any]],
    traffic: str,
    profile: str = PROFILE_DRIVING,
) -> list[dict[str, Any]]:
    """Assign human labels + summaries to up to 3 ranked distinct routes."""
    if not picked:
        return []

    by_time = min(picked, key=lambda r: (r["hard_hit"], r["duration_adj_min"]))
    by_dist = min(picked, key=lambda r: (r["hard_hit"], r["distance_km"]))
    by_safe = min(
        picked,
        key=lambda r: (
            r["hard_hit"],
            len(r.get("blocker_hits") or []) + len(r.get("vru_care_hits") or []),
            r["cost"],
        ),
    )

    used_labels: set[str] = set()
    labeled: list[dict[str, Any]] = []
    active_events = [
        b for b in blockers if b.get("active", True)
    ]
    mode_label = "bike streets" if profile == PROFILE_CYCLING else "car streets"

    for i, r in enumerate(picked):
        labels: list[str] = []
        if i == 0:
            labels.append("Recommended")
        if r is by_time and "Fastest" not in used_labels:
            labels.append("Fastest")
        if r is by_dist and "Shortest" not in used_labels:
            labels.append("Shortest")
        if r is by_safe and "Avoids events" not in used_labels and i > 0:
            labels.append("Avoids events")
        if not labels:
            labels.append(f"Option {i + 1}")

        primary = labels[0]
        for lb in labels:
            used_labels.add(lb)

        hit_ids = {h.get("id") for h in (r.get("blocker_hits") or [])}
        avoided = [
            b["name"]
            for b in active_events
            if b.get("type") in ("closure", "event") and b["id"] not in hit_ids
        ]
        cong = [
            h.get("id")
            for h in (r.get("blocker_hits") or [])
            if h.get("type") == "congestion"
        ]
        parts = [f"{r['distance_km']} km", f"~{r['duration_adj_min']} min"]
        if r.get("follows_roads"):
            parts.append(f"via {mode_label}")
        else:
            parts.append("approx path (offline)")
        if avoided:
            parts.append(f"avoids {', '.join(avoided[:2])}")
        if cong:
            parts.append("light congestion on path")
        if r.get("vru_care_hits"):
            parts.append("slow near pedestrians/cyclists")
        if r.get("hard_hit"):
            parts.append("⚠ intersects closure")
        parts.append(f"traffic:{traffic}")

        labeled.append(
            {
                **r,
                "id": f"opt_{i + 1}",
                "rank": i + 1,
                "label": primary,
                "tags": labels,
                "summary": " · ".join(parts),
                "traffic": traffic,
                "optimized": True,
                "follows_roads": bool(r.get("follows_roads")),
                "profile": profile,
                "events_accounted": [
                    {"id": b["id"], "name": b.get("name"), "type": b.get("type"), "active": True}
                    for b in active_events
                ],
                "blockers_avoided": [
                    b["id"]
                    for b in active_events
                    if b.get("type") in ("closure", "event") and b["id"] not in hit_ids
                ],
            }
        )
    return labeled


def _collect_candidates(
    origin: tuple[float, float],
    dest: tuple[float, float],
    blockers: list[dict[str, Any]],
    profile: str = PROFILE_DRIVING,
) -> list[dict[str, Any]]:
    """Collect street-network candidates; geometric fallback only if OSRM empty."""
    candidates: list[dict[str, Any]] = []
    for r in _fetch_osrm([origin, dest], alternatives=True, profile=profile):
        candidates.append(r)
    for wps in _detour_waypoints(origin, dest, blockers):
        for r in _fetch_osrm(wps, alternatives=False, profile=profile):
            candidates.append(r)
    # Corridor diversity via OSRM (still road-snapped)
    for wps in _diversity_via_waypoints(origin, dest):
        for r in _fetch_osrm(wps, alternatives=False, profile=profile):
            candidates.append(r)
    if not candidates:
        # One retry of direct request (public demo can flake)
        for r in _fetch_osrm([origin, dest], alternatives=False, profile=profile):
            candidates.append(r)
    if not candidates:
        candidates.append(
            _fallback_path(origin[0], origin[1], dest[0], dest[1], blockers, profile)
        )
    return candidates


def _chain_fallback(
    points: list[tuple[float, float]],
    blockers: list[dict[str, Any]],
    profile: str = PROFILE_DRIVING,
) -> dict[str, Any]:
    """Stitch curved segments between ordered waypoints (offline only)."""
    if len(points) < 2:
        p = points[0] if points else (0.0, 0.0)
        return {
            "coordinates": [[p[1], p[0]]],
            "distance_km": 0.0,
            "duration_min": 0.0,
            "source": "fallback",
            "follows_roads": False,
            "profile": profile,
        }
    coords: list[list[float]] = []
    total_dist = 0.0
    total_dur = 0.0
    for i in range(len(points) - 1):
        a, b = points[i], points[i + 1]
        seg = _fallback_path(a[0], a[1], b[0], b[1], blockers, profile)
        sc = seg["coordinates"]
        if coords and sc:
            sc = sc[1:]  # avoid duplicate joint
        coords.extend(sc)
        total_dist += float(seg.get("distance_km") or 0)
        total_dur += float(seg.get("duration_min") or 0)
    coords = densify_polyline(coords)
    speed = base_speed_for_profile(profile)
    if total_dist <= 0:
        total_dist = polyline_length_km(coords)
        total_dur = (total_dist / max(speed, 5.0)) * 60.0
    return {
        "coordinates": coords,
        "distance_km": total_dist,
        "duration_min": total_dur,
        "source": "fallback",
        "follows_roads": False,
        "profile": profile,
    }


def _collect_candidates_multileg(
    points: list[tuple[float, float]],
    blockers: list[dict[str, Any]],
    profile: str = PROFILE_DRIVING,
) -> list[dict[str, Any]]:
    """
    Multi-stop candidates for live GPS OD + up to 2 intermediate stops.
    Uses OSRM multi-waypoint routing (street-following) only when possible.
    """
    candidates: list[dict[str, Any]] = []
    if len(points) < 2:
        return candidates

    for r in _fetch_osrm(points, alternatives=False, profile=profile):
        candidates.append(r)

    origin, dest = points[0], points[-1]
    mids = points[1:-1]
    if not mids:
        return _collect_candidates(origin, dest, blockers, profile)

    for mid in mids:
        for side, mult in ((90, 0.15), (-90, 0.15), (60, 0.25), (-60, 0.25)):
            br = bearing_deg(origin[0], origin[1], dest[0], dest[1])
            via = _offset_point(mid[0], mid[1], 0.4 * mult * 5, (br + side) % 360)
            ordered = [origin]
            for m in mids:
                ordered.append(via if m is mid else m)
            ordered.append(dest)
            for r in _fetch_osrm(ordered, alternatives=False, profile=profile):
                candidates.append(r)

    for wps in _detour_waypoints(origin, dest, blockers):
        if len(wps) >= 3:
            merged = [origin] + list(mids) + [wps[1], dest]
        else:
            merged = points
        for r in _fetch_osrm(merged, alternatives=False, profile=profile):
            candidates.append(r)

    if not candidates:
        for r in _fetch_osrm(points, alternatives=False, profile=profile):
            candidates.append(r)
    if not candidates:
        candidates.append(_chain_fallback(points, blockers, profile))
    return candidates


def plan_routes(
    origin_lat: float,
    origin_lon: float,
    dest_lat: float,
    dest_lon: float,
    traffic: str = "medium",
    blockers: list[dict[str, Any]] | None = None,
    max_routes: int = 3,
    waypoints: list[tuple[float, float]] | None = None,
    profile: str = PROFILE_DRIVING,
    ride_type: str | None = None,
) -> dict[str, Any]:
    """
    Compute up to `max_routes` distinct optimized paths under traffic,
    road closures, congestion, and live events.

    `profile` / `ride_type`: driving (cars on car streets) or cycling (bike taxi).
    Both profiles apply soft pedestrian/cyclist care costs.
    """
    if ride_type:
        profile = profile_for_ride_type(ride_type)
    if profile not in PROFILE_META:
        profile = PROFILE_DRIVING

    blockers = blockers or []
    origin = (origin_lat, origin_lon)
    dest = (dest_lat, dest_lon)
    stops = list(waypoints or [])[:2]
    points: list[tuple[float, float]] = [origin] + stops + [dest]
    max_routes = max(1, min(3, max_routes))

    if stops:
        raw = _collect_candidates_multileg(points, blockers, profile)
    else:
        raw = _collect_candidates(origin, dest, blockers, profile)

    scored = [_score_candidate(c, traffic, blockers, profile) for c in raw]
    # Prefer road-following first, then non-hard-hit, then cost
    scored.sort(
        key=lambda r: (
            0 if r.get("follows_roads") else 1,
            1 if r["hard_hit"] else 0,
            r["cost"],
        )
    )

    if scored and scored[0]["hard_hit"] and any(
        not x["hard_hit"] for x in scored
    ):
        scored.sort(
            key=lambda r: (
                0 if r.get("follows_roads") else 1,
                1 if r["hard_hit"] else 0,
                r["cost"],
            )
        )

    # Greedy diversity — prefer keeping only OSRM corridors when available
    road_scored = [r for r in scored if r.get("follows_roads")]
    pool = road_scored if road_scored else scored

    picked: list[dict[str, Any]] = []
    for r in pool:
        if any(_routes_similar(r, p) for p in picked):
            continue
        picked.append(r)
        if len(picked) >= max_routes:
            break

    # Only synthesize extra OSRM via-point corridors (not geometric arcs)
    if len(picked) < max_routes and road_scored:
        for wps in _diversity_via_waypoints(origin, dest):
            for raw_r in _fetch_osrm(wps, alternatives=False, profile=profile):
                sc = _score_candidate(raw_r, traffic, blockers, profile)
                if any(_routes_similar(sc, p) for p in picked):
                    continue
                picked.append(sc)
                if len(picked) >= max_routes:
                    break
            if len(picked) >= max_routes:
                break

    # Absolute last resort: one offline geometric path if nothing else exists
    if not picked:
        fb = (
            _chain_fallback(points, blockers, profile)
            if stops
            else _fallback_path(origin_lat, origin_lon, dest_lat, dest_lon, blockers, profile)
        )
        picked.append(_score_candidate(fb, traffic, blockers, profile))

    routes = _label_top_routes(picked[:max_routes], blockers, traffic, profile)
    for r in routes:
        r["stop_count"] = len(stops)
        r["waypoints"] = [{"lat": s[0], "lon": s[1]} for s in stops]
        r["profile"] = profile
        r["follows_roads"] = bool(r.get("follows_roads"))

    selected = routes[0] if routes else None
    active = [b for b in blockers if b.get("active", True)]

    return {
        "routes": routes,
        "selected": selected,
        "conditions": {
            "traffic": traffic,
            "profile": profile,
            "vru_care": True,
            "active_blockers": [
                {
                    "id": b["id"],
                    "name": b.get("name"),
                    "type": b.get("type"),
                    "severity": b.get("severity"),
                }
                for b in active
            ],
            "events": [
                b for b in active if b.get("type") in ("closure", "event", "congestion")
            ],
        },
        "alternatives_considered": len(scored),
        "waypoints": [{"lat": s[0], "lon": s[1]} for s in stops],
        "profile": profile,
    }


def plan_route(
    origin_lat: float,
    origin_lon: float,
    dest_lat: float,
    dest_lon: float,
    traffic: str = "medium",
    blockers: list[dict[str, Any]] | None = None,
    waypoints: list[tuple[float, float]] | None = None,
    profile: str = PROFILE_DRIVING,
    ride_type: str | None = None,
) -> dict[str, Any]:
    """Best single route (back-compat)."""
    bundle = plan_routes(
        origin_lat,
        origin_lon,
        dest_lat,
        dest_lon,
        traffic,
        blockers,
        max_routes=1,
        waypoints=waypoints,
        profile=profile,
        ride_type=ride_type,
    )
    if not bundle["selected"]:
        return {
            "coordinates": [[origin_lon, origin_lat], [dest_lon, dest_lat]],
            "distance_km": haversine_km(origin_lat, origin_lon, dest_lat, dest_lon),
            "duration_min": 1.0,
            "duration_adj_min": 1.0,
            "source": "fallback",
            "follows_roads": False,
            "profile": profile_for_ride_type(ride_type) if ride_type else profile,
            "cost": 99.0,
            "traffic": traffic,
            "alternatives_considered": 0,
            "blocker_hits": [],
            "blockers_avoided": [],
            "optimized": False,
        }
    best = dict(bundle["selected"])
    best["alternatives_considered"] = bundle["alternatives_considered"]
    return best


async def plan_route_async(
    origin_lat: float,
    origin_lon: float,
    dest_lat: float,
    dest_lon: float,
    traffic: str = "medium",
    blockers: list[dict[str, Any]] | None = None,
    waypoints: list[tuple[float, float]] | None = None,
    profile: str = PROFILE_DRIVING,
    ride_type: str | None = None,
) -> dict[str, Any]:
    """Run plan_route off the event loop (OSRM is blocking HTTP)."""
    import asyncio

    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(
        _executor,
        lambda: plan_route(
            origin_lat,
            origin_lon,
            dest_lat,
            dest_lon,
            traffic,
            blockers,
            waypoints,
            profile,
            ride_type,
        ),
    )


async def plan_routes_async(
    origin_lat: float,
    origin_lon: float,
    dest_lat: float,
    dest_lon: float,
    traffic: str = "medium",
    blockers: list[dict[str, Any]] | None = None,
    max_routes: int = 3,
    waypoints: list[tuple[float, float]] | None = None,
    profile: str = PROFILE_DRIVING,
    ride_type: str | None = None,
) -> dict[str, Any]:
    """Run plan_routes off the event loop."""
    import asyncio

    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(
        _executor,
        lambda: plan_routes(
            origin_lat,
            origin_lon,
            dest_lat,
            dest_lon,
            traffic,
            blockers,
            max_routes,
            waypoints,
            profile,
            ride_type,
        ),
    )


def closest_index_on_route(
    coordinates: list[list[float]], lat: float, lon: float
) -> int:
    """Index of polyline vertex nearest to (lat, lon)."""
    if not coordinates:
        return 0
    best_i = 0
    best_d = float("inf")
    for i, (plon, plat) in enumerate(coordinates):
        d = haversine_km(lat, lon, plat, plon)
        if d < best_d:
            best_d = d
            best_i = i
    return best_i


def advance_along_route(
    coordinates: list[list[float]],
    index: int,
    step_km: float,
) -> tuple[float, float, int, float, float]:
    """
    Walk along densified [lon, lat] polyline from `index` by up to `step_km`.

    Returns:
      (new_lat, new_lon, new_index, remaining_km, heading_deg)
    """
    if not coordinates:
        return 0.0, 0.0, 0, 0.0, 0.0
    if index >= len(coordinates) - 1:
        lon, lat = coordinates[-1]
        return lat, lon, len(coordinates) - 1, 0.0, 0.0

    remaining_step = step_km
    i = index
    lon, lat = coordinates[i]

    while remaining_step > 0 and i < len(coordinates) - 1:
        nlon, nlat = coordinates[i + 1]
        seg = haversine_km(lat, lon, nlat, nlon)
        if seg <= remaining_step or seg < 1e-6:
            remaining_step -= seg
            lon, lat = nlon, nlat
            i += 1
        else:
            ratio = remaining_step / seg
            lon = lon + (nlon - lon) * ratio
            lat = lat + (nlat - lat) * ratio
            remaining_step = 0.0

    # Remaining distance to end of route
    rem = 0.0
    cur_lat, cur_lon = lat, lon
    for j in range(i, len(coordinates) - 1):
        plon, plat = coordinates[j] if j > i else (cur_lon, cur_lat)
        if j == i:
            plon, plat = cur_lon, cur_lat
        nlon, nlat = coordinates[j + 1]
        rem += haversine_km(plat, plon, nlat, nlon)

    # Heading toward next vertex (or last segment)
    if i < len(coordinates) - 1:
        nlon, nlat = coordinates[i + 1]
        heading = bearing_deg(lat, lon, nlat, nlon)
    elif i > 0:
        plon, plat = coordinates[i - 1]
        heading = bearing_deg(plat, plon, lat, lon)
    else:
        heading = 0.0

    return lat, lon, i, rem, heading


def default_blockers() -> list[dict[str, Any]]:
    """Munich demo road closures / congestion / live events."""
    return [
        {
            "id": "BLK_ENGLISCHER",
            "name": "Englischer Garten Road Closure",
            "type": "closure",
            "lat": 48.1525,
            "lon": 11.5917,
            "radius_km": 0.35,
            "severity": 1.0,
            "active": True,
            "auto": False,
            "description": "Full road closure — routes must detour",
        },
        {
            "id": "BLK_AIRPORT_RD",
            "name": "A9 Airport Corridor Congestion",
            "type": "congestion",
            "lat": 48.2200,
            "lon": 11.6500,
            "radius_km": 0.6,
            "severity": 1.4,
            "active": True,
            "auto": True,
            "description": "Heavy traffic corridor — prefer alternatives",
        },
        {
            "id": "BLK_MITTLERER_RING",
            "name": "Mittlerer Ring Construction",
            "type": "congestion",
            "lat": 48.1550,
            "lon": 11.5400,
            "radius_km": 0.5,
            "severity": 1.2,
            "active": True,
            "auto": True,
            "description": "Construction slowdown zone",
        },
        {
            "id": "BLK_OKTOBERFEST",
            "name": "Theresienwiese Event Closure",
            "type": "event",
            "lat": 48.1315,
            "lon": 11.5497,
            "radius_km": 0.35,
            "severity": 1.0,
            "active": False,
            "auto": True,
            "description": "Live event roadblock (auto or admin toggle)",
        },
        {
            "id": "BLK_MARIENPLATZ_RALLY",
            "name": "Marienplatz Parade",
            "type": "event",
            "lat": 48.1374,
            "lon": 11.5755,
            "radius_km": 0.3,
            "severity": 1.1,
            "active": False,
            "auto": True,
            "description": "Temporary parade / VIP movement",
        },
        {
            "id": "BLK_STACHUS",
            "name": "Stachus / Karlsplatz Jam",
            "type": "congestion",
            "lat": 48.1391,
            "lon": 11.5657,
            "radius_km": 0.4,
            "penalty": 1.6,
            "active": True,
            "auto": True,
            "description": "Chronic peak-hour bottleneck",
        },
    ]


# Closures and events both act as hard obstacles for routing
def _is_hard_blocker(btype: str) -> bool:
    return btype in ("closure", "event")
