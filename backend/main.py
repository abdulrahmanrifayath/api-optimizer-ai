import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database.database import Base, engine

# =========================
# MODELS (IMPORTANT)
# =========================
import backend.models.user
import backend.models.api_log

# =========================
# ROUTES
# =========================
from backend.routes.user_routes import router as user_router
from backend.routes.ai_routes import router as ai_router
from backend.auth.auth_routes import router as auth_router

# =========================
# WEBSOCKET ROUTES (ADDED)
# =========================
from backend.routes.ws_routes import router as ws_router

# =========================
# MIDDLEWARE
# =========================
from backend.middleware.api_logger import ApiLoggerMiddleware

# =========================
# AI ENGINE
# =========================
from backend.ai_engine.analyzer import fetch_logs
from backend.ai_engine.insights import generate_insights


app = FastAPI(
    title="API Optimizer AI",
    version="1.0.0"
)

# =========================
# MIDDLEWARE
# =========================
app.add_middleware(ApiLoggerMiddleware)

# =========================
# CORS SETUP
# =========================
origins = os.getenv("CORS_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins != [""] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# REGISTER ROUTES
# =========================
app.include_router(user_router)
app.include_router(ai_router)
app.include_router(auth_router)

# ✅ WEBSOCKET ROUTE ENABLED
app.include_router(ws_router)

# =========================
# STARTUP EVENT
# =========================
@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)

# =========================
# BASIC ROUTES
# =========================
@app.get("/")
def home():
    return {"message": "API Optimizer AI Running 🚀"}


@app.get("/health")
def health():
    return {"status": "healthy"}

# =========================
# AI INSIGHTS ENDPOINT
# =========================
@app.get("/ai/insights")
def ai_insights():
    logs = fetch_logs()

    return {
        "total_logs": len(logs),
        "insights": generate_insights(logs)
    }

# =========================
# RUN SERVER (DEV)
# =========================
if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 8000))

    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )