# SuperExam Processing Service - Technical Design Document

## Overview

This document describes the architecture and design of the Python background processing service that handles
long-running exam question generation tasks.

## Problem Statement

Current Next.js architecture has limitations:

- **Blocking Operations**: Server Actions wait for entire AI generation (30s-2min), risking timeout
- **No Real-Time Progress**: UI shows "Starting AI processing..." throughout, no intermediate updates
- **Single-Threaded**: Next.js handles processing synchronously
- **Poor UX**: Users wait with no feedback during long operations

## Solution Architecture

### High-Level Flow

```
Next.js App
    ↓ (1) HTTP POST /jobs/process
FastAPI Service
    ↓ (2) Create job in Redis
Redis Queue
    ↓ (3) Worker polls queue
Worker Process
    ↓ (4) Updates Firestore with progress
Firestore
    ↓ (5) Client polls for status
Next.js UI (Real-time updates)
```

### Key Components

1. **FastAPI HTTP Server** - Job submission endpoint
2. **Redis** - Job queue and state persistence
3. **Worker Processes** - Background job execution
4. **Firestore** - Real-time status updates for UI
5. **Gemini API** - AI question generation

---

## Data Flow

### 1. Job Submission Flow

```
User clicks "Process with AI"
    ↓
Next.js calls processDocument() Server Action
    ↓
Server Action updates Firestore: status="processing", progress=0
    ↓
Server Action POSTs to Python service: /jobs/process
    ↓
FastAPI creates job in Redis with status="pending"
    ↓
FastAPI adds job_id to Redis queue
    ↓
Returns job_id to Next.js
    ↓
Next.js shows "Processing started" toast
```

### 2. Worker Processing Flow

```
Worker polls Redis queue (blocking BLPOP)
    ↓
Gets job_id from queue
    ↓
Fetches job data from Redis
    ↓
Updates job: status="processing", attempt=1
    ↓
Updates Firestore: progress=10, step="Reading document..."
    ↓
Fetches document metadata from Firestore
    ↓
Updates Firestore: progress=20, step="Loading PDF..."
    ↓
Reads PDF file from /uploads volume
    ↓
Updates Firestore: progress=30, step="Loading prompts..."
    ↓
Fetches system and custom prompts from Firestore
    ↓
Updates Firestore: progress=40, step="Analyzing PDF..."
    ↓
Calls Gemini API (30s-2min)
    ↓
Updates Firestore: progress=90, step="Saving questions..."
    ↓
Saves questions to Firestore subcollection
    ↓
Updates Firestore: status="ready", progress=100
    ↓
Updates Redis job: status="completed"
```

### 3. Retry Flow (on Failure)

```
Worker catches exception during processing
    ↓
Check attempt count (attempt < 3?)
    ↓
Yes: Calculate retry delay (0s, 30s, 60s)
    ↓
Add job to Redis delayed queue (sorted set by timestamp)
    ↓
Update Firestore: step="Retrying... (attempt 2/3)"
    ↓
Worker's delayed job processor checks for ready jobs
    ↓
Moves ready jobs back to main queue
    ↓
Repeat processing
    ↓
No (max attempts reached): Mark job as failed
    ↓
Update Firestore: status="failed", error="..."
```

### 4. UI Polling Flow

```
Document card shows status="processing"
    ↓
useEffect starts polling interval (2.5s)
    ↓
Calls getDocumentStatus() Server Action
    ↓
Fetches document from Firestore
    ↓
Updates card UI with progress/currentStep
    ↓
Status still "processing"? Continue polling
    ↓
Status changed to "ready" or "failed"? Stop polling
    ↓
Show success/error toast
```

---

## Data Models

### Redis Job Structure

```json
{
  "job_id": "uuid-v4",
  "doc_id": "firestore-doc-id",
  "system_prompt_id": "prompt-id",
  "custom_prompt_id": "prompt-id",
  "schema": "json-string | null",
  "status": "pending | processing | completed | failed",
  "attempt": 1,
  "max_attempts": 3,
  "created_at": 1234567890,
  "started_at": 1234567890 | null,
  "completed_at": 1234567890 | null,
  "error": "error message" | null,
  "retry_at": 1234567890 | null
}
```

**Redis Keys:**

- Job data: `job:{job_id}` (string, JSON serialized)
- Main queue: `job_queue` (list, FIFO)
- Delayed jobs: `delayed_jobs` (sorted set, scored by retry timestamp)

### Firestore Document Status

```json
{
  "id": "doc-id",
  "status": "processing | ready | failed",
  "progress": 0-100,
  "currentStep": "Reading PDF... | Analyzing content... | Generating questions...",
  "error": "error message" | null,
  "questionCount": 0,
  "updatedAt": timestamp
}
```

---

## Key Features

### 1. Stateful Job Management (Redis)

**Purpose**: Persist job state across service restarts

**Implementation**:

- Jobs stored as JSON strings in Redis with TTL
- Queue uses Redis LIST (RPUSH to add, BLPOP to consume)
- Delayed jobs use Redis SORTED SET (scored by retry timestamp)

**Benefits**:

- Jobs survive service restarts
- Workers can be scaled independently
- Queue is persistent and distributed

### 2. Retry Logic with Exponential Backoff

**Purpose**: Handle transient failures (API rate limits, network issues)

**Implementation**:

- 3 attempts per job (configurable)
- Retry delays: [0s, 30s, 60s]
- Delayed queue uses sorted set for scheduled retries
- Worker checks delayed queue each iteration

**Benefits**:

- Automatic recovery from transient errors
- Prevents overwhelming Gemini API
- Clear failure threshold (3 attempts)

### 3. Real-Time Progress Updates (Firestore)

**Purpose**: Provide user feedback during long-running operations

**Implementation**:

- Worker updates Firestore at each processing step
- Progress: 0% → 10% → 20% → 30% → 40% → 90% → 100%
- Current step descriptions for user visibility
- Client polls Firestore every 2.5 seconds

**Benefits**:

- Users see actual progress, not just "processing"
- Clear indication of where processing is stuck if it fails
- Better UX for long-running tasks

### 4. Worker Scalability

**Purpose**: Process multiple jobs concurrently

**Implementation**:

- Multiple worker processes via Docker Compose replicas
- Each worker polls Redis queue independently
- Workers are stateless (all state in Redis/Firestore)

**Benefits**:

- Horizontal scaling: docker-compose up --scale worker=8
- Parallel processing of multiple documents
- No coordination needed between workers

### 5. Non-Blocking Job Submission

**Purpose**: Next.js returns immediately without waiting for processing

**Implementation**:

- Next.js calls Python service to create job
- Python service queues job and returns job_id
- Total submission time: <100ms
- Processing happens asynchronously

**Benefits**:

- No Server Action timeouts
- Better Next.js performance
- User can navigate away during processing

---

## API Endpoints

### POST /jobs/process

**Request:**

```json
{
	"doc_id": "firestore-doc-id",
	"system_prompt_id": "prompt-id",
	"custom_prompt_id": "prompt-id",
	"schema": "json-string | null"
}
```

**Response:**

```json
{
	"job_id": "uuid-v4",
	"message": "Job queued successfully"
}
```

### GET /jobs/{job_id}

**Response:**

```json
{
	"job_id": "uuid-v4",
	"status": "pending | processing | completed | failed",
	"attempt": 1,
	"max_attempts": 3,
	"error": null,
	"created_at": 1234567890,
	"started_at": 1234567890,
	"completed_at": null
}
```

### DELETE /jobs/{job_id}

**Response:**

```json
{
	"message": "Job cancelled"
}
```

### GET /health

**Response:**

```json
{
	"status": "healthy",
	"redis": "connected"
}
```

---

## Deployment Architecture

### Project Structure

```
processing-service/
├── app/
│   ├── main.py              # FastAPI app (job submission)
│   ├── worker.py            # Worker process (job execution)
│   ├── models.py            # Pydantic request/response models
│   ├── config.py            # Environment configuration
│   └── services/
│       ├── redis_service.py      # Redis operations
│       ├── firestore_service.py  # Firestore operations
│       └── gemini_service.py     # Gemini API calls
├── docker-compose.yml       # Service orchestration
├── Dockerfile               # Python app container
├── requirements.txt         # Python dependencies
└── .env                     # Environment variables
```

### Docker Compose Services

**redis**

- Image: redis:7-alpine
- Port: 6379
- Persistence: Volume mounted for data
- Health check: redis-cli ping

**api**

- Build: Local Dockerfile
- Port: 8000
- Command: uvicorn app.main:app
- Volumes: Firebase credentials, PDF uploads (read-only)

**worker** (replicas: 2)

- Build: Local Dockerfile
- Command: python -m app.worker
- Volumes: Firebase credentials, PDF uploads (read-only)
- Scalable: docker-compose up --scale worker=4

### Environment Variables

