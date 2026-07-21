from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from backend.models.api_log import ApiLog
from backend.models.connected_api import ConnectedAPI
from backend.ml.anomaly_detector import AnomalyDetector
from backend.ml.predictor import predict_traffic_forecast, predict_next_hour


class AIAnalyticsService:
    def __init__(self, db: Session, current_user):
        self.db = db
        self.user = current_user
        self.anomaly_detector = AnomalyDetector()

    def get_user_logs(self, hours: int = 24):
        cutoff = datetime.utcnow() - timedelta(hours=hours)
        return (
            self.db.query(ApiLog)
            .filter(
                (ApiLog.user_id == self.user.id) | (ApiLog.user_id.is_(None)),
                ApiLog.timestamp >= cutoff
            )
            .order_by(ApiLog.timestamp.desc())
            .all()
        )

    def get_dashboard_ai_summary(self):
        logs = self.get_user_logs()
        total_requests = len(logs)

        if total_requests == 0:
            return {
                "score": {"score": 95, "status": "Excellent", "metrics": {"total_requests": 0, "avg_response_time": 0.0, "error_rate": 0.0}},
                "alerts": [],
                "traffic": {"total_logs": 0, "status": "Healthy", "predicted_next_hour": 10},
            }

        avg_rt = round(sum(l.response_time for l in logs) / total_requests, 2)
        errors = sum(1 for l in logs if l.status_code >= 400)
        error_rate = round((errors / total_requests) * 100, 2)

        # AI Health Score calculation (0-100)
        score_val = 100
        score_val -= min(40, error_rate * 4)
        score_val -= min(40, max(0, (avg_rt - 50) / 10))
        score_val = max(10, round(score_val))

        status_text = "Excellent" if score_val >= 85 else "Good" if score_val >= 70 else "Needs Attention" if score_val >= 50 else "Critical"

        alerts = self.anomaly_detector.detect_anomalies_from_logs(logs)

        next_hour_predicted = predict_next_hour({
            "requests": total_requests,
            "avg_response_time": avg_rt,
            "error_rate": error_rate
        })

        return {
            "score": {
                "score": score_val,
                "status": status_text,
                "metrics": {
                    "total_requests": total_requests,
                    "avg_response_time": round(avg_rt / 1000.0, 4), # in seconds for card UI compatibility
                    "error_rate": error_rate
                }
            },
            "alerts": alerts,
            "traffic": {
                "total_logs": total_requests,
                "status": "Healthy" if error_rate < 5 else "Degraded",
                "predicted_next_hour": next_hour_predicted
            }
        }

    def get_anomalies(self):
        logs = self.get_user_logs()
        return self.anomaly_detector.detect_anomalies_from_logs(logs)

    def get_predictions(self):
        logs = self.get_user_logs()
        forecast = predict_traffic_forecast(logs)
        return {
            "total_predicted_requests": sum(f["predicted_requests"] for f in forecast[:6]),
            "peak_hour": max(forecast, key=lambda x: x["predicted_requests"])["hour"],
            "forecast": forecast
        }

    def get_risk_analysis(self):
        logs = self.get_user_logs()
        if not logs:
            return []

        endpoint_stats = {}
        for log in logs:
            ep = log.endpoint
            if ep not in endpoint_stats:
                endpoint_stats[ep] = {"times": [], "errors": 0, "total": 0}
            endpoint_stats[ep]["times"].append(log.response_time)
            endpoint_stats[ep]["total"] += 1
            if log.status_code >= 400:
                endpoint_stats[ep]["errors"] += 1

        risk_list = []
        for ep, data in endpoint_stats.items():
            avg_rt = sum(data["times"]) / len(data["times"]) if data["times"] else 0
            err_rate = (data["errors"] / data["total"]) * 100 if data["total"] > 0 else 0
            
            risk_level = "Low"
            if err_rate > 10 or avg_rt > 500:
                risk_level = "High"
            elif err_rate > 3 or avg_rt > 200:
                risk_level = "Medium"

            risk_list.append({
                "endpoint": ep,
                "risk_level": risk_level,
                "avg_response_time": round(avg_rt, 2),
                "error_rate": round(err_rate, 2),
                "total_requests": data["total"],
                "recommendation": "Implement response caching" if avg_rt > 200 else "Optimize database indexing" if err_rate > 5 else "Optimal configuration"
            })

        return sorted(risk_list, key=lambda x: (x["risk_level"] == "High", x["risk_level"] == "Medium"), reverse=True)

    def get_recommendations(self):
        logs = self.get_user_logs()
        anomalies = self.anomaly_detector.detect_anomalies_from_logs(logs)

        recommendations = [
            {
                "title": "Enable Redis Caching for Read-Heavy Endpoints",
                "description": "Caching response payloads for GET endpoints can reduce latency by up to 65%.",
                "priority": "High",
                "impact": "Lowers database CPU utilization and improves p99 response time."
            },
            {
                "title": "Database Connection Pooling Optimization",
                "description": "Configure PyMySQL connection pool pre-ping to eliminate stale socket reconnect delays.",
                "priority": "Medium",
                "impact": "Reduces transient connection errors by 80%."
            }
        ]

        if anomalies:
            for item in anomalies:
                recommendations.append({
                    "title": f"Investigate {item['type']} on {item['endpoint']}",
                    "description": item["message"],
                    "priority": "High" if item["severity"] == "High" else "Medium",
                    "impact": "Prevents potential downstream cascading service degradation."
                })

        return recommendations
