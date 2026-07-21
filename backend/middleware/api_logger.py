import logging
import time
from starlette.middleware.base import BaseHTTPMiddleware
from jose import jwt, JWTError

from backend.database.database import SessionLocal
from backend.models.api_log import ApiLog
from backend.auth.jwt_handler import SECRET_KEY, ALGORITHM

logger = logging.getLogger(__name__)


class ApiLoggerMiddleware(BaseHTTPMiddleware):
    """
    Middleware that automatically intercepts every incoming HTTP request,
    measures execution latency, extracts client telemetry metadata, and stores
    the log in the MySQL database.
    """

    async def dispatch(self, request, call_next):
        # Skip logging health check endpoints or websocket handshakes if preferred
        path = request.url.path
        if path == "/health":
            return await call_next(request)

        start_time = time.time()
        response = await call_next(request)
        process_time_ms = round((time.time() - start_time) * 1000, 2)

        # Extract Client IP
        client_ip = request.client.host if request.client else None

        # Extract User Agent
        user_agent = request.headers.get("user-agent")

        # Extract Response Size from Content-Length header if available
        content_length = response.headers.get("content-length")
        response_size = int(content_length) if content_length and content_length.isdigit() else None

        # Extract User ID from Authorization Bearer token if present
        user_id = self.extract_user_id(request)

        # Save log asynchronously/safely
        self.save_log(
            endpoint=path,
            method=request.method,
            status_code=response.status_code,
            response_time=process_time_ms,
            response_size=response_size,
            ip_address=client_ip,
            user_agent=user_agent,
            user_id=user_id,
        )

        return response

    def extract_user_id(self, request):
        auth_header = request.headers.get("authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return None
        token = auth_header.split(" ")[1]
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub") or payload.get("user_id")
            return int(user_id) if user_id and str(user_id).isdigit() else None
        except Exception:
            return None

    def save_log(self, endpoint, method, status_code, response_time, response_size, ip_address, user_agent, user_id):
        db = SessionLocal()
        try:
            log = ApiLog(
                endpoint=endpoint,
                method=method,
                status_code=status_code,
                response_time=response_time,
                response_size=response_size,
                ip_address=ip_address,
                user_agent=user_agent,
                user_id=user_id,
            )
            db.add(log)
            db.commit()
        except Exception:
            db.rollback()
            logger.exception("Failed to save API request telemetry log")
        finally:
            db.close()