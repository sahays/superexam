# SuperExam Processing Service

Python background processing service for long-running exam question generation tasks.

## Features

- ✅ Non-blocking job processing with Redis queue
- ✅ Automatic retry with exponential backoff (3 attempts)
- ✅ Real-time progress updates via Firestore
- ✅ Scalable worker processes
- ✅ Prefixed Redis keys for multi-project environments

## Architecture

```
Next.js → FastAPI → Redis Queue → Workers → Gemini API
                         ↓
                   Firestore (status updates)
                         ↓
                   Next.js UI (polling)
```

## Setup

### 1. Prerequisites

- Python 3.11+
- Docker & Docker Compose
- Redis instance running on port 6379
- Google Cloud authentication (`gcloud auth login`)
- Gemini API key

### 2. Google Cloud Authentication

```bash
# Login with gcloud (provides default credentials)
gcloud auth login

# Set your project
gcloud config set project your-project-id

# Setup Application Default Credentials
gcloud auth application-default login
```

### 3. Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your values
nano .env
```

**Required Configuration:**

```env
# Redis - Use your existing Redis instance
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_KEY_PREFIX=superexam:  # Prefix to avoid key conflicts

# Gemini API
GEMINI_API_KEY=your-api-key-here
```

### 4. Start Services

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# View worker logs only
docker-compose logs -f worker

# Scale workers
docker-compose up -d --scale worker=4
```

## Usage

### Submit a Job

```bash
curl -X POST http://localhost:8000/jobs/process \
  -H "Content-Type: application/json" \
  -d '{
    "doc_id": "firestore-doc-id",
    "system_prompt_id": "prompt-id",
    "custom_prompt_id": "prompt-id",
    "schema": null
  }'
```

**Response:**
```json
{
  "job_id": "uuid-here",
  "message": "Job queued successfully"
}
```

### Check Job Status

```bash
curl http://localhost:8000/jobs/{job_id}
```

### Health Check

```bash
curl http://localhost:8000/health
```

## Redis Key Structure

All keys are prefixed with `REDIS_KEY_PREFIX` (default: `superexam:`):

- `superexam:job:{job_id}` - Job data (JSON)
- `superexam:job_queue` - Main job queue (LIST)
- `superexam:delayed_jobs` - Delayed retry queue (SORTED SET)

## Monitoring

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f worker
docker-compose logs -f api
```

### Inspect Redis

```bash
# Connect to your existing Redis instance
redis-cli

# View all SuperExam jobs
KEYS superexam:job:*

# View queue
LRANGE superexam:job_queue 0 -1

# View delayed jobs
ZRANGE superexam:delayed_jobs 0 -1 WITHSCORES
```

### Check Health

```bash
curl http://localhost:8000/health
```

## Scaling

```bash
# Scale to 8 workers
docker-compose up -d --scale worker=8

# Scale down to 2 workers
docker-compose up -d --scale worker=2
```

## Development

### Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run API server
python -m app.main

# Run worker (in separate terminal)
python -m app.worker
```

### Environment Variables

See `.env.example` for all available configuration options.

## Troubleshooting

### Worker not processing jobs

1. Check Redis connection:
   ```bash
   curl http://localhost:8000/health
   ```

2. Check worker logs:
   ```bash
   docker-compose logs -f worker
   ```

3. Verify Redis keys:
   ```bash
   redis-cli
   KEYS superexam:*
   ```

4. Ensure Redis is accessible:
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

### Jobs failing immediately

1. Check Google Cloud authentication:
   ```bash
   gcloud auth application-default print-access-token
   ```

2. Verify PDF file exists in `/uploads`
3. Check Gemini API key is valid
4. Review worker logs for detailed errors
5. Ensure gcloud credentials are mounted correctly

### Redis key conflicts

Ensure `REDIS_KEY_PREFIX` is unique across all projects using the same Redis instance.

## Documentation

- [Project Plan](../docs/project_plan.md)
- [Technical Design](../docs/technical_design.md)

## License

MIT
