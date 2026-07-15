from backend.services.analytics_service import AnalyticsService


class ExecutiveSummaryService:

    def generate(self):

        analytics = AnalyticsService().get_summary()

        success_rate = analytics["success_rate"]
        response = analytics["average_response_time"]

        if success_rate >= 99 and response < 100:
            grade = "A+"
            summary = (
                "Excellent API performance. "
                "System is highly stable with minimal latency and almost no failures."
            )

        elif success_rate >= 97:
            grade = "A"
            summary = (
                "API performance is healthy. "
                "Continue monitoring traffic trends."
            )

        elif success_rate >= 95:
            grade = "B"
            summary = (
                "Performance is acceptable but improvements are recommended."
            )

        else:
            grade = "C"
            summary = (
                "System health requires immediate optimization."
            )

        return {
            "grade": grade,
            "summary": summary,
            "analytics": analytics
        }