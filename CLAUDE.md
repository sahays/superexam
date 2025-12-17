# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SuperExam is a web application for generating interactive exams from PDF documents using Google Gemini AI. It uses a hybrid architecture:

1. **Next.js Frontend** (`website/`): App Router-based UI with Server Actions, handling user interactions and auth
2. **Python Processing Service** (`processing-service/`): FastAPI service for long-running AI generation tasks

**Key Technologies:**
- Frontend: Next.js 16, TypeScript, Tailwind CSS 4, Shadcn UI, Zustand, React Hook Form
- Backend: Python 3.11+, FastAPI, Google Gemini 1.5 Flash
- Infrastructure: Google Cloud (Firestore, Storage, Cloud Run)

## Development Setup

### Next.js Application
```bash
cd website
npm install
npm run dev  # Starts on http://localhost:3000
```

### Python Processing Service
```bash
cd processing-service
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Environment Variables
Both services require `.env` files. See `website/.env.example` and `processing-service/.env.example`.

Required variables:
- `GEMINI_API_KEY`: Google Gemini API key
- `GCS_BUCKET_NAME`: Google Cloud Storage bucket name
- `GCP_PROJECT_ID`: Google Cloud project ID
- `PROCESSING_SERVICE_URL`: URL of Python service (http://localhost:8000 for local dev)

## Architecture & Data Flow

### Document Processing Workflow
1. User uploads PDF → Saved to Google Cloud Storage (GCS)
2. Metadata stored in Firestore `documents` collection with status `uploaded`
3. User selects System + Custom prompts → Triggers processing via Server Action
4. Server Action calls Python service: `POST /jobs/process`
5. Python service:
   - Creates job in Firestore `jobs` collection
   - Processes in background (BackgroundTasks locally, Cloud Tasks in prod)
   - Downloads PDF from GCS
   - Fetches prompts from Firestore
   - Calls Gemini API with PDF + prompts
   - Updates Firestore with real-time progress (0-100%)
   - Saves generated questions to document
6. Frontend polls Firestore for status updates (`processing` → `ready` | `failed`)

### Exam Execution
- Users configure exams (time limit, question count) from processed documents
- State managed via Zustand (`lib/stores/exam-store.ts`)
- Exam sessions persisted to Firestore `exam-sessions` collection
- AI explanations stream via Server-Sent Events (SSE) at `app/api/explain/route.ts`

## Code Structure

### Next.js (`website/`)
```
app/
├── (dashboard)/           # Route group for main app
│   ├── documents/         # Document management pages
│   ├── prompts/           # Prompt management pages
│   ├── exams/             # Exam pages
│   ├── layout.tsx         # Dashboard layout (sidebar + header)
│   └── page.tsx           # Welcome page with stats
├── actions/               # Server Actions for mutations
│   ├── documents.ts       # uploadDocument, processDocument, deleteDocument
│   ├── prompts.ts         # CRUD for system/custom prompts
│   └── exams.ts           # Exam-related actions
└── api/
    └── explain/           # SSE endpoint for AI explanations

lib/
├── db/                    # Firestore data access layer
│   ├── firebase.ts        # Firebase Admin initialization
│   ├── documents.ts       # Document queries
│   └── prompts.ts         # Prompt queries
├── services/              # Business logic
├── stores/                # Zustand stores (exam state)
├── types/                 # TypeScript interfaces
│   └── index.ts           # Document, Question, Prompt, Exam types
└── utils/                 # Utilities (cn, etc.)
```

### Python Service (`processing-service/`)
```
app/
├── main.py                # FastAPI app, endpoints, rate limiting
├── models.py              # Pydantic models (ProcessJobRequest, etc.)
├── config.py              # Settings (from env vars)
└── services/
    ├── firestore_service.py  # Firestore operations
    ├── gemini_service.py     # Gemini API calls
    ├── pdf_service.py        # PDF text extraction
    └── processor.py          # Core processing logic
```

## Development Patterns

### Server Actions
- All data mutations use Server Actions in `app/actions/`
- Naming convention: `verbNoun` (e.g., `uploadDocument`, `createSystemPrompt`)
- Return type: `{ success: boolean, data?: T, error?: string }`
- Example:
```typescript
export async function uploadDocument(formData: FormData) {
  try {
    // Process upload
    return { success: true, data: document };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### Firestore Collections
- `documents`: Document metadata, status, progress
- `system-prompts`: Role/behavior prompts
- `custom-prompts`: Task-specific instructions
- `exam-sessions`: Completed exam records
- `jobs`: Processing job queue/status
- `rate-limits`: Rate limiting counters

### Status Polling Pattern
Client components poll Firestore during processing:
```typescript
useEffect(() => {
  if (status === 'processing') {
    const interval = setInterval(async () => {
      const doc = await getDocument(id);
      setStatus(doc.status);
      setProgress(doc.progress);
    }, 2000);
    return () => clearInterval(interval);
  }
}, [status]);
```

### Type Safety
- All Firestore documents have TypeScript interfaces in `lib/types/index.ts`
- Python service uses Pydantic models in `app/models.py`
- Ensure type consistency between services (especially Question structure)

### Design System
- Dark mode professional SaaS theme
- Colors: Purple primary (#5750F1), Green success (#3FD97F), Orange warning (#FF9C55)
- Background: Gradient from #0F1117 to #1C1F26
- Cards: #1C1F26 background, #2E3342 border, rounded-[10px]
- Shadcn UI components with custom styling via `cn()` utility

## Deployment

Deploy to Google Cloud Run using `./deploy.sh`:

```bash
# Quick update (no env var changes)
./deploy.sh

# Full deployment (with env var updates)
./deploy.sh --full
```

The script:
1. Builds Docker images for both services
2. Pushes to Google Artifact Registry
3. Deploys to Cloud Run with configured environment variables
4. Uses Gen 2 execution environment
5. 30-minute timeout for long-running AI tasks

Services deployed:
- `superexam-api`: Python processing service
- `superexam-website`: Next.js frontend

## Rate Limiting

Python service implements Firestore-based rate limiting on `/jobs/process`:
- 1 request per minute per IP
- 10 requests per hour per IP
- 23 requests per day per IP

Status check endpoint: 30 requests per minute per IP

## Common Tasks

### Add a new Server Action
1. Create function in appropriate file in `app/actions/`
2. Mark with `'use server'` directive
3. Import and use in Client Components with `useTransition` or form actions

### Add a new Firestore collection
1. Define TypeScript interface in `lib/types/index.ts`
2. Add data access functions in `lib/db/`
3. Add Python Pydantic model if accessed by processing service

### Modify Question Generation
1. Update Gemini prompt in `processing-service/app/services/gemini_service.py`
2. Update Question type in `lib/types/index.ts` if structure changes
3. Update frontend display components in `website/app/(dashboard)/exams/`

### Debug Processing Issues
1. Check Python service logs: `docker logs <container-id>` or Cloud Run logs
2. Check Firestore `jobs` collection for job status/errors
3. Check document `status`, `error`, and `currentStep` fields
4. Verify GCS bucket permissions and file existence

## Important Notes

- Next.js uses standalone output mode for Docker deployment
- Server Actions have 25MB body size limit (configured in `next.config.ts`)
- Python service uses `async def` for processor but FastAPI BackgroundTasks for local dev
- Firestore security rules not included - ensure proper authentication in production
- CORS is wide open (`allow_origins=["*"]`) - configure for production
- Rate limiting uses Firestore for serverless compatibility (no Redis needed)
