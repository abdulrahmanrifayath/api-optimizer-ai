from backend.services.prediction_service import PredictionService
from backend.services.anomaly_service import AnomalyService
from backend.services.explanation_service import ExplanationService

from backend.core.constants import (
    HEALTH_SCORE_MAX,
    HIGH_RESPONSE_TIME,
    WARNING_RESPONSE_TIME,
    ERROR_RATE_THRESHOLD,
    TRAFFIC_CONFIDENCE,
    CACHE_CONFIDENCE,
    ERROR_CONFIDENCE,
    ANOMALY_CONFIDENCE,
    DATABASE_CONFIDENCE,
    SYSTEM_CONFIDENCE,
    TRAFFIC_IMPROVEMENT,
    CACHE_IMPROVEMENT,
    ERROR_IMPROVEMENT,
    ANOMALY_IMPROVEMENT,
    DATABASE_IMPROVEMENT,
    SYSTEM_IMPROVEMENT,
    PRIORITY_LOW,
    PRIORITY_HIGH,
    PRIORITY_CRITICAL,
)


class OptimizationService:
    """
    Generates AI-powered optimization recommendations based on
    traffic prediction and anomaly detection.
    """

    def get_recommendations(self):

        prediction = PredictionService().get_prediction()
        anomaly = AnomalyService().detect()

        recommendations = []

        priority = PRIORITY_LOW
        health_score = HEALTH_SCORE_MAX

        # ==========================================================
        # High Traffic
        # ==========================================================
        if prediction["trend"] == "Increasing":

            recommendations.append(
                ExplanationService.explain(
                    title="Scale API Instances",
                    reason="AI predicts increasing traffic.",
                    confidence=TRAFFIC_CONFIDENCE,
                    improvement=TRAFFIC_IMPROVEMENT,
                    metric="Predicted Requests",
                    value=prediction["predicted_requests"],
                    threshold=prediction["current_requests"],
                    model="Traffic Prediction",
                )
            )

            priority = PRIORITY_HIGH
            health_score -= 10

        # ==========================================================
        # Slow API
        # ==========================================================
        if prediction["avg_response_time"] > HIGH_RESPONSE_TIME:

            recommendations.append(
                ExplanationService.explain(
                    title="Enable Redis Cache",
                    reason="Average response time is high.",
                    confidence=CACHE_CONFIDENCE,
                    improvement=CACHE_IMPROVEMENT,
                    metric="Average Response Time",
                    value=prediction["avg_response_time"],
                    threshold=HIGH_RESPONSE_TIME,
                    model="Performance Analysis",
                )
            )

            health_score -= 10

        # ==========================================================
        # High Error Rate
        # ==========================================================
        if prediction["error_rate"] > ERROR_RATE_THRESHOLD:

            recommendations.append(
                ExplanationService.explain(
                    title="Investigate API Errors",
                    reason="Error rate exceeds 5%.",
                    confidence=ERROR_CONFIDENCE,
                    improvement=ERROR_IMPROVEMENT,
                    metric="Error Rate",
                    value=prediction["error_rate"],
                    threshold=ERROR_RATE_THRESHOLD,
                    model="Error Analysis",
                )
            )

            health_score -= 15

        # ==========================================================
        # AI Anomaly
        # ==========================================================
        if anomaly["anomaly"]:

            recommendations.append(
                ExplanationService.explain(
                    title="Investigate Abnormal Traffic",
                    reason="Isolation Forest detected abnormal behaviour.",
                    confidence=ANOMALY_CONFIDENCE,
                    improvement=ANOMALY_IMPROVEMENT,
                    metric="Anomaly Score",
                    value=anomaly["score"],
                    threshold=0.5,
                    model="Isolation Forest",
                )
            )

            priority = PRIORITY_CRITICAL
            health_score -= 20

        # ==========================================================
        # Database Optimization
        # ==========================================================
        if prediction["avg_response_time"] > WARNING_RESPONSE_TIME:

            recommendations.append(
                ExplanationService.explain(
                    title="Optimize Database Queries",
                    reason="Reduce response latency.",
                    confidence=DATABASE_CONFIDENCE,
                    improvement=DATABASE_IMPROVEMENT,
                    metric="Average Response Time",
                    value=prediction["avg_response_time"],
                    threshold=WARNING_RESPONSE_TIME,
                    model="Performance Analysis",
                )
            )

            health_score -= 5

        # ==========================================================
        # Healthy System
        # ==========================================================
        if len(recommendations) == 0:

            recommendations.append(
                ExplanationService.explain(
                    title="System Healthy",
                    reason="No optimization required.",
                    confidence=SYSTEM_CONFIDENCE,
                    improvement=SYSTEM_IMPROVEMENT,
                    metric="Health Score",
                    value=health_score,
                    threshold=HEALTH_SCORE_MAX,
                    model="AI Health Engine",
                )
            )

        return {
            "health_score": max(health_score, 0),
            "priority": priority,
            "recommendations": recommendations,
        }