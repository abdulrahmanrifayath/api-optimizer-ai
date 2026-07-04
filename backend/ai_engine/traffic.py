from collections import Counter


def get_traffic_insights(logs):
    """
    Analyze API usage patterns
    """

    if not logs:
        return {
            "top_endpoints": [],
            "total_unique_endpoints": 0
        }

    endpoints = Counter(log.endpoint for log in logs)

    return {
        "top_endpoints": endpoints.most_common(5),
        "total_unique_endpoints": len(endpoints)
    }