import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database.database import Base, engine

# Import models so SQLAlchemy creates the tables
import backend.models.api_log
import backend.models.user
import backend.models.connected_api
import backend.models.connected_api_metric

# Routes
from backend.auth.auth_routes import router as auth_router
from backend.routes.ai_routes import router as ai_router
from backend.routes.user_routes import router as user_router
from backend.routes.ws_routes import router as ws_router
from backend.routes.connected_api_routes import router as connected_api_router
from backend.routes.api_log_routes import router as api_log_router

# Middleware
from backend.middleware.api_logger import ApiLoggerMiddleware

# AI Engine
from backend.ai_engine.analyzer import fetch_logs
from backend.ai_engine.insights import generate_insights


# ==========================================================
# FastAPI Application
# ==========================================================
app = FastAPI(
    title="API Optimizer AI",
    description="AI-Powered API Monitoring and Optimization Platform",
    version="1.0.0",
)


# ==========================================================
# Middleware
# ==========================================================
app.add_middleware(ApiLoggerMiddleware)


# ==========================================================
# CORS Configuration
# ==========================================================
origins = os.getenv("CORS_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins != [""] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================================
# Register API Routes
# ==========================================================
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(connected_api_router)
app.include_router(api_log_router)
app.include_router(ai_router)
app.include_router(ws_router)

from sqlalchemy import text

# ==========================================================
# Startup Event
# ==========================================================
@app.on_event("startup")
def startup():
    """
    Create database tables and ensure schema migrations when the application starts.
    """
    Base.metadata.create_all(bind=engine)

    # Ensure api_logs table has extended Sprint 3 columns if table already existed
    with engine.connect() as conn:
        for col_def in [
            "ADD COLUMN response_size INT NULL",
            "ADD COLUMN ip_address VARCHAR(45) NULL",
            "ADD COLUMN user_agent VARCHAR(255) NULL",
            "ADD COLUMN user_id INT NULL",
        ]:
            try:
                conn.execute(text(f"ALTER TABLE api_logs {col_def}"))
                conn.commit()
            except Exception:
                pass  # Column already exists

    # Ensure connected_apis table has extended telemetry columns
    with engine.connect() as conn:
        for col_def in [
            "ADD COLUMN last_checked DATETIME NULL",
            "ADD COLUMN latency DOUBLE PRECISION DEFAULT 0.0",
            "ADD COLUMN availability DOUBLE PRECISION DEFAULT 100.0",
            "ADD COLUMN avg_response_time DOUBLE PRECISION DEFAULT 0.0",
            "ADD COLUMN failure_count INT DEFAULT 0",
            "ADD COLUMN total_checks INT DEFAULT 0",
            "ADD COLUMN ssl_verified BOOLEAN DEFAULT 1",
        ]:
            try:
                conn.execute(text(f"ALTER TABLE connected_apis {col_def}"))
                conn.commit()
            except Exception:
                pass


# ==========================================================
# Root Endpoint
# ==========================================================
@app.get("/")
def home():
    """
    Verify that the backend server is running.
    """
    return {"message": "API Optimizer AI Running 🚀"}


# ==========================================================
# Health Check
# ==========================================================
@app.get("/health")
def health():
    """
    Basic application health check.
    """
    return {"status": "healthy"}


# ==========================================================
# AI Insights
# ==========================================================
@app.get("/ai/insights")
def ai_insights():
    """
    Generate AI-powered insights from the collected API logs.
    """
    logs = fetch_logs()

    return {
        "total_logs": len(logs),
        "insights": generate_insights(logs),
    }


# ==========================================================
# Development Server
# ==========================================================
if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 8000))

    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
    )