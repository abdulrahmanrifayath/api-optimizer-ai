from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

from backend.ai_engine.analyzer import fetch_logs
from backend.ai_engine.anomaly import detect_anomalies
from backend.ai_engine.scoring import calculate_api_scores
from backend.ai_engine.traffic import get_traffic_insights

from backend.services.action_service import ActionService
from backend.services.analytics_service import AnalyticsService
from backend.services.anomaly_service import AnomalyService
from backend.services.export_service import ExportService
from backend.services.history_service import HistoryService
from backend.services.optimization_service import OptimizationService
from backend.services.pdf_export_service import PDFExportService
from backend.services.prediction_service import PredictionService
from backend.services.simulation_service import SimulationService
from backend.services.executive_summary_service import ExecutiveSummaryService
from backend.services.benchmark_service import BenchmarkService
from backend.services.executive_report_service import ExecutiveReportService
from backend.services.business_insight_service import BusinessInsightService
from backend.services.trend_service import TrendService
from backend.services.executive_insights_service import ExecutiveInsightsService

router = APIRouter(
    prefix="/ai",
    tags=["AI"]
)

# ==========================================================
# AI Dashboard
# ==========================================================
@router.get("/dashboard")
def ai_dashboard():
    try:
        logs = fetch_logs()

        return {
            "score": calculate_api_scores(logs),
            "alerts": detect_anomalies(logs),
            "traffic": get_traffic_insights(logs),
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Dashboard generation failed: {str(e)}"
        )


# ==========================================================
# Traffic Prediction
# ==========================================================
@router.get("/predict-traffic")
def predict_traffic():
    try:
        return PredictionService().get_prediction()

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Traffic prediction failed: {str(e)}"
        )


# ==========================================================
# Anomaly Detection
# ==========================================================
@router.get("/detect-anomaly")
def detect_anomaly():
    try:
        return AnomalyService().detect()

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Anomaly detection failed: {str(e)}"
        )


# ==========================================================
# Optimization Advisor
# ==========================================================
@router.get("/optimization-advisor")
def optimization_advisor():
    try:
        return OptimizationService().get_recommendations()

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Optimization advisor failed: {str(e)}"
        )


# ==========================================================
# Historical Metrics
# ==========================================================
@router.get("/history")
def api_history():
    return HistoryService().get_history()


# ==========================================================
# AI Action Center
# ==========================================================
@router.get("/actions")
def get_ai_actions():
    return ActionService().get_actions()


# ==========================================================
# AI Simulation
# ==========================================================
@router.post("/simulate-action/{action_id}")
def simulate_action(action_id: int):
    return SimulationService().simulate(action_id)


# ==========================================================
# Export JSON
# ==========================================================
@router.get("/export/json")
def export_json():
    return Response(
        content=ExportService.export_json(),
        media_type="application/json",
        headers={
            "Content-Disposition": "attachment; filename=api_report.json"
        },
    )


# ==========================================================
# Export CSV
# ==========================================================
@router.get("/export/csv")
def export_csv():
    return Response(
        content=ExportService.export_csv(),
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=api_report.csv"
        },
    )


# ==========================================================
# Export PDF
# ==========================================================
@router.get("/export/pdf")
def export_pdf():
    pdf = PDFExportService.generate()

    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=API_Optimizer_Report.pdf"
        },
    )


# ==========================================================
# Analytics
# ==========================================================
@router.get("/analytics")
def analytics(days: int = 1):
    return AnalyticsService().get_summary(days)


# ==========================================================
# Executive Report
# ==========================================================
@router.get("/executive-report")
def executive_report():
    try:
        service = ExecutiveReportService()
        return service.generate()

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Executive report generation failed: {str(e)}"
        )


# ==========================================================
# Benchmark Analytics
# ==========================================================
@router.get("/benchmark")
def benchmark():
    return BenchmarkService().get_benchmark()


# ==========================================================
# Executive Summary
# ==========================================================
@router.get("/executive-summary")
def executive_summary():
    service = ExecutiveSummaryService()
    return service.generate()


# ==========================================================
# Business Insight Service
# ==========================================================
@router.get("/business-insights")
def business_insights():
    return BusinessInsightService().generate()


# ==========================================================
# AI Trend
# ==========================================================
@router.get("/trend-data")
def trend_data():
    return TrendService().get_trends()


# ==========================================================
# Executive Insights
# ==========================================================
@router.get("/executive-insights")
def executive_insights():
    service = ExecutiveInsightsService()
    return service.generate()