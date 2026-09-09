# Route Finding & Optimization

| Field | Value |
|-------|--------|
| **Module** | `server/routing.py` |
| **Consumers** | `server/app.py` (trip movement, accept, replan, select-route) |
| **Version** | 3.0 |
| **Reference geo** | Munich, Germany |

This document specifies how the demo computes **road-following routes**, ranks **up to three alternatives**, accounts for **traffic / closures / events**, and lets the **driver select or switch** paths during a ride.

---

## 1. Goals

| Goal | Demo behavior |
|------|----------------|
| Road-following path | Prefer OSRM driving geometry over straight-line Haversine |
| Multi-criteria cost | Traffic-adjusted time + distance + blocker/event penalties |
| Hard constraints | Closures & events force detours when possible |
| Soft constraints | Congestion zones increase cost (prefer avoid) |
| Alternatives | Return up to **3** geometrically distinct options |
| Driver agency | Select any option; replan from current GPS mid-ride |
| Live world | Auto traffic drift + event toggles replan active trips |
| Resilience | Offline / OSRM-down geometric fallback |

---

## 2. High-level pipeline

```
Origin (lat,lon)  +  Destination (lat,lon)
        │
        ▼
┌───────────────────┐
│  Live conditions  │  traffic level · active blockers · events
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Candidate generation │
│  1. OSRM direct (+alternatives) │
│  2. Detour vias around closures/events │
│  3. Diversity vias (corridor spread) │
│  4. Geometric fallback if empty │
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Densify polyline  │  ~40 m sample spacing
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Score each candidate │  cost = f(duration, distance, blockers)
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Diversity pick (≤3) │  greedy: best first, skip similar corridors
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Label & summarize │  Recommended / Fastest / Shortest / Avoids events
└─────────┬─────────┘
          ▼
  routes[] + selected (rank 1 by default)
```

### When routes are planned

| Trigger | Phase | Origin | Destination |
|---------|-------|--------|-------------|
| Driver accepts ride | `to_pickup` | Driver GPS | Pickup |
| Driver accepts ride | `to_destination` | Pickup | Drop (precomputed) |
| Passenger picked up | `to_destination` | Pickup (or current) | Drop |
| `POST .../replan` | Active leg | Current driver GPS | Pickup or drop |
| Live conditions change | Active leg | Current driver GPS | Pickup or drop |
| Driver selects option | Active leg | **Full replan** from current GPS; match preferred strategy; recalc remaining distance/ETA/fare |

---

## 3. Live conditions model

### 3.1 Traffic levels

Defined in `location_service.TRAFFIC_FACTORS`:

| Level | Factor | Effect |
|-------|--------|--------|
| `low` | 1.0 | Base free-flow |
| `medium` | 1.35 | Default urban |
| `high` | 1.8 | Peak |
| `severe` | 2.4 | Gridlock |

**ETA:**  
`duration_adj_min = duration_min × traffic_factor`

**Movement step (simulation):**  
`step_km = base_step / traffic_factor` (capped minimum)

Traffic is set manually via admin **or** drifted by the auto-conditions loop.

### 3.2 Blocker / event types

| Type | Constraint class | Routing effect |
|------|------------------|----------------|
| `closure` | **Hard** | Near-infinite penalty if path intersects radius; force detour vias |
| `event` | **Hard** | Same as closure (parade, VIP, temporary roadblock) |
| `congestion` | **Soft** | Penalty ∝ severity × depth into radius; path still legal |

Each blocker:

```
id, name, type, lat, lon, radius_km, severity, active, auto?, description
```

- **Hard intersection:** minimum distance from blocker center to any route segment ≤ `radius_km`.
- **Depth:** `1 − (min_distance / radius)` — center hit = 1.0.
- **Soft penalty:** `CONGESTION_BASE_PENALTY × severity × depth` (minutes-equivalent).
- **Hard penalty:** `CLOSURE_PENALTY` (~1e6) plus `hard_hit = true`.

