from datetime import datetime, timedelta
from sqlalchemy import func

from backend.database.database import SessionLocal
from backend.models.api_log import ApiLog

from backend.services.trend_explanation_service import TrendExplanationService

class HistoryService:

    def __init__(self):
        self.db = SessionLocal()

    def get_history(self):

        history = []

        now = datetime.now()

        for i in range(6, -1, -1):

            day = now - timedelta(days=i)

            total_requests = (
                self.db.query(ApiLog)
                .filter(func.date(ApiLog.timestamp) == day.date())
                .count()
            )

            avg_response = (
                self.db.query(func.avg(ApiLog.response_time))
                .filter(func.date(ApiLog.timestamp) == day.date())
                .scalar()
            )

            if avg_response is None:
                avg_response = 0

            errors = (
                self.db.query(ApiLog)
                .filter(
                    func.date(ApiLog.timestamp) == day.date(),
                    ApiLog.status_code >= 400
                )
                .count()
            )

            error_rate = 0

            if total_requests > 0:
                error_rate = (errors / total_requests) * 100

            history.append({

                "date": day.strftime("%a"),

                "requests": total_requests,

                "response_time": round(avg_response * 1000, 2),

                "error_rate": round(error_rate, 2)

            })

        return {

    "history": history,

    "ai_analysis": TrendExplanationService.generate(history)

}