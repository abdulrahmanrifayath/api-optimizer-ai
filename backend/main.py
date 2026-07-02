import os

from fastapi import FastAPI

from backend.database.database import Base, engine

import backend.models.user
import backend.models.api_log

from backend.routes.user_routes import router as user_router
from backend.routes.ai_routes import router as ai_router

from backend.middleware.api_logger import ApiLoggerMiddleware


# Create DB tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="API Optimizer AI",
    version="1.0.0"
)


# Middleware (API monitoring)
app.add_middleware(ApiLoggerMiddleware)


# Routes
app.include_router(user_router)
app.include_router(ai_router)


@app.get("/")
def home():
    return {"message": "API Optimizer AI Running 🚀"}


@app.get("/health")
def health():
    return {"status": "healthy"}


# -----------------------------
# CLOUD DEPLOYMENT ENTRY POINT
# -----------------------------
if __name__ == "__main__":
    import uvicorn
    import os

    port = int(os.environ.get("PORT", 8000))

    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=port
    )