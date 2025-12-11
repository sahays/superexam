# SuperExam Project Plan (v2: Next.js Monolith)

## Overview
A web application allowing users to upload PDFs to generate and take interactive exams. The system uses **Google Gemini APIs** to parse content and extract questions.
This version replaces the previous Flutter/Rust architecture with a **Next.js Monolith**, simplifying deployment and development velocity.

## Tech Stack
- **Framework:** [Next.js 16+](https://nextjs.org/) (App Router, Server Actions/API Routes)
- **Language:** TypeScript
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [Shadcn UI](https://ui.shadcn.com/) (Radix Primitives)
- **Icons:** [Lucide React](https://lucide.dev/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand) (Client state)
- **Form Management:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) (Validation)
- **Database:** Google Cloud Firestore (via `firebase-admin` on server, `firebase` on client if needed for auth/realtime)
- **AI:** Google Gemini API (via Google AI Studio SDK)
- **PDF Processing:** `pdf-parse` or similar Node.js library.

---

## Epic 1: Foundation & Setup
**Goal:** Initialize the modern web stack.

### Story 1.1: Project Initialization
- [x] Initialize Next.js project (`npx create-next-app@latest`).
- [x] Configure Tailwind CSS.
- [x] Initialize Shadcn UI (`npx shadcn-ui@latest init`).
- [x] Install core dependencies: `zustand`, `zod`, `react-hook-form`, `lucide-react`, `firebase-admin`, `next-themes`.

### Story 1.2: Layout & Navigation
- [x] Implement `AppShell` layout (Sidebar + Header + Main Content).
- [x] Create Navigation Sidebar with items: **Documents**, **Prompts**, **Exams**.
- [x] Implement Dark/Light mode toggle.
- [ ] Create Welcome landing page at `/` (separate from dashboard).

### Story 1.3: Infrastructure
- [x] Configure Firebase Admin SDK (Server-side) for Firestore access.
- [x] Configure Environment Variables (`FIREBASE_CREDENTIALS`, `GEMINI_API_KEY`).

---

## Epic 2: Document Upload & Management
**Goal:** Simple upload workflow - upload first, process later.

### Story 2.1: Document Upload
- [x] Create `/documents` page.
- [x] Implement "Upload Document" Dialog (File dropzone).
- [x] Store PDF file persistently (Local filesystem).
- [x] Save Document Metadata to Firestore (Status: `uploaded`).
- [x] List uploaded documents as cards.
- [x] Implement Delete action.

### Story 2.2: Document Card UI
- [x] Display uploaded documents in card grid.
- [x] Show document status badge (`uploaded`, `processing`, `ready`, `failed`).
- [x] Show metadata (upload date, file name).
- [ ] **Refactor:** Add "Process" button only for `uploaded` status documents.
- [ ] **Refactor:** Show processing progress indicator on card during processing.
- [ ] **Refactor:** Poll for status updates when document is processing.

---

## Epic 3: Prompt Management
**Goal:** Create and manage reusable system and custom prompts.

### Story 3.1: Prompt Data Model
- [ ] Define `SystemPrompt` interface (id, name, content, createdAt).
- [ ] Define `CustomPrompt` interface (id, name, content, createdAt).
- [ ] Create Firestore collections: `system-prompts`, `custom-prompts`.
- [ ] Implement CRUD operations in `lib/db/prompts.ts`.

### Story 3.2: Prompts Page UI
- [ ] Create `/prompts` page.
- [ ] Implement tabs: "System Prompts" and "Custom Prompts".
- [ ] Display prompts in card grid.
- [ ] Implement "Create Prompt" dialog (name + content textarea).
- [ ] Implement Edit and Delete actions.

### Story 3.3: Prompt Server Actions
- [ ] `createSystemPrompt(name, content)` - Server Action.
- [ ] `updateSystemPrompt(id, data)` - Server Action.
- [ ] `deleteSystemPrompt(id)` - Server Action.
- [ ] `createCustomPrompt(name, content)` - Server Action.
- [ ] `updateCustomPrompt(id, data)` - Server Action.
- [ ] `deleteCustomPrompt(id)` - Server Action.

---

## Epic 4: Document Processing with Prompts
**Goal:** Process uploaded documents using selected prompts via Gemini API.

### Story 4.1: Process Document Dialog
- [ ] Create "Process Document" dialog (triggered by Process button on card).
- [ ] **Prompt Selection Step 1:** Dropdown to select existing System Prompt OR button to create new.
- [ ] **Prompt Selection Step 2:** Dropdown to select existing Custom Prompt OR button to create new.
- [ ] Implement inline prompt creation within dialog.
- [ ] Start processing on confirmation.

### Story 4.2: Backend Processing Implementation
- [ ] Update `processDocument` Server Action:
    - Accept `docId`, `systemPromptId`, `customPromptId`.
    - Fetch prompts from Firestore.
    - Read PDF file from storage.
    - Combine: PDF + System Prompt + Custom Prompt → Gemini API.
    - Update document status to `processing` immediately.
    - Process asynchronously (or synchronously with streaming updates).
- [ ] Update `ai.ts` service:
    - `generateQuestionsWithPrompts(pdfBuffer, systemPrompt, customPrompt)`.
    - Send multimodal request to Gemini.
- [ ] Save processing progress to Firestore:
    - Fields: `status`, `progress`, `currentStep`, `error`.
- [ ] Update status to `ready` on success, `failed` on error.

### Story 4.3: Frontend Status Polling
- [ ] Implement status polling in document card component.
- [ ] Poll Firestore every 2-3 seconds while status is `processing`.
- [ ] Update card UI with progress indicator (spinner, progress bar, current step).
- [ ] Stop polling when status changes to `ready` or `failed`.
- [ ] Display success/error toast notifications.

### Story 4.4: Processing Feedback UI
- [ ] Show processing status on card:
    - Progress spinner.
    - Current step text (e.g., "Analyzing PDF...", "Generating questions...").
    - Progress percentage if available.
- [ ] Update badge color based on status.
- [ ] Disable "Process" button during processing.

---

## Epic 5: Exam Module
**Goal:** Interactive quiz interface using processed documents.

### Story 5.1: Exam Configuration
- [ ] Create `/exams` page.
- [ ] UI to select a processed Document (status: `ready`).
- [ ] UI to configure exam settings:
    - Number of questions (from available pool).
    - Timer duration (optional).
    - Randomize questions.

### Story 5.2: Exam Interface
- [ ] Create `/exams/[id]` dynamic route for active exam.
- [ ] Quiz UI components:
    - Question Card with number indicator.
    - Multiple Choice options.
    - Navigation buttons (Previous, Next, Submit).
- [ ] Implement Timer functionality with countdown.
- [ ] State management (Zustand) for current exam session:
    - Selected answers.
    - Time remaining.
    - Current question index.

### Story 5.3: Submission & Results
- [ ] Calculate score upon submission.
- [ ] Display Results Page:
    - Total score and percentage.
    - Question-by-question breakdown.
    - Correct vs incorrect answers.
- [ ] Save Exam Result to Firestore (`exam-sessions` collection).
- [ ] Link exam session back to source document.

---

## Epic 6: Welcome Page
**Goal:** Landing page at root with overview and quick actions.

### Story 6.1: Welcome Page Design
- [ ] Create `/` (root) page (separate from any dashboard).
- [ ] Hero section with app title and description.
- [ ] Quick stats overview:
    - Total documents uploaded.
    - Total prompts created.
    - Total exams taken.
- [ ] Call-to-action buttons:
    - "Upload Document".
    - "Create Prompt".
    - "Take Exam".
- [ ] Recent activity section (optional).

### Story 6.2: Navigation Updates
- [ ] Update sidebar to show: Documents, Prompts, Exams.
- [ ] Remove Dashboard and History from navigation.
- [ ] Add logo/home link that goes to `/`.

---

## Architecture Notes

### Core Workflow
1. **Upload:** User uploads PDF → Saved to filesystem → Firestore record with status `uploaded`.
2. **Process:** User clicks "Process" → Selects/creates System + Custom prompts → Backend calls Gemini API → Updates Firestore with progress.
3. **Poll:** Frontend polls Firestore for status updates → Shows progress on card → Completes when status is `ready` or `failed`.
4. **Exam:** User selects processed document → Configures exam → Takes quiz → Views results.

### Data Models
**Documents:**
- Fields: `id`, `title`, `status` (uploaded | processing | ready | failed), `filePath`, `questionCount`, `createdAt`, `progress`, `currentStep`, `error`.
- Subcollection: `documents/{id}/questions`.

**Prompts:**
- Collections: `system-prompts`, `custom-prompts`.
- Fields: `id`, `name`, `content`, `createdAt`, `updatedAt`.

**Exam Sessions:**
- Collection: `exam-sessions`.
- Fields: `id`, `documentId`, `userId`, `answers`, `score`, `startedAt`, `completedAt`.

### Technical Implementation
- **Monolith:** All logic in Next.js Server Actions. No separate backend.
- **Server Actions:** Handle all mutations (upload, process, create prompts, submit exam).
- **Client Components:** Interactive UI (prompts selection, quiz, status polling).
- **Status Polling:** Client-side polling every 2-3 seconds using `setInterval` or React Query.
- **Storage:** PDFs stored persistently in local filesystem (`uploads/` directory).

---

## Epic 7: Python Background Processing Service
**Goal:** Decouple long-running AI processing from Next.js into a dedicated Python service for better scalability and real-time progress updates.

### Problem Statement
Current architecture has limitations:
- **Blocking Operations:** Server Actions wait for entire AI generation (30s-2min), risking timeout
- **No Real-Time Progress:** UI shows "Starting AI processing..." throughout, no intermediate updates
- **Single-Threaded:** Next.js handles processing synchronously, blocking resources
- **Poor UX:** Users wait with no feedback during long operations

### Solution: Python Processing Service
Create a separate **stateful** Python HTTP service for exam question generation that:
1. Runs independently as a background daemon
2. Accepts job requests via HTTP API
3. **Stores jobs in Redis** for persistence and state management
4. Processes jobs in separate threads (non-blocking)
5. **Implements retry logic** (3 attempts) with exponential backoff
6. Updates Firestore directly with real-time progress
7. Next.js only submits jobs and polls Firestore for status

### Story 7.1: Service Overview

**High-Level Architecture:**
- **FastAPI** HTTP service on port 8000
- **Redis** for job queue and state persistence
- **Worker processes** poll Redis and process jobs
- **Firestore** for real-time progress updates to UI
- **3-attempt retry** with exponential backoff on failures

**Key Features:**
- Stateful job management in Redis
- Non-blocking job processing
- Real-time progress updates (0-100%)
- Automatic retry on failures
- Scalable worker pool

**Technical Implementation:**
See `technical_design.md` for detailed implementation specifications.

### Story 7.2: Service Components
**Main Components:**
- FastAPI HTTP server (`main.py`)
- Background worker processes (`worker.py`)
- Redis for job queue and state
- Gemini API integration for question generation
- Firestore updates for UI progress

**See `technical_design.md` for detailed code and implementation.**

### Story 7.3: Next.js Integration

**Update `processDocument` Server Action** to call Python service:
```typescript
// app/actions/documents.ts
export async function processDocument(
  docId: string,
  systemPromptId: string,
  customPromptId: string,
  schema: string | null
) {
  try {
    // Call Python service
    const response = await fetch('http://localhost:8000/jobs/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        doc_id: docId,
        system_prompt_id: systemPromptId,
        custom_prompt_id: customPromptId,
        schema: schema
      })
    });

    const { job_id } = await response.json();
    return { success: true, jobId: job_id };

  } catch (error) {
    return { error: 'Failed to start processing' };
  }
}
```

**UI polling continues unchanged** - already polls Firestore for status updates.

### Story 7.4: Deployment & Configuration

**Development Setup:**
```bash
# Start Redis + Processing Service + Workers
cd processing-service
docker-compose up -d

# Scale workers for production
docker-compose up -d --scale worker=4
```

**Environment Variables:**
- Redis connection (host, port)
- Firebase credentials path
- Gemini API key and model
- Max retry attempts (default: 3)
- Worker pool size

**See `technical_design.md` for complete deployment configuration.**

### Story 7.5: Advanced Features
**Optional Enhancements:**
- [ ] **Job Queue:** Use Redis or RabbitMQ for persistent job queue
- [ ] **Worker Scaling:** Multiple worker processes for parallel job processing
- [ ] **Retry Logic:** Automatic retry on failures with exponential backoff
- [ ] **Streaming Progress:** WebSocket connection for real-time updates (instead of polling)
- [ ] **Job Cancellation:** API endpoint to cancel running jobs
- [ ] **Metrics & Monitoring:** Prometheus metrics, health checks, logging
- [ ] **Rate Limiting:** Prevent overwhelming Gemini API with too many concurrent requests

### Story 7.6: Migration Plan
**Phased Rollout:**
1. **Phase 1:** Build Python service alongside existing Next.js processing
2. **Phase 2:** Add feature flag to toggle between Next.js and Python processing
3. **Phase 3:** Monitor Python service performance in production
4. **Phase 4:** Switch all traffic to Python service
5. **Phase 5:** Remove old Next.js processing code

### Benefits
- ✅ **Non-Blocking:** Next.js immediately returns, no timeout risk
- ✅ **Real-Time Progress:** Detailed status updates every step of the way
- ✅ **Scalable:** Can run multiple workers, process jobs concurrently
- ✅ **Better UX:** Users see actual progress (0-100%) and current step
- ✅ **Separation of Concerns:** AI processing isolated from web server
- ✅ **Language-Appropriate:** Python is better for AI/ML workflows
- ✅ **Easy Debugging:** Dedicated logs and monitoring for processing jobs

---