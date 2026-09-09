# Product Requirements Document (PRD)
# ride Driver Allocation & Route Optimization — Production-Ready Spec

| Field | Value |
|-------|--------|
| **Product** | Ride Matching, Driver Allocation & Multi-Route Navigation |
| **Version** | 3.0 (Matching + routing delivered) |
| **Status** | Complete — implementation delivered |
| **Stack (demo)** | Python FastAPI · Next.js/Mapbox · WebSocket · in-memory store · OSRM |
| **Reference geo** | Munich, Germany |
| **Related** | [README.md](./README.md) · [docs/ROUTING.md](./docs/ROUTING.md) |

---

## 1. Problem Statement

When a passenger requests a ride, the platform must allocate the best available driver within a few hundred milliseconds while optimizing for:

- Low passenger waiting time  
- High driver utilization  
- Fair earnings distribution (idle-time fairness)  
- Minimal cancellations  
- ETA accuracy  
- Surge-aware pricing  
- Horizontal scalability to high request volume  

---

## 2. Goals & Success Metrics

### 2.1 Primary KPIs

| KPI | Target | Demo measurement |
|-----|--------|------------------|
| Match latency | &lt; 300 ms | `match_latency_ms` on ride object |
| Driver acceptance | &gt; 90% path success | Sequential re-offer until accept |
| Average pickup ETA | &lt; 4 min (urban) | ETA from ranking |
| Ride cancellation | &lt; 3% (platform) | Cancel API + reject path |
| Driver utilization | &gt; 70% | Status distribution in admin stats |

### 2.2 Demo success metrics

| Metric | Target |
|--------|--------|
| Driver matched under 1 s | Yes |
| Ranking visible with score breakdown | Yes |
| ETA shown | Yes |
| Live status updates | WebSocket |
| Driver movement simulation | Yes — **5 s** ticks on road polyline |
| Up to 3 optimized routes | Yes — traffic / closures / events |
| Mid-ride route switch | Yes — driver select + replan |
| Live conditions automation | Yes — optional auto traffic & events |
| One-command run | `docker compose up` or `uvicorn` |

---

## 3. Personas & User Stories

### Passenger
- As a passenger, I request a ride with pickup, drop, and ride type so I get a matched driver quickly.  
- As a passenger, I see nearby ranked drivers and fare estimate before confirming.  
- As a passenger, I can cancel while searching / offered / early allocated.  
- As a passenger, I see ride timeline (requested → offered → accepted → en route → completed).  

### Driver
- As a driver, I go online/offline.  
- As a driver, I receive timed ride offers and can accept or reject.  
- As a driver, my location updates continuously (GPS simulation).  
- As a driver, I see up to three optimized routes (traffic, closures, events) and can choose one.  
- As a driver, I can switch routes or replan during en_route / on_trip.  

### Admin / Ops
- As an operator, I view fleet status, ride queue, allocation logs, and surge.  
- As an operator, I change traffic conditions and reset demo state.  
- As an operator, I toggle road closures, congestion, and events.  
- As an operator, I enable/disable automatic live conditions simulation.  

---

## 4. Functional Requirements

### 4.1 Passenger

| ID | Requirement | Priority |
|----|-------------|----------|
| P-01 | Request ride with pickup, destination, ride type, zone | P0 |
| P-02 | Select ride type: rideGo, rideX, ridePremier | P0 |
| P-03 | Cancel request / early ride | P0 |
| P-04 | View fare estimate with surge | P0 |
| P-05 | View ranked nearby drivers + score breakdown | P0 |
| P-06 | View match latency and ride timeline | P1 |

### 4.2 Driver

| ID | Requirement | Priority |
|----|-------------|----------|
| D-01 | Go online (available) / offline | P0 |
| D-02 | Accept ride offer | P0 |
| D-03 | Reject ride offer | P0 |
| D-04 | Offer timeout auto-releases reservation | P0 |
| D-05 | Simulated GPS updates every ~2 s (idle) / ~5 s (on route) | P1 |
| D-06 | Auto navigation pickup → drop after accept along optimized path | P0 |
| D-07 | View up to 3 labeled route options for active leg | P0 |
| D-08 | Select any route option during en_route / on_trip | P0 |
| D-09 | Request replan from current GPS under live conditions | P1 |

### 4.3 System

