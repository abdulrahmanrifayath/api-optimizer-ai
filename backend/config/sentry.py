import os
import logging

logger = logging.getLogger("api_optimizer")


def init_sentry():
    """
    Initialize Sentry error tracking if SENTRY_DSN environment variable is configured.
    """
    sentry_dsn = os.getenv("SENTRY_DSN")
    if not sentry_dsn:
        logger.info("ℹ️ Sentry DSN not provided. Production error tracking running in local mode.")
        return False

    try:
        import sentry_sdk
        from sentry_sdk.integrations.fastapi import FastApiIntegration
        from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration

        sentry_sdk.init(
            dsn=sentry_dsn,
            integrations=[
                FastApiIntegration(),
                SqlalchemyIntegration(),
            ],
            traces_sample_rate=0.2,
            profiles_sample_rate=0.1,
            environment=os.getenv("ENVIRONMENT", "production"),
        )
        logger.info("⚡ Sentry Production Observability & Tracing Initialized!")
        return True
    except ImportError:
        logger.warning("⚠️ sentry-sdk package not installed. Skipping Sentry initialization.")
        return False
    except Exception as e:
        logger.error(f"❌ Failed to initialize Sentry: {e}")
        return False
