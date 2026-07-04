from fastapi import APIRouter

from backend.ai_engine.analyzer import fetch_logs
from backend.ai_engine.scoring import calculate_api_scores
from backend.ai_engine.anomaly import detect_anomalies
from backend.ai_engine.traffic import get_traffic_insights  # NEW UPGRADE

router = APIRouter(prefix="/ai", tags=["AI"])


@router.get("/dashboard")
def ai_dashboard():
    logs = fetch_logs()

    return {
        "score": calculate_api_scores(logs),
        "alerts": detect_anomalies(logs),
        "traffic": get_traffic_insights(logs)  # NEW FEATURE
    }