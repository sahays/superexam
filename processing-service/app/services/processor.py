import logging
import time
from app.services import firestore_service, gemini_service
from app.config import settings
from app.models import JobStatus
from google.cloud import storage

logger = logging.getLogger(__name__)

async def process_job_logic(job_id: str):
    """
    Core processing logic for a single job.
    Designed to be called by an HTTP endpoint (Cloud Tasks).
    """
    # Retrieve job from Firestore (replaces Redis)
    job = firestore_service.get_job(job_id)
    if not job:
        logger.error(f"Job {job_id} not found in Firestore")
        return False

    doc_id = job["doc_id"]
    attempt = job.get("attempt", 0) + 1

    logger.info(f"Processing job {job_id} for document {doc_id} (attempt {attempt})")

    # Update job status to PROCESSING in Firestore
    firestore_service.update_job(job_id, {
        "status": JobStatus.PROCESSING,
        "attempt": attempt,
        "started_at": int(time.time())
    })

    # Update Firestore - Starting
    firestore_service.update_status(
        doc_id,
        status="processing",
        progress=0,
        current_step="Starting processing..."
    )

    try:
        # Step 1: Get document metadata
        firestore_service.update_status(doc_id, status="processing", progress=10, current_step="Reading document...")
        
        doc = firestore_service.get_document(doc_id)
        if not doc or not doc.get("filePath"):
            raise ValueError("Document or file path not found in Firestore")

        # Step 2: Read PDF file from GCS
        firestore_service.update_status(doc_id, status="processing", progress=20, current_step="Loading PDF file...")
        
        try:
            storage_client = storage.Client()
            bucket = storage_client.bucket(settings.gcs_bucket_name)
            blob = bucket.blob(doc["filePath"])
            
            if not blob.exists():
                 raise FileNotFoundError(f"PDF file not found in GCS bucket {settings.gcs_bucket_name}: {doc['filePath']}")

            pdf_buffer = blob.download_as_bytes()
            logger.info(f"Downloaded PDF from GCS: {doc['filePath']} ({len(pdf_buffer)} bytes)")

        except Exception as gcs_error:
            logger.error(f"GCS Download Error: {gcs_error}")
            raise Exception(f"Failed to download file from storage: {str(gcs_error)}")

        # Step 3: Get prompts
        firestore_service.update_status(doc_id, status="processing", progress=30, current_step="Loading prompts...")
        
        system_prompt = firestore_service.get_prompt("system-prompts", job["system_prompt_id"])
        custom_prompt = firestore_service.get_prompt("custom-prompts", job["custom_prompt_id"])

        if not system_prompt or not custom_prompt:
            raise ValueError("Prompts not found")

        # Step 4: Generate questions
        firestore_service.update_status(doc_id, status="processing", progress=40, current_step="Analyzing PDF content with AI...")
        
        logger.info(f"Calling Gemini API for job {job_id}")
        questions = gemini_service.generate_questions(
            pdf_buffer=pdf_buffer,
            system_prompt=system_prompt,
            custom_prompt=custom_prompt,
            schema=job.get("schema")
        )

        # Step 5: Save results
        firestore_service.update_status(doc_id, status="processing", progress=90, current_step="Saving questions...")
        firestore_service.save_questions(doc_id, questions)

        # Step 6: Mark complete
        firestore_service.update_job(job_id, {
            "status": JobStatus.COMPLETED,
            "completed_at": int(time.time())
        })
        logger.info(f"Job {job_id} completed successfully")
        
        return True

    except Exception as e:
        logger.error(f"Job {job_id} failed: {e}", exc_info=True)
        
        firestore_service.update_job(job_id, {
            "status": JobStatus.FAILED,
            "completed_at": int(time.time()),
            "error": str(e)
        })
        
        firestore_service.update_status(
            doc_id,
            status="failed",
            error=f"Processing failed: {str(e)}"
        )
        # Re-raise to let the caller (API) know it failed
        raise e
