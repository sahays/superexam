# SuperExam Project Plan (v2: Next.js Monolith)

## Overview

A web application allowing users to upload PDFs to generate and take interactive exams. The system uses **Google Gemini
APIs** to parse content and extract questions. This version replaces the previous Flutter/Rust architecture with a
**Next.js Monolith**, simplifying deployment and development velocity.

## Tech Stack

- **Framework:** [Next.js 16+](https://nextjs.org/) (App Router, Server Actions/API Routes)
- **Language:** TypeScript
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [Shadcn UI](https://ui.shadcn.com/) (Radix Primitives)
- **Icons:** [Lucide React](https://lucide.dev/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand) (Client state)
- **Form Management:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) (Validation)
- **Database:** Google Cloud Firestore (via `firebase-admin` on server, `firebase` on client if needed for
  auth/realtime)
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

## Epic 2: Document Upload & Management ✅ COMPLETE

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
- [x] **Refactor:** Add "Process" button only for `uploaded` status documents.
- [x] **Refactor:** Show processing progress indicator on card during processing.
- [x] **Refactor:** Poll for status updates when document is processing.
- [x] **Enhancement:** Add info button to view document details (prompts used and generated questions).

---

## Epic 3: Prompt Management ✅ COMPLETE

**Goal:** Create and manage reusable system and custom prompts.

### Story 3.1: Prompt Data Model

- [x] Define `SystemPrompt` interface (id, name, content, createdAt).
- [x] Define `CustomPrompt` interface (id, name, content, createdAt).
- [x] Create Firestore collections: `system-prompts`, `custom-prompts`.
- [x] Implement CRUD operations in `lib/db/prompts.ts`.

### Story 3.2: Prompts Page UI

- [x] Create `/prompts` page.
- [x] Implement tabs: "System Prompts" and "Custom Prompts".
- [x] Display prompts in card grid.
- [x] Implement "Create Prompt" dialog (name + content textarea).
- [x] Implement "Edit Prompt" dialog (pre-populated form).
- [x] Implement Delete action with confirmation.

### Story 3.3: Prompt Server Actions

- [x] `createSystemPrompt(name, content)` - Server Action.
- [x] `updateSystemPrompt(id, data)` - Server Action.
- [x] `deleteSystemPrompt(id)` - Server Action.
- [x] `createCustomPrompt(name, content)` - Server Action.
- [x] `updateCustomPrompt(id, data)` - Server Action.
- [x] `deleteCustomPrompt(id)` - Server Action.

---

## Epic 4: Document Processing with Prompts ✅ COMPLETE

**Goal:** Process uploaded documents using selected prompts via Gemini API.

### Story 4.1: Process Document Dialog

- [x] Create "Process Document" dialog (triggered by Process button on card).
- [x] **Prompt Selection Step 1:** Dropdown to select existing System Prompt OR button to create new.
- [x] **Prompt Selection Step 2:** Dropdown to select existing Custom Prompt OR button to create new.
- [x] Implement inline prompt creation within dialog.
- [x] Start processing on confirmation.

### Story 4.2: Backend Processing Implementation

- [x] Update `processDocument` Server Action:
  - Accept `docId`, `systemPromptId`, `customPromptId`.
  - Fetch prompts from Firestore.
  - Read PDF file from storage.
  - Combine: PDF + System Prompt + Custom Prompt → Gemini API.
  - Update document status to `processing` immediately.
  - Process asynchronously (or synchronously with streaming updates).
- [x] Update `ai.ts` service:
  - `generateQuestionsWithPrompts(pdfBuffer, systemPrompt, customPrompt)`.
  - Send multimodal request to Gemini.
- [x] Save processing progress to Firestore:
  - Fields: `status`, `progress`, `currentStep`, `error`.
- [x] Update status to `ready` on success, `failed` on error.

### Story 4.3: Frontend Status Polling

- [x] Implement status polling in document card component.
- [x] Poll Firestore every 2-3 seconds while status is `processing`.
- [x] Update card UI with progress indicator (spinner, progress bar, current step).
- [x] Stop polling when status changes to `ready` or `failed`.
- [x] Display success/error toast notifications.

### Story 4.4: Processing Feedback UI

- [x] Show processing status on card:
  - Progress spinner.
  - Current step text (e.g., "Analyzing PDF...", "Generating questions...").
  - Progress percentage if available.
- [x] Update badge color based on status.
- [x] Disable "Process" button during processing.

---

## Epic 5: Exam Module ✅ COMPLETE

**Goal:** Interactive quiz interface using processed documents with comprehensive exam management and AI-powered explanations.

### Story 5.1: Exam Configuration & Navigation

- [x] Create `/exams` page with three sections:
  - In Progress exams (incomplete sessions)
  - Completed exams (past results)
  - Start New Exam (available documents)
- [x] "Take Exam" button on document cards navigates to `/exams/[id]/configure`
- [x] Create `/exams/[id]/configure` page for exam setup
- [x] UI to configure exam settings:
  - Number of questions (from available pool)
  - Timer duration (optional, in minutes)
  - Randomize questions checkbox
- [x] Validation for question count and timer duration

### Story 5.2: Exam Session Management

- [x] Create `/exams/[id]/session/[sessionId]` dynamic route for active exam
- [x] Server Actions for exam lifecycle:
  - `createExamSession()` - Initialize new exam with configuration
  - `getExamSession()` - Fetch session state
  - `getExamSessions()` - Fetch all sessions (completed + incomplete)
  - `updateExamAnswer()` - Save answer progress
  - `submitExam()` - Calculate score and mark complete
  - `getExamQuestions()` - Fetch questions for session
- [x] Firestore `exam-sessions` collection structure:
  - Session metadata (documentId, startedAt, completedAt)
  - Configuration (questionIds, timerEnabled, timerMinutes)
  - State (answers map, score, correctCount, totalQuestions)

### Story 5.3: Interactive Exam Interface

- [x] Quiz UI components:
  - Question Card with number indicator
  - Multiple Choice options with selection state
  - Navigation buttons (Previous, Next)
  - Submit button on last question
  - **Early submission button** (always visible in header)
- [x] Timer functionality:
  - Countdown display in header
  - Red warning when < 1 minute remaining
  - Auto-submit when timer expires
  - Timer state persisted in session
- [x] State management (Zustand):
  - Current question index with bounds checking
  - Answer selections (synced with server)
  - Time remaining
  - Total questions count
- [x] Real-time answer persistence:
  - Auto-save on answer selection
  - Updates Firestore immediately
  - Toast notification on save errors

### Story 5.4: Submission & Results

- [x] Early exit functionality:
  - Submit button always visible in header (green outline)
  - Confirmation dialog before submission
  - Prevents accidental early submission
- [x] Score calculation:
  - Correct vs total answers
  - Percentage score
  - Saved to session document
- [x] Results display:
  - Overall score with color coding (Pass/Fail)
  - Question-by-question breakdown
  - Show correct answer vs user answer
  - Display explanations (if available)
  - Visual indicators (checkmarks, x-marks)
- [x] Color-coded scoring:
  - Green (≥70%): Pass
  - Orange (50-69%): Warning/Marginal
  - Red (<50%): Fail

### Story 5.5: Exam History & Resume

- [x] Exam sessions page improvements:
  - "In Progress" section with orange warning styling
  - "Completed Exams" section with score-based colors
  - "Start New Exam" section with available documents
- [x] Resume functionality:
  - "Resume Exam" button for incomplete sessions
  - Preserves question index and answers
  - Continues with remaining time (if timer enabled)
- [x] View results:
  - "View Results" button for completed exams
  - Same interface as post-submission view
  - Read-only access to past exam
- [x] Session metadata display:
  - Started/Completed timestamps
  - Time elapsed indicators
  - Question count
  - Document title with proper linking

### Story 5.6: UI/UX Enhancements

- [x] Professional card design:
  - Hover animations (lift and shadow)
  - Status badges with appropriate colors
  - Icon indicators (clock, checkmark, warning)
- [x] Progress indicators:
  - Answered questions count (X/Y answered)
  - Progress bar with percentage
  - Visual question navigation
- [x] Responsive layout:
  - Grid layouts for exam cards
  - Flexible header with timer and submit button
  - Mobile-friendly navigation
- [x] Consistent design system:
  - Success/warning/destructive color palette
  - Smooth transitions (300ms animations)
  - Accessible contrast ratios

### Story 5.7: AI-Powered Question Explanations ✅ COMPLETE

**Goal:** Allow users to get AI-generated explanations for exam questions. New responses overwrite previous ones.

- [x] **Explanation Request Interface:**
  - Add "Ask AI" button on question cards (both active exam and results view)
  - Prompt selection dialog (choose existing or create new prompt)
  - Support for both system and custom prompts
  - Inline prompt creation within dialog
  - Tabs for switching between system and custom prompts

- [x] **Gemini API Streaming Integration:**
  - Send question text and answer choices to Gemini API with selected prompt
  - Stream response in real-time to the page using Server-Sent Events (SSE)
  - Display streaming content with smooth character-by-character animation
  - Typing cursor animation during streaming
  - Handle errors and timeouts gracefully
  - Update UI in real-time as tokens arrive with smooth transitions
  - Auto-scroll to bottom during streaming

- [x] **Response Persistence:**
  - Save AI response to Firestore in question document
  - Store as `explanation` field with metadata (promptId, promptName, promptType, generatedAt)
  - New responses overwrite previous explanation (no history)
  - Update both page and database on new query
  - Persist explanation across page refreshes

- [x] **Explanation Display UI:**
  - Show explanation in collapsed accordion below question
  - Display prompt name used and generation timestamp (relative time)
  - "Ask AI" button to regenerate with different prompt
  - Markdown rendering with proper styling (bold headings, lists, code blocks)
  - Markdown/Formatted toggle to switch between raw and rendered view
  - Copy button to copy explanation to clipboard
  - Loading state with spinner during streaming
  - Smooth fade-in animations for new content

- [x] **Server Actions & API:**
  - `/api/explain` POST route - Streaming SSE endpoint
  - Update question document with explanation field
  - Firestore schema: `explanation: { content, promptId, promptName, promptType, generatedAt }`
  - Proper error handling and streaming cleanup

---

## Epic 8: Document Details Page ✅ COMPLETE

**Goal:** Provide a detailed view of document processing inputs and outputs.

### Story 8.1: Document Details Page

- [x] Create `/documents/[id]` dynamic route for document details.
- [x] Display document metadata (title, upload date, status).
- [x] Show processing inputs:
  - System prompt used (name and full content).
  - Custom prompt used (name and full content).
  - Schema used (if applicable).
- [x] Display all generated questions with their answers and options.
- [x] Add navigation back to documents list.

### Story 8.2: Info Button on Document Card

- [x] Add info/details icon button to document card.
- [x] Link to document details page (`/documents/[id]`).
- [x] Show button only for documents with status `ready` (processed).

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
2. **Process:** User clicks "Process" → Selects/creates System + Custom prompts → Backend calls Gemini API → Updates
   Firestore with progress.
3. **Poll:** Frontend polls Firestore for status updates → Shows progress on card → Completes when status is `ready` or
   `failed`.
4. **Exam:** User selects processed document → Configures exam → Takes quiz → Views results.

### Data Models

**Documents:**

- Fields: `id`, `title`, `status` (uploaded | processing | ready | failed), `filePath`, `questionCount`, `createdAt`,
  `progress`, `currentStep`, `error`.
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

## Epic 7: Python Background Processing Service ✅ COMPLETE

**Goal:** Decouple long-running AI processing from Next.js into a dedicated Python service for better scalability and
real-time progress updates.

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

**Technical Implementation:** See `technical_design.md` for detailed implementation specifications.

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
		return { success: true, jobId: job_id };
	} catch (error) {
		return { error: "Failed to start processing" };
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

**Core Features Implemented:**

- [x] **Job Queue:** Redis used for persistent job queue with key prefixing
- [x] **Worker Scaling:** Multiple worker processes for parallel job processing (scalable via docker-compose)
- [x] **Retry Logic:** Automatic retry on failures with exponential backoff (3 attempts: 0s, 30s, 60s)
- [x] **Real-time Progress:** Firestore updates with detailed progress (0-100%) and current step
- [ ] **Streaming Progress:** WebSocket connection for real-time updates (instead of polling)
- [ ] **Job Cancellation:** API endpoint to cancel running jobs
- [ ] **Metrics & Monitoring:** Prometheus metrics, health checks, logging
- [ ] **Rate Limiting:** Prevent overwhelming Gemini API with too many concurrent requests

### Story 7.6: Implementation Status

**Completed:**

- [x] **Phase 1:** Python service built with FastAPI, Redis, and worker processes
- [x] **Phase 2:** Integrated with Next.js via HTTP API
- [x] **Phase 3:** Firestore integration for real-time progress updates
- [x] **Phase 4:** Delete functionality enhanced to clean up physical PDF files
- [x] **Phase 5:** Google Cloud default credentials (gcloud auth) configured
- [x] **Phase 6:** Relative path configuration for uploads directory

### Benefits

- ✅ **Non-Blocking:** Next.js immediately returns, no timeout risk
- ✅ **Real-Time Progress:** Detailed status updates every step of the way
- ✅ **Scalable:** Can run multiple workers, process jobs concurrently
- ✅ **Better UX:** Users see actual progress (0-100%) and current step
- ✅ **Separation of Concerns:** AI processing isolated from web server
- ✅ **Language-Appropriate:** Python is better for AI/ML workflows
- ✅ **Easy Debugging:** Dedicated logs and monitoring for processing jobs

---

## Epic 9: Security & Protection ✅ COMPLETE

**Goal:** Implement security measures to protect the processing service from abuse, bots, and excessive usage.

### Story 9.1: Rate Limiting ✅ COMPLETE

**Goal:** Prevent API abuse and ensure fair resource allocation.

- [x] **IP-Based Rate Limiting:**
  - Implemented using slowapi library for FastAPI
  - Rate limiting per IP address tracked automatically
  - Redis-backed storage for distributed rate limiting
  - Return 429 Too Many Requests with Retry-After header

- [x] **Endpoint-Specific Limits:**
  - `/`: 10 requests per minute per IP
  - `/jobs/process`: 5 requests per minute per IP (expensive operation)
  - `/jobs/status`: 30 requests per minute per IP (lightweight)
  - `/jobs/{id}` DELETE: 10 requests per minute
  - Health check endpoints: No rate limiting (unrestricted)

- [x] **Rate Limit Response:**
  - Custom error handler with clear error messages
  - Retry-After header included in 429 responses
  - Logs all rate limit violations for monitoring
  - Automatic IP blocking after 5 violations

### Story 9.2: Bot Detection & Prevention ✅ COMPLETE

**Goal:** Detect and block automated bot traffic.

- [x] **User-Agent Validation:**
  - Require valid User-Agent header on all requests
  - Block common bot user agents (scrapers, crawlers, bots)
  - Allow legitimate browsers (Chrome, Firefox, Safari, Edge)
  - Allow API testing tools (Postman, Insomnia)
  - Configurable blocklist and allowlist

- [x] **Request Pattern Analysis:**
  - Track request frequency per IP per endpoint
  - Detect suspicious patterns (>100 requests per minute)
  - Automatic IP blocking for bot-like behavior
  - Redis-backed request counting with automatic expiration

- [x] **Header Validation:**
  - Validate presence of User-Agent header
  - Check for missing or suspicious header combinations
  - Log warnings for requests with missing standard headers
  - SecurityMiddleware enforces validation on all endpoints

### Story 9.3: Request Validation & Sanitization

**Goal:** Ensure all incoming requests are valid and safe.

- [ ] **Input Validation:**
  - Validate all request parameters (docId, promptIds)
  - Sanitize file paths to prevent directory traversal
  - Validate JSON schema structure
  - Check document ID format and existence

- [ ] **Size Limits:**
  - Limit request body size (max 1MB for JSON)
  - Validate prompt content length
  - Prevent oversized schema uploads

### Story 9.4: IP Blocking & Blacklisting ✅ COMPLETE

**Goal:** Block malicious IPs and repeat offenders.

- [x] **Automatic IP Blocking:**
  - Block IPs that exceed rate limits repeatedly (after 5 violations)
  - Temporary blocks (1 hour default) for rate limit violations
  - Permanent blocks for severe abuse patterns (>100 requests/min)
  - Store blocked IPs in Redis with automatic expiration
  - Track block reason and timestamp in Redis

- [x] **IP Block Management:**
  - `is_ip_blocked()` - Check if IP is currently blocked
  - `block_ip()` - Block IP with duration and reason
  - `unblock_ip()` - Manually unblock IP
  - `get_block_info()` - Get detailed block information
  - Logging of all block/unblock actions

### Story 9.5: Monitoring & Alerts ✅ COMPLETE

**Goal:** Track security events and respond to threats.

- [x] **Security Event Logging:**
  - Log all rate limit violations with IP and endpoint
  - Log blocked requests and IPs with reasons
  - Log suspicious bot activity (invalid User-Agent, patterns)
  - Track error rates and patterns in application logs
  - Structured logging with timestamps and severity levels

- [ ] **Metrics & Dashboards:**
  - Track rate limit hits per endpoint (future: Prometheus)
  - Monitor blocked request count (future: Grafana dashboard)
  - Alert on unusual traffic patterns (future: alerting system)
  - Dashboard for security metrics (future enhancement)

### Story 9.6: Authentication & Authorization (Future)

**Goal:** Add authentication layer for API access.

- [ ] **API Key Authentication:**
  - Generate unique API keys per client
  - Validate API key on all requests
  - Rate limit per API key (not just IP)
  - Revocable API keys

- [ ] **Request Signing:**
  - HMAC-based request signatures
  - Prevent replay attacks with timestamps
  - Validate request integrity

---
