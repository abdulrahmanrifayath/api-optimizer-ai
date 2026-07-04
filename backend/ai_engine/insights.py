def generate_insights(logs):
    insights = []

    for log in logs:

        # slow API detection
        if log.response_time > 1.0:
            insights.append(
                f"{log.endpoint} is slow ({log.response_time}s) → optimize query or add caching"
            )

        # error detection
        if log.status_code >= 500:
            insights.append(
                f"{log.endpoint} has server errors → check backend logic"
            )

        # authentication issues
        if log.status_code == 401:
            insights.append(
                f"{log.endpoint} authentication failure → verify login system"
            )

    return insights