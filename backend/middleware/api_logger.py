import time
from starlette.middleware.base import BaseHTTPMiddleware
from backend.database.database import SessionLocal
from backend.models.api_log import ApiLog


class ApiLoggerMiddleware(BaseHTTPMiddleware):

    async def dispatch(self, request, call_next):

        start_time = time.time()

        response = await call_next(request)

        process_time = round(time.time() - start_time, 4)

        # ⚡ DO NOT BLOCK REQUEST (important fix)
        self.save_log_background(
            request.url.path,
            request.method,
            response.status_code,
            process_time
        )

        return response

    def save_log_background(self, endpoint, method, status_code, response_time):
        """
        Fast DB write (non-blocking logic)
        """

        try:
            db = SessionLocal()

            log = ApiLog(
                endpoint=endpoint,
                method=method,
                status_code=status_code,
                response_time=response_time
            )

            db.add(log)
            db.commit()
            db.refresh(log)
            db.close()

        except Exception as e:
            print("Logging error:", e)