# Web Apps Portfolio

A collection of full-stack and frontend web applications covering e-commerce, authentication, AI tools, recipes, ride matching, chatbots, and UI clones. Each project lives in its own folder and can be run independently.

## Projects at a glance

| Folder | Project | Description | Stack |
|--------|---------|-------------|-------|
| [ShopIt](./ShopIt/) | ShopIt Pro | Production-ready e-commerce platform | Next.js 16, React 19, TypeScript, Tailwind, Sanity, Clerk, Stripe |
| [ride-app](./ride-app/) | Ride Match App | Ride-hailing matching engine with live map UI | FastAPI, Next.js, Mapbox, WebSockets |
| [recipe_website](./recipe_website/) | RecipeHub | Full-stack recipe sharing platform | Next.js 15, Prisma, PostgreSQL, NextAuth, Stripe, i18n |
| [resume-optimizer](./resume-optimizer/) | Resume Optimizer | AI resume builder / ATS optimizer | FastAPI, React + Vite, Firebase, Docker, OpenAI |
| [llm_exp](./llm_exp/) | UUID Form Filler Agent | AI form auto-fill from UUID lookup | FastAPI, React + Vite, SQLite, OpenAI |
| [chatbot-openai](./chatbot-openai/) | AI Chatbot | ChatGPT-style chatbot with auth & history | React, Node/Express, MongoDB, OpenAI, JWT |
| [auth_fullstack](./auth_fullstack/) | Role-Based Auth | Full-stack auth with roles, PIN, and admin panel | React + Vite, Express, MongoDB |
| [otp-auth](./otp-auth/) | OTP Authentication | Email OTP login with Redis cache + JWT | React (CRA), Express, MongoDB, Redis, Nodemailer |
| [react-apps](./react-apps/) | React Apps | Suite of UI clones and AI demos | React, TypeScript, Vite (+ backends where noted) |

---

## 1. ShopIt — ShopIt Pro

Complete e-commerce solution with product catalog, cart, wishlist, payments, admin/employee workflows, and CMS-backed content.

**Highlights**

- Product catalog with categories, brands, variants, and inventory
- Search, filters, sorting, and related-product recommendations
- Persistent cart, wishlist, Stripe / Clerk / COD payments
- Order tracking, admin dashboard, employee flows
- Sanity CMS, Firebase, email notifications, SEO tooling

**Quick start**

```bash
cd ShopIt
npm install
npm run dev
```

See [ShopIt/README.md](./ShopIt/README.md) and [ShopIt/docs/SETUP.md](./ShopIt/docs/SETUP.md) for full setup.

---

## 2. ride-app — Ride Match App

Production-style ride-hailing demo focused on **driver matching** and **multi-route optimization** (traffic, closures, events), with a live Mapbox UI and WebSocket updates. Reference city: Munich, Germany.

**Highlights**

- Geo radius search and multi-factor driver scoring (ETA, distance, rating, accept/cancel, idle)
- Sequential offer/retry with atomic reservation TTL; up to 5 retries
- Pricing with surge; OSRM routes with up to 3 alternatives and mid-ride switch
- Live traffic/event simulation and replan of active trips
- Passenger, driver, and admin UIs; multi-ride focus; live share links (`/track/{token}`)

**Quick start**

```bash
# Backend
cd ride-app/server
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000 --reload

# Frontend (new terminal)
cd ride-app/client
npm install
cp .env.local.example .env.local   # Mapbox + API URLs
npm run dev
```

Or: `docker compose up --build` from `ride-app/`.

