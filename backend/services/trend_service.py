from backend.services.analytics_service import AnalyticsService


class TrendService:
    """
    Generates trend data for dashboard charts.
    """

    def get_trends(self):
        analytics = AnalyticsService().get_summary()

        total = analytics["total_requests"]
        success = analytics["successful_requests"]
        failed = analytics["failed_requests"]
        response = analytics["average_response_time"]

        # Demo trend values (replace later with DB aggregation)
        trend = [
            {
                "time": "09:00",
                "requests": max(total - 80, 0),
                "response_time": response + 25,
                "success_rate": 97.8
            },
            {
                "time": "10:00",
                "requests": max(total - 60, 0),
                "response_time": response + 15,
                "success_rate": 98.5
            },
            {
                "time": "11:00",
                "requests": max(total - 30, 0),
                "response_time": response + 10,
                "success_rate": 99.1
            },
            {
                "time": "12:00",
                "requests": total,
                "response_time": response,
                "success_rate": round(
                    (success / total * 100) if total else 0,
                    2
                )
            }
        ]

        return trend