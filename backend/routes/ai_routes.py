from fastapi import APIRouter

from datetime import datetime

from backend.ml.predictor import predict_next_hour

from backend.services.prediction_service import PredictionService

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

@router.get("/predict-traffic")
def predict_traffic():

    service = PredictionService()

    return service.get_prediction()

    prediction = predict_next_hour(features)

    trend = "Stable"

    if prediction > 50:
        trend = "Increasing"

    elif prediction < 20:
        trend = "Decreasing"

    confidence = 92.5

    recommendation = "No action required."

    if trend == "Increasing":
        recommendation = "Consider scaling to handle higher traffic."

    elif trend == "Decreasing":
        recommendation = "Current capacity is sufficient."

    return {

        "current_hour": now.hour,

        "predicted_requests": prediction,

        "trend": trend,

        "confidence": confidence,

        "recommendation": recommendation

    }