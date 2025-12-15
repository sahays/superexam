# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**SuperExam** is a Next.js 16 web application that generates and administers interactive exams from PDF documents using Google Gemini AI. The architecture consists of two services:
- **Next.js Frontend** (`website/`) - UI, Server Actions, and basic processing
- **Python Processing Service** (`processing-service/`) - Heavy AI processing via FastAPI

## Development Commands

### Next.js Website

```bash
cd website
npm install          # Install dependencies
npm run dev          # Development server (http://localhost:3000)
npm run build        # Production build
npm start            # Production server
npm run lint         # Run ESLint
```

### Python Processing Service

```bash
cd processing-service
pip install -r requirements.txt                    # Install dependencies
uvicorn app.main:app --reload --port 8000         # Development server (http://localhost:8000)
```

### Deployment

```bash
# Quick upgrade (no env var changes)
./deploy.sh

# Full deployment (with env var updates)
./deploy.sh --full
```

## Architecture Overview

### Service Communication Flow

```
User → Next.js (Port 3000)
         ↓
    Server Action (processDocument)
         ↓
    FastAPI Service (Port 8000) → Gemini API
         ↓
    Firestore (status updates)
         ↓
    Next.js UI (polling every 2-3s)
```

### Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Shadcn UI
- **Backend**: FastAPI (Python), Firebase Admin SDK
- **Database**: Google Cloud Firestore
- **Storage**: Google Cloud Storage (GCS)
- **AI**: Google Gemini API (gemini-1.5-flash model)
- **State Management**: Zustand (client), Server Components (server)
- **Forms**: React Hook Form + Zod validation

### Next.js Directory Structure

**Key directories in `website/`:**

- **`app/`** - Next.js App Router
  - `(dashboard)/` - Authenticated routes: `/documents`, `/prompts`, `/exams`
  - `actions/` - Server Actions for mutations (documents.ts, prompts.ts, exams.ts)
  - `api/` - API routes (e.g., SSE streaming for AI explanations)
  - `layout.tsx` - Root layout with theme provider
  - `page.tsx` - Landing page

- **`lib/`** - Business logic
  - `db/` - Firestore access layer
    - `firebase.ts` - Firebase Admin initialization and collection() helper
    - `documents.ts`, `prompts.ts` - Data access functions
  - `services/` - Core business logic
    - `ai.ts` - Gemini API integration
    - `pdf.ts` - PDF parsing utilities
  - `types/` - TypeScript interfaces and Zod schemas
  - `stores/` - Zustand stores (exam state management)

- **`components/`** - React components
  - `ui/` - Shadcn UI primitives (Radix-based)
  - `documents/`, `prompts/`, `exams/` - Feature-specific components

### Python Processing Service Structure

**Key files in `processing-service/`:**

- **`app/`**
  - `main.py` - FastAPI app, endpoints, rate limiting
  - `config.py` - Environment configuration
  - `models.py` - Pydantic models
  - `services/` - Business logic (processor.py, firestore.py, gemini.py, storage.py)
  - `middleware/` - Request middleware

## Data Flow Patterns

### Server Actions Pattern

All mutations use Server Actions in `app/actions/`:

```typescript
// app/actions/documents.ts
export async function uploadDocument(formData: FormData) {
  // 1. Validate with Zod
  // 2. Perform operation
  // 3. Revalidate path
  // 4. Return { success, error, data }
}
```

Always:
- Use Zod for input validation
- Return standardized responses: `{ success?: boolean, error?: string, data?: T }`
- Call `revalidatePath()` after mutations
- Use `'use server'` directive

### Firestore Access Pattern

Use the `collection()` helper for prefixed collection names:

```typescript
import { db, collection } from '@/lib/db/firebase';

// Access collection with automatic prefixing
const docsRef = db.collection(collection('documents'));
const doc = await docsRef.doc(id).get();
```

**Collections:**
- `documents` - Document metadata (status, progress, error)
  - Subcollection: `documents/{id}/questions`
- `system-prompts` - System prompts (role/behavior)
- `custom-prompts` - Custom prompts (user-specific)
- `exam-sessions` - Exam results and history

### Document Processing Workflow

**Three-phase process:**

1. **Upload Phase** (`uploadDocument` Server Action)
   - User uploads PDF via dialog
   - PDF saved to GCS bucket
   - Document record created in Firestore with `status: 'uploaded'`

2. **Prompt Selection** (Process Dialog)
   - User clicks "Process" button on uploaded document card
   - Two-step dialog: select System Prompt, then Custom Prompt
   - Both can be selected from existing or created inline

3. **Processing Phase** (`processDocument` Server Action)
   - Next.js calls FastAPI service at `/jobs/process`
   - Python service fetches PDF from GCS
   - Combines PDF + System Prompt + Custom Prompt → Gemini API
   - Updates Firestore with progress (`progress`, `currentStep`)
   - Frontend polls Firestore every 2-3 seconds
   - Questions saved to `documents/{id}/questions` subcollection
   - Status becomes `ready` or `failed`

