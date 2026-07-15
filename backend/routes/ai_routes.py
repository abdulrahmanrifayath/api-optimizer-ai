from fastapi import APIRouter, HTTPException

from backend.services.prediction_service import PredictionService
from backend.services.anomaly_service import AnomalyService
from backend.services.optimization_service import OptimizationService
from backend.services.history_service import HistoryService
from backend.services.action_service import ActionService
from backend.services.simulation_service import SimulationService

from backend.ai_engine.analyzer import fetch_logs
from backend.ai_engine.scoring import calculate_api_scores
from backend.ai_engine.anomaly import detect_anomalies
from backend.ai_engine.traffic import get_traffic_insights


router = APIRouter(prefix="/ai", tags=["AI"])


# ==========================================================
# Dashboard
# ==========================================================
@router.get("/dashboard")
def ai_dashboard():
    try:
        logs = fetch_logs()

        return {
            "score": calculate_api_scores(logs),
            "alerts": detect_anomalies(logs),
            "traffic": get_traffic_insights(logs),
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Dashboard generation failed: {str(e)}"
        )


# ==========================================================
# Traffic Prediction
# ==========================================================
@router.get("/predict-traffic")
def predict_traffic():
    try:
        service = PredictionService()
        return service.get_prediction()

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Traffic prediction failed: {str(e)}"
        )


# ==========================================================
# Anomaly Detection
# ==========================================================
@router.get("/detect-anomaly")
def detect_anomaly():
    try:
        service = AnomalyService()
        return service.detect()

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Anomaly detection failed: {str(e)}"
        )


# ==========================================================
# AI Optimization Advisor
# ==========================================================
@router.get("/optimization-advisor")
def optimization_advisor():
    try:
        service = OptimizationService()
        return service.get_recommendations()

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Optimization advisor failed: {str(e)}"
        )
    
@router.get("/history")
def api_history():

    service = HistoryService()

    return service.get_history()

@router.get("/actions")
def get_ai_actions():
    """
    Returns AI-powered optimization actions.
    """

    service = ActionService()

    return service.get_actions()

@router.post("/simulate-action/{action_id}")
def simulate_action(action_id: int):

    service = SimulationService()

    return service.simulate(action_id)