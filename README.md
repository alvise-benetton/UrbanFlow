# 🏙️ UrbanFlow

> Real-time pedestrian flow monitoring and management platform for the historic centre of Trento.

[![CI](https://github.com/alvise-benetton/UrbanFlow/actions/workflows/ci.yml/badge.svg)](https://github.com/alvise-benetton/UrbanFlow/actions/workflows/ci.yml)
![Tests](https://img.shields.io/badge/tests-52%20passed-brightgreen?logo=jest&logoColor=white)
![Vue.js](https://img.shields.io/badge/Vue.js-3-4FC08D?logo=vue.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![DaisyUI](https://img.shields.io/badge/DaisyUI-4-5A0EF8?logo=daisyui&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)

---

## 📖 Overview

UrbanFlow is a full-stack IoT and GIS-enabled web application developed to empower municipal operators in monitoring and regulating pedestrian crowd dynamics across Trento's historic district.

The system processes real-time density metrics collected from camera networks, compares crowd volumes against zone-specific safety thresholds, evaluates live alerts, and presents dynamic visual feedback on an interactive GIS dashboard. Operators can schedule public events, inspect historical sensor curves, and manage platform permissions.

---

## 🚀 Key Features

| Domain | Highlights |
|---|---|
| 🗺️ **Interactive GIS Map** | Leaflet-powered GIS engine with GeoJSON zone boundaries, dynamic density gradient fills, live alert markers, and zone inspectors |
| 📊 **Analytics & Trends** | Interactive Chart.js time-series plots depicting crowd trends per zone and across scheduled municipal events |
| ⚡ **Live Alert Engine** | Continuous threshold evaluation flagging capacity violations and crowd surges with real-time status badges |
| 🔐 **Secure RBAC & Auth** | Stateless JWT authentication, secure token revocation, password hashing (`bcrypt`), and route-level authorization guards |
| 📅 **Event Scheduling** | Full lifecycle CRUD for municipal and cultural gatherings mapped to pedestrian sectors |
| 👥 **User Administration** | Granular user management portal (add, modify, remove users, toggle administrator roles, and reset credentials) |
| ☁️ **Cloud Database & Keepalive** | Hosted on Oracle Cloud Always Free (ARM64 Ampere) with containerized MongoDB 7.0 and automated keepalive service |

---

## 🏗️ Architecture & Cloud Infrastructure

```
┌────────────────────────────────────────────────────────┐
│                   Vite + Vue 3 SPA                     │
│  (Composition API · TailwindCSS · DaisyUI · Leaflet)   │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP / REST (JWT)
                           ▼
┌────────────────────────────────────────────────────────┐
│                   Express 4 REST API                   │
│   (Middleware · RBAC · Mongoose · Jest Test Runner)    │
└──────────────────────────┬─────────────────────────────┘
                           │ Mongoose Driver (Port 27017)
                           ▼
┌────────────────────────────────────────────────────────┐
│         Oracle Cloud Always Free (Ubuntu ARM64)        │
│    ┌──────────────────────────────────────────────┐    │
│    │ Docker Container: MongoDB 7.0 (Auth enabled) │    │
│    │ Storage Volume: /opt/urbanflow/mongo-data    │    │
│    └──────────────────────────────────────────────┘    │
│    ┌──────────────────────────────────────────────┐    │
│    │ Systemd Daemon: oracle-keepalive.service     │    │
│    └──────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────┘
```

---

## 🧪 Demo Credentials

The platform includes pre-seeded demo accounts ready for evaluation:

| Role | Email | Password | Access Rights |
|---|---|---|---|
| 🛡️ **Administrator** | `mario.rossi@example.com` | `password_mario` | Full system access: user administration, zone thresholds, events |
| 🛡️ **Administrator** | `giulia.verdi@example.com` | `password_giulia` | Full system access: user administration, zone thresholds, events |
| 👤 **Standard Operator**| `luca.bianchi@example.com` | `password_luca` | Operational access: live map, charts, alerts, event inspection |

---

## ⚡ Quickstart

### Option 1: Monorepo Local Setup (Recommended)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/alvise-benetton/UrbanFlow.git
   cd UrbanFlow
   ```

2. **Install all dependencies** (root, API, and frontend):
   ```bash
   npm run install:all
   ```

3. **Configure Environment Variables**:
   ```bash
   cp api/.env.example api/.env
   cp frontend/.env.example frontend/.env
   ```

4. **Seed the Database** (optional, seeds demo zones, events, users, and sensor data):
   ```bash
   npm run seed
   ```

5. **Start Both Services Concurrently**:
   ```bash
   npm run dev
   ```
   - API: [http://localhost:3000](http://localhost:3000)
   - Frontend: [http://localhost:5173](http://localhost:5173)

---

### Option 2: Docker Compose

Spin up the complete stack (MongoDB 7.0, API, and Frontend with Nginx) with a single command:

```bash
docker compose up --build -d
```

- Web App: [http://localhost:8080](http://localhost:8080)
- REST API: [http://localhost:3000](http://localhost:3000)
- MongoDB: `localhost:27017`

To shut down:
```bash
docker compose down
```

---

## 🧪 Automated Testing & CI

The backend test suite runs 52 end-to-end integration and unit tests using **Jest**, **Supertest**, and an isolated in-memory MongoDB server:

```bash
# Run tests from root
npm test

# Or run tests directly in api/
npm --prefix api test
```

### CI Pipeline
Every push and pull request to `main` triggers automated GitHub Actions workflows:
- Backend test validation across Node.js versions
- Frontend TypeScript / Vite production build verification

---

## 📂 Project Structure

```
UrbanFlow/
├── .github/workflows/ci.yml       # GitHub Actions CI pipeline
├── api/                           # Express REST API
│   ├── middleware/                # JWT auth, RBAC admin guard, request logger
│   ├── models/                    # Mongoose schemas (User, Session, Zone, Event, CameraData)
│   ├── routers/                   # Modular route controllers
│   ├── services/                  # Business logic and database operations
│   ├── seeds/                     # Initial JSON dataset (zones, users, camera measurements)
│   ├── tests/                     # 52 Jest + Supertest automated tests
│   ├── index.js                   # Express application setup & middleware export
│   ├── server.js                  # Production HTTP bootstrap
│   ├── seeder.js                  # Database seeder CLI
│   ├── jest.setup.js              # Jest polyfills (Node 22+ compatibility) & timeouts
│   └── Dockerfile                 # Container image specification
│
├── frontend/                      # Vue 3 SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── generalComponents/ # Map, Login, Home, ZonesAlertsList, EventsList, Users...
│   │   │   ├── mapComponents/     # ZoneTooltip, ZoomPane
│   │   │   └── utility/           # Vue Router with auth guards, EventBus
│   │   ├── services/              # Centralized API HTTP client
│   │   ├── assets/                # Styling (TailwindCSS, DaisyUI) and Chart.js setup
│   │   └── main.js                # Vue SPA bootstrap
│   ├── nginx.conf                 # Production Nginx reverse-proxy configuration
│   └── Dockerfile                 # Multi-stage production container build
│
├── docs/                          # API specifications (OpenAPI 3.0 apiDoc.yaml)
├── deliverables/                  # Software engineering deliverables (UML, mockups, flows)
├── docker-compose.yml             # Local multi-service orchestration
└── package.json                   # Monorepo management scripts
```

---

## 👥 Contributors

| Name | Role | Profile |
|---|---|---|
| **Alvise Benetton** | Full-Stack Developer & Frontend Lead | [@alvise-benetton](https://github.com/alvise-benetton) |
| **Davide Compagni** | Full-Stack Developer & Backend Lead | [@DaviCompa](https://github.com/DaviCompa) |
| **Mirko Cecchinato** | Backend Developer | Contributor |

---

## 📄 License

Copyright © 2024–2026 Alvise Benetton, Davide Compagni, Mirko Cecchinato.  
All Rights Reserved. See [LICENSE](./LICENSE) for details.
