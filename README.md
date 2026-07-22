# 🔮 API Optimizer AI — Intelligent API Telemetry, Performance Optimization & Business Intelligence Platform

[![Build Status](https://img.shields.io/badge/CI%2FCD-Passing-10b981?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/abdulrahmanrifayath/api-optimizer-ai/actions)
[![React](https://img.shields.io/badge/React-19.0-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-2.0-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.13-3776ab?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479a1?style=for-the-badge&logo=mysql&logoColor=white)](https://mysql.com)
[![Docker](https://img.shields.io/badge/Docker-Containers-2496ed?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-a855f7?style=for-the-badge)](LICENSE)

An enterprise-grade, full-stack API telemetry ingestion, performance optimization, machine learning traffic forecasting, and executive business intelligence platform. Built with **React 19**, **FastAPI (Python 3.13)**, **MySQL 8.0**, and a **Cyber Neon Violet Glassmorphism** user interface.

---

## ✨ Core Features & Capabilities

### 📡 1. Real-Time Telemetry & Log Explorer
* **Live HTTP Stream**: Real-time log collection and ingestion of HTTP requests (methods, status codes, latency, payload sizes, client IPs).
* **Multi-Format Exporter**: Export telemetry logs instantly as **CSV**, **JSON**, or downloadable **PDF** reports.
* **Filter & Search**: Advanced search by endpoint path, status category (2xx, 3xx, 4xx, 5xx), and date ranges.

### ⚡ 2. Connected REST API Manager & Health Monitor
* **API Connector**: Connect and monitor external REST APIs (e.g., Stripe, GitHub, OpenWeather, OpenAI, custom endpoints).
* **Health & Latency Check**: Track SSL cert validity, DNS resolution times, average response latency, and availability uptime percentages.
* **Connection Tester**: Trigger manual or automated 5-second interval heartbeat tests.

### 🤖 3. AI Predictive Analytics & Risk Engine
* **ML Traffic Predictor**: Predict next-hour and 30-minute traffic surges using time-series forecasting models.
* **AI Risk Analyzer**: Evaluates error rates and response latency to assign dynamic system risk levels (**LOW**, **MEDIUM**, **HIGH**).
* **Smart Optimization Advisor**: Actionable recommendations (e.g., enabling Redis response caching, database indexing, horizontal pod autoscaling).

### 💼 4. Executive Board & Business Intelligence Reports
* **Executive Summary**: Business-friendly summaries of system availability, SLA compliance, and weekly traffic growth.
* **Industry API Leaderboard**: Ranks your connected APIs against top global benchmarks (Stripe, GitHub, OpenAI, OpenWeather).
* **Cost Optimization Calculator**: Estimates infrastructure cost savings across compute, bandwidth, and database I/O.
* **Executive PDF Generator**: Generate and download branded executive PDF reports with a single click.

### 🛡️ 5. Enterprise Security & Performance Hardening
* **Sliding Window IP Rate Limiter**: Protects auth routes (`/auth/login`) against brute-force attacks (**5 attempts/min per IP**).
* **HTTP Security Headers**: Injects `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Content-Security-Policy`.
* **In-Memory TTL Caching Engine**: Accelerates telemetry dashboard routes down to **< 2ms response times**.

### 🐳 6. Multi-Stage Docker & Cloud Deployment
* **One-Command Setup**: Orchestrate MySQL 8.0, FastAPI backend, and Nginx reverse proxy with `docker compose up --build -d`.
* **Nginx Reverse Proxy**: Production Nginx container serving React SPA static assets and proxying API traffic.
* **Automated Database Backups**: Python script (`scripts/backup_db.py`) executing compressed `.sql.gz` dumps with 7-day retention rotation.

---

## 🎨 Cyber Neon Glassmorphism UI Aesthetics

The web application features a **Cyber Neon Violet Glassmorphism UI** tailored for both **Day (Light)** and **Night (Dark)** modes:
* **Translucent Glass Panels**: Translucent card containers with `backdrop-filter: blur(20px)` and glowing neon borders (`#a855f7` / `#06b6d4`).
* **High-Contrast Typography**: Guaranteed text readability using adaptive CSS variables across all tables, forms, badges, and controls.
* **Glow Recharts**: Customized Bar, Line/Area, and Donut Pie charts with SVG linear color gradients.

---

## 🏗️ System Architecture & Tech Stack

```
[ Client Browser ]
       │
       ▼
┌────────────────────────────────────────────────────────┐
│ Nginx Reverse Proxy (Port 80)                         │
│ ├─ Serves React 19 SPA (Cyber Neon Glass UI)          │
│ └─ Proxies /api/, /ai/, /reports/, /auth/ Requests      │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ FastAPI Backend Engine (Port 8000)                     │
│ ├─ Security Headers & Rate Limiting Middleware          │
│ ├─ In-Memory TTL Cache Engine (<2ms response)          │
│ ├─ AI Analytics Engine & Time-Series Predictor         │
│ └─ Executive PDF Report Generator                      │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ MySQL 8.0 Database Container (Port 3306)              │
│ ├─ SQLAlchemy 2.0 ORM & Compound Indexes               │
│ └─ Persistent Named Volume (mysql_data)                │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start & Installation

### Option 1: Docker Compose Deployment (Recommended)

Make sure [Docker Desktop](https://www.docker.com/products/docker-desktop/) is installed.

```bash
# 1. Clone the repository
git clone https://github.com/abdulrahmanrifayath/api-optimizer-ai.git
cd api-optimizer-ai

# 2. Build and launch all containers
docker compose up --build -d

# 3. Check running services
docker compose ps
```

* **Web Application**: Navigate to [http://localhost](http://localhost)
* **FastAPI Swagger Docs**: Navigate to [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Option 2: Local Development Setup

#### 1. Backend Setup (FastAPI)
```bash
# Install Python dependencies
pip install -r requirements.txt

# Launch FastAPI server on port 8000
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 2. Frontend Setup (React)
```bash
cd frontend

# Install Node dependencies
npm install

# Start React development server
npm start
```
Navigates to [http://localhost:3000](http://localhost:3000).

---

## 🌐 API Endpoint Reference

| Category | Endpoint | Method | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `/auth/register` | `POST` | Create new user account |
| **Auth** | `/auth/login` | `POST` | Authenticate & get JWT token (Rate limited) |
| **Connected APIs** | `/connected-apis/` | `GET` | List connected REST APIs with pagination |
| **Connected APIs** | `/connected-apis/` | `POST` | Connect & test a new REST API |
| **Connected APIs** | `/connected-apis/{id}/test` | `POST` | Run connection & latency test |
| **Telemetry Logs** | `/api/v1/logs/` | `GET` | Filter HTTP telemetry logs |
| **Telemetry Logs** | `/api/v1/logs/export` | `GET` | Export logs as CSV, JSON, or PDF |
| **AI Analytics** | `/ai/dashboard` | `GET` | Fetch AI telemetry score & predictions |
| **AI Analytics** | `/ai/anomalies` | `GET` | Retrieve AI anomaly detections |
| **Executive** | `/reports/executive-kpis` | `GET` | Executive Board business metrics |
| **Executive** | `/reports/executive-pdf` | `GET` | Download Executive PDF Report |

---

## 🛠️ Environment Variables Configuration

Copy `.env.docker.example` to `.env` to customize production variables:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `mysql+pymysql://root:root@db:3306/api_optimizer_db` | Database connection string |
| `JWT_SECRET` | `supersecretkey1234567890apioptimizerai` | Secret key for signing JWT tokens |
| `JWT_ALGORITHM` | `HS256` | JWT signing algorithm |
| `CORS_ORIGINS` | `http://localhost,http://localhost:3000` | Allowed CORS origins |
| `SENTRY_DSN` | `""` | Optional Sentry error tracking DSN |

---

## 📦 Automated Database Backups

To trigger a manual or cron-scheduled database backup with 7-day retention:
```bash
python scripts/backup_db.py
```
Outputs compressed archives to `backups/api_optimizer_db_YYYYMMDD_HHMMSS.sql.gz`.

---

## 🧪 Running Automated Tests

```bash
# Run Sprint 8 Security & Performance Verification Suite
python scratch/test_sprint8.py
```

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<p center>
  Developed with ❤️ by <a href="https://github.com/abdulrahmanrifayath">Abdulrahman Rifayath</a>
</p>
