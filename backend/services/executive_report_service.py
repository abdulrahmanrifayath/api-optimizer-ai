from backend.services.analytics_service import AnalyticsService


class ExecutiveReportService:
    """
    Generates an AI-powered executive report using analytics data.
    """

    def __init__(self):
        self.analytics = AnalyticsService()

    def generate(self):
        analytics = self.analytics.get_summary()

        success_rate = analytics["success_rate"]
        response = analytics["average_response_time"]
        failed = analytics["failed_requests"]
        total = analytics["total_requests"]

        # Overall Health
        if success_rate >= 99:
            health = "Excellent"
        elif success_rate >= 95:
            health = "Healthy"
        elif success_rate >= 90:
            health = "Warning"
        else:
            health = "Critical"

        # Executive Summary
        summary = [
            f"{total:,} API requests processed.",
            f"Success rate remained at {success_rate}%.",
            f"Average response time is {response} ms.",
            f"Failed requests: {failed}.",
        ]

        # Business Impact
        impact = []

        if success_rate >= 99:
            impact.append("API availability exceeded SLA targets.")

        if response < 100:
            impact.append("Customer experience remains excellent.")

        if failed == 0:
            impact.append("No service interruptions detected.")
        else:
            impact.append("Minor failures detected during monitoring.")

        impact.append("Infrastructure utilization is stable.")

        # Recommendations
        recommendations = []

        if response > 200:
            recommendations.append(
                "Investigate backend latency and optimize slow endpoints."
            )
        else:
            recommendations.append(
                "Current response time is within acceptable limits."
            )

        if success_rate < 98:
            recommendations.append(
                "Reduce API failures by improving exception handling."
            )
        else:
            recommendations.append(
                "Maintain current monitoring strategy."
            )

        recommendations.append(
            "Enable caching for frequently accessed endpoints."
        )

        recommendations.append(
            "Monitor database queries for future optimization."
        )

        return {
            "overall_health": health,
            "summary": summary,
            "business_impact": impact,
            "recommendations": recommendations,
        }