# 📖 API Optimizer AI - Production UAT & Operational Runbook

Welcome to the **API Optimizer AI** Production Handover Documentation. This document provides complete guidance for deployment, operations, maintenance, and User Acceptance Testing (UAT).

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 19, React Router v7, Recharts, FontAwesome, Vanilla CSS (Cyber Neon Glassmorphism) |
| **Backend** | FastAPI (Python 3.13), Pydantic v2, APScheduler, SQLAlchemy 2.0 ORM |
| **Database** | MySQL 8.0 / SQLite 3 (`api_optimizer_db`) with compound indexes |
| **Security & Auth** | JWT Authentication, Sliding Window IP Rate Limiter, HTTP Security Headers |
| **Caching Engine** | In-Memory LRU TTL Response Cache |
| **Web Server** | Nginx 1.25 (SPA Fallback + Reverse Proxying) |
| **Containerization** | Docker, Multi-Stage Dockerfiles, Docker Compose |
| **CI/CD** | GitHub Actions Pipeline (`.github/workflows/deploy.yml`) |

---

## 🚀 Quick-Start Guide

### Option 1: Docker One-Command Deployment (Recommended)
```bash
# 1. Clone repository
git clone https://github.com/abdulrahmanrifayath/api-optimizer-ai.git
cd api-optimizer-ai

# 2. Launch production containers
docker compose up --build -d

# 3. Verify running services
docker compose ps
```
- **Web App**: `http://localhost`
- **FastAPI OpenAPI Docs**: `http://localhost:8000/docs`

---

### Option 2: Local Development Execution

#### 1. Start FastAPI Backend
```bash
# Install dependencies
pip install -r requirements.txt

# Start backend server
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 2. Start React Frontend
```bash
cd frontend
npm install
npm start
```

---

## 🌐 API Endpoint Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/auth/register` | `POST` | User account registration |
| `/auth/login` | `POST` | Authenticate user & obtain JWT token |
| `/connected-apis/` | `GET` | List connected REST APIs |
| `/connected-apis/` | `POST` | Connect & test new REST API |
| `/api/v1/logs/` | `GET` | Retrieve filtered HTTP telemetry logs |
| `/ai/dashboard` | `GET` | Fetch AI telemetry score & predictions |
| `/reports/executive-kpis` | `GET` | Executive Board business metrics |
| `/reports/executive-pdf` | `GET` | Generate & download Executive PDF Report |

---

## 📦 Backup & Disaster Recovery

Run the automated backup script to generate compressed SQL dumps:
```bash
python scripts/backup_db.py
```
- Archives are saved to `backups/api_optimizer_db_YYYYMMDD_HHMMSS.sql.gz`.
- Backups older than **7 days** are automatically pruned.

---

## 🛡️ Security & Performance Assurance

1. **Security Headers**: All HTTP responses include `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `X-XSS-Protection`, and `Content-Security-Policy`.
2. **Rate Limiting**: `/auth/login` is limited to **5 attempts/min per IP** to prevent brute force attacks.
3. **Response Caching**: High-frequency dashboard requests use in-memory TTL caching for **< 2ms response times**.
