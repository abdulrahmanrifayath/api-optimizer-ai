from backend.services.analytics_service import AnalyticsService


class BusinessInsightService:

    def generate(self):
        analytics = AnalyticsService().get_summary()

        success = analytics["success_rate"]
        response = analytics["average_response_time"]
        failed = analytics["failed_requests"]

        insights = []

        if success >= 99:
            insights.append(
                "API reliability is excellent. Current infrastructure is highly stable."
            )
        elif success >= 95:
            insights.append(
                "System is stable but monitoring response latency is recommended."
            )
        else:
            insights.append(
                "API stability is below enterprise standards. Immediate optimization is recommended."
            )

        if response > 500:
            insights.append(
                "High response latency detected. Consider caching and load balancing."
            )
        elif response > 250:
            insights.append(
                "Response time is acceptable but optimization opportunities exist."
            )
        else:
            insights.append(
                "Response performance is excellent."
            )

        if failed > 0:
            insights.append(
                f"{failed} failed requests detected during the analysis period."
            )
        else:
            insights.append(
                "No failed requests detected."
            )

        return {
            "generated_by": "AI Business Insight Engine",
            "insights": insights
        }