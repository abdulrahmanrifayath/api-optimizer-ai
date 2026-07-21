from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.auth.dependencies import get_current_user
from backend.services.ai_analytics_service import AIAnalyticsService


router = APIRouter(
    prefix="/ai",
    tags=["AI Engine & Analytics"]
)


# ==========================================================
# 1. AI DASHBOARD OVERVIEW
# ==========================================================
@router.get("/dashboard")
def ai_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        service = AIAnalyticsService(db, current_user)
        return service.get_dashboard_ai_summary()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate AI dashboard: {str(e)}"
        )


# ==========================================================
# 2. AI TELEMETRY ANOMALIES
# ==========================================================
@router.get("/anomalies")
def get_anomalies(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        service = AIAnalyticsService(db, current_user)
        return service.get_anomalies()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch anomalies: {str(e)}"
        )


# ==========================================================
# 3. TRAFFIC & LATENCY PREDICTIONS
# ==========================================================
@router.get("/predictions")
def get_predictions(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        service = AIAnalyticsService(db, current_user)
        return service.get_predictions()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate predictions: {str(e)}"
        )


# ==========================================================
# 4. ENDPOINT RISK ANALYSIS
# ==========================================================
@router.get("/risk-analysis")
def get_risk_analysis(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        service = AIAnalyticsService(db, current_user)
        return service.get_risk_analysis()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to evaluate risk analysis: {str(e)}"
        )


# ==========================================================
# 5. AI OPTIMIZATION RECOMMENDATIONS
# ==========================================================
@router.get("/recommendations")
def get_recommendations(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        service = AIAnalyticsService(db, current_user)
        return service.get_recommendations()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate recommendations: {str(e)}"
        )