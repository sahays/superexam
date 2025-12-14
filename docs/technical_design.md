# SuperExam Processing Service - Technical Design Document

## Overview

This document describes the architecture and design of the Python background processing service that handles long-running exam question generation tasks.

## Solution Architecture

### High-Level Flow

```
Next.js App
    ↓ (1) HTTP POST /jobs/process
FastAPI Service
    ↓ (2) Creates job in Firestore
    ↓ (3) Triggers background task (or Cloud Task)
Processing Logic
    ↓ (4) Reads PDF from GCS
    ↓ (5) Calls Gemini API
    ↓ (6) Updates Firestore with progress
Next.js UI (Real-time updates)
    ↓ (7) Polls Firestore for status
```

### Key Components

1.  **FastAPI HTTP Server**: Handles API requests and orchestrates processing.
2.  **Firestore**: Acts as the "Job DB" and "Status Store".
3.  **Google Cloud Storage (GCS)**: Stores uploaded PDF files.
4.  **Gemini API**: Generates exam questions.

---

## Data Flow

### 1. Job Submission Flow

```
User clicks "Process with AI"
    ↓
Next.js calls processDocument() Server Action
    ↓
Server Action uploads file to GCS
    ↓
Server Action updates Firestore: status="processing", progress=0
    ↓
Server Action POSTs to Python service: /jobs/process
    ↓
FastAPI creates job record in Firestore
    ↓
FastAPI starts background task (local) or queues Cloud Task (prod)
    ↓
Returns job_id to Next.js
```

### 2. Processing Flow

```
Processor starts
    ↓
Updates job status in Firestore: status="processing", attempt=1
    ↓
Updates Firestore doc: progress=10, step="Reading document..."
    ↓
Fetches document metadata from Firestore
    ↓
Downloads PDF from GCS
    ↓
Updates Firestore doc: progress=30, step="Loading prompts..."
    ↓
Fetches prompts from Firestore
    ↓
Updates Firestore doc: progress=40, step="Analyzing PDF..."
    ↓
Calls Gemini API
    ↓
Updates Firestore doc: progress=90, step="Saving questions..."
    ↓
Saves questions to Firestore subcollection
    ↓
Updates Firestore doc: status="ready", progress=100
    ↓
Updates Job record: status="completed"
```

---

## Data Models

### Firestore Job Structure (Collection: `jobs`)

```json
{
  "job_id": "uuid-v4",
  "doc_id": "firestore-doc-id",
  "system_prompt_id": "prompt-id",
  "custom_prompt_id": "prompt-id",
  "schema": "json-string | null",
  "status": "pending | processing | completed | failed",
  "attempt": 1,
  "created_at": timestamp,
  "started_at": timestamp,
  "completed_at": timestamp,
  "error": "error message"
}
```

### Firestore Document Status (Collection: `documents`)

```json
{
  "id": "doc-id",
  "status": "processing | ready | failed",
  "progress": 0-100,
  "currentStep": "Reading PDF... | Analyzing content...",
  "error": "error message",
  "questionCount": 0,
  "filePath": "gcs-filename",
  "updatedAt": timestamp
}
```

---

## Key Features

### 1. Stateless Architecture (Cloud Run Ready)

**Purpose**: Run efficiently in a serverless environment.

**Implementation**:
- No local file storage (uses GCS).
- No persistent in-memory state (uses Firestore).
- Single container deployment.

### 2. Real-Time Progress Updates

**Purpose**: Provide user feedback during long-running operations.

**Implementation**:
- Processor updates Firestore at each step.
- Client polls Firestore every 2.5 seconds.

### 3. Rate Limiting (Firestore-backed)

**Purpose**: Prevent abuse and manage costs.

**Implementation**:
- Uses Firestore transactions to count requests per IP/window.
- Limits: 5 requests/min for processing, 30/min for status checks.

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

### POST /jobs/execute (Internal/Cloud Tasks)

**Request:**
```json
{
    "job_id": "uuid-v4"
}
```

### GET /health

**Response:**
```json
{
    "status": "healthy"
}
```

---

## Deployment Architecture

### Project Structure

```
processing-service/
├── app/
│   ├── main.py              # FastAPI app
│   ├── models.py            # Pydantic models
│   ├── config.py            # Configuration
│   └── services/
│       ├── firestore_service.py
│       ├── processor.py     # Core logic
│       └── gemini_service.py
├── Dockerfile
├── requirements.txt
└── .env
```

### Environment Variables

```env
GEMINI_API_KEY=...
GCP_PROJECT_ID=...
GCS_BUCKET_NAME=...
FIRESTORE_COLLECTION_PREFIX=superexam-
```