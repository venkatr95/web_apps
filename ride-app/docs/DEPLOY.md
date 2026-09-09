# Deploy: Render (API) + Vercel (Client)

```
┌────────────────┐   HTTPS / WSS    ┌─────────────────────┐
│  Vercel        │ ───────────────▶ │  Render             │
│  Next.js       │                  │  FastAPI + WebSocket│
│  root: client/ │                  │  root: server/      │
└────────────────┘                  └─────────────────────┘
```

| Piece | Platform | Root dir |
|-------|----------|----------|
| Backend | [Render](https://render.com) | `server/` |
| Frontend | [Vercel](https://vercel.com) | `client/` |

---

## Prerequisites

1. GitHub (or GitLab) account — push this repo.  
2. [Render](https://dashboard.render.com) account.  
3. [Vercel](https://vercel.com) account.  
4. Mapbox public token: https://account.mapbox.com/access-tokens  

```bash
# From your machine (once)
cd d:\ai_proj\uber-alg
git init
git add .
git commit -m "RideMatch: ready for Render + Vercel"
# Create empty repo on GitHub, then:
git remote add origin https://github.com/<YOU>/<REPO>.git
git branch -M main
git push -u origin main
```

---

## Part A — Deploy API on Render

### A1. Blueprint (fastest)

1. Push repo to GitHub.  
2. Render Dashboard → **New** → **Blueprint**.  
3. Connect the repo.  
4. Render reads root [`render.yaml`](../render.yaml):
   - Service name: `ridematch-app`
   - Root: `server`
   - Start: `uvicorn app:app --host 0.0.0.0 --port $PORT --workers 1`
   - Health: `/api/health`
5. Click **Apply**.  
6. Wait until status is **Live**.  
7. Service URL (from `render.yaml` name `ridematch-app`):

```
https://ridematch-app.onrender.com
```

WebSocket URL:

```
wss://ridematch-app.onrender.com/ws
```

Client already points here via `client/.env.production` and `client/.env.local` (see also Vercel env vars).

### A2. Manual Web Service (no Blueprint)

1. **New** → **Web Service** → connect repo.  
2. Settings:

| Field | Value |
|-------|--------|
| Name | `ridematch-app` |
| Region | Frankfurt (or nearest) |
| Root Directory | `server` |
| Runtime | Python 3 |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn app:app --host 0.0.0.0 --port $PORT --workers 1` |
| Instance type | Free |

3. Advanced → Health Check Path: `/api/health`  
4. **Create Web Service**.

### A3. Verify API

```bash
curl https://ridematch-app.onrender.com/api/health
```

Expected: `{"status":"ok", ...}`

> **Free tier note:** Render spins down idle free services (~15 min). First request after sleep can take 30–60s. WebSockets work when the service is awake.

---

## Part B — Deploy client on Vercel

### B1. Dashboard

1. [vercel.com/new](https://vercel.com/new) → **Import** the same GitHub repo.  
2. **Configure Project:**

| Setting | Value |
|---------|--------|
| Framework Preset | Next.js |
| Root Directory | **`client`** ← important |
| Build Command | `npm run build` (default) |
| Output | Next.js default |

3. **Environment Variables** (Production + Preview + Development):

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_API_URL` | `https://ridematch-app.onrender.com` (**no** trailing `/`) |
| `NEXT_PUBLIC_WS_URL` | `wss://ridematch-app.onrender.com/ws` |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | `pk.…` your Mapbox token |

Same values are in `client/.env.production` for production builds.

4. **Deploy**.  
5. Open the Vercel URL, e.g. `https://uber-alg.vercel.app`.

### B2. CLI alternative

```bash
npm i -g vercel
cd client

vercel link
# Set root to client if linking monorepo

vercel env add NEXT_PUBLIC_API_URL production
# paste: https://ridematch-app.onrender.com

vercel env add NEXT_PUBLIC_WS_URL production
# paste: wss://ridematch-app.onrender.com/ws

vercel env add NEXT_PUBLIC_MAPBOX_TOKEN production
# paste: pk....

vercel --prod
```

Config file: [`client/vercel.json`](../client/vercel.json).

---

## Part C — Mapbox URL restrictions (recommended)

In Mapbox → Access tokens → your `pk` token → **URL restrictions**, add:

```
http://localhost:3000/*
https://*.vercel.app/*
https://your-custom-domain.com/*
```

---

## Part D — End-to-end checklist

| Step | OK? |
|------|-----|
| `GET /api/health` on Render returns 200 | |
| Vercel site loads | |
| Connection badge turns **Live** (WS) | |
| Map shows (Mapbox token) | |
| Use my location / address search works | |
| Request ride → accept as driver → car moves | |
| Light theme: left/bottom panel not black | |
| Mobile: Map button peels sheet down | |

---

## Updating after code changes

```bash
git add .
git commit -m "Your message"
git push origin main
```

- **Render** auto-redeploys if auto-deploy is on.  
- **Vercel** auto-redeploys production from `main`.

If you change the Render hostname, update Vercel env vars and redeploy the client.

---

## Dev vs prod URLs (automatic)

| Mode | Command / host | API | WebSocket |
|------|----------------|-----|-----------|
| **Dev** | `next dev` (localhost:3000) | `http://localhost:8000` | `ws://localhost:8000/ws` |
| **Prod** | Vercel build | `https://ridematch-app.onrender.com` | `wss://ridematch-app.onrender.com/ws` |

| File | Role |
|------|------|
| `client/.env.development` | Localhost API (auto for `npm run dev`) |
| `client/.env.production` | Render API (auto for Vercel / `next build`) |
| `client/.env.local` | Secrets only (Mapbox); optional overrides |
| `client/src/lib/config.ts` | Fallbacks if env vars missing |

Vercel: set the same production values in Project → Settings → Environment Variables  
(or rely on committed `.env.production` for `NEXT_PUBLIC_*` at build time).  
Always set `NEXT_PUBLIC_MAPBOX_TOKEN` in Vercel (not committed).

## Local development

```bash
# Terminal 1 — API (localhost)
cd server
uvicorn app:app --reload --port 8000

# Terminal 2 — client (uses .env.development → localhost)
cd client
# .env.local only needs Mapbox:
# NEXT_PUBLIC_MAPBOX_TOKEN=pk....
npm run dev
```

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Vercel build fails “module not found” | Root Directory must be `client` |
| WS never connects | Use `wss://` (not `ws://`) on HTTPS Vercel; check Render is awake |
| CORS errors | Server already allows `*`; confirm API URL has no trailing slash |
| Map blank | Missing `NEXT_PUBLIC_MAPBOX_TOKEN` on Vercel |
| API 502 on free tier | Cold start — wait 1 min, retry `/api/health` |
| Health check fails on Render | Path must be `/api/health`; start command uses `$PORT` |
| Location denied | HTTPS required (Vercel is fine); user must allow permission |

---

## Files used by deploy

| File | Purpose |
|------|---------|
| [`render.yaml`](../render.yaml) | Render Blueprint for API |
| [`server/runtime.txt`](../server/runtime.txt) | Python version |
| [`server/requirements.txt`](../server/requirements.txt) | Pip deps |
| [`client/vercel.json`](../client/vercel.json) | Vercel Next.js hints |
| [`client/.env.local.example`](../client/.env.local.example) | Env template |
