"""
Application-wide constants for the API Optimizer AI project.
Keeping thresholds and configuration values here avoids
hardcoding them across multiple services.
"""

# ==========================================================
# Health Score
# ==========================================================
HEALTH_SCORE_MAX = 100

# ==========================================================
# Response Time Thresholds (seconds)
# ==========================================================
WARNING_RESPONSE_TIME = 0.15
HIGH_RESPONSE_TIME = 0.30

# ==========================================================
# Error Rate Thresholds (%)
# ==========================================================
ERROR_RATE_THRESHOLD = 5

# ==========================================================
# AI Confidence Scores (%)
# ==========================================================
TRAFFIC_CONFIDENCE = 94
CACHE_CONFIDENCE = 91
ERROR_CONFIDENCE = 97
ANOMALY_CONFIDENCE = 99
DATABASE_CONFIDENCE = 88
SYSTEM_CONFIDENCE = 100

# ==========================================================
# Expected Improvements
# ==========================================================
TRAFFIC_IMPROVEMENT = "30% lower response time"
CACHE_IMPROVEMENT = "40% faster responses"
ERROR_IMPROVEMENT = "Reduce failed requests"
ANOMALY_IMPROVEMENT = "Prevent service degradation"
DATABASE_IMPROVEMENT = "20% lower DB latency"
SYSTEM_IMPROVEMENT = "System already optimized"

# ==========================================================
# Priority Levels
# ==========================================================
PRIORITY_LOW = "LOW"
PRIORITY_HIGH = "HIGH"
PRIORITY_CRITICAL = "CRITICAL"