# Ride Match App

Production-style demonstration of a ride-hailing **driver allocation / matching engine** plus **multi-route optimization** (traffic, closures, events), with a live map UI, REST APIs, and WebSocket updates.

| | |
|--|--|
| **Reference city** | Munich, Germany |
| **Backend** | Python FastAPI · asyncio sims · in-memory state |
| **Frontend** | Next.js · Mapbox GL · Framer Motion · Zustand |
| **Docs** | [PRD.md](./PRD.md) · [docs/ROUTING.md](./docs/ROUTING.md) · [prd.txt](./prd.txt) (original brief) |

---

## Features

| Area | Capability |
|------|------------|
| **Matching** | Geo radius search, multi-factor ranking, sequential offer + retry |
| **Scoring** | ETA 35% · Distance 20% · Rating 15% · Accept 10% · Cancel 10% · Idle 10% |
| **Concurrency** | Atomic driver reservation with TTL (lock simulation) |
| **Failures** | Timeout → next driver, reject → next, max 5 retries, GPS staleness |
| **Pricing** | Base + distance + time + surge (demand/supply) |
| **Routing** | OSRM road geometry, up to **3 optimized alternatives**, mid-ride switch |
| **Constraints** | Traffic levels, road closures, events, congestion zones |
| **Live world** | Auto traffic/event simulation; replan active trips on change |
| **Navigation sim** | Location ticks every **5 s** along selected polyline |
| **Realtime** | WebSocket: GPS, offers, status, routes, blockers, conditions |
| **UI** | Passenger (GPS origin, address autofill, max 2 stops) · Driver routes · Admin · light/dark · mobile + desktop |
| **Deploy** | Next.js on Vercel + API elsewhere — see [docs/DEPLOY.md](./docs/DEPLOY.md) |
| **Multi-ride** | Concurrent ride requests; select which ride to focus on the map |
| **Live share** | Per-ride tracking link (`/track/{token}`) via Email / WhatsApp / copy |

---

## Quick start

### 1 — Backend (FastAPI)

```bash
cd server
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS/Linux
# source .venv/bin/activate

pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

Backend REST + WebSocket API: **http://localhost:8000**.

Docker: `docker compose up --build` (same port).

### 2 — Client (Next.js)

```bash
cd client
npm install
cp .env.local.example .env.local   # set NEXT_PUBLIC_MAPBOX_TOKEN
npm run dev
```

Open **http://localhost:3000**.

`client/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_mapbox_public_token   # https://account.mapbox.com/access-tokens
```

Without a Mapbox token the app still runs (matching, offers, admin); the map pane shows a placeholder.

> Legacy Leaflet UI: `client-legacy/` (reference only; not served by the backend).

---

## Demo flow

1. **Passenger** → **Use my location** (permission) or type addresses → optional **up to 2 stops** (fare re-estimates) → **Request Ride**
2. Inspect ranked drivers + score breakdown + fare
3. **Driver** → select offered driver → **Accept**
4. System plans **up to 3 routes** (pickup leg + trip leg) under traffic & blockers
5. Driver panel: pick **Recommended / Fastest / Shortest / …**; switch anytime mid-ride
6. Car advances every **5 s** along the selected path → pickup → trip → complete
7. **Admin** → traffic, auto conditions, blockers/events, allocation logs, reset

---

## Algorithms (overview)

### A — Driver matching

```
Ride Request
  → Search radius (urban 2km / suburban 5km / airport 8km)
  → Filter available + fresh GPS
  → ETA from distance × traffic factor
  → Normalize metrics 0–1 within candidate set
  → Weighted score rank
  → Reserve top driver (TTL 15s)
  → Offer (timeout 10s)
  → Accept → allocate | Reject/timeout → next (max 5)
```

Full ranking weights and failure modes: **[PRD.md](./PRD.md)**.

### B — Route finding & optimization

```
Origin → Destination + live conditions (traffic, closures, events, congestion)
  → Generate candidates (OSRM alts + detour vias + diversity vias)
  → Densify polyline (~40 m)
  → Score: 0.55×traffic-time + 0.25×distance + 0.20×blocker cost
  → Prefer hard-hit=false, then lowest cost
  → Greedy diversity pick → up to 3 options
  → Labels: Recommended / Fastest / Shortest / Avoids events
  → Driver selects or auto-replans when conditions change
  → Movement: advance_along_route every 5s
```

**Full specification, formulas, APIs, and future scope:** **[docs/ROUTING.md](./docs/ROUTING.md)**.

| Constraint | Class | Effect |
|------------|-------|--------|
| Traffic level | Soft | Scales ETA & step speed |
| Congestion zone | Soft | Cost penalty by depth × severity |
| Road closure | Hard | Detour required when possible |
| Live event | Hard | Same as closure (parade, temporary block) |

---

## API summary

### Matching & rides

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health + counts |
| GET | `/api/drivers` | All drivers |
| GET | `/api/drivers/nearby?lat=&lon=` | Ranked nearby candidates |
| POST | `/api/ride/request` | Create ride + start matching |
| POST | `/api/ride/respond` | `{ride_id, accepted}` |
| GET | `/api/ride/{id}` | Ride detail + timeline + routes |
| GET | `/api/rides` | All rides |
| POST | `/api/ride/{id}/cancel` | Cancel ride |
| POST | `/api/drivers/{id}/status` | online / offline |
| POST | `/api/drivers/{id}/location` | GPS update |
| GET | `/api/pricing/estimate` | Fare estimate |

### Routing & live conditions

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/route/preview` | Up to 3 optimized routes + conditions |
| POST | `/api/ride/{id}/select-route` | `{ "route_id": "opt_2", "phase"? }` |
| POST | `/api/ride/{id}/replan` | Replan from current driver GPS |
| GET | `/api/admin/blockers` | Closures / events / congestion |
| POST | `/api/admin/blockers/{id}` | `{ "active": true\|false }` |
| POST | `/api/admin/traffic` | Set traffic level |
| GET | `/api/admin/conditions` | Traffic + auto + note + blockers |
| POST | `/api/admin/auto-conditions` | `{ "enabled": true\|false }` |
| GET | `/api/admin/logs` | Allocation decision logs |
| GET | `/api/admin/stats` | KPIs / surge / latency |
| POST | `/api/admin/reset` | Reset demo state |
| WS | `/ws` | Live events |

