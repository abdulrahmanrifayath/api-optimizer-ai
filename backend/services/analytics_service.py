from datetime import datetime, timedelta

from backend.database.database import SessionLocal
from backend.models.api_log import ApiLog


class AnalyticsService:
    """
    Provides overall API analytics summary.
    """

    def __init__(self):
        self.db = SessionLocal()

    def get_summary(self, days=1):
        logs = self.db.query(ApiLog).all()

        if days > 0:
            cutoff = datetime.now() - timedelta(days=days)

            logs = [
                log
                for log in logs
                if log.timestamp >= cutoff
            ]

        total = len(logs)

        success = len(
            [
                log
                for log in logs
                if 200 <= log.status_code < 400
            ]
        )

        failed = total - success

        success_rate = (
            round(success / total * 100, 2)
            if total > 0
            else 0
        )

        average_response_time = (
            round(
                sum(log.response_time for log in logs) / total,
                2,
            )
            if total > 0
            else 0
        )

        endpoint_counter = {}

        for log in logs:
            endpoint_counter[log.endpoint] = (
                endpoint_counter.get(log.endpoint, 0) + 1
            )

        top_endpoint = (
            max(endpoint_counter, key=endpoint_counter.get)
            if endpoint_counter
            else "-"
        )

        if success_rate >= 99:
            recommendation = "Excellent API health."
        elif success_rate >= 95:
            recommendation = "Monitor response times."
        else:
            recommendation = "Immediate optimization recommended."

        return {
            "total_requests": total,
            "successful_requests": success,
            "failed_requests": failed,
            "success_rate": success_rate,
            "average_response_time": average_response_time,
            "top_endpoint": top_endpoint,
            "recommendation": recommendation,
        }