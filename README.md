# 🏙️ UrbanFlow

> Real-time pedestrian flow management system for the historic centre of Trento.

![Vue.js](https://img.shields.io/badge/Vue.js-3-4FC08D?logo=vue.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![DaisyUI](https://img.shields.io/badge/DaisyUI-4-5A0EF8?logo=daisyui&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)

---

## Overview

UrbanFlow is a full-stack web application developed to support city operators in monitoring and managing pedestrian flows across monitored zones in Trento's historic centre. The system ingests crowd-density data from camera sensors, evaluates alert thresholds per zone, and exposes a real-time dashboard for event scheduling and user administration.

---

## Features

| Area | Details |
|------|---------|
| 🗺️ **Interactive Map** | Leaflet-based map with GeoJSON zone overlays, density-gradient colouring, alert markers, and interactive zone tooltips |
| 📊 **Data Visualisation** | Chart.js crowd-density charts per zone and per event |
| 🔐 **Authentication** | JWT-based session management with token persistence and revocation; automatic redirect on expiry |
| 👥 **Role-Based Access** | Admin / base roles — admins can manage users, change roles, and configure zone thresholds |
| 📅 **Event Management** | Full CRUD for scheduled urban events linked to monitored zones |
| ⚠️ **Alert System** | Configurable pedestrian-density thresholds with real-time alert evaluation per zone |
| 🛠️ **Admin Panel** | Reserved area with user listing, creation, editing, deletion, and password management |

---

## Tech Stack

### Backend (`api/`)

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18+ |
| Framework | Express 4 |
| Database | MongoDB via Mongoose 8 |
| Auth | JSON Web Tokens (`jsonwebtoken`) + `bcrypt` |
| Testing | Jest 29 + Supertest + `mongodb-memory-server` |

### Frontend (`frontend/`)

| Layer | Technology |
|-------|-----------|
| Framework | Vue.js 3 (Composition API) |
| Build | Vite 5 |
| Styling | TailwindCSS 3 + DaisyUI 4 |
| Mapping | Leaflet (via GeoJSON) |
| Charts | Chart.js 4 + `chartjs-adapter-date-fns` |
| Notifications | Notyf |

---

## Project Structure

```
UrbanFlow/
├── api/                          # Express REST API
│   ├── middleware/               # Logger, JWT auth, admin auth
│   ├── models/                   # Mongoose schemas (user, session, zone, event, cameraData)
│   ├── routers/                  # Express route handlers
│   ├── services/                 # Business logic & DB queries
│   ├── seeds/                    # Seed data (JSON)
│   ├── tests/                    # Jest + Supertest test suites
│   ├── index.js                  # Express app entry point
│   ├── server.js                 # HTTP server bootstrap
│   ├── seeder.js                 # Database seeder script
│   └── package.json
│
├── frontend/                     # Vue 3 SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── generalComponents/ # Map, Login, Home, Zones, Events, Users, …
│   │   │   ├── mapComponents/     # ZoneTooltip, ZoomPane
│   │   │   └── utility/           # Router, EventBus
│   │   ├── assets/               # Global CSS, Chart.js setup
│   │   └── main.js
│   ├── public/                   # Static assets
│   ├── index.html
│   └── package.json
│
├── docs/
│   └── apiDoc.yaml               # OpenAPI 3.0 specification
│
├── deliverables/                 # Course deliverables (mockups, UML, user flows)
│   ├── d1/                       # UI Mockups
│   ├── d2/                       # UML Diagrams (class, component, use-case, activity)
│   └── d3/                       # User Flows
│
├── .env.example                  # Environment variable template
└── LICENSE
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- A MongoDB instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### Backend

```bash
cd api
npm install

# Copy the environment template and fill in your values
cp ../.env.example .env   # edit DB_URL and SUPER_SECRET

npm start        # starts on PORT (default: 3000)
npm test         # runs the full Jest test suite
```

### Frontend

```bash
cd frontend
npm install
npm run dev      # development server (Vite, hot-reload)
npm run build    # production build
npm run preview  # preview the production build locally
```

---

## API Documentation

The full OpenAPI 3.0 specification is available at [`docs/apiDoc.yaml`](./docs/apiDoc.yaml).

Key endpoints:

| Resource | Endpoints |
|----------|-----------|
| **Session** | `POST /session` · `DELETE /session` |
| **Users** | `GET /users` · `POST /users` · `GET/PUT/DELETE /users/:id` |
| **Zones** | `GET /zones` · `POST /zones` · `GET/PUT/DELETE /zones/:id` |
| **Events** | `GET /events` · `POST /events` · `GET/PUT/DELETE /events/:id` |
| **CameraData** | `GET /cameraData` · `POST /cameraData` |

---

## Contributors

| Name | Role |
|------|------|
| [Alvise Benetton](https://github.com/alvise-benetton) | Full-stack (Frontend lead) |
| [Davide Compagni](https://github.com/DaviCompa) | Full-stack (Backend lead) |
| Mirko Cecchinato | Backend |

---

## License

Copyright © 2024 Alvise Benetton, Davide Compagni, Mirko Cecchinato — All Rights Reserved.  
See [LICENSE](./LICENSE) for details.
