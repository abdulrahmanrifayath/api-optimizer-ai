from backend.database.database import SessionLocal
from backend.models.api_log import ApiLog
from sqlalchemy import func
from datetime import datetime, timedelta


class BenchmarkService:

    def get_benchmark(self):

        db = SessionLocal()

        try:

            today = datetime.now().date()
            yesterday = today - timedelta(days=1)

            # -------------------------
            # Today's Metrics
            # -------------------------

            today_logs = (
                db.query(ApiLog)
                .filter(func.date(ApiLog.timestamp) == today)
                .all()
            )

            # -------------------------
            # Yesterday's Metrics
            # -------------------------

            yesterday_logs = (
                db.query(ApiLog)
                .filter(func.date(ApiLog.timestamp) == yesterday)
                .all()
            )

            today_metrics = self.calculate_metrics(today_logs)
            yesterday_metrics = self.calculate_metrics(yesterday_logs)

            return {
                "today": today_metrics,
                "yesterday": yesterday_metrics,
                "comparison": {
                    "requests_change": self.percent_change(
                        yesterday_metrics["requests"],
                        today_metrics["requests"]
                    ),
                    "response_time_change": self.percent_change(
                        yesterday_metrics["response_time"],
                        today_metrics["response_time"]
                    ),
                    "success_rate_change": self.percent_change(
                        yesterday_metrics["success_rate"],
                        today_metrics["success_rate"]
                    )
                }
            }

        finally:
            db.close()

    # --------------------------------------------------------

    def calculate_metrics(self, logs):

        total = len(logs)

        if total == 0:
            return {
                "requests": 0,
                "response_time": 0,
                "success_rate": 0
            }

        avg_response = round(
            sum(log.response_time for log in logs) / total,
            2
        )

        success = len(
            [log for log in logs if 200 <= log.status_code < 400]
        )

        success_rate = round((success / total) * 100, 2)

        return {
            "requests": total,
            "response_time": avg_response,
            "success_rate": success_rate
        }

    # --------------------------------------------------------

    def percent_change(self, old, new):

        if old == 0:

            if new == 0:
                return "0%"

            return "+100%"

        change = ((new - old) / old) * 100

        if change >= 0:
            return f"+{change:.1f}%"

        return f"{change:.1f}%"