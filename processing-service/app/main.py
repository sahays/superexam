import logging
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.models import ProcessJobRequest, ProcessJobResponse, JobStatusResponse
from app.services import redis_service, init_security_service, security_service
from app.middleware import SecurityMiddleware
from app.config import settings

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.debug else logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

# Create FastAPI app
app = FastAPI(
    title="SuperExam Processing Service",
    description="Background service for exam question generation from PDFs",
    version="1.0.0"
)

# Set rate limiter state
app.state.limiter = limiter


# Custom rate limit exceeded handler
@app.exception_handler(RateLimitExceeded)
async def custom_rate_limit_handler(request: Request, exc: RateLimitExceeded):
    """
    Custom handler for rate limit exceeded

    Logs the violation and potentially blocks repeat offenders
    """
    client_ip = request.client.host if request.client else "unknown"
    logger.warning(f"Rate limit exceeded for {client_ip} on {request.url.path}")

    # Record rate limit violation
    if security_service:
        security_service.record_rate_limit_violation(client_ip)

    return JSONResponse(
        status_code=429,
        content={
            "error": "Rate limit exceeded",
            "message": "Too many requests. Please slow down.",
            "retry_after": exc.detail.split("Retry after ")[1] if "Retry after" in exc.detail else "60 seconds"
        },
        headers={
            "Retry-After": "60"
        }
    )

# Initialize security service
init_security_service(redis_service.client, settings.redis_key_prefix)
logger.info("Security service initialized")

# Add security middleware (bot detection, IP blocking)
app.add_middleware(SecurityMiddleware)

# CORS middleware (configure for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Configure allowed origins for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
@limiter.limit("10/minute")
def root(request: Request):
    """Root endpoint - service info"""
    return {
        "service": "SuperExam Processing Service",
        "status": "running",
        "version": "1.0.0",
        "redis_prefix": settings.redis_key_prefix
    }


@app.get("/health")
def health_check(request: Request):
    """Health check endpoint - verifies Redis connectivity"""
    try:
        redis_connected = redis_service.ping()
        if redis_connected:
            return {
                "status": "healthy",
                "redis": "connected",
                "prefix": settings.redis_key_prefix
            }
        else:
            return {
                "status": "unhealthy",
                "redis": "disconnected",
                "error": "Redis ping failed"
            }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e)
        }


@app.post("/jobs/process", response_model=ProcessJobResponse)
@limiter.limit("5/minute")
def create_process_job(request: Request, job_request: ProcessJobRequest):
    """
    Create a new document processing job

    - Validates request data
    - Creates job in Redis with PENDING status
    - Adds job to queue for worker processing
    - Returns job_id for status tracking

    Rate limit: 5 requests per minute (expensive operation)
    """
    try:
        job_id = redis_service.create_job(
            doc_id=job_request.doc_id,
            system_prompt_id=job_request.system_prompt_id,
            custom_prompt_id=job_request.custom_prompt_id,
            schema=job_request.schema
        )

        logger.info(f"Created job {job_id} for document {job_request.doc_id}")

        return ProcessJobResponse(job_id=job_id)

    except Exception as e:
        logger.error(f"Failed to create job: {e}")
        raise HTTPException(status_code=500, detail="Failed to create job")


@app.get("/jobs/{job_id}", response_model=JobStatusResponse)
@limiter.limit("30/minute")
def get_job_status(request: Request, job_id: str):
    """
    Get job status by ID

    - Returns job metadata including status, attempts, timestamps
    - Used for debugging and monitoring

    Rate limit: 30 requests per minute (lightweight operation)
    """
    job = redis_service.get_job(job_id)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return JobStatusResponse(**job)


@app.delete("/jobs/{job_id}")
@limiter.limit("10/minute")
def cancel_job(request: Request, job_id: str):
    """
    Cancel a pending job

    - Can only cancel jobs with PENDING status
    - Processing jobs cannot be cancelled

    Rate limit: 10 requests per minute
    """
    job = redis_service.get_job(job_id)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job["status"] == "processing":
        raise HTTPException(
            status_code=400,
            detail="Cannot cancel job in progress"
        )

    redis_service.mark_failed(job_id, "Cancelled by user")
    logger.info(f"Job {job_id} cancelled")

    return {"message": "Job cancelled"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