| ID | Requirement | Priority |
|----|-------------|----------|
| S-01 | Find nearby drivers by radius + status | P0 |
| S-02 | Rank by weighted multi-factor score | P0 |
| S-03 | Allocate best driver with reservation lock | P0 |
| S-04 | Retry next driver on reject/timeout (max 5) | P0 |
| S-05 | Surge from demand/supply | P0 |
| S-06 | Traffic factor affects ETA and movement speed | P0 |
| S-07 | Idempotent ride create (optional key) | P1 |
| S-08 | Allocation decision audit log | P1 |
| S-09 | WebSocket broadcast of core events | P0 |
| S-10 | Health and admin stats endpoints | P1 |
| S-11 | Multi-route optimization (≤3) with road geometry | P0 |
| S-12 | Account for closures, events, congestion in route cost | P0 |
| S-13 | Live conditions loop (auto traffic/events) with replan | P1 |
| S-14 | Admin blocker + auto-conditions controls | P1 |

---

## 5. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| Latency | Matching path p99 &lt; 300 ms for demo fleet size |
| Availability | Stateless API processes; demo is single-node |
| Consistency | Reservation uses mutual exclusion (lock) so one driver → one offer |
| Security (prod) | AuthN/AuthZ, rate limits, TLS — out of demo scope; listed in §18 |
| Observability | Timeline events + allocation logs + latency field |
| Portability | Docker image + compose for one-command deploy |

---

## 6. High-Level Architecture

```
Passenger / Driver / Admin UI (static SPA)
              |
         API Gateway (FastAPI)
              |
     ┌────────┴────────┐
     |  Ride Service   |
     |  Matching Engine|
     └────────┬────────┘
              |
  ┌───────────┼───────────┐
  | Location  | Pricing   | ETA/Traffic
  | Driver    | State     | Notifications (WS)
  └───────────┴───────────┘
```

### Production mapping (reference)

| Demo component | Production analogue |
|----------------|---------------------|
| In-memory dict | Redis (location, locks) + Postgres (trips, profiles) |
| Background asyncio loops | Kafka consumers + workers |
| Haversine (matching ETA) | Segment-level ETA service |
| OSRM public + heuristics | Mapbox/Google/HERE or own CH graph + SLA |
| Scalar traffic level | Live speed tiles / probe data |
| Static blocker list | Authority + crowd incident feeds |
| Weighted match score | Learning-to-rank / ML ranker |
| Single process WS | Gateway + pub/sub fanout |

---

## 7. Microservices (logical)

| Service | Responsibility |
|---------|----------------|
| **Ride Service** | Lifecycle: searching → offered → allocated → en_route → on_trip → completed / cancelled |
| **Driver Service** | Profile, status, vehicle, acceptance metrics |
| **Location Service** | Lat/lon/heading/speed; nearby search; movement ticks |
| **Routing Service** | Multi-route plan, densify, diversity, select/replan (`routing.py`) |
| **Conditions Service** | Traffic, closures, events, congestion; auto loop |
| **ETA Service** | Distance → time with traffic factor (match + route) |
| **Pricing Service** | Base, distance, time, min fare, surge |
| **Matching Engine** | Filter → score → rank → reserve → offer → retry |
| **Notification** | WebSocket (demo); push/SMS in production |

---

## 8. Driver State Machine

```
offline ⇄ available → reserved → accepted → en_route → on_trip → available
                ↑         | reject/timeout
                └─────────┘
```

| State | Meaning |
|-------|---------|
| `offline` | Not matching |
| `available` | Eligible for offers |
| `reserved` | Soft-locked for offer TTL |
| `accepted` / `en_route` | Committed to pickup |
| `on_trip` | Passenger aboard |
| `busy` (legacy) | Treated as non-available |

---

## 9. Allocation Pipeline

```
Ride Request
  → Fetch nearby drivers (zone radius)
  → Filter unavailable / stale GPS
  → Optional vehicle-type filter (fallback all)
  → Calculate distance + traffic-aware ETA
  → Normalize metrics → weighted score
  → Rank descending
  → Reserve #1 (TTL 15s)
  → Offer (timeout 10s)
  → Accepted? → Allocate
  → No → next candidate (max 5)
  → Exhausted → status no_drivers
```

### 9.1 Candidate search radius

