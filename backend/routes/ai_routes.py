from fastapi import APIRouter
from backend.ai_engine.analyzer import fetch_logs
from backend.ai_engine.scoring import calculate_api_scores
from backend.ai_engine.anomaly import detect_anomalies

router = APIRouter(prefix="/ai", tags=["AI"])


@router.get("/dashboard")
def ai_dashboard():
    logs = fetch_logs()

    return {
        "score": calculate_api_scores(logs),
        "alerts": detect_anomalies(logs)
    }