### Example — request ride

```bash
curl -X POST http://localhost:8000/api/ride/request \ride
  -H "Content-Type: application/json" \
  -d "{\"passenger\":\"John\",\"pickup\":[48.1374,11.5755],\"destination\":[48.1620,11.5865],\"ride_type\":\"rideGo\"}"
```

### Example — switch route mid-ride

```bash
curl -X POST http://localhost:8000/api/ride/RXXXXXX/select-route \
  -H "Content-Type: application/json" \
  -d "{\"route_id\":\"opt_2\"}"
```

### Example — preview three routes

```bash
curl -X POST http://localhost:8000/api/route/preview \
  -H "Content-Type: application/json" \
  -d "{\"origin\":[48.1374,11.5755],\"destination\":[48.1620,11.5865]}"
```

---

## Project structure
ride
```
ride-alg/
├── client/                       # Next.js (TS, Tailwind, Mapbox, Framer Motion)
│   ├── src/app/
│   ├── src/components/
│   │   ├── map/                  # MapView, DriverMarker, route/blocker layers
│   │   ├── panels/               # Passenger / Driver / Admin
│   │   └── ui/
│   └── src/lib/                  # api, realtime, store, types
├── client-legacy/                # Old Leaflet SPA (reference)
├── server/
│   ├── app.py                    # FastAPI, WS, movement + live conditions loops
│   ├── matching_engine.py        # Rank / score / offer policy
│   ├── routing.py                # Multi-route plan, score, densify, advance
│   ├── location_service.py       # Haversine, ETA, traffic factors
│   ├── pricing.py
│   ├── state.py                  # In-memory store, blockers, ride routes
│   ├── data/drivers.json
│   └── requirements.txt
├── docs/
│   └── ROUTING.md                # Route finding & optimization (full)
├── docker-compose.yml
├── Dockerfile
├── prd.txt                       # Original product requirements brief
├── PRD.md                        # Full product / system PRD
└── README.md                     # This file
```

---

## KPIs (demo targets)

| KPI | Target |
|-----|--------|
| Match latency | &lt; 300 ms (local demo typically &lt; 50 ms) |
| Driver acceptance path | Sequential re-offer |
| Route options | Up to 3 labeled alternatives when available |
| Pickup / trip navigation | 5 s ticks on optimized polyline |
| Live conditions | Traffic + blockers factored into cost |
| Cancellation handling | Passenger cancel + driver reject |
| Live updates | WebSocket |

---

## Deploy (Render API + Vercel client)

Full guide: **[docs/DEPLOY.md](./docs/DEPLOY.md)**.

| Service | Platform | Root |
|---------|----------|------|
| FastAPI + WebSocket | **Render** (`render.yaml`) | `server/` |
| Next.js UI | **Vercel** | `client/` |

**Render:** New → Blueprint (or Web Service) → root `server` → start  
`uvicorn app:app --host 0.0.0.0 --port $PORT --workers 1`

**Vercel:** Import repo → Root Directory **`client`** → env:

```
NEXT_PUBLIC_API_URL=https://ridematch-app.onrender.com
NEXT_PUBLIC_WS_URL=wss://ridematch-app.onrender.com/ws
NEXT_PUBLIC_MAPBOX_TOKEN=pk....
```

**Dev vs prod (automatic):**

| | Dev (`npm run dev`) | Prod (Vercel) |
|--|---------------------|---------------|
| API | `http://localhost:8000` | `https://ridematch-app.onrender.com` |
| WS | `ws://localhost:8000/ws` | `wss://ridematch-app.onrender.com/ws` |

Files: `client/.env.development` · `client/.env.production` · secrets in `.env.local`

---

## Documentation map

| Doc | Contents |
|-----|----------|
| [README.md](./README.md) | Runbook, features, API cheat sheet, short algorithms |
| [docs/DEPLOY.md](./docs/DEPLOY.md) | **Vercel + API production deploy** |
| [PRD.md](./PRD.md) | Product requirements, matching, pricing, data model, production checklist |
| [docs/ROUTING.md](./docs/ROUTING.md) | Route generation, cost function, diversity, selection, future scope |
| [prd.txt](./prd.txt) | Original short requirements brief |

---

## Future scope (summary)

**Matching:** learning-to-rank, H3 geo index, Redis locks, multi-city shards.  
**Routing:** vendor SLA or own CH graph, live segment speeds, k-shortest / Pareto sets, turn-by-turn, toll/EV preferences, mid-trip ML replan, authority incident feeds.  

Details: **[docs/ROUTING.md §13](./docs/ROUTING.md#13-future-scope-routing--optimization)** and **[PRD.md §17–18](./PRD.md)**.

---

## License

Demo / educational use.