**Key files:**
- `website/app/actions/documents.ts` - Upload and processing triggers
- `processing-service/app/services/processor.py` - Core processing logic
- `processing-service/app/services/gemini.py` - Gemini API calls
- `website/components/documents/process-dialog.tsx` - Prompt selection UI
- `website/components/documents/document-card.tsx` - Status polling

### Status Polling Pattern

Document cards poll Firestore when `status === 'processing'`:

```typescript
useEffect(() => {
  if (document.status !== 'processing') return;

  const interval = setInterval(async () => {
    // Fetch latest document status from Firestore
    // Update local state
  }, 2000); // Poll every 2 seconds

  return () => clearInterval(interval);
}, [document.status]);
```

## Environment Variables

### Next.js Website (`.env.local`)

```env
GCP_PROJECT_ID=your-project-id
GCS_BUCKET_NAME=your-bucket-name
GEMINI_API_KEY=your-api-key
FIRESTORE_COLLECTION_PREFIX=superexam-
PROCESSING_SERVICE_URL=http://localhost:8000
GEMINI_MODEL=gemini-1.5-flash
```

### Python Processing Service (`.env`)

```env
GEMINI_API_KEY=your-api-key
GCS_BUCKET_NAME=your-bucket-name
GCP_PROJECT_ID=your-project-id
FIRESTORE_COLLECTION_PREFIX=superexam-
GEMINI_MODEL=gemini-1.5-flash
```

**Authentication:**
- Uses Google Application Default Credentials (ADC)
- Run `gcloud auth application-default login` for local development

## Coding Standards

### Naming Conventions

- **Files**: `kebab-case.tsx` (e.g., `process-dialog.tsx`)
- **Components**: `PascalCase` (e.g., `ProcessDialog`)
- **Functions/Variables**: `camelCase` (e.g., `uploadDocument`)
- **Server Actions**: `verbNoun` pattern (e.g., `processDocument`, `deleteDocument`)
- **Firestore Collections**: `kebab-case` with prefix (e.g., `superexam-documents`)

### TypeScript

- Strict typing enforced - **never use `any`**
- Use Zod for runtime validation (especially Server Action inputs)
- Define interfaces in `lib/types/index.ts`
- Use type imports: `import type { Document } from '@/lib/types'`

### Error Handling

- Use `try/catch` in Server Actions
- Return standardized error responses: `{ error: string }`
- Log errors with `console.error()`
- Always call `revalidatePath()` after mutations

### Design System

**Professional admin dashboard theme:**
- Dark mode: Diagonal gradient backgrounds (`135deg`)
- Smooth animations on all interactive elements (300ms major, 200ms minor)
- Hover effects: scale, translate, shadow (e.g., `hover:scale-105 hover:-translate-y-1`)
- Card structure: `bg-card border border-border rounded-[10px] shadow-sm p-6`
- Use `cn()` utility for conditional Tailwind classes
- Collapsible sidebar with `<Sidebar collapsible="icon">`

## Key Integration Points

### Next.js ↔ Python Service

**Next.js triggers processing:**

```typescript
// website/app/actions/documents.ts
const response = await fetch(`${PROCESSING_SERVICE_URL}/jobs/process`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ doc_id, system_prompt_id, custom_prompt_id, schema })
});
```

**Python service updates Firestore:**

```python
# processing-service/app/services/processor.py
await firestore_service.update_document(doc_id, {
    'status': 'processing',
    'progress': 50,
    'currentStep': 'Generating questions...'
})
```

### Gemini API Integration

- Model: `gemini-1.5-flash` (multimodal)
- Input: PDF file buffer + text prompts
- Output: JSON array of questions (validated with JSON Schema)
- Response cleaning: Strip markdown code blocks from JSON

### Google Cloud Storage

- Store PDFs with naming: `{timestamp}-{sanitized-filename}.pdf`
- Python service reads from GCS bucket
- Both services use same bucket (configured via `GCS_BUCKET_NAME`)

## Development Workflow

1. **Start both services locally:**
   ```bash
   # Terminal 1
   cd website && npm run dev

   # Terminal 2
   cd processing-service && uvicorn app.main:app --reload --port 8000
   ```

2. **Authentication setup:**
   ```bash
   gcloud auth application-default login
   ```

3. **Testing document processing:**
   - Upload PDF via Next.js UI (`/documents`)
   - Click "Process" button, select prompts
   - Watch Firestore for status updates
   - Check Python service logs for processing details

## Deployment Architecture

**Google Cloud Run:**
- `superexam-website` - Next.js service
- `superexam-api` - Python FastAPI service

**Deploy script (`deploy.sh`):**
- Builds Docker images for both services
- Pushes to Google Artifact Registry
- Deploys to Cloud Run
- Use `--full` flag to update environment variables

## Important Notes

- **Collection Prefixes**: Both services must use same `FIRESTORE_COLLECTION_PREFIX`
- **Server-First**: Prioritize Server Components for data fetching
- **Client Components**: Only use `'use client'` for interactivity
- **Business Logic**: Keep in `lib/services/` for testability
- **Rate Limiting**: Python service implements Firestore-based rate limiting
- **Real-time Updates**: UI polls Firestore, not the Python service directly
