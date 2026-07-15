from backend.services.prediction_service import PredictionService
from backend.services.anomaly_service import AnomalyService


class ActionService:
    """
    Generates actionable AI recommendations for API optimization.
    """

    def get_actions(self):

        prediction = PredictionService().get_prediction()
        anomaly = AnomalyService().detect()

        actions = []

        # ------------------------------------
        # High Traffic
        # ------------------------------------
        if prediction["trend"] == "Increasing":

            actions.append({
                "id": 1,
                "title": "Scale Backend Instances",
                "priority": "High",
                "confidence": 94,
                "risk": "Low",
                "effort": "5 Minutes",
                "expected_improvement": "30% lower response time",
                "description": (
                    "Traffic prediction indicates increasing API usage. "
                    "Scaling backend instances can maintain low latency."
                )
            })

        # ------------------------------------
        # Slow Response
        # ------------------------------------
        if prediction["avg_response_time"] > 0.30:

            actions.append({
                "id": 2,
                "title": "Enable Redis Cache",
                "priority": "High",
                "confidence": 91,
                "risk": "Low",
                "effort": "10 Minutes",
                "expected_improvement": "40% faster responses",
                "description": (
                    "Frequently requested endpoints can benefit from caching."
                )
            })

        # ------------------------------------
        # High Error Rate
        # ------------------------------------
        if prediction["error_rate"] > 5:

            actions.append({
                "id": 3,
                "title": "Investigate API Errors",
                "priority": "Critical",
                "confidence": 97,
                "risk": "Medium",
                "effort": "30 Minutes",
                "expected_improvement": "Reduce failed requests",
                "description": (
                    "High error rate detected. Investigate logs and backend services."
                )
            })

        # ------------------------------------
        # AI Anomaly
        # ------------------------------------
        if anomaly["anomaly"]:

            actions.append({
                "id": 4,
                "title": "Investigate Traffic Anomaly",
                "priority": "Critical",
                "confidence": 99,
                "risk": "High",
                "effort": "15 Minutes",
                "expected_improvement": "Prevent service degradation",
                "description": (
                    "Isolation Forest detected abnormal traffic behavior."
                )
            })

        # ------------------------------------
        # Moderate Response Time
        # ------------------------------------
        if (
            prediction["avg_response_time"] > 0.15
            and prediction["avg_response_time"] <= 0.30
        ):

            actions.append({
                "id": 5,
                "title": "Optimize Database Queries",
                "priority": "Medium",
                "confidence": 88,
                "risk": "Low",
                "effort": "20 Minutes",
                "expected_improvement": "20% lower database latency",
                "description": (
                    "Review slow queries and add indexes where appropriate."
                )
            })

        # ------------------------------------
        # Healthy System
        # ------------------------------------
        if len(actions) == 0:

            actions.append({
                "id": 6,
                "title": "Continue Monitoring",
                "priority": "Low",
                "confidence": 100,
                "risk": "None",
                "effort": "0 Minutes",
                "expected_improvement": "System already optimized",
                "description": (
                    "No immediate optimization is required."
                )
            })

        return {
            "actions": actions
        }