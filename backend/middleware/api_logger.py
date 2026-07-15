import logging
import time

from starlette.middleware.base import BaseHTTPMiddleware

from backend.database.database import SessionLocal
from backend.models.api_log import ApiLog


# Configure logger for this module
logger = logging.getLogger(__name__)


class ApiLoggerMiddleware(BaseHTTPMiddleware):
    """
    Middleware that logs every API request to the database.

    Captures:
    - Endpoint
    - HTTP Method
    - Status Code
    - Response Time
    """

    async def dispatch(self, request, call_next):
        """
        Intercepts every incoming request, measures execution time,
        stores the request information in the database, and returns
        the original response.
        """

        start_time = time.time()

        response = await call_next(request)

        process_time = round(time.time() - start_time, 4)

        # Save API log after the response is generated
        self.save_log(
            endpoint=request.url.path,
            method=request.method,
            status_code=response.status_code,
            response_time=process_time,
        )

        return response

    def save_log(self, endpoint, method, status_code, response_time):
        """
        Save API request information into the database.
        """

        db = SessionLocal()

        try:
            log = ApiLog(
                endpoint=endpoint,
                method=method,
                status_code=status_code,
                response_time=response_time,
            )

            db.add(log)
            db.commit()
            db.refresh(log)

        except Exception:
            db.rollback()
            logger.exception("Failed to save API log")

        finally:
            db.close()