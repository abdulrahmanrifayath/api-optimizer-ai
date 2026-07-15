import csv
import io
import json

from backend.ai_engine.analyzer import fetch_logs
from backend.ai_engine.scoring import calculate_api_scores
from backend.ai_engine.anomaly import detect_anomalies
from backend.ai_engine.traffic import get_traffic_insights


class ExportService:

    @staticmethod
    def collect_dashboard_data():
        logs = fetch_logs()

        return {
            "score": calculate_api_scores(logs),
            "alerts": detect_anomalies(logs),
            "traffic": get_traffic_insights(logs),
            "logs": logs,
        }

    @staticmethod
    def export_json():
        data = ExportService.collect_dashboard_data()

        return json.dumps(data, indent=4, default=str)

    @staticmethod
    def export_csv():
        data = ExportService.collect_dashboard_data()

        output = io.StringIO()

        writer = csv.writer(output)

        writer.writerow([
            "Endpoint",
            "Method",
            "Status Code",
            "Response Time",
            "Timestamp",
        ])

        for log in data["logs"]:
            writer.writerow([
                getattr(log, "endpoint", ""),
                getattr(log, "method", ""),
                getattr(log, "status_code", ""),
                getattr(log, "response_time", ""),
                getattr(log, "timestamp", ""),
            ])

        return output.getvalue()