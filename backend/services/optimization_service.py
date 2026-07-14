from backend.services.prediction_service import PredictionService
from backend.services.anomaly_service import AnomalyService


class OptimizationService:

    def get_recommendations(self):

        prediction = PredictionService().get_prediction()

        anomaly = AnomalyService().detect()

        recommendations = []

        priority = "LOW"

        health_score = 100

        # --------------------------
        # High Traffic
        # --------------------------

        if prediction["trend"] == "Increasing":

            recommendations.append({

                "title": "Scale API Instances",
                "reason": "AI predicts increasing traffic.",
                "impact": "High",
                "confidence": 94,
                "expected_improvement": "30% lower response time"

            })

            priority = "HIGH"

            health_score -= 10

        # --------------------------
        # Slow API
        # --------------------------

        if prediction["avg_response_time"] > 0.30:

            recommendations.append({

                "title": "Enable Redis Cache",
                "reason": "Average response time is high.",
                "impact": "High",
                "confidence": 91,
                "expected_improvement": "40% faster responses"

            })

            health_score -= 10

        # --------------------------
        # High Error Rate
        # --------------------------

        if prediction["error_rate"] > 5:

            recommendations.append({

                "title": "Investigate API Errors",
                "reason": "Error rate exceeds 5%.",
                "impact": "High",
                "confidence": 97,
                "expected_improvement": "Reduce failed requests"

            })

            health_score -= 15

        # --------------------------
        # AI Anomaly
        # --------------------------

        if anomaly["anomaly"]:

            recommendations.append({

                "title": "Investigate Abnormal Traffic",
                "reason": "Isolation Forest detected abnormal behaviour.",
                "impact": "Critical",
                "confidence": 99,
                "expected_improvement": "Prevent service degradation"

            })

            priority = "CRITICAL"

            health_score -= 20

        # --------------------------
        # Database Optimization
        # --------------------------

        if prediction["avg_response_time"] > 0.15:

            recommendations.append({

                "title": "Optimize Database Queries",
                "reason": "Reduce response latency.",
                "impact": "Medium",
                "confidence": 88,
                "expected_improvement": "20% lower DB latency"

            })

            health_score -= 5

        # --------------------------
        # Healthy System
        # --------------------------

        if len(recommendations) == 0:

            recommendations.append({

                "title": "System Healthy",
                "reason": "No optimization required.",
                "impact": "None",
                "confidence": 100,
                "expected_improvement": "System already optimized"

            })

        return {

            "health_score": max(health_score, 0),

            "priority": priority,

            "recommendations": recommendations

        }