from fastapi import APIRouter
from backend.ai_engine.analyzer import fetch_logs
from backend.ai_engine.scoring import calculate_api_scores

router = APIRouter(prefix="/ai", tags=["AI"])


@router.get("/insights")
def insights():
    logs = fetch_logs()

    return calculate_api_scores(logs)