import firebase_admin
from firebase_admin import firestore
from typing import Optional


class FirestoreService:
    def __init__(self):
        # Initialize Firebase Admin with default credentials from gcloud auth
        # Uses Application Default Credentials (ADC) from gcloud auth login
        if not firebase_admin._apps:
            firebase_admin.initialize_app()

        self.db = firestore.client()

    def get_document(self, doc_id: str) -> Optional[dict]:
        """Get document metadata from Firestore"""
        doc_ref = self.db.collection('documents').document(doc_id)
        doc = doc_ref.get()

        if doc.exists:
            return {"id": doc.id, **doc.to_dict()}
        return None

    def get_prompt(self, collection: str, prompt_id: str) -> Optional[str]:
        """Get prompt content from system-prompts or custom-prompts collection"""
        prompt_ref = self.db.collection(collection).document(prompt_id)
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
        doc_ref = self.db.collection('documents').document(doc_id)

        update_data = {
            "status": status,
            "updatedAt": firestore.SERVER_TIMESTAMP
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
        doc_ref = self.db.collection('documents').document(doc_id)
        batch = self.db.batch()

        # Update main document
        batch.update(doc_ref, {
            "status": "ready",
            "questionCount": len(questions),
            "progress": firestore.DELETE_FIELD,
            "currentStep": firestore.DELETE_FIELD,
            "updatedAt": firestore.SERVER_TIMESTAMP
        })

        # Add questions to subcollection
        questions_collection = doc_ref.collection('questions')
        for q in questions:
            q_ref = questions_collection.document(q["id"])
            batch.set(q_ref, q)

        # Commit all changes atomically
        batch.commit()


firestore_service = FirestoreService()
