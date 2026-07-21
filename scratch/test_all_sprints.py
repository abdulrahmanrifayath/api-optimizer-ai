import sys
from datetime import datetime
from sqlalchemy import text

from backend.database.database import SessionLocal, Base, engine
import backend.models.user
import backend.models.connected_api
import backend.models.connected_api_metric
import backend.models.api_log
import backend.models.recommendation_history
import backend.models.error_log

# Execute alter statements to migrate MySQL schema
with engine.connect() as conn:
    for col_def in [
        "ADD COLUMN last_checked DATETIME NULL",
        "ADD COLUMN latency DOUBLE PRECISION DEFAULT 0.0",
        "ADD COLUMN availability DOUBLE PRECISION DEFAULT 100.0",
        "ADD COLUMN avg_response_time DOUBLE PRECISION DEFAULT 0.0",
        "ADD COLUMN failure_count INT DEFAULT 0",
        "ADD COLUMN total_checks INT DEFAULT 0",
        "ADD COLUMN ssl_verified BOOLEAN DEFAULT 1",
        "ADD COLUMN api_key VARCHAR(500) NULL",
        "ADD COLUMN auth_header VARCHAR(255) NULL",
        "ADD COLUMN is_monitored BOOLEAN DEFAULT 1",
    ]:
        try:
            conn.execute(text(f"ALTER TABLE connected_apis {col_def}"))
            conn.commit()
        except Exception:
            pass

    for col_def in [
        "ADD COLUMN request_size INT DEFAULT 0",
        "ADD COLUMN error_type VARCHAR(50) NULL",
    ]:
        try:
            conn.execute(text(f"ALTER TABLE connected_api_metrics {col_def}"))
            conn.commit()
        except Exception:
            pass

Base.metadata.create_all(bind=engine)

def verify_all():
    print("[TEST] Initializing database tables verification...")
    db = SessionLocal()
    try:
        from backend.models.user import User
        from backend.models.connected_api import ConnectedAPI
        from backend.models.connected_api_metric import ConnectedApiMetric
        from backend.models.error_log import ErrorLog

        test_user = db.query(User).filter(User.email == "architect@optimizer.ai").first()
        if not test_user:
            test_user = User(name="Senior Architect", email="architect@optimizer.ai", password="hashed_pass")
            db.add(test_user)
            db.commit()
            db.refresh(test_user)

        # Test Connected API creation
        test_api = db.query(ConnectedAPI).filter(ConnectedAPI.base_url == "https://api.github.com").first()
        if not test_api:
            test_api = ConnectedAPI(
                name="GitHub REST API",
                base_url="https://api.github.com",
                description="GitHub Public Telemetry",
                status="Healthy",
                user_id=test_user.id
            )
            db.add(test_api)
            db.commit()
            db.refresh(test_api)

        # Test Metric Creation
        metric = ConnectedApiMetric(
            connected_api_id=test_api.id,
            status_code=200,
            response_time=85.5,
            request_size=120,
            response_size=1500,
            error_type=None
        )
        db.add(metric)

        # Test Error Log Creation
        err = ErrorLog(
            connected_api_id=test_api.id,
            error_type="Timeout",
            status_code=504,
            message="Gateway timeout simulation",
            frequency=1
        )
        db.add(err)
        db.commit()

        # Test AI Analytics Service
        from backend.services.ai_analytics_service import AIAnalyticsService
        service = AIAnalyticsService(db, test_user)

        score_card = service.get_score_card()
        print(f"[TEST] AI Score Card: {score_card}")

        features = service.get_feature_engineering_metrics()
        print(f"[TEST] Features: {features}")

        predictions = service.get_multi_horizon_predictions()
        print(f"[TEST] Multi-Horizon Predictions: Next Hour={predictions['next_hour_predicted']}, Next Day={predictions['next_day_predicted']}")

        trends = service.get_trend_detection()
        print(f"[TEST] Trend Detection: Traffic={trends['traffic_trend']}, Latency={trends['latency_trend']}")

        alerts = service.get_smart_alerts()
        print(f"[TEST] Smart Alerts Count: {len(alerts)}")

        recs = service.get_recommendation_history()
        print(f"[TEST] Recommendation History Count: {len(recs)}")

        print("[OK] ALL BACKEND VERIFICATION CHECKS PASSED CLEANLY!")

    except Exception as e:
        print(f"[ERROR] Verification failed: {e}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    verify_all()
