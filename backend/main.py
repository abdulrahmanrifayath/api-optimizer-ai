from fastapi import FastAPI

from backend.database.database import Base, engine

import backend.models.user

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="API Optimizer AI",
    version="1.0.0",
    description="AI Powered API Usage Monitor"
)


@app.get("/")
def home():
    return {
        "message": "Welcome to API Optimizer AI 🚀"
    }


@app.get("/health")
def health():
    return {
        "status": "Healthy"
    }