Seed set: Englischer Garten closure, A9 airport corridor congestion, Mittlerer Ring construction, Theresienwiese event, Marienplatz parade, Stachus jam (`default_blockers()`).

### 3.3 Automatic conditions loop

`live_conditions_loop` (~40 s):

1. Optionally step traffic up/down one level.
2. For `auto: true` blockers: toggle events / nudge congestion severity.
3. Broadcast `traffic_updated`, `blockers_updated`, `conditions_updated`.
4. For each active ride (`allocated` / `en_route` / `on_trip`): **force replan** from current driver position and snap progress onto the new selected path.

Admin can disable automation: `POST /api/admin/auto-conditions` `{ "enabled": false }`.

---

## 4. Candidate generation

### 4.1 OSRM (primary)

Public demo endpoint:

```
GET https://router.project-osrm.org/route/v1/driving/{lon},{lat};...
    ?overview=full&geometries=geojson&alternatives=true|false
```

- Two-point requests request **alternatives**.
- Multi-waypoint (detour / diversity) requests use `alternatives=false`.
- Timeout: ~4 s; failures → empty list (fallback path).

Returns raw candidates: `coordinates` (GeoJSON `[lon,lat]`), `distance_km`, `duration_min`, `source: "osrm"`.

### 4.2 Closure / event detours

For each active hard blocker near the origin–destination chord:

- Place via points around the blocker (bearings ±45…±120, radii 1.8×–3.5× `radius_km`).
- Request OSRM `origin → via → dest`.

### 4.3 Diversity vias

Even when OSRM returns a single corridor, inject intermediate points offset perpendicular (and reverse) from the OD mid-segment fractions to force **alternate corridors**.

### 4.4 Geometric fallback

If no OSRM candidates (offline / error):

- Build a multi-midpoint arc origin → curved mids → dest.
- Insert detour points around hard blockers.
- Densify; estimate duration at ~22 km/h base.
- `source: "fallback"`.

If all scored OSRM paths still have `hard_hit`, append another fallback scored candidate and re-rank.

---

## 5. Densification

`densify_polyline(coords, spacing_km ≈ 0.04)`

Inserts vertices so consecutive samples are ~**40 m** apart. Enables:

- Smooth **5 s** GPS ticks along the road.
- Stable **closest-vertex** snap when switching routes mid-ride.
- Consistent distance / blocker intersection checks.

---

## 6. Cost function (optimization objective)

Lower is better.

```
cost =
    W_DURATION × (duration_min × traffic_factor) / 15
  + W_DISTANCE × distance_km / 5
  + W_BLOCKER  × min(soft_penalty / 20, 50)
```

| Weight | Symbol | Value | Rationale |
|--------|--------|-------|-----------|
| Duration (traffic-aware) | `W_DURATION` | **0.55** | Passenger time is primary |
| Distance | `W_DISTANCE` | **0.25** | Fuel / fare fairness |
| Blockers / events | `W_BLOCKER` | **0.20** | Safety & reliability |

**Primary sort key:**

```
( hard_hit ? 1 : 0 ,  cost )
```

Hard-hit routes are always ranked after routes that avoid closures/events.

---

## 7. Selecting the best three routes

### 7.1 Greedy diversity

After global sort:

1. Take the best candidate.
2. Walk remaining list; keep a candidate only if it is **not similar** to any already picked.
3. Stop at `max_routes = 3` (or fewer if only one/two exist).

**Similarity** (`_routes_similar`):

- Length ratio differs by &gt; 18% → distinct.
- Else compare 5 sample points (0%, 25%, 50%, 75%, 100%); mean Haversine distance &lt; **0.35 km** → similar (drop).

If fewer than 3 distinct corridors remain, synthesize extra arc fallbacks with increasing offset.

### 7.2 Labels

Assigned after the diverse set is fixed:

| Label | Rule |
|-------|------|
| **Recommended** | Rank 1 (best cost among non-hard-hit preferred) |
| **Fastest** | Lowest `duration_adj_min` |
| **Shortest** | Lowest `distance_km` |
| **Avoids events** | Fewest hard/soft hits (when not rank 1) |
| **Option N** | Fallback label |

