from sqlalchemy.orm import Session
from backend.models.api_log import ApiLog


class APIAnalyzer:

    def __init__(self, db: Session):
        self.db = db

    # 1. Get all logs
    def get_logs(self):
        return self.db.query(ApiLog).all()

    # 2. Find slow APIs (> 500 ms)
    def get_slow_apis(self, threshold=500):
        logs = self.db.query(ApiLog).all()

        slow = []

        for log in logs:
            if log.response_time > threshold:
                slow.append({
                    "endpoint": log.endpoint,
                    "response_time": log.response_time
                })

        return slow

    # 3. Top endpoints by usage
    def top_endpoints(self):
        logs = self.db.query(ApiLog).all()

        count_map = {}

        for log in logs:
            count_map[log.endpoint] = count_map.get(log.endpoint, 0) + 1

        sorted_endpoints = sorted(count_map.items(), key=lambda x: x[1], reverse=True)

        return sorted_endpoints[:5]

    # 4. Error rate analysis
    def error_rate(self):
        logs = self.db.query(ApiLog).all()

        total = len(logs)
        errors = len([l for l in logs if l.status_code >= 400])

        if total == 0:
            return 0

        return round((errors / total) * 100, 2)

    # 5. Full AI Insight Generator
    def generate_insights(self):

        slow = self.get_slow_apis()
        top = self.top_endpoints()
        error = self.error_rate()

        insights = []

        # Slow API insight
        if slow:
            insights.append({
                "type": "performance",
                "message": "Slow APIs detected",
                "data": slow,
                "recommendation": "Enable caching or optimize database queries"
            })

        # Traffic insight
        if top:
            insights.append({
                "type": "traffic",
                "message": "Top used endpoints identified",
                "data": top,
                "recommendation": "Consider load balancing or caching for these endpoints"
            })

        # Error insight
        if error > 5:
            insights.append({
                "type": "error",
                "message": f"High error rate: {error}%",
                "recommendation": "Check API validation and backend stability"
            })

        return insights