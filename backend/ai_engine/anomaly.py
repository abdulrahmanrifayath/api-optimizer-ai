from collections import defaultdict


def detect_anomalies(logs):
    """
    AI-powered anomaly detection (improved version)
    """

    if not logs:
        return []

    endpoint_times = defaultdict(list)
    anomalies = []

    # -------------------------
    # GROUP RESPONSE TIMES
    # -------------------------
    for log in logs:
        if log.response_time:
            endpoint_times[log.endpoint].append(log.response_time)

    # -------------------------
    # CALCULATE THRESHOLDS
    # -------------------------
    for endpoint, times in endpoint_times.items():

        avg_time = sum(times) / len(times)
        max_time = max(times)

        # SPIKE detection (key upgrade)
        if max_time > avg_time * 3 and max_time > 2:
            anomalies.append({
                "type": "critical",
                "message": f"Performance spike detected on {endpoint}",
                "recommendation": "Check database queries or external API calls"
            })

        # SLOW endpoint detection
        if avg_time > 2:
            anomalies.append({
                "type": "warning",
                "message": f"Slow endpoint detected: {endpoint}",
                "recommendation": "Optimize response time using caching or indexing"
            })

    # -------------------------
    # ERROR RATE ANOMALY
    # -------------------------
    error_count = sum(1 for log in logs if log.status_code >= 400)
    error_rate = (error_count / len(logs)) * 100

    if error_rate > 10:
        anomalies.append({
            "type": "critical",
            "message": f"High error rate detected: {round(error_rate,2)}%",
            "recommendation": "Fix backend exceptions and validation issues"
        })

    return anomalies