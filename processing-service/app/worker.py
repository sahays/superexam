import logging
import time
from pathlib import Path
from app.services import redis_service, firestore_service, gemini_service
from app.config import settings
from app.models import JobStatus

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.debug else logging.INFO,
    format='%(asctime)s - Worker - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class Worker:
    def __init__(self):
        self.running = True
        logger.info(f"Worker initialized with Redis prefix: {settings.redis_key_prefix}")

    def process_job(self, job_id: str):
        """Process a single job with retry logic"""
        job = redis_service.get_job(job_id)
        if not job:
            logger.error(f"Job {job_id} not found in Redis")
            return

        doc_id = job["doc_id"]
        attempt = job["attempt"] + 1

        logger.info(f"Processing job {job_id} for document {doc_id} (attempt {attempt}/{job['max_attempts']})")

        # Update job status to PROCESSING
        redis_service.update_job(job_id, {
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
            # Step 1: Get document metadata (10%)
            firestore_service.update_status(
                doc_id,
                status="processing",
                progress=10,
                current_step="Reading document..."
            )

            doc = firestore_service.get_document(doc_id)
            if not doc or not doc.get("filePath"):
                raise Exception("Document or file path not found in Firestore")

            # Step 2: Read PDF file (20%)
            firestore_service.update_status(
                doc_id,
                status="processing",
                progress=20,
                current_step="Loading PDF file..."
            )

            # PDFs are in uploads directory (configurable via env)
            file_path = Path(settings.uploads_dir) / doc["filePath"]
            if not file_path.exists():
                raise Exception(f"PDF file not found: {file_path}")

            with open(file_path, "rb") as f:
                pdf_buffer = f.read()

            logger.info(f"Read PDF file: {file_path} ({len(pdf_buffer)} bytes)")

            # Step 3: Get prompts (30%)
            firestore_service.update_status(
                doc_id,
                status="processing",
                progress=30,
                current_step="Loading prompts..."
            )

            system_prompt = firestore_service.get_prompt(
                "system-prompts",
                job["system_prompt_id"]
            )
            custom_prompt = firestore_service.get_prompt(
                "custom-prompts",
                job["custom_prompt_id"]
            )

            if not system_prompt or not custom_prompt:
                raise Exception("One or both prompts not found in Firestore")

            # Step 4: Generate questions with AI (40% -> 90%)
            firestore_service.update_status(
                doc_id,
                status="processing",
                progress=40,
                current_step="Analyzing PDF content with AI..."
            )

            logger.info(f"Calling Gemini API for job {job_id}")
            questions = gemini_service.generate_questions(
                pdf_buffer=pdf_buffer,
                system_prompt=system_prompt,
                custom_prompt=custom_prompt,
                schema=job.get("schema")
            )

            logger.info(f"Generated {len(questions)} questions for job {job_id}")

            # Step 5: Save results (90%)
            firestore_service.update_status(
                doc_id,
                status="processing",
                progress=90,
                current_step="Saving questions..."
            )

            firestore_service.save_questions(doc_id, questions)

            # Step 6: Mark complete (100%)
            firestore_service.update_status(
                doc_id,
                status="ready",
                progress=100
            )

            redis_service.mark_completed(job_id)
            logger.info(f"Job {job_id} completed successfully ({len(questions)} questions generated)")

        except Exception as e:
            logger.error(f"Job {job_id} failed (attempt {attempt}): {e}", exc_info=True)

            # Determine if we should retry
            if attempt < job["max_attempts"]:
                # Calculate retry delay using exponential backoff
                delay_index = attempt - 1
                delay = settings.retry_delays[delay_index] if delay_index < len(settings.retry_delays) else 60

                logger.info(f"Requeueing job {job_id} with {delay}s delay (attempt {attempt + 1}/{job['max_attempts']})")
                redis_service.requeue_job(job_id, delay_seconds=delay)

                # Update Firestore with retry info
                firestore_service.update_status(
                    doc_id,
                    status="processing",
                    progress=0,
                    current_step=f"Retrying... (attempt {attempt + 1}/{job['max_attempts']})"
                )
            else:
                # Max attempts reached - mark as failed
                logger.error(f"Job {job_id} failed after {attempt} attempts")
                redis_service.mark_failed(job_id, str(e))

                firestore_service.update_status(
                    doc_id,
                    status="failed",
                    error=f"Failed after {attempt} attempts: {str(e)}"
                )

    def process_delayed_jobs(self):
        """Move delayed jobs back to main queue when ready"""
        ready_jobs = redis_service.get_delayed_jobs()
        for job_id in ready_jobs:
            logger.info(f"Moving delayed job {job_id} back to queue")
            redis_service.client.rpush(redis_service.queue_key, job_id)

    def run(self):
        """Main worker loop"""
        logger.info("Worker started - waiting for jobs...")

        while self.running:
            try:
                # First, process any delayed jobs that are ready
                self.process_delayed_jobs()

                # Pop next job from queue (blocking)
                job_id = redis_service.pop_job()

                if job_id:
                    self.process_job(job_id)

            except KeyboardInterrupt:
                logger.info("Worker stopping (KeyboardInterrupt)...")
                self.running = False
            except Exception as e:
                logger.error(f"Worker error: {e}", exc_info=True)
                time.sleep(1)  # Brief pause before retrying

        logger.info("Worker stopped")


if __name__ == "__main__":
    worker = Worker()
    worker.run()