Each option includes:

```json
{
  "id": "opt_1",
  "rank": 1,
  "label": "Recommended",
  "tags": ["Recommended", "Fastest"],
  "summary": "3.2 km · ~12 min · avoids Englischer Garten · traffic:high",
  "coordinates": [[lon, lat], ...],
  "distance_km": 3.2,
  "duration_min": 8.5,
  "duration_adj_min": 12.0,
  "cost": 0.91,
  "source": "osrm",
  "blocker_hits": [],
  "blockers_avoided": ["BLK_ENGLISCHER"],
  "events_accounted": [...],
  "traffic": "high",
  "optimized": true
}
```

---

## 8. Driver selection & mid-ride switch

### 8.1 Default

On plan/replan: `selected = routes[0]` (Recommended), stored as:

- `route_to_pickup` or `route_to_destination` (active geometry)
- `route_options_pickup` / `route_options_destination` (full list)
- `selected_route_id`

### 8.2 Explicit select

`POST /api/ride/{id}/select-route`

```json
{ "route_id": "opt_2", "phase": "to_destination" }
```

- Resolves `route_id` in the phase’s options list.
- Sets that geometry as the active path.
- **`closest_index_on_route`**: snaps `route_progress_index` to the nearest vertex from current driver GPS (no teleport to origin).
- Broadcasts `ride_updated`; movement continues on the new polyline at the next 5 s tick.

### 8.3 Replan

`POST /api/ride/{id}/replan` — regenerates up to 3 options from **current** position to the active leg’s destination under **current** traffic and blockers.

---

## 9. Navigation simulation (movement)

`trip_movement_loop` — interval **`TRIP_TICK_SEC = 5`**:

```
coords = active route polyline
index  = ride.route_progress_index
step   = step_for_traffic(base_step, traffic)

(lat, lon, new_index, remaining_km, heading) =
    advance_along_route(coords, index, step)

update driver GPS + heading
broadcast driver_location
if remaining_km < threshold → transition status (pickup → on_trip → completed)
```

| Leg | Base step | Status |
|-----|-----------|--------|
| Driver → pickup | ~0.10 km / tick | `en_route` |
| Pickup → drop | ~0.14 km / tick | `on_trip` |

Client interpolates marker motion with ~4.8 s CSS transform so motion looks continuous between ticks.

---

## 10. API surface (routing)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/route/preview` | Bundle: up to 3 routes + conditions (no ride) |
| POST | `/api/ride/{id}/select-route` | Driver chooses `route_id` |
| POST | `/api/ride/{id}/replan` | Force replan active leg |
| GET | `/api/admin/blockers` | List closures / events / congestion |
| POST | `/api/admin/blockers/{id}` | Toggle `{ "active": bool }` |
| POST | `/api/admin/traffic` | Set traffic level |
| POST | `/api/admin/auto-conditions` | Enable/disable live simulation |
| GET | `/api/admin/conditions` | Snapshot: traffic, auto, note, blockers |

### WebSocket additions

| Type | Payload |
|------|---------|
| `blockers_updated` | `{ blockers }` |
| `conditions_updated` | `{ traffic, note, blockers, auto }` |
| `ride_updated` | Includes `route_options_*`, `selected_route_id`, geometry |
| `driver_location` | May include `route_progress_index`, `remaining_km`, `heading` |

---

## 11. Complexity & performance (demo)

| Stage | Complexity / cost |
|-------|-------------------|
| OSRM calls | O(C) HTTP round-trips (C ≈ candidates; bounded by detour set) |
| Densify | O(V) vertices after sampling |
| Score | O(C × segments × blockers) for intersection tests |
| Diversity | O(K × C) with K ≤ 3 |
| Movement tick | O(step / spacing) per active ride |

