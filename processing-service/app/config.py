import os
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Firestore Configuration
    firestore_collection_prefix: str = "superexam-"  # Prefix for all Firestore collections

    # Gemini Configuration
    gemini_api_key: str
    gemini_model: str = "gemini-1.5-flash"

    # Processing Configuration
    max_retry_attempts: int = 3
    retry_delays: List[int] = [0, 30, 60]  # Exponential backoff in seconds
    job_ttl: int = 86400  # Job TTL in seconds (24 hours)

    # File Configuration
    uploads_dir: str = "/uploads"  # Default for Docker, override for local
    gcs_bucket_name: str = "superexam-uploads"  # GCS Bucket for file storage

    # Server Configuration
    port: int = 8000
    host: str = "0.0.0.0"
    debug: bool = False

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
