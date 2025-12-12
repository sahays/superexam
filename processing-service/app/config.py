import os
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Redis Configuration
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_db: int = 0
    redis_password: str | None = None
    redis_key_prefix: str = "superexam:"  # Prefix for all Redis keys

    # Gemini Configuration
    gemini_api_key: str
    gemini_model: str = "gemini-1.5-flash"

    # Processing Configuration
    max_retry_attempts: int = 3
    retry_delays: List[int] = [0, 30, 60]  # Exponential backoff in seconds
    worker_poll_interval: int = 1  # Worker poll interval in seconds
    job_ttl: int = 86400  # Job TTL in seconds (24 hours)

    # File Configuration
    uploads_dir: str = "/uploads"  # Default for Docker, override for local

    # Server Configuration
    port: int = 8000
    host: str = "0.0.0.0"
    debug: bool = False

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
