from collections import defaultdict


def detect_anomalies(logs):
    """
    Detect unusual API behavior patterns
    """

    if not logs:
        return []

    endpoint_counts = defaultdict(int)
    error_counts = defaultdict(int)
    response_times = defaultdict(list)

    total_errors = 0

    # -----------------------------
    # COLLECT DATA
    # -----------------------------
    for log in logs:
        endpoint = log.endpoint

        endpoint_counts[endpoint] += 1

        if log.status_code >= 400:
            error_counts[endpoint] += 1
            total_errors += 1

        if log.response_time:
            response_times[endpoint].append(log.response_time)

    total_requests = len(logs)
    error_rate = (total_errors / total_requests) * 100

    alerts = []

    # -----------------------------
    # 1. HIGH ERROR RATE ALERT
    # -----------------------------
    if error_rate > 20:
        alerts.append({
            "type": "critical",
            "message": f"High system error rate detected: {round(error_rate, 2)}%",
            "recommendation": "Investigate backend stability immediately"
        })

    # -----------------------------
    # 2. ENDPOINT ABUSE DETECTION
    # -----------------------------
    for endpoint, count in endpoint_counts.items():
        if count > (total_requests * 0.4):
            alerts.append({
                "type": "warning",
                "message": f"Unusual traffic spike on {endpoint}",
                "recommendation": "Consider rate limiting or caching"
            })

    # -----------------------------
    # 3. SLOW ENDPOINT DETECTION
    # -----------------------------
    for endpoint, times in response_times.items():
        if times:
            avg_time = sum(times) / len(times)

            if avg_time > 1.0:
                alerts.append({
                    "type": "warning",
                    "message": f"Slow response detected on {endpoint} ({round(avg_time, 2)}s)",
                    "recommendation": "Optimize database queries or add caching"
                })

    # -----------------------------
    # OUTPUT
    # -----------------------------
    return alerts