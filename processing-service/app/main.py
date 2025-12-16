import logging
import uuid
import time
from fastapi import FastAPI, HTTPException, Request, BackgroundTasks
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.models import ProcessJobRequest, ProcessJobResponse, JobStatusResponse
from app.services import firestore_service
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
def root(request: Request):
    """Root endpoint - service info"""
    return {
        "service": "SuperExam Processing Service",
        "status": "running",
        "version": "1.0.0"
    }


@app.get("/health")
def health_check(request: Request):
    """Health check endpoint"""
    return {"status": "healthy"}


@app.post("/jobs/process", response_model=ProcessJobResponse)
def create_process_job(request: Request, job_request: ProcessJobRequest, background_tasks: BackgroundTasks):
    """
    Create a new document processing job

    Rate limits:
    - 1 request per minute
    - 10 requests per hour
    - 23 requests per day
    """
    client_ip = request.client.host if request.client else "unknown"

    # Check multiple rate limit windows
    if not firestore_service.check_rate_limit(f"rate_limit:process:minute:{client_ip}", limit=1, window_seconds=60):
        raise HTTPException(status_code=429, detail="Rate limit exceeded: 1 request per minute. Try again later.")

    if not firestore_service.check_rate_limit(f"rate_limit:process:hour:{client_ip}", limit=10, window_seconds=3600):
        raise HTTPException(status_code=429, detail="Rate limit exceeded: 10 requests per hour. Try again later.")

    if not firestore_service.check_rate_limit(f"rate_limit:process:day:{client_ip}", limit=23, window_seconds=86400):
        raise HTTPException(status_code=429, detail="Rate limit exceeded: 23 requests per day. Try again later.")

    try:
        job_id = str(uuid.uuid4())
        
        job_data = {
            "job_id": job_id,
            "doc_id": job_request.doc_id,
            "system_prompt_id": job_request.system_prompt_id,
            "custom_prompt_id": job_request.custom_prompt_id,
            "schema": job_request.schema,
            "status": "pending",
            "attempt": 0,
            "created_at": int(time.time()),
        }

        firestore_service.create_job(job_id, job_data)

        logger.info(f"Created job {job_id} for document {job_request.doc_id}")

        # Trigger processing immediately in background (Local)
        # In Prod, this would be a Cloud Task enqueued here
        from app.services.processor import process_job_logic
        background_tasks.add_task(process_job_logic, job_id)

        return ProcessJobResponse(job_id=job_id)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create job: {e}")
        raise HTTPException(status_code=500, detail="Failed to create job")


@app.get("/jobs/{job_id}", response_model=JobStatusResponse)
def get_job_status(request: Request, job_id: str):
    """
    Get job status by ID
    """
    # Rate limit: 30 requests per minute
    client_ip = request.client.host if request.client else "unknown"
    if not firestore_service.check_rate_limit(f"rate_limit:status:{client_ip}", limit=30, window_seconds=60):
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Try again later.")

    job = firestore_service.get_job(job_id)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return JobStatusResponse(**job)


@app.delete("/jobs/{job_id}")
def cancel_job(request: Request, job_id: str):
    """
    Cancel a pending job
    """
    job = firestore_service.get_job(job_id)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job["status"] == "processing":
        raise HTTPException(
            status_code=400,
            detail="Cannot cancel job in progress"
        )

    firestore_service.update_job(job_id, {"status": "failed", "error": "Cancelled by user"})
    logger.info(f"Job {job_id} cancelled")

    return {"message": "Job cancelled"}


@app.post("/jobs/execute")
async def execute_job(request: Request, payload: dict):
    """
    Execute a processing job.
    Designed to be called by Cloud Tasks (Push Queue).
    """
    job_id = payload.get("job_id")
    if not job_id:
        raise HTTPException(status_code=400, detail="Missing job_id")
        
    try:
        from app.services.processor import process_job_logic
        await process_job_logic(job_id)
        return {"status": "success", "job_id": job_id}
    except Exception as e:
        logger.error(f"Execution failed for job {job_id}: {e}")
        # Return 500 to trigger Cloud Tasks retry
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
