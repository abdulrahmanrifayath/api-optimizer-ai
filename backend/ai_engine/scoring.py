from collections import defaultdict


def calculate_api_scores(logs):
    """
    Convert API logs into AI health score dashboard (Production Improved Version)
    """

    total_requests = len(logs)

    # ----------------------------
    # EMPTY STATE
    # ----------------------------
    if total_requests == 0:
        return {
            "score": 100,
            "grade": "A",
            "message": "No traffic yet",
            "metrics": {
                "total_requests": 0,
                "error_rate": 0,
                "avg_response_time": 0,
                "most_used_endpoint": None
            }
        }

    endpoint_count = defaultdict(int)
    error_count = 0
    total_response_time = 0

    # ----------------------------
    # PROCESS LOGS
    # ----------------------------
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

    # ----------------------------
    # SCORE CALCULATION (BALANCED REALISTIC)
    # ----------------------------

    score = 100

    # error penalty (soft cap)
    score -= min(error_rate * 0.8, 40)

    # response time penalty (log-based instead of power curve)
    if avg_response_time > 0.5:
        score -= min(avg_response_time * 2, 40)

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