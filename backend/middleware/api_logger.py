import time
from starlette.middleware.base import BaseHTTPMiddleware
from backend.database.database import SessionLocal
from backend.models.api_log import ApiLog


class ApiLoggerMiddleware(BaseHTTPMiddleware):

    async def dispatch(self, request, call_next):

        start_time = time.time()

        response = await call_next(request)

        process_time = time.time() - start_time

        db = SessionLocal()

        try:
            log = ApiLog(
                endpoint=str(request.url.path),
                method=request.method,
                status_code=response.status_code,
                response_time=round(process_time * 1000, 2)
            )

            db.add(log)
            db.commit()

        except Exception as e:
            print("Logging failed:", e)

        finally:
            db.close()

        return response