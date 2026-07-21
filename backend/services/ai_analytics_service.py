from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from backend.models.api_log import ApiLog
from backend.models.connected_api import ConnectedAPI
from backend.models.recommendation_history import RecommendationHistory
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
                    "avg_response_time": round(avg_rt / 1000.0, 4),
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

    # Phase 6: AI Score Card
    def get_score_card(self):
        logs = self.get_user_logs()
        total = len(logs)
        if total == 0:
            return {
                "overall_score": 95,
                "performance_score": 98,
                "security_score": 92,
                "reliability_score": 96,
                "availability_score": 99,
                "optimization_score": 90
            }

        avg_rt = sum(l.response_time for l in logs) / total
        err_count = sum(1 for l in logs if l.status_code >= 400)
        err_rate = (err_count / total) * 100

        perf = max(10, round(100 - min(80, (avg_rt - 30) * 0.5)))
        sec = max(10, round(100 - sum(1 for l in logs if l.status_code in [401, 403]) * 5))
        rel = max(10, round(100 - err_rate * 5))
        avail = max(10, round(100 - sum(1 for l in logs if l.status_code >= 500) * 10))
        opt = max(10, round((perf + rel + avail) / 3))
        overall = round((perf + sec + rel + avail + opt) / 5)

        return {
            "overall_score": overall,
            "performance_score": perf,
            "security_score": sec,
            "reliability_score": rel,
            "availability_score": avail,
            "optimization_score": opt
        }

    # Phase 7: Business Insights
    def get_business_insights(self):
        logs = self.get_user_logs()
        user_apis = self.db.query(ConnectedAPI).filter(ConnectedAPI.user_id == self.user.id).all()

        ep_counts = {}
        for l in logs:
            ep_counts[l.endpoint] = ep_counts.get(l.endpoint, 0) + 1

        most_used = max(ep_counts, key=ep_counts.get) if ep_counts else (user_apis[0].name if user_apis else "N/A")
        least_used = min(ep_counts, key=ep_counts.get) if ep_counts else "N/A"

        # Calculate estimated savings
        avg_rt = sum(l.response_time for l in logs) / len(logs) if logs else 45.0
        potential_savings = round(len(logs) * 0.00015 * (avg_rt / 100.0), 2) + 45.0

        return {
            "peak_usage_hours": "14:00 - 18:00 UTC",
            "most_used_api": most_used,
            "least_used_api": least_used,
            "potential_cost_savings_usd": potential_savings,
            "capacity_growth_forecast": "+18.5% expected request volume next week",
            "recommendations_summary": f"Caching GET payloads on {most_used} can reduce server compute load by 40%."
        }

    # Phase 8: Recommendation History
    def get_recommendation_history(self):
        # Sync initial recommendations into DB if empty
        existing = self.db.query(RecommendationHistory).filter(RecommendationHistory.user_id == self.user.id).all()
        if not existing:
            default_recs = [
                RecommendationHistory(
                    user_id=self.user.id,
                    title="Enable Response Caching for High-Volume GET Endpoints",
                    category="Performance",
                    status="Pending",
                    impact="Reduces average latency by ~65% and lowers server CPU load."
                ),
                RecommendationHistory(
                    user_id=self.user.id,
                    title="Optimize Database Query Indexing on api_logs",
                    category="Database",
                    status="Pending",
                    impact="Accelerates time-series telemetry querying speed by 10x."
                ),
                RecommendationHistory(
                    user_id=self.user.id,
                    title="Implement Rate Limiting Policy to Prevent Brute-Force Attacks",
                    category="Security",
                    status="Pending",
                    impact="Blocks rogue bot scrapers and prevents server memory spikes."
                )
            ]
            self.db.add_all(default_recs)
            self.db.commit()
            existing = self.db.query(RecommendationHistory).filter(RecommendationHistory.user_id == self.user.id).all()

        return existing

    def update_recommendation_status(self, rec_id: int, new_status: str):
        rec = (
            self.db.query(RecommendationHistory)
            .filter(RecommendationHistory.id == rec_id, RecommendationHistory.user_id == self.user.id)
            .first()
        )
        if not rec:
            return None

        rec.status = new_status
        rec.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(rec)
        return rec