| Zone | Radius |
|------|--------|
| Urban | 2 km |
| Suburban | 5 km |
| Airport | 8 km |

Geo indexing (production): GeoHash or H3. Demo: O(n) Haversine over fleet.

### 9.2 Ranking weights

| Factor | Weight | Direction |
|--------|--------|-----------|
| ETA | 35% | Lower better |
| Distance | 20% | Lower better |
| Driver rating | 15% | Higher better |
| Acceptance rate | 10% | Higher better |
| Cancellation rate | 10% | Lower better |
| Idle time | 10% | Higher better (fairness) |

### 9.3 Score formula

```
Score =
  0.35 × ETA_score
+ 0.20 × Distance_score
+ 0.15 × Rating_score
+ 0.10 × Acceptance_score
+ 0.10 × Cancellation_score
+ 0.10 × Idle_score
```

Each metric is min-max normalized to **[0, 1]** within the candidate set for that request.

### 9.4 Offer policy

| Parameter | Value |
|-----------|-------|
| Max retries | 5 |
| Offer timeout | 10 seconds |
| Reservation TTL | 15 seconds |

---

## 9A. Route Finding & Optimization

> **Authoritative algorithm doc:** [docs/ROUTING.md](./docs/ROUTING.md)  
> This section is the PRD-level summary for product and eng alignment.

### 9A.1 Objectives

1. Produce **road-following** paths (not straight-line only).  
2. Optimize under **traffic**, **road closures**, **events**, and **congestion**.  
3. Surface up to **three** distinct, labeled alternatives.  
4. Allow the **driver to select or switch** routes during the ride.  
5. **Replan** when live conditions change or the driver requests it.  

### 9A.2 Pipeline (summary)

```
OD + live conditions
  → Candidates: OSRM (+alternatives) · detour vias · diversity vias · fallback
  → Densify (~40 m)
  → Cost = 0.55×(duration×traffic)/15 + 0.25×(distance)/5 + 0.20×blocker_term
  → Sort: hard_hit first key, then cost
  → Greedy diversity → ≤3 routes
  → Labels: Recommended / Fastest / Shortest / Avoids events
  → Default select rank-1; driver may override
```

### 9A.3 Constraint classes

| Class | Types | Behavior |
|-------|-------|----------|
| Hard | `closure`, `event` | Prefer zero intersection; detour vias; hard_hit sort key |
| Soft | `congestion`, traffic level | Cost / ETA / step scaling |

### 9A.4 Cost weights (routing)

| Factor | Weight |
|--------|--------|
| Traffic-adjusted duration | 55% |
| Path distance | 25% |
| Blocker / event penalty | 20% |

### 9A.5 Navigation simulation

| Parameter | Value |
|-----------|-------|
| Location tick | **5 seconds** |
| Step en_route | ~0.10 km / tick (÷ traffic factor) |
| Step on_trip | ~0.14 km / tick (÷ traffic factor) |
| Mid-switch snap | Nearest vertex on newly selected polyline |

### 9A.6 Live conditions

- Manual: admin traffic + blocker toggles.  
- Automatic (`auto_conditions`): ~40 s loop drifts traffic, toggles auto events, adjusts congestion severity, **force-replans** active rides.  

### 9A.7 Future scope (routing)

