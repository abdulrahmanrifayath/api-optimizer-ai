from backend.services.analytics_service import AnalyticsService


class ExecutiveInsightsService:
    """
    Generates AI-style executive insights from API analytics.
    """

    def __init__(self):
        self.analytics = AnalyticsService()

    def generate(self):

        analytics = self.analytics.get_summary()

        success = analytics["success_rate"]
        response = analytics["average_response_time"]
        failed = analytics["failed_requests"]

        insights = []

        # API Health
        if success >= 99:
            insights.append({
                "title": "API Reliability",
                "status": "Excellent",
                "message": "The platform is operating with excellent stability."
            })

        elif success >= 95:
            insights.append({
                "title": "API Reliability",
                "status": "Good",
                "message": "Minor failures detected. Continue monitoring."
            })

        else:
            insights.append({
                "title": "API Reliability",
                "status": "Critical",
                "message": "High failure rate detected. Immediate optimization recommended."
            })

        # Performance
        if response < 200:
            insights.append({
                "title": "Performance",
                "status": "Excellent",
                "message": "Average response time is well below industry standards."
            })

        elif response < 500:
            insights.append({
                "title": "Performance",
                "status": "Average",
                "message": "Performance is acceptable but can be improved."
            })

        else:
            insights.append({
                "title": "Performance",
                "status": "Poor",
                "message": "Response latency is significantly high."
            })

        # Failure Analysis
        if failed == 0:
            insights.append({
                "title": "Failures",
                "status": "Healthy",
                "message": "No failed API requests detected."
            })

        else:
            insights.append({
                "title": "Failures",
                "status": "Attention",
                "message": f"{failed} failed requests require investigation."
            })

        return {
            "insights": insights
        }