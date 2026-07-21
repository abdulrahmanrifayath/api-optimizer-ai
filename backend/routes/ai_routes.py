from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.auth.dependencies import get_current_user
from backend.services.ai_analytics_service import AIAnalyticsService
from backend.schemas.recommendation_schema import (
    RecommendationStatusUpdate,
    RecommendationResponse,
    AIScoreCardResponse,
    BusinessInsightsResponse,
)


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
# 2. AI TELEMETRY ANOMALIES (Phase 3)
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
# 3. TRAFFIC & LATENCY PREDICTIONS (Phase 2)
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
# 4. ENDPOINT RISK ANALYSIS (Phase 5)
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
# 5. AI SCORE CARD (Phase 6)
# ==========================================================
@router.get("/score-card", response_model=AIScoreCardResponse)
def get_score_card(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        service = AIAnalyticsService(db, current_user)
        return service.get_score_card()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate AI score card: {str(e)}"
        )


# ==========================================================
# 6. BUSINESS INSIGHTS (Phase 7)
# ==========================================================
@router.get("/business-insights", response_model=BusinessInsightsResponse)
def get_business_insights(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        service = AIAnalyticsService(db, current_user)
        return service.get_business_insights()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate business insights: {str(e)}"
        )


# ==========================================================
# 7. RECOMMENDATION HISTORY (Phase 8)
# ==========================================================
@router.get("/recommendations/history", response_model=list[RecommendationResponse])
def get_recommendation_history(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        service = AIAnalyticsService(db, current_user)
        return service.get_recommendation_history()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch recommendation history: {str(e)}"
        )


# ==========================================================
# 8. UPDATE RECOMMENDATION STATUS (Phase 8 - Accepted, Ignored, Applied)
# ==========================================================
@router.patch("/recommendations/{rec_id}/status", response_model=RecommendationResponse)
def update_recommendation_status(
    rec_id: int,
    status_update: RecommendationStatusUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        service = AIAnalyticsService(db, current_user)
        updated_rec = service.update_recommendation_status(rec_id, status_update.status)
        if not updated_rec:
            raise HTTPException(status_code=404, detail="Recommendation record not found.")
        return updated_rec
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update recommendation status: {str(e)}"
        )