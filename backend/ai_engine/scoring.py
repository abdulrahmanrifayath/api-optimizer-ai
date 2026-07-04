from collections import defaultdict


def calculate_api_scores(logs):
    """
    Convert API logs into AI health score dashboard
    """

    total_requests = len(logs)
    if total_requests == 0:
        return {
            "score": 100,
            "grade": "A",
            "message": "No traffic yet"
        }

    endpoint_count = defaultdict(int)
    error_count = 0
    total_response_time = 0

    for log in logs:
        endpoint_count[log.endpoint] += 1

        if log.status_code >= 400:
            error_count += 1

        total_response_time += log.response_time or 0

    # ----------------------------
    # METRICS
    # ----------------------------

    error_rate = (error_count / total_requests) * 100
    avg_response_time = total_response_time / total_requests

    most_used = max(endpoint_count, key=endpoint_count.get)
    slow_endpoint_score = avg_response_time

    # ----------------------------
    # SCORE CALCULATION
    # ----------------------------

    score = 100

    # penalty for errors
    score -= error_rate * 0.8

    # penalty for speed
    if avg_response_time > 1:
        score -= (avg_response_time * 10)

    # clamp score
    score = max(0, min(100, round(score, 2)))

    # ----------------------------
    # GRADE SYSTEM
    # ----------------------------

    if score >= 90:
        grade = "A"
    elif score >= 75:
        grade = "B"
    elif score >= 60:
        grade = "C"
    elif score >= 40:
        grade = "D"
    else:
        grade = "F"

    # ----------------------------
    # OUTPUT
    # ----------------------------

    return {
        "score": score,
        "grade": grade,
        "metrics": {
            "total_requests": total_requests,
            "error_rate": round(error_rate, 2),
            "avg_response_time": round(avg_response_time, 4),
            "most_used_endpoint": most_used
        }
    }