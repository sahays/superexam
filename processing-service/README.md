# SuperExam Processing Service

Python background processing service for long-running exam question generation tasks.

## Features

- ✅ Asynchronous job processing (FastAPI BackgroundTasks)
- ✅ Real-time progress updates via Firestore
- ✅ Google Cloud Storage (GCS) integration for files
- ✅ Rate limiting via Firestore

## Architecture

```
Next.js → FastAPI (API + Processor) → Gemini API
                 ↓
           Firestore (status updates)
                 ↓
           Next.js UI (polling)
```

## Setup

### 1. Prerequisites

- Python 3.11+
- Google Cloud authentication (`gcloud auth login`)
- Gemini API key
- Google Cloud Storage bucket

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
# Gemini API
GEMINI_API_KEY=your-api-key-here

# Google Cloud Storage
GCS_BUCKET_NAME=your-bucket-name
```

### 4. Start Service

```bash
# Install dependencies
pip install -r requirements.txt

# Run API server
uvicorn app.main:app --reload --port 8000
```

## Usage

### Submit a Job

```bash
curl -X POST http://localhost:8000/jobs/process \
  -H "Content-Type: application/json" \
  -d 
'{ "doc_id": "firestore-doc-id", "system_prompt_id": "prompt-id", "custom_prompt_id": "prompt-id", "schema": null }'
```

**Response:**
```json
{
  "job_id": "uuid-here"
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

## Deployment

See [Cloud Run Deployment Guide](../docs/deployment_guide.md).

## Documentation

- [Project Plan](../docs/project_plan.md)
- [Technical Design](../docs/technical_design.md)

## License

MIT