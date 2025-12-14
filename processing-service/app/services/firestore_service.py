import firebase_admin
from firebase_admin import firestore
from typing import Optional
import time
import os
import logging
from firebase_admin import firestore
from app.config import settings

logger = logging.getLogger(__name__)

class FirestoreService:
    def __init__(self, collection_prefix: str = "superexam-"):
        # Log critical environment configuration on startup
        logger.info(f"--- FirestoreService Initializing ---")
        logger.info(f"ENV: FIRESTORE_COLLECTION_PREFIX='{collection_prefix}'")
        logger.info(f"ENV: GCS_BUCKET_NAME='{settings.gcs_bucket_name}'")
        logger.info(f"ENV: GEMINI_MODEL='{settings.gemini_model}'")
        logger.info(f"ENV: PROJECT_ID='{os.environ.get('GCP_PROJECT_ID') or os.environ.get('GOOGLE_CLOUD_PROJECT')}'")
        
        # Initialize Firebase Admin with default credentials from gcloud auth
        # Uses Application Default Credentials (ADC) from gcloud auth login
        if not firebase_admin._apps:
            firebase_admin.initialize_app()

        self.db = firestore.client()
        self.prefix = collection_prefix
        logger.info(f"Firestore initialized with project: {self.db.project}")

    def _collection(self, name: str):
        """Get collection with prefix"""
        full_name = f"{self.prefix}{name}"
        # logger.debug(f"Accessing collection: {full_name}") 
        return self.db.collection(full_name)

    def check_rate_limit(self, key: str, limit: int, window_seconds: int) -> bool:
        """
        Check if request is allowed under rate limit using Firestore transaction.
        Returns True if allowed, False if limit exceeded.
        """
        doc_ref = self._collection('rate_limits').document(key)
        transaction = self.db.transaction()

        @firestore.transactional
        def update_in_transaction(transaction, ref):
            snapshot = ref.get(transaction=transaction)
            now = time.time()
            
            if not snapshot.exists:
                transaction.set(ref, {
                    "count": 1,
                    "reset_at": now + window_seconds
                })
                return True
            
            data = snapshot.to_dict()
            reset_at = data.get("reset_at", 0)
            
            if now > reset_at:
                # Window expired, reset
                transaction.set(ref, {
                    "count": 1,
                    "reset_at": now + window_seconds
                })
                return True
            
            if data.get("count", 0) >= limit:
                return False
            
            transaction.update(ref, {
                "count": firestore.Increment(1)
            })
            return True

        return update_in_transaction(transaction, doc_ref)

    def get_document(self, doc_id: str) -> Optional[dict]:
        """Get document metadata from Firestore"""
        logger.info(f"Fetching document: {doc_id} from collection {self.prefix}documents")
        doc_ref = self._collection('documents').document(doc_id)
        doc = doc_ref.get()

        if doc.exists:
            logger.info(f"Document found: {doc.id}")
            return {"id": doc.id, **doc.to_dict()}
        
        logger.warning(f"Document {doc_id} NOT found in {doc_ref.path}")
        return None

    def get_prompt(self, collection: str, prompt_id: str) -> Optional[str]:
        """
        Get prompt content from system-prompts or custom-prompts collection
        Note: collection parameter should be the unprefixed name (e.g., 'system-prompts')
        """
        logger.info(f"Fetching prompt: {prompt_id} from {self.prefix}{collection}")
        prompt_ref = self._collection(collection).document(prompt_id)
        prompt = prompt_ref.get()

        if prompt.exists:
            return prompt.to_dict().get('content')
        
        logger.warning(f"Prompt {prompt_id} NOT found in {prompt_ref.path}")
        return None

    def update_status(
        self,
        doc_id: str,
        status: str,
        progress: Optional[int] = None,
        current_step: Optional[str] = None,
        error: Optional[str] = None
    ):
        """Update document processing status in Firestore"""
        logger.info(f"Updating status for {doc_id}: {status}")
        doc_ref = self._collection('documents').document(doc_id)

        update_data = {
            "status": status,
            "updatedAt": int(time.time() * 1000)
        }

        if progress is not None:
            update_data["progress"] = progress

        if current_step is not None:
            update_data["currentStep"] = current_step

        if error is not None:
            update_data["error"] = error

        # Clear progress fields when processing completes
        if status in ["ready", "failed"]:
            update_data["progress"] = firestore.DELETE_FIELD
            update_data["currentStep"] = firestore.DELETE_FIELD

        doc_ref.update(update_data)

    def save_questions(self, doc_id: str, questions: list[dict]):
        """Save generated questions to Firestore using batch write"""
        logger.info(f"Saving {len(questions)} questions for {doc_id}")
        doc_ref = self._collection('documents').document(doc_id)
        batch = self.db.batch()

        # Update main document
        batch.update(doc_ref, {
            "status": "ready",
            "questionCount": len(questions),
            "progress": firestore.DELETE_FIELD,
            "currentStep": firestore.DELETE_FIELD,
            "updatedAt": int(time.time() * 1000)
        })

        # Add questions to subcollection
        questions_collection = doc_ref.collection('questions')
        for q in questions:
            q_ref = questions_collection.document(q["id"])
            batch.set(q_ref, q)

        # Commit all changes atomically
        batch.commit()

    def create_job(self, job_id: str, job_data: dict):
        """Create a new job record in Firestore"""
        logger.info(f"Creating job: {job_id}")
        job_ref = self._collection('jobs').document(job_id)
        job_data['createdAt'] = int(time.time() * 1000)
        job_ref.set(job_data)

    def get_job(self, job_id: str) -> Optional[dict]:
        """Get job data from Firestore"""
        logger.info(f"Fetching job: {job_id} from {self.prefix}jobs")
        job_ref = self._collection('jobs').document(job_id)
        job = job_ref.get()
        if job.exists:
            return job.to_dict()
        
        logger.warning(f"Job {job_id} NOT found in {job_ref.path}")
        return None

    def update_job(self, job_id: str, updates: dict):
        """Update job data in Firestore"""
        job_ref = self._collection('jobs').document(job_id)
        updates['updatedAt'] = int(time.time() * 1000)
        job_ref.update(updates)


# Initialize with prefix from settings
firestore_service = FirestoreService(settings.firestore_collection_prefix)
