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
- **Database:** Google Cloud Firestore
- **Storage:** Google Cloud Storage (GCS)
- **AI:** Google Gemini API
- **Backend:** FastAPI (Python) for AI processing

---

## Epic 1: Foundation & Setup ✅ COMPLETE

**Goal:** Initialize the modern web stack.

### Story 1.1: Project Initialization

- [x] Initialize Next.js project.
- [x] Configure Tailwind CSS & Shadcn UI.
- [x] Install core dependencies.

### Story 1.2: Layout & Navigation

- [x] Implement `AppShell` layout.
- [x] Create Navigation Sidebar.
- [x] Implement Dark/Light mode toggle.

### Story 1.3: Infrastructure

- [x] Configure Firebase Admin SDK.
- [x] Configure Environment Variables.

---

## Epic 2: Document Upload & Management ✅ COMPLETE

**Goal:** Simple upload workflow.

### Story 2.1: Document Upload

- [x] Create `/documents` page.
- [x] Implement "Upload Document" Dialog.
- [x] **Store PDF file in Google Cloud Storage (GCS).**
- [x] Save Document Metadata to Firestore.
- [x] List uploaded documents.
- [x] Implement Delete action.

---

## Epic 3: Prompt Management ✅ COMPLETE

**Goal:** Create and manage reusable prompts.

### Story 3.1: Prompt Data Model

- [x] Define System/Custom Prompt interfaces.
- [x] Create Firestore collections.
- [x] Implement CRUD operations.

### Story 3.2: Prompts Page UI

- [x] Create `/prompts` page with tabs.
- [x] Implement Create/Edit/Delete dialogs.

---

## Epic 4: Document Processing ✅ COMPLETE

**Goal:** Process uploaded documents via Gemini API.

### Story 4.1: Process Document Dialog

- [x] Create "Process Document" dialog.
- [x] Prompt Selection Steps.
- [x] Start processing on confirmation.

### Story 4.2: Backend Processing

- [x] Update `processDocument` Server Action.
- [x] Call Python Processing Service.
- [x] Save progress to Firestore.

### Story 4.3: Feedback UI

- [x] Implement status polling.
- [x] Show progress indicator on card.

---

## Epic 5: Exam Module ✅ COMPLETE

**Goal:** Interactive quiz interface.

### Story 5.1: Exam Configuration

- [x] Create `/exams` page.
- [x] Create `/exams/[id]/configure` page.
- [x] Configure question count/timer.

### Story 5.2: Exam Session

- [x] Create active exam route.
- [x] Server Actions for exam lifecycle.
- [x] Firestore `exam-sessions` collection.

### Story 5.3: Interface

- [x] Quiz UI components (Card, Options, Nav).
- [x] Timer functionality.
- [x] State management (Zustand).

### Story 5.4: Submission & Results

- [x] Early exit functionality.
- [x] Score calculation.
- [x] Results display with Pass/Fail.

### Story 5.7: AI Explanations

- [x] "Ask AI" button on questions.
- [x] Stream Gemini response via SSE.
- [x] Save explanation to Firestore.

---

## Epic 7: Python Background Service ✅ COMPLETE

**Goal:** Decouple long-running AI processing for Cloud Run.

### Story 7.1: Service Architecture

- **FastAPI** HTTP service.
- **Firestore** for job status and rate limiting.
- **Background Tasks** for non-blocking execution.
- **GCS** for file access.

### Story 7.2: Components

- `main.py`: API & Rate Limiting.
- `processor.py`: Core logic (GCS read -> Gemini -> Firestore write).
- `firestore_service.py`: DB interactions.

### Story 7.3: Next.js Integration

- `processDocument` calls `POST /jobs/process`.
- Returns immediately; Next.js polls Firestore.

---

## Epic 9: Security ✅ COMPLETE

**Goal:** Protect the service.

### Story 9.1: Rate Limiting

- [x] **Firestore-backed Rate Limiting:**
  - `POST /jobs/process`: 5 requests/min per IP.
  - `GET /jobs/{id}`: 30 requests/min per IP.
- [x] **IP Blocking:**
  - Automatic blocking for violations.

### Story 9.2: Bot Protection

- [x] User-Agent validation.
- [x] Request pattern analysis.

---

## Epic 6: Welcome Page (Pending)

**Goal:** Landing page.

- [ ] Hero section.
- [ ] Quick stats.
- [ ] CTA buttons.

---

## Epic 11: Website Rate Limiting & Bot Protection ✅ COMPLETE

**Goal:** Comprehensive protection for Next.js website against abuse and bots.

### Story 11.1: Bot Detection Infrastructure

- [x] Create bot detection utility library.
- [x] Implement user-agent validation.
- [x] Add request signature validation.
- [x] Suspicious request pattern detection.

### Story 11.2: Server Action Rate Limiting

- [x] Create rate limiting wrapper utility.
- [x] Apply to auth actions (5 requests/15min).
- [x] Apply to document actions (10 requests/min).
- [x] Apply to prompt actions (20 requests/min).
- [x] Apply to exam actions (30 requests/min).

### Story 11.3: Global Middleware Protection

- [x] Create Next.js middleware.
- [x] Bot detection integration.
- [x] Authentication verification.
- [x] Path-specific protection.

---

## Epic 10: Access Code Authentication ✅ COMPLETE

**Goal:** Temporary access via codes (no accounts). 12-hour sessions.

### Story 10.1: Authentication Infrastructure

- [x] JWT utility functions (create, verify tokens).
- [x] Access-codes Firestore collection.
- [x] Auth Server Actions (validate, create, manage codes).
- [x] Middleware for route protection.

### Story 10.2: Access Code Entry

- [x] `/access-code` page with form.
- [x] Code validation flow.
- [x] Set HTTP-only cookie with JWT.
- [x] Redirect to dashboard on success.

### Story 10.3: Admin Dashboard

- [x] `/admin/codes` protected route (admin code only).
- [x] View all codes with usage stats.
- [x] Create new codes form.
- [x] Enable/Disable codes.
- [x] Delete codes.

### Story 10.4: Initial Setup

- [x] Add JWT_SECRET to environment.
- [x] Create initial admin code in Firestore (see `/admin/README.md`).
- [x] Update middleware matcher config.

---
