from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class RecommendationStatusUpdate(BaseModel):
    status: str  # Accepted, Ignored, Applied, Pending


class RecommendationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    category: str
    status: str
    impact: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AIScoreCardResponse(BaseModel):
    overall_score: int
    performance_score: int
    security_score: int
    reliability_score: int
    availability_score: int
    optimization_score: int


class BusinessInsightsResponse(BaseModel):
    peak_usage_hours: str
    most_used_api: str
    least_used_api: str
    potential_cost_savings_usd: float
    capacity_growth_forecast: str
    recommendations_summary: str
