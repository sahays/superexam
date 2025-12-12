import json
import time
import uuid
from typing import Optional
import redis
from app.config import settings
from app.models import JobStatus


class RedisService:
    def __init__(self):
        self.client = redis.Redis(
            host=settings.redis_host,
            port=settings.redis_port,
            db=settings.redis_db,
            password=settings.redis_password,
            decode_responses=True
        )

        # Redis key prefixes with namespace
        self.prefix = settings.redis_key_prefix
        self.job_key_prefix = f"{self.prefix}job:"
        self.queue_key = f"{self.prefix}job_queue"
        self.delayed_queue_key = f"{self.prefix}delayed_jobs"

    def create_job(
        self,
        doc_id: str,
        system_prompt_id: str,
        custom_prompt_id: str,
        schema: Optional[str] = None
    ) -> str:
        """Create a new job and add to queue"""
        job_id = str(uuid.uuid4())

        job_data = {
            "job_id": job_id,
            "doc_id": doc_id,
            "system_prompt_id": system_prompt_id,
            "custom_prompt_id": custom_prompt_id,
            "schema": schema,
            "status": JobStatus.PENDING,
            "attempt": 0,
            "max_attempts": settings.max_retry_attempts,
            "created_at": int(time.time()),
            "started_at": None,
            "completed_at": None,
            "error": None,
            "retry_at": None
        }

        # Store job data with TTL
        self.client.setex(
            f"{self.job_key_prefix}{job_id}",
            settings.job_ttl,
            json.dumps(job_data)
        )

        # Add to queue
        self.client.rpush(self.queue_key, job_id)

        return job_id

    def get_job(self, job_id: str) -> Optional[dict]:
        """Get job data by ID"""
        data = self.client.get(f"{self.job_key_prefix}{job_id}")
        if data:
            return json.loads(data)
        return None

    def update_job(self, job_id: str, updates: dict):
        """Update job data and refresh TTL"""
        job = self.get_job(job_id)
        if job:
            job.update(updates)
            self.client.setex(
                f"{self.job_key_prefix}{job_id}",
                settings.job_ttl,
                json.dumps(job)
            )

    def pop_job(self) -> Optional[str]:
        """Pop next job from queue (blocking)"""
        result = self.client.blpop(self.queue_key, timeout=settings.worker_poll_interval)
        if result:
            _, job_id = result
            return job_id
        return None

    def requeue_job(self, job_id: str, delay_seconds: int = 0):
        """Requeue a job for retry"""
        job = self.get_job(job_id)
        if not job:
            return

        if delay_seconds > 0:
            # Schedule for future retry using sorted set
            retry_timestamp = int(time.time()) + delay_seconds
            job["retry_at"] = retry_timestamp
            job["status"] = JobStatus.PENDING
            self.update_job(job_id, job)

            # Add to delayed queue (sorted set scored by retry timestamp)
            self.client.zadd(self.delayed_queue_key, {job_id: retry_timestamp})
        else:
            # Immediate retry
            job["status"] = JobStatus.PENDING
            self.update_job(job_id, job)
            self.client.rpush(self.queue_key, job_id)

    def get_delayed_jobs(self) -> list[str]:
        """Get jobs ready to be retried from delayed queue"""
        now = int(time.time())

        # Get jobs with retry_at <= now
        job_ids = self.client.zrangebyscore(self.delayed_queue_key, 0, now)

        if job_ids:
            # Remove from delayed queue
            self.client.zremrangebyscore(self.delayed_queue_key, 0, now)

        return job_ids

    def mark_completed(self, job_id: str):
        """Mark job as completed"""
        self.update_job(job_id, {
            "status": JobStatus.COMPLETED,
            "completed_at": int(time.time())
        })

    def mark_failed(self, job_id: str, error: str):
        """Mark job as failed"""
        self.update_job(job_id, {
            "status": JobStatus.FAILED,
            "completed_at": int(time.time()),
            "error": error
        })

    def delete_job(self, job_id: str):
        """Delete job from Redis"""
        self.client.delete(f"{self.job_key_prefix}{job_id}")

    def ping(self) -> bool:
        """Check Redis connection"""
        try:
            return self.client.ping()
        except Exception:
            return False


redis_service = RedisService()
