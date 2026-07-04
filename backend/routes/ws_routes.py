from fastapi import APIRouter, WebSocket
import asyncio

from backend.ai_engine.analyzer import fetch_logs
from backend.ai_engine.scoring import calculate_api_scores
from backend.ai_engine.anomaly import detect_anomalies

router = APIRouter()


@router.websocket("/ws/dashboard")
async def websocket_dashboard(websocket: WebSocket):
    await websocket.accept()

    try:
        while True:
            logs = fetch_logs()

            data = {
                "score": calculate_api_scores(logs),
                "alerts": detect_anomalies(logs)
            }

            await websocket.send_json(data)

            # IMPORTANT: prevent infinite CPU usage
            await asyncio.sleep(2)

    except Exception as e:
        print("WebSocket disconnected:", e)