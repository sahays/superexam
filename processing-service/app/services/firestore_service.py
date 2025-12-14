import firebase_admin
from firebase_admin import firestore
from typing import Optional
import time
from firebase_admin import firestore
from app.config import settings


class FirestoreService:
    def __init__(self, collection_prefix: str = "superexam-"):
        # Initialize Firebase Admin with default credentials from gcloud auth
        # Uses Application Default Credentials (ADC) from gcloud auth login
        if not firebase_admin._apps:
            firebase_admin.initialize_app()

        self.db = firestore.client()
        self.prefix = collection_prefix

    def _collection(self, name: str):
        """Get collection with prefix"""
        return self.db.collection(f"{self.prefix}{name}")

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
        doc_ref = self._collection('documents').document(doc_id)
        doc = doc_ref.get()

        if doc.exists:
            return {"id": doc.id, **doc.to_dict()}
        return None

    def get_prompt(self, collection: str, prompt_id: str) -> Optional[str]:
        """
        Get prompt content from system-prompts or custom-prompts collection
        Note: collection parameter should be the unprefixed name (e.g., 'system-prompts')
        """
        prompt_ref = self._collection(collection).document(prompt_id)
        prompt = prompt_ref.get()

        if prompt.exists:
            return prompt.to_dict().get('content')
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
        job_ref = self._collection('jobs').document(job_id)
        job_data['createdAt'] = int(time.time() * 1000)
        job_ref.set(job_data)

    def get_job(self, job_id: str) -> Optional[dict]:
        """Get job data from Firestore"""
        job_ref = self._collection('jobs').document(job_id)
        job = job_ref.get()
        if job.exists:
            return job.to_dict()
        return None

    def update_job(self, job_id: str, updates: dict):
        """Update job data in Firestore"""
        job_ref = self._collection('jobs').document(job_id)
        updates['updatedAt'] = int(time.time() * 1000)
        job_ref.update(updates)


# Initialize with prefix from settings
firestore_service = FirestoreService(settings.firestore_collection_prefix)