```env
# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Firebase
FIREBASE_CREDENTIALS_PATH=/credentials/firebase-credentials.json

# Gemini
GEMINI_API_KEY=your-key
GEMINI_MODEL=gemini-1.5-flash

# Processing
MAX_RETRY_ATTEMPTS=3
WORKER_POOL_SIZE=4
```

### Volume Mounts

```yaml
volumes:
  - ./credentials:/credentials:ro # Firebase credentials
  - ../website/uploads:/uploads:ro # PDF files (read-only)
  - redis_data:/data # Redis persistence
```

---

## Integration with Next.js

### Server Action Update

```typescript
// app/actions/documents.ts
export async function processDocument(
	docId: string,
	systemPromptId: string,
	customPromptId: string,
	schema: string | null
) {
	// 1. Update Firestore immediately
	await db.collection("documents").doc(docId).update({
		status: "processing",
		currentStep: "Queuing job...",
		progress: 0,
	});

	// 2. Call Python processing service
	const response = await fetch("http://localhost:8000/jobs/process", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			doc_id: docId,
			system_prompt_id: systemPromptId,
			custom_prompt_id: customPromptId,
			schema: schema,
		}),
	});

	const { job_id } = await response.json();

	// 3. Return immediately (processing happens in background)
	revalidatePath("/documents");
	return { success: true, jobId: job_id };
}
```

### Client-Side Polling (No Changes)

Existing polling implementation in `document-card.tsx` continues to work:

- Polls Firestore every 2.5 seconds
- Updates UI with progress/currentStep
- Stops polling when status changes to "ready" or "failed"

---

## Error Handling

### Common Errors

| Error                       | Cause                    | Recovery                       |
| --------------------------- | ------------------------ | ------------------------------ |
| PDF not found               | File missing, wrong path | Check volume mount             |
| Prompts not found           | Invalid prompt IDs       | Validate IDs before submission |
| Gemini API error            | Rate limit, quota        | Retry with backoff             |
| Redis connection failed     | Redis down               | Check health, restart          |
| Firestore permission denied | Invalid credentials      | Verify Firebase config         |

### Retry Strategy

**Attempt 1**: Immediate retry (0s delay)

- Handles transient network issues

**Attempt 2**: 30s delay

- Handles API rate limits

**Attempt 3**: 60s delay

- Final attempt before marking failed

**After 3 attempts**: Mark job as failed

- Update Firestore with error message
- User sees failure notification

---

## Monitoring & Debugging

### Logs

```bash
# View all logs
docker-compose logs -f

# Worker logs only
docker-compose logs -f worker

# API logs only
docker-compose logs -f api
```

### Redis Inspection

```bash
# Connect to Redis
docker-compose exec redis redis-cli

# View all jobs
KEYS job:*

# Get specific job
GET job:uuid-here

# View queue
LRANGE job_queue 0 -1

# View delayed jobs
ZRANGE delayed_jobs 0 -1 WITHSCORES
```

### Health Checks

```bash
# Check API
curl http://localhost:8000/health

# Check Redis
docker-compose exec redis redis-cli ping
```

---

## Performance Optimization

### Scaling Workers

```bash
# Scale to 8 workers for high load
docker-compose up -d --scale worker=8
```

### Redis Tuning

```yaml
# Add memory limits and eviction policy
command: redis-server --appendonly yes --maxmemory 512mb --maxmemory-policy allkeys-lru
```

### Worker Optimization

- **Poll interval**: Adjust for faster/slower queue checks
- **Retry delays**: Tune based on Gemini API rate limits
- **Connection pooling**: Reuse Firestore connections

---

## Future Enhancements

- [ ] WebSocket support for real-time progress (eliminate polling)
- [ ] Job cancellation from UI
- [ ] Prometheus metrics for monitoring
- [ ] Rate limiting for Gemini API
- [ ] Job priority queue
- [ ] Admin dashboard for job monitoring
- [ ] Graceful shutdown handling
- [ ] Auto-scaling based on queue size

---

## Architecture Benefits

✅ **Non-Blocking**: Next.js returns immediately after queuing job ✅ **Real-Time Progress**: Firestore updates at every
processing step ✅ **Scalable**: Multiple workers process jobs concurrently ✅ **Resilient**: Automatic retry with
exponential backoff ✅ **Stateful**: Redis persists job state across restarts ✅ **Isolated**: Processing failures don't
affect web server ✅ **Observable**: Comprehensive logging and monitoring ✅ **Language-Appropriate**: Python for AI/ML
workflows

---

## References

- Project Plan: `docs/project_plan.md`
- FastAPI: https://fastapi.tiangolo.com
- Redis: https://redis.io/docs
- Gemini API: https://ai.google.dev/docs