- API: [http://localhost:8000](http://localhost:8000)
- UI: [http://localhost:3000](http://localhost:3000)

Docs: [ride-app/README.md](./ride-app/README.md) · [docs/ROUTING.md](./ride-app/docs/ROUTING.md) · [docs/DEPLOY.md](./ride-app/docs/DEPLOY.md).

---

## 3. recipe_website — RecipeHub

Production-quality recipe sharing platform with SSR, auth, collections, shopping lists, admin approval, billing, and multi-language support. Runs in **demo mode** without a database.

**Highlights**

- Recipe browse/search, wizard create/edit, favorites, collections, comments, follows
- Shopping lists, nutrition panel, servings adjuster, unit toggle, PDF/print/share
- NextAuth (credentials + OAuth), email verification, PIN login, admin pending-recipe approval
- Stripe billing; AI recipe generator page; i18n (en, de, es, hi, kn, ta, te)
- Jest unit tests + Playwright e2e; demo mode with in-memory sample data

**Quick start (demo mode — no DB)**

```bash
cd recipe_website
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Login: `demo@example.com` (any password).

**Full setup (PostgreSQL)**

```bash
cp .env.example .env   # set DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Docs: [recipe_website/README.md](./recipe_website/README.md) · [QUICKSTART](./recipe_website/docs/QUICKSTART.md) · [ARCHITECTURE](./recipe_website/docs/ARCHITECTURE.md) · [DEMO_MODE](./recipe_website/docs/DEMO_MODE.md).

---

## 4. resume-optimizer

AI-powered resume builder and ATS optimizer with a FastAPI backend (TF-IDF keyword matching + optional LLM) and a React + TypeScript frontend. Fully Dockerized.

**Highlights**

- Resume editor (personal info, experience, education, skills, summary)
- Job-description matching, keyword analysis, and LLM optimization (GPT-4)
- DOCX / PDF export; Firebase auth on the frontend
- Separate frontend/backend containers via Docker Compose

**Quick start**

```bash
cd resume-optimizer
# Set OPENAI_API_KEY in docker-compose.yml
docker-compose up --build
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

**Local development**

```bash
# Backend
cd resume-optimizer/backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
cd resume-optimizer/frontend
npm install
npm run dev
```

Details: [resume-optimizer/README.md](./resume-optimizer/README.md).

---

## 5. llm_exp — UUID Form Filler Agent

AI-powered form auto-fill demo: pick or type a UUID, and an OpenAI agent maps database records into formatted form fields. Uses SQLite for persistence and optional LM Studio for local models.

**Highlights**

- UUID combobox (type or select) with instant auto-fill
- FastAPI + OpenAI agent for data mapping/formatting
- SQLite with seeded demo records and session persistence
- React + TypeScript + Vite UI; Windows `start.bat` one-command launch
- LM Studio setup docs for local LLM experiments

**Quick start**

```bash
# Windows one-command
cd llm_exp
start.bat

# Or manually:
# Backend
cd llm_exp/backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
# Copy .env.example → .env and set OPENAI_API_KEY
python main.py

# Frontend (new terminal)
cd llm_exp/frontend
npm install
npm run dev
```

- App: [http://localhost:5173](http://localhost:5173)
- API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

Docs: [llm_exp/README.md](./llm_exp/README.md) · [QUICKSTART](./llm_exp/QUICKSTART.md) · [ARCHITECTURE](./llm_exp/ARCHITECTURE.md) · [LM Studio](./llm_exp/LMSTUDIO_SETUP.md).

---

## 6. chatbot-openai

ChatGPT-inspired chatbot with user accounts, message persistence, and OpenAI completions (MERN-style stack).

**Highlights**

- Message storage with retrieve/delete
- JWT auth, HTTP-only signed cookies, password encryption
- Middleware-secured API routes
- Light/dark theme on the frontend

**Quick start**

```bash
# Backend
cd chatbot-openai/backend
# Create .env with COOKIE_SECRET, OPEN_AI_SECRET, OPENAI_ORGANIZATION_ID,
# MONGODB_URL, JWT_SECRET, PORT, etc.
npm install
npm run dev

# Frontend (new terminal)
cd chatbot-openai/frontend
npm install
npm run dev
```

App: [http://localhost:5173](http://localhost:5173). Details: [chatbot-openai/README.md](./chatbot-openai/README.md).

---

## 7. auth_fullstack — Role-Based Authentication

Full-stack role-based auth system with user tiers, PIN login, forgot-password flows, and an admin dashboard.

**Highlights**

- Register with email, phone, password, PIN, and security question
- Login via password or PIN
- Forgot password: PIN (3 attempts), security question (3 attempts), email fallback for Silver/Gold
- Admin: view users, promote to admin, change category (Basic / Silver / Gold), edit/delete accounts
- Dark / light theme

**Quick start**

```bash
# Backend (requires MongoDB running)
cd auth_fullstack/server
npm install
npm run dev

# Frontend (new terminal)
cd auth_fullstack/client
npm install
npm run dev
```

Details: [auth_fullstack/README.md](./auth_fullstack/README.md).

---

## 8. otp-auth — OTP Authentication

Passwordless email OTP login: request a 6-digit code, verify it, and receive a JWT. OTPs are cached in Redis (15-minute TTL) and persisted in MongoDB, then emailed via Nodemailer (Gmail SMTP).

**Highlights**

- `POST /request-otp` and `POST /verify-otp`
- Redis cache + MongoDB dual storage for OTPs
- JWT issued on successful verification
- Rate limiting support; CORS locked to the CRA frontend
- Login + OTP form UI with toast notifications (port **4200**)

**Quick start**

Requires **MongoDB**, **Redis**, and email credentials (`EMAIL_USER`, `EMAIL_PASS`) in the backend `.env`.

```bash
# Backend
cd otp-auth/otp-auth-backend
npm install
npm start
# Default API: http://localhost:3000

# Frontend (new terminal)
cd otp-auth/otp-auth-frontend
npm install
npm start
# UI: http://localhost:4200
```

Details: [otp-auth/README.md](./otp-auth/README.md).

---

## 9. react-apps

Collection of React + TypeScript + Vite apps (UI clones, AI tools, and one full-stack recipe platform).

| App | Description | Stack highlights |
|-----|-------------|------------------|
| [bigbasket-ui](./react-apps/bigbasket-ui/) | Grocery e-commerce UI (BigBasket-style) | React Router, Tailwind, Google Maps |
| [clone-bndb](./react-apps/clone-bndb/) | Airbnb-style property listings | Mapbox, Supabase, Zustand |
| [clone-recipes](./react-apps/clone-recipes/) | Recipe sharing (frontend + Express API) | Redux Toolkit, Express, MongoDB, JWT |
| [coin-app](./react-apps/coin-app/) | AI coin identification from photos | OpenAI Vision, Framer Motion |
| [plant-app](./react-apps/plant-app/) | AI plant ID (FloraLens) | OpenAI, Supabase, PIN security |
| [trip-planner](./react-apps/trip-planner/) | Travel companion: itinerary, chat, expenses | React Router, PDF export |

**Quick start (any app)**

```bash
cd react-apps/<project-folder>
npm install
npm run dev
```

Typical URL: `http://localhost:5173`.

For `clone-recipes`, also run the API:

```bash
cd react-apps/clone-recipes/server
npm install
npm run seed
npm run dev
```

Full guide: [react-apps/README.md](./react-apps/README.md).

---

## Prerequisites

Depending on the project you run, you may need:

| Requirement | Used by |
|-------------|---------|
| **Node.js** v18+ and npm | All projects |
| **Python** 3.10+ | ride-app, resume-optimizer, llm_exp |
| **Docker** / Docker Compose | ride-app, resume-optimizer (optional) |
| **PostgreSQL** | recipe_website (optional in demo mode) |
| **MongoDB** | chatbot-openai, auth_fullstack, otp-auth, clone-recipes |
| **Redis** | otp-auth |
| **SQLite** | llm_exp (bundled / created on first run) |
| **API keys / secrets** | OpenAI, Mapbox, Stripe, Supabase, Clerk, NextAuth, Gmail SMTP, etc. (per project) |

---

## Repository layout

```text
web_apps/
├── ShopIt/                    # E-commerce (Next.js + Sanity + Clerk)
├── ride-app/                  # Ride matching (FastAPI + Next.js + Mapbox)
│   ├── client/
│   ├── server/
│   └── docs/
├── recipe_website/            # RecipeHub (Next.js + Prisma + PostgreSQL)
│   ├── docs/
│   ├── prisma/
│   └── src/
├── resume-optimizer/          # Resume AI (FastAPI + Vite + Firebase)
│   ├── backend/
│   └── frontend/
├── llm_exp/                   # UUID form filler agent (FastAPI + React + OpenAI)
│   ├── backend/
│   └── frontend/
├── chatbot-openai/            # Chatbot (Express + React + MongoDB)
│   ├── backend/
│   └── frontend/
├── auth_fullstack/            # Role-based auth (Express + React + MongoDB)
│   ├── client/
│   └── server/
├── otp-auth/                  # Email OTP auth (Express + CRA + Redis)
│   ├── otp-auth-backend/
│   └── otp-auth-frontend/
├── react-apps/                # Smaller React demos & clones
│   ├── bigbasket-ui/
│   ├── clone-bndb/
│   ├── clone-recipes/
│   │   ├── frontend/
│   │   └── server/
│   ├── coin-app/
│   ├── plant-app/
│   └── trip-planner/
└── README.md                  # This file
```

---

## Docs index

| Project | Primary docs |
|---------|----------------|
| ShopIt | [README](./ShopIt/README.md) · [SETUP](./ShopIt/docs/SETUP.md) · [Commands](./ShopIt/docs/Commands.md) |
| Ride Match | [README](./ride-app/README.md) · [PRD](./ride-app/PRD.md) · [Routing](./ride-app/docs/ROUTING.md) · [Deploy](./ride-app/docs/DEPLOY.md) |
| RecipeHub | [README](./recipe_website/README.md) · [QUICKSTART](./recipe_website/docs/QUICKSTART.md) · [ARCHITECTURE](./recipe_website/docs/ARCHITECTURE.md) · [DEMO_MODE](./recipe_website/docs/DEMO_MODE.md) · [APPROVAL](./recipe_website/docs/APPROVAL_SYSTEM.md) · [DB](./recipe_website/docs/DB_README.md) |
| Resume Optimizer | [README](./resume-optimizer/README.md) |
| LLM Exp | [README](./llm_exp/README.md) · [QUICKSTART](./llm_exp/QUICKSTART.md) · [ARCHITECTURE](./llm_exp/ARCHITECTURE.md) · [LM Studio](./llm_exp/LMSTUDIO_SETUP.md) · [CHECKLIST](./llm_exp/CHECKLIST.md) |
| AI Chatbot | [README](./chatbot-openai/README.md) |
| Auth Fullstack | [README](./auth_fullstack/README.md) |
| OTP Auth | [README](./otp-auth/README.md) |
| React Apps | [README](./react-apps/README.md) · [plant-app Setup](./react-apps/plant-app/Setup.md) |

---

## License & notes

Individual projects may carry their own licenses and setup docs. Prefer each project's `README.md` (and any `SETUP.md` / `docs/`) for environment variables, deployment, and contribution details.