See **[docs/ROUTING.md §13](./docs/ROUTING.md#13-future-scope-routing--optimization)** for the full roadmap:

| Horizon | Themes |
|---------|--------|
| Near-term | Vendor SLA, segment traffic, turn-by-turn, tolls, EV, route cache |
| Algorithms | Own CH graph, k-shortest / Yen, time-dependent SP, Pareto fronts |
| Learning | ETA residual models, preference learning, RL replan policy |
| Ops | Authority feeds, geofenced validity windows, restricted zones |
| Scale | City shards, OD matrices, Kafka condition streams, SLOs |
| UX | Passenger preview, fare-by-route, shareable live ETA |

---

## 10. Concurrency & Locking

Prevent double allocation:

```
Ride Request
  → Reserve driver (SET NX EX style / mutex)
  → Accepted? Confirm : Release
```

Demo: thread-safe `reserve_driver` with expiry.  
Production: Redis `SET key NX EX`, or transactional compare-and-set.

---

## 11. Failure Handling

| Failure | Handling |
|---------|----------|
| Driver offline | Skip candidate |
| Driver timeout | Release lock → next driver |
| Driver reject | Release lock → next driver |
| GPS stale (&gt;15 s) | Exclude (when timestamps enforced) |
| ETA / OSRM down | Geometric curved fallback path; matching still Haversine |
| All routes hard-hit | Prefer lowest cost among hits; fallback detour arc |
| Duplicate request | Idempotency key on create |
| Notification failure | Client WS reconnect + REST poll |
| No drivers | `no_drivers` terminal status |
| Invalid route_id select | 404 — option not in phase options |

---

## 12. Pricing

### 12.1 Ride types (EUR demo rates)

| Type | Base | Per km | Per min | Min fare |
|------|------|--------|---------|----------|
| rideGo | 3.5 | 1.15 | 0.25 | 6 |
| rideX | 5.0 | 1.50 | 0.30 | 8 |
| ridePremier | 8.0 | 2.00 | 0.40 | 12 |

### 12.2 Surge

Derived from `pending_requests / available_drivers`, capped **1.0x–3.0x**, with slight airport premium.

```
total = max((base + dist_fare + time_fare) × surge, min_fare × surge)
```

---

## 13. Data Model

### Driver

| Field | Type | Notes |
|-------|------|-------|
| id | string | e.g. D101 |
| name | string | |
| latitude, longitude | float | |
| rating | float | 0–5 |
| acceptance_rate | float | 0–1 |
| cancellation_rate | float | 0–1 |
| idle_minutes | float | Fairness feature |
| status | enum | See state machine |
| vehicle | string | rideGo / rideX / ridePremier |
| vehicle_number | string | |
| heading, speed | float | |
| last_update | timestamp | Staleness |
| reserved_until | timestamp | Lock |
| current_ride_id | string | |

### Ride

| Field | Type | Notes |
|-------|------|-------|
| id | string | RXXXXXX |
| passenger | string | |
| pickup_lat/lon | float | |
| destination_lat/lon | float | |
| ride_type | string | |
| status | enum | searching, offered, allocated, en_route, on_trip, completed, cancelled, no_drivers |
| driver_id / driver_name | string | |
| eta_minutes, distance_km | float | To pickup |
| fare | object | Breakdown |
| ranked_candidates | array | Snapshot |
| offer_attempts | array | Audit |
| retry_count / max_retries | int | |
| timeline | array | Events |
| match_latency_ms | float | KPI |
| idempotency_key | string | Optional |
| offer_expires_at | timestamp | |
| route_to_pickup | object | Selected approach geometry + metrics |
| route_to_destination | object | Selected trip geometry + metrics |
| route_options_pickup | array | Up to 3 approach alternatives |
| route_options_destination | array | Up to 3 trip alternatives |
| selected_route_id | string | e.g. `opt_1` |
| route_conditions | object | Traffic + active blockers snapshot |
| active_route | enum | `to_pickup` \| `to_destination` |
| route_progress_index | int | Vertex index on densified polyline |

### Blocker / event

| Field | Type | Notes |
|-------|------|-------|
| id | string | e.g. BLK_ENGLISCHER |
| name | string | Display |
| type | enum | `closure` \| `event` \| `congestion` |
| lat, lon | float | Center |
| radius_km | float | Influence radius |
| severity | float | Soft cost multiplier |
| active | bool | In effect |
| auto | bool | Managed by live conditions loop |
| description | string | Ops note |

---

## 14. API Specification

### POST `/api/ride/request`

```json
{
  "passenger": "John",
  "pickup": [48.1374, 11.5755],
  "destination": [48.1620, 11.5865],
  "ride_type": "rideGo",
  "zone": "urban",
  "idempotency_key": "optional-uuid"
}
```

### POST `/api/ride/respond`

```json
{ "ride_id": "R1A2B3C", "accepted": true }
```

### GET `/api/drivers/nearby?lat=&lon=&ride_type=&zone=`

Returns ranked list with `score`, `eta`, `breakdown`.

### POST `/api/route/preview`

```json
{ "origin": [48.1374, 11.5755], "destination": [48.1620, 11.5865] }
```

Returns `{ routes: [...≤3], selected, conditions, alternatives_considered }`.

### POST `/api/ride/{id}/select-route`

```json
{ "route_id": "opt_2", "phase": "to_destination" }
```

### POST `/api/ride/{id}/replan`

Recomputes options from current driver GPS for the active leg.

### Admin routing / conditions

| Method | Path | Body |
|--------|------|------|
| GET | `/api/admin/blockers` | — |
| POST | `/api/admin/blockers/{id}` | `{ "active": true }` |
| POST | `/api/admin/traffic` | `{ "traffic": "high" }` |
| GET | `/api/admin/conditions` | — |
| POST | `/api/admin/auto-conditions` | `{ "enabled": true }` |

### WebSocket `/ws` events

| Type | Payload |
|------|---------|
| `snapshot` | drivers, rides, blockers, stats |
| `driver_location` | id, lat, lon, status, heading?, progress? |
| `driver_status` | id, status |
| `ride_created` / `ride_updated` / `ride_allocated` / `ride_completed` | ride (+ routes) |
| `ride_offer` | ride, driver_id, timeout, score |
| `traffic_updated` | traffic |
| `blockers_updated` | blockers |
| `conditions_updated` | traffic, note, blockers, auto |
| `system` | message |

Full path list: see [README.md](./README.md).

---

## 15. Sequence (happy path)

```
Passenger → POST /ride/request
API → Matching Engine → rank drivers
API → reserve D101 → status offered
WS → Driver UI offer popup
Driver → POST /ride/respond accepted=true
API → plan_routes(to_pickup) + plan_routes(to_destination)  // ≤3 each
API → status allocated; WS ride_allocated (options + selected)
Driver UI → shows route picker; optional select-route / replan
trip_movement_loop → every 5s advance_along_route(selected)
  → en_route → on_trip (activate destination options)
  → completed
Live conditions loop → may force replan mid-trip
WS → Passenger + Admin updates
```

---

## 16. Scalability (production blueprint)

| Concern | Approach |
|---------|----------|
| Event bus | Kafka: `driver-location`, `ride-request`, `ride-events`, `road-conditions`, `notifications` |
| Cache | Redis: nearby sets, availability, surge, ETA cache, route cache, locks |
| System of record | PostgreSQL: trips, profiles, payments, route audits |
| Real-time geo | Redis GEO / H3 cells / tile-based sharding |
| Matching workers | Partition by city/geo cell |
| Routing workers | Graph shards per metro; CH precompute; vendor failover |
| Conditions | Stream processors for incidents → partial invalidation |
| Notifications | Push gateway + WS edge nodes |

---

## 17. ML & Algorithm Enhancements (future)

### 17.1 Matching (who gets the trip)

Replace static weights with a learned ranker using:

- Historical acceptance probability  
- Predicted pickup time (routing-aware)  
- Traffic / weather  
- Local demand/supply ratio  
- Driver area familiarity  
- Passenger cancellation likelihood  
- Earnings balancing constraints  

Output: P(successful efficient completion) as rank score, with exploration for fairness.

### 17.2 Routing (how the car goes)

See also [docs/ROUTING.md §13](./docs/ROUTING.md#13-future-scope-routing--optimization).

| Theme | Direction |
|-------|-----------|
| Graph | Own OSM-based contracted hierarchy; time-dependent edge costs |
| Alternatives | Yen k-shortest / Pareto (time–distance–risk) instead of via heuristics |
| ETA | Residual models on top of map engine; daypart + weather features |
| Preference | Per-driver route choice (highway vs local) from historical selects |
| Replan policy | RL / bandit: when to push “better route” vs. path stability |
| Risk | Incident heatmaps, flood, accessibility as edge attributes |
| Ops | Authority + crowd feeds with validity windows |

### 17.3 Joint marketplace + navigation

- Match with **routing-aware pickup ETA** (not Haversine-only).  
- **Batch / pool** matching with shared corridor optimization.  
- **Dynamic pricing by route option** (passenger-visible tradeoffs).  

---

## 18. Production Readiness Checklist

### Delivered in this repo (demo-prod)

- [x] End-to-end matching with ranked scoring  
- [x] Reservation + timeout + multi-retry  
- [x] Pricing + surge  
- [x] REST + WebSocket  
- [x] Passenger / Driver / Admin UX  
- [x] Live map + movement simulation (5 s route following)  
- [x] Multi-route optimization (≤3) with traffic & blockers  
- [x] Driver route select + replan mid-ride  
- [x] Live conditions automation (traffic / events)  
- [x] Allocation audit logs  
- [x] Match latency instrumentation  
- [x] Docker + compose  
- [x] README + this PRD + [docs/ROUTING.md](./docs/ROUTING.md)  

### Required before real production traffic

- [ ] Authentication & authorization (JWT / session)  
- [ ] TLS termination and secrets management  
- [ ] Rate limiting and abuse protection  
- [ ] Persistent DB + migrations  
- [ ] Redis for locks, geo, and route cache  
- [ ] Routing provider SLA or self-hosted graph with HA  
- [ ] Segment-level live traffic (not city scalar only)  
- [ ] Incident / authority feed integration  
- [ ] PCI / payment integration  
- [ ] PII encryption and retention policy  
- [ ] Multi-region failover  
- [ ] SLOs, metrics (Prometheus), tracing (OTLP) — include route plan p99  
- [ ] Load tests at city-scale QPS  
- [ ] Legal/compliance (transport regulations)  

---

## 19. Sample Seed Data

Eight drivers around Marienplatz / central Munich (`server/data/drivers.json`), mixed vehicles and metrics. Default passenger corridor: Marienplatz → Schwabing.

### Worked ranking example (illustrative)

| Driver | ETA | Dist | Rating | Accept | Cancel | Idle | Role |
|--------|-----|------|--------|--------|--------|------|------|
| D101 | 3 | 1.2 | 4.9 | 98% | 2% | 10 | Strong all-rounder |
| D102 | 2 | 0.8 | 4.7 | 92% | 1% | 4 | Best ETA |
| D103 | 5 | 2.5 | 5.0 | 99% | 0% | 20 | Best fairness/rating |

Exact winner depends on candidate set normalization at request time (shown live in UI).

---

## 20. Test Plan (manual / API)

1. **Health** — `GET /api/health` → 200  
2. **Nearby** — `GET /api/drivers/nearby` returns sorted scores  
3. **Match** — request ride → status `offered` with `driver_id`  
4. **Reject chain** — reject → next driver offered  
5. **Accept** — accept → `allocated` → `route_options_*` length 1–3  
6. **Route preview** — `POST /api/route/preview` returns labeled routes + conditions  
7. **Select route** — `select-route` with `opt_2` → `selected_route_id` updates; marker follows new path  
8. **Replan** — change traffic/blocker → `replan` or wait auto loop → options refresh  
9. **Movement** — location updates ~every 5 s along polyline (not straight line only)  
10. **Timeout** — do not respond 10s → re-offer  
11. **Cancel** — passenger cancel releases driver  
12. **Offline** — set driver offline → not in nearby  
13. **Surge** — reduce available drivers / stack requests → surge ≥ 1  
14. **Reset** — admin reset restores seed fleet + default blockers  

---

## 21. Out of Scope (explicit)

- Real payments and invoices  
- Government IDs / KYC  
- Multi-stop trips / pool matching  
- Native iOS/Android apps  
- True multi-city sharding  
- Turn-by-turn voice navigation UI  
- Production map-provider SLA contracts  
- Legal enforcement of road restrictions (demo constraints only)  

---

## 22. Document index

| Document | Audience | Contents |
|----------|----------|----------|
| [README.md](./README.md) | Engineers / demo runners | Setup, API table, short algorithms |
| [PRD.md](./PRD.md) | Product + eng | Requirements, matching, pricing, checklist |
| [docs/ROUTING.md](./docs/ROUTING.md) | Routing eng | Full route algorithms, costs, future scope |
| [prd.txt](./prd.txt) | Historical | Original short brief |

---

## 22. Deliverables

| Deliverable | Location |
|-------------|----------|
| Backend | `server/` |
| Frontend | `client/` |
| Seed data | `server/data/drivers.json` |
| Containerization | `Dockerfile`, `docker-compose.yml` |
| Ops docs | `README.md` |
| This PRD | `PRD.md` |
| Original notes | `prd.txt` |

---

## 23. Approval

This PRD and the accompanying implementation are **complete for demo production-ready delivery**. No further product approval is required to run, demo, or extend the system within the documented scope.

**Version:** 2.0  
**Date:** 2026-08-06  
**State:** Approved by implementation (shipped)
