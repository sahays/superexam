import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.models import ProcessJobRequest, ProcessJobResponse, JobStatusResponse
from app.services import redis_service
from app.config import settings

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.debug else logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="SuperExam Processing Service",
    description="Background service for exam question generation from PDFs",
    version="1.0.0"
)

# CORS middleware (configure for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Configure allowed origins for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    """Root endpoint - service info"""
    return {
        "service": "SuperExam Processing Service",
        "status": "running",
        "version": "1.0.0",
        "redis_prefix": settings.redis_key_prefix
    }


@app.get("/health")
def health_check():
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
def create_process_job(request: ProcessJobRequest):
    """
    Create a new document processing job

    - Validates request data
    - Creates job in Redis with PENDING status
    - Adds job to queue for worker processing
    - Returns job_id for status tracking
    """
    try:
        job_id = redis_service.create_job(
            doc_id=request.doc_id,
            system_prompt_id=request.system_prompt_id,
            custom_prompt_id=request.custom_prompt_id,
            schema=request.schema
        )

        logger.info(f"Created job {job_id} for document {request.doc_id}")

        return ProcessJobResponse(job_id=job_id)

    except Exception as e:
        logger.error(f"Failed to create job: {e}")
        raise HTTPException(status_code=500, detail="Failed to create job")


@app.get("/jobs/{job_id}", response_model=JobStatusResponse)
def get_job_status(job_id: str):
    """
    Get job status by ID

    - Returns job metadata including status, attempts, timestamps
    - Used for debugging and monitoring
    """
    job = redis_service.get_job(job_id)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return JobStatusResponse(**job)


@app.delete("/jobs/{job_id}")
def cancel_job(job_id: str):
    """
    Cancel a pending job

    - Can only cancel jobs with PENDING status
    - Processing jobs cannot be cancelled
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