**Latency note:** Accept path may take hundreds of ms–a few seconds when OSRM is cold or many detours are requested. Matching itself stays Haversine-fast; routing is async after accept.

**Production target:** sub-100 ms p99 from a co-located routing cache or vendor SLA (Mapbox / Google / in-house graph).

---

## 12. File map

| File | Role |
|------|------|
| `server/routing.py` | plan_routes, plan_route, densify, score, advance, blockers seed |
| `server/location_service.py` | Haversine, traffic factors, step scaling, ETA |
| `server/app.py` | ensure_route, movement loop, live conditions, select/replan APIs |
| `server/state.py` | Ride route fields, blocker store |
| `client/.../DriverPanel.tsx` | Route picker UI |
| `client/.../MapView.tsx` | Selected + alternate polylines, blocker circles |

---

## 13. Future scope (routing & optimization)

### 13.1 Near-term (productization)

| Item | Description |
|------|-------------|
| Vendor routing SLA | Mapbox Directions / Google Routes / HERE with contract SLAs |
| Traffic tiles | Live speed profiles per road segment (not single city scalar) |
| Turn-by-turn | Maneuver list for driver nav app (not just polyline) |
| Toll / prefer highways | User preferences as soft constraints |
| EV range / charging | Feasible path filter for electric fleets |
| Route caching | Redis: OD + conditions hash → geometry + ETA |
| A/B ranking weights | Tunable W_DURATION / W_DISTANCE / W_BLOCKER per city |

### 13.2 Graph & algorithms

| Item | Description |
|------|-------------|
| Own road graph | OSM extract → contracted hierarchy (CH) / custom Dijkstra |
| Multi-modal | Walk + transit last mile for hybrid products |
| Time-dependent shortest path | FIFO networks with historical speed curves |
| k-shortest / Yen’s | Principled alternatives vs. via-point heuristics |
| Pareto front | Explicit time–distance–risk non-dominated set |
| Risk-aware routing | Crime, flood, incident heatmaps as edge weights |
| Convoy / fleet constraints | Shared corridors for batch dispatch |

### 13.3 Learning systems

| Item | Description |
|------|-------------|
| ETA residual model | Predict OSRM error from weather, events, daypart |
| Preference learning | Per-driver route choice model (highway vs local) |
| Dynamic re-ranking | Mid-trip “better route available” push with regret bounds |
| Causal event impact | Estimate delay from event type using historical trips |
| RL for replan policy | When to replan vs. stay (stability vs. savings) |

### 13.4 Live ops & safety

| Item | Description |
|------|-------------|
| Authority feeds | City traffic police / Waze-class incident ingestion |
| Geofenced closures | Temporary polygons with start/end validity windows |
| Two-way radio / SOS reroute | Instant hard-closure injection + broadcast |
| Accessibility | Avoid stairs/steps for wheelchair-capable products |
| Compliance | Restricted zones, airport queue lanes, odd-even rules |

### 13.5 Platform scale

| Item | Description |
|------|-------------|
| City shards | Graph and cache per metro |
| Edge compute | Precompute popular OD matrices for peak hours |
| Streaming updates | Kafka `road-conditions` → partial route invalidation |
| Observability | p50/p99 plan latency, replan rate, switch rate, hard-hit rate |
| Offline maps | On-device fallback for driver app |

### 13.6 Product UX

| Item | Description |
|------|-------------|
| Passenger route preview | Show top-3 before request with fare delta |
| Fare by route | Distance/time differ → transparent pricing per option |
| Share ETA deep-link | Live remaining polyline for friends/family |
| Voice / HUD | “Take option 2 — saves 4 minutes” |

---

## 14. Related algorithms (matching)

Driver **allocation** (who gets the trip) is separate from **routing** (how the car goes). See:

- **PRD.md** §9 — multi-factor ranking (ETA, distance, rating, accept, cancel, idle)
- **README.md** — short matching flowchart
- **`server/matching_engine.py`** — implementation

Together: matching optimizes **marketplace efficiency**; routing optimizes **path quality under live constraints**.
