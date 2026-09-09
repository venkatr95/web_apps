# React Apps

A collection of React + TypeScript + Vite applications showcasing UI clones, AI-powered tools, and full-stack demos. Each project lives in its own folder and can be run independently.

**Repository:** [github.com/venkatr95/react-apps](https://github.com/venkatr95/react-apps)

## Projects

| Project | Description | Stack highlights |
|---------|-------------|------------------|
| [bigbasket-ui](#1-bigbasket-ui) | Grocery e-commerce UI (BigBasket-style) | React Router, Tailwind, Google Maps |
| [clone-bndb](#2-clone-bndb--airbnb-clone) | Airbnb-style property listings | Mapbox, Supabase, Zustand |
| [clone-recipes](#3-clone-recipes) | Recipe sharing platform (frontend + API) | Redux Toolkit, Express, MongoDB |
| [coin-app](#4-coin-app) | AI coin identification from photos | OpenAI Vision, Framer Motion |
| [plant-app](#5-plant-app--floralens) | AI plant identification (FloraLens) | OpenAI, Supabase, PIN security |
| [trip-planner](#6-trip-planner) | Travel companion with itinerary & expenses | React Router, PDF export |

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node.js)
- API keys where noted (OpenAI, Supabase, Mapbox, etc.)

## Quick start (any app)

```bash
cd <project-folder>
npm install
npm run dev
```

Typical local URL: `http://localhost:5173`

---

## 1. bigbasket-ui

Grocery storefront UI inspired by BigBasket.

### Features

- Home page product browsing
- Offers page
- Smart Basket
- Order tracking
- Header, footer, product cards
- Location and login dialogs
- Light/dark theme toggle

### Tech stack

- React 18, TypeScript, Vite
- Tailwind CSS
- React Router
- Lucide icons
- Google Maps (`@googlemaps/js-api-loader`, `@googlemaps/react-wrapper`)

### Run

```bash
cd bigbasket-ui
npm install
npm run dev
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run preview` | Preview production build |

### Routes

| Path | Page |
|------|------|
| `/` | Home |
| `/offers` | Offers |
| `/smart-basket` | Smart Basket |
| `/track` | Tracking |

---

## 2. clone-bndb — Airbnb clone

Modern property listing and booking-style UI.

### Features

- Property listings with detailed views
- Interactive maps (Mapbox)
- Responsive design
- Advanced search and filtering
- Date range picker for bookings
- Guest selection
- Wishlist
- Multi-language support
- Currency conversion

### Tech stack

- React 18, TypeScript, Vite
- Tailwind CSS, Headless UI
- React Router, Zustand
- Mapbox GL / react-map-gl
- Supabase
- date-fns, react-day-picker
- Lucide icons

### Environment

Create `clone-bndb/.env`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_MAPBOX_TOKEN=your_mapbox_token
```

### Run

```bash
cd clone-bndb
npm install
npm run dev
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run preview` | Preview production build |

### License

MIT — see [clone-bndb/LICENSE](clone-bndb/LICENSE).

---

## 3. clone-recipes

Full-stack recipe sharing platform: React frontend + Express/MongoDB API.

### Structure

```
clone-recipes/
├── frontend/   # React app (recipe-sharing-platform)
└── server/     # Node.js + Express REST API
```

---

### 3a. Frontend

Recipe feed, channels, auth, and settings UI.

#### Features

- Auth: login, register, forgot password
- Private routes
- Recipe feed with cards and skeletons
- Channels: create, list, share links, options menus
- Theme toggle (light/dark)
- Redux Toolkit state (auth, channels, recipes)
- Settings page

#### Tech stack

- React 18, TypeScript, Vite
- Tailwind CSS
- Redux Toolkit, React Redux
- React Router
- react-icons, Lucide
- react-intersection-observer
- Prettier + ESLint plugins

#### Run

```bash
cd clone-recipes/frontend
npm install
npm run dev
```

#### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run prettier` | Format with Prettier |
| `npm run preview` | Preview production build |

#### Routes

| Path | Page |
|------|------|
| `/` | Home (protected) |
| `/login` | Login |
| `/register` | Register |
| `/forgot-password` | Forgot password |

#### Frontend dependencies (optional notes)

```bash
npm install react-icons
npm i eslint-plugin-unused-imports eslint-plugin-import
npm install --save-dev prettier prettier-plugin-organize-imports
npx prettier --write .
```

---

### 3b. Server — Recipe Server API

Node.js + TypeScript + Express REST API for recipe channels.

#### Roles

| Role | Access |
|------|--------|
| **Admin** | Full access |
| **Creator** | Create channels and recipes |
| **User** | View, like, heart, and save recipes |

#### Tech stack

- Express, TypeScript
- MongoDB (Mongoose)
- JWT auth (jsonwebtoken)
- bcryptjs, dotenv, cors
- faker (seeding)

#### Run

```bash
cd clone-recipes/server
npm install
npm run seed
npm run dev
```

#### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (`ts-node-dev`) |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled app |
| `npm run seed` | Seed database |

#### API docs

See the Postman collection:

[`clone-recipes/server/Recipe_Server_API.postman_collection.json`](clone-recipes/server/Recipe_Server_API.postman_collection.json)

Configure MongoDB and JWT secrets via `.env` in the server folder (e.g. `MONGODB_URI`, `JWT_SECRET`).

---

## 4. coin-app

AI-powered coin identification: upload a photo, get analysis via OpenAI Vision.

### Features

- Image upload zone (drag-and-drop)
- OpenAI image analysis
- Result card with coin details
- API key modal (env or runtime)
- Framer Motion animations

### Tech stack

- React 19, TypeScript, Vite
- Tailwind CSS, Framer Motion
- OpenAI SDK
- react-dropzone, axios
- Lucide icons
- Netlify-ready (`netlify.toml`)

### Environment

Create `coin-app/.env` (or enter the key in the UI):

```env
VITE_OPENAI_API_KEY=your_openai_api_key
```

### Run

```bash
cd coin-app
npm install
npm run dev
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run lint:dualite` | Dualite ESLint config |
| `npm run tsc:dualite` | Dualite TypeScript check |
| `npm run preview` | Preview production build |

---

## 5. plant-app — FloraLens

AI plant identification app: identify plants, care guides, history, and secure garden journal.

### Features

- Instant identification from photos
- Care guides (watering, sunlight, soil)
- PIN-based security
- AI analysis (OpenAI)
- Plant history and estimated value
- Auth via Supabase
- Landing, dashboard, pin flow

### Tech stack

- React 19, TypeScript, Vite
- Tailwind CSS, Framer Motion
- Supabase (auth & database)
- OpenAI (plant analysis)
- React Router, react-dropzone
- Lucide icons
- Netlify-ready (`netlify.toml`)

### Environment

Create `plant-app/.env`:

```env
VITE_OPENAI_API_KEY="your_openai_api_key_here"
VITE_SUPABASE_URL="your_supabase_url_here"
VITE_SUPABASE_ANON_KEY="your_supabase_anon_key_here"
```

> Never commit real secrets in `.env`.

### Run

```bash
cd plant-app
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build (`dist/`) |
| `npm run lint` | ESLint |
| `npm run lint:dualite` | Dualite ESLint config |
| `npm run tsc:dualite` | Dualite TypeScript check |
| `npm run preview` | Preview production build |

### Setup details

Full setup guide: [plant-app/Setup.md](plant-app/Setup.md)

### License

MIT

---

## 6. trip-planner

Travel companion app: destinations, itineraries, chat, and expense tracking.

### Features

- Landing and featured destinations
- Onboarding wizard
- Itinerary cards and detail views
- Chat interface with conversation list
- Expense form and list
- Login / auth UI
- Theme support
- PDF generation utility

### Tech stack

- React 18, TypeScript, Vite
- Tailwind CSS
- React Router
- Lucide icons
- uuid

### Run

```bash
cd trip-planner
npm install
npm run dev
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run preview` | Preview production build |

### Routes

| Path | Page |
|------|------|
| `/` | Home |
| `/auth` | Login |
| `/itinerary` | Itinerary / landing |
| `/chat` | Chat |
| `/expenses` | Expenses |

---

## Repository layout

```
react-apps/
├── README.md                 # This file
├── bigbasket-ui/             # Grocery UI clone
├── clone-bndb/               # Airbnb clone
├── clone-recipes/
│   ├── frontend/             # Recipe sharing UI
│   └── server/               # Recipe REST API
├── coin-app/                 # AI coin identifier
├── plant-app/                # FloraLens plant ID
└── trip-planner/             # Travel companion
```

## Common stack

Most frontends share:

- **Build:** Vite
- **UI:** React + TypeScript
- **Styles:** Tailwind CSS + PostCSS
- **Lint:** ESLint 9
- **Icons:** Lucide React (and/or react-icons)

## Security notes

- Store API keys and secrets in local `.env` files only.
- Prefer server-side proxies for production OpenAI/Supabase secrets; client `VITE_*` keys are exposed to the browser.
- Do not commit `.env` files containing real credentials.

## Contributing

1. Create a branch from `main`.
2. Work inside the relevant project folder.
3. Keep changes scoped to that app unless shared tooling is intentional.
4. Open a pull request with a clear description.

## License

Individual projects may have their own licenses (e.g. MIT under `clone-bndb` and plant-app). Check each project folder for details.
