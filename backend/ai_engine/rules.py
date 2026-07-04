def analyze_api(response_time: float, status_code: int):

    suggestions = []

    if response_time > 1.0:
        suggestions.append("API is slow → consider caching or query optimization")

    if status_code >= 500:
        suggestions.append("Server error detected → check backend logic")

    if response_time > 2.0:
        suggestions.append("Critical latency → redesign endpoint")

    return suggestions