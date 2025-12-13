import logging
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.status import HTTP_429_TOO_MANY_REQUESTS, HTTP_403_FORBIDDEN
from app.services import security_service

logger = logging.getLogger(__name__)


class SecurityMiddleware(BaseHTTPMiddleware):
    """
    Middleware for security checks:
    - IP blocking
    - Bot detection
    - Request header validation
    """

    async def dispatch(self, request: Request, call_next):
        # Get client IP
        client_ip = request.client.host if request.client else "unknown"

        # Skip security checks for health endpoint
        if request.url.path == "/health":
            return await call_next(request)

        # Check if IP is blocked
        if security_service and security_service.is_ip_blocked(client_ip):
            block_info = security_service.get_block_info(client_ip)
            logger.warning(f"Blocked request from {client_ip}: {block_info}")

            return JSONResponse(
                status_code=HTTP_403_FORBIDDEN,
                content={
                    "error": "Access forbidden",
                    "message": "Your IP has been temporarily blocked",
                    "reason": block_info.get("reason") if block_info else "Unknown",
                    "expires_in": block_info.get("expires_in") if block_info else None
                }
            )

        # Validate request headers (bot detection)
        if security_service:
            headers_dict = dict(request.headers)
            is_valid, error_msg = security_service.validate_request_headers(headers_dict)

            if not is_valid:
                logger.warning(f"Invalid request from {client_ip}: {error_msg}")

                # Track and potentially block
                security_service.track_request(client_ip, request.url.path)

                return JSONResponse(
                    status_code=HTTP_403_FORBIDDEN,
                    content={
                        "error": "Invalid request",
                        "message": error_msg
                    }
                )

        # Track request patterns
        if security_service:
            is_suspicious = security_service.track_request(client_ip, request.url.path)
            if is_suspicious:
                return JSONResponse(
                    status_code=HTTP_429_TOO_MANY_REQUESTS,
                    content={
                        "error": "Too many requests",
                        "message": "Suspicious activity detected. Your IP has been temporarily blocked."
                    }
                )

        # Process request
        response = await call_next(request)

        return response
