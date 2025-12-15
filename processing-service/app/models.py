from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class JobStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class ProcessJobRequest(BaseModel):
    doc_id: str
    system_prompt_id: str
    custom_prompt_id: str
    schema: Optional[str] = None  # DEPRECATED: Schema now defined via Pydantic models in gemini_service.py


class ProcessJobResponse(BaseModel):
    job_id: str
    message: str = "Job queued successfully"


class JobStatusResponse(BaseModel):
    job_id: str
    status: JobStatus
    attempt: int
    max_attempts: int
    error: Optional[str] = None
    created_at: int
    started_at: Optional[int] = None
    completed_at: Optional[int] = None


class Question(BaseModel):
    id: str
    text: str
    options: list[str]
    correctAnswer: int = Field(ge=0, le=3)
    explanation: str
