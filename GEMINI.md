# SuperExam - Gemini Context

## Project Overview

**SuperExam** is a web application that enables users to upload PDF documents and generate interactive exams using **Google Gemini AI**.

The project uses a hybrid architecture:
1.  **Frontend/Monolith (`website/`):** A **Next.js 16** application (App Router) handling the UI, auth-related logic, and direct user interactions. It uses **Server Actions** for data mutations and **Firestore** for persistence.
2.  **Processing Service (`processing-service/`):** A dedicated **Python FastAPI** service for handling long-running AI processing tasks. It uses **Redis** for job queuing and worker management to avoid blocking the Next.js server.

### Key Technologies
- **Frontend:** Next.js 16, TypeScript, Tailwind CSS, Shadcn UI, Zustand, React Hook Form.
- **Backend Service:** Python 3.11+, FastAPI, Redis (Queue), Google Cloud Firestore.
- **AI:** Google Gemini 1.5 Flash (via `google-generativeai`).
- **Database:** Google Cloud Firestore.
- **Infrastructure:** Docker Compose (for the Python service and Redis).

## Project Plan Summary

The project is structured into key Epics, transitioning from a basic upload tool to a full exam platform.

*   **Epic 1: Foundation & Setup:** Initializing Next.js, Shadcn UI, Firebase Admin, and basic layout (Sidebar/Header).
*   **Epic 2: Document Upload & Management:** 
    *   Upload PDF files to local storage (`uploads/`).
    *   Metadata stored in Firestore (`documents` collection).
    *   Status tracking: `uploaded` -> `processing` -> `ready` | `failed`.
*   **Epic 3: Prompt Management:**
    *   CRUD for System Prompts (role/behavior) and Custom Prompts (specific instructions).
    *   Stored in `system-prompts` and `custom-prompts` collections.
*   **Epic 4: Document Processing with Prompts:**
    *   Dialog to select System + Custom prompts for a document.
    *   Backend (Python Service) generates questions via Gemini.
    *   Real-time progress updates via Firestore polling.
*   **Epic 5: Exam Module:**
    *   Configure exams (time limit, question count).
    *   Interactive quiz interface with timer and score calculation.
    *   Results display with Pass/Fail grading.
    *   **AI Explanations:** Real-time streaming of question explanations using Gemini (Server-Sent Events).
*   **Epic 6: Welcome Page:** Landing page with stats and quick actions (Upload, Create Prompt, Take Exam).
*   **Epic 7: Python Background Service:**
    *   Decoupled processing using FastAPI + Redis + Workers.
    *   Handles long-running AI generation tasks.
    *   Implements rate limiting and retries.

## Architecture & Data Flow

### 1. Document Upload
- Users upload PDFs via the Next.js UI (`/documents`).
- Files are stored locally in the `uploads/` directory (mapped volume).
- Metadata is saved to Firestore with status `uploaded`.

### 2. Processing Workflow
- **Initiation:** User selects a prompt (System/Custom) and clicks "Process".
- **Dispatch:** Next.js Server Action (`processDocument`) sends a request to the Python Service (`POST http://localhost:8000/jobs/process`).
- **Queuing:** Python service queues the job in Redis.
- **Execution:** A Python worker picks up the job:
    1.  Reads the PDF and Prompts.
    2.  Calls Gemini API to generate questions.
    3.  Updates Firestore with real-time progress (`processing` -> `ready` or `failed`).
- **Feedback:** The Next.js UI polls Firestore (or listens to snapshots) to update the progress bar and status.

### 3. Exam Execution
- Users configure exams (time, question count) from processed documents.
- State is managed via Zustand (client-side) and synced to Firestore (`exam-sessions` collection).
- **AI Explanations:** Users can ask for explanations for specific questions, which streams responses from Gemini via Server-Sent Events (SSE).

## Frontend Design & Patterns

### Design System (SaaS Admin Dashboard)
- **Theme:** Professional, enterprise-grade minimalism.
- **Colors (Dark Mode):**
    - Background: `linear-gradient` (`#0F1117` to `#1C1F26`).
    - Card: `#1C1F26` with Border `#2E3342`.
    - Accent: Purple `#5750F1` (Primary), Green `#3FD97F` (Success), Orange `#FF9C55` (Warning).
- **Layout:**
    - **Sidebar:** Collapsible (icon-only mode), contains navigation for Documents, Prompts, Exams.
    - **Grid:** Responsive cards (`grid-cols-1` mobile to `grid-cols-4` desktop).
    - **Animations:** Smooth transitions (300ms) for hover states, card lifts, and menu slides.

### Component Patterns
- **Cards:** Used for Documents, Prompts, and Exams. Standard padding (`p-6`), rounded corners (`rounded-[10px]`), and hover lift effects.
- **Dialogs:** Used for complex interactions (Upload, Process, Create Prompt).
- **Polling:** `useEffect` + `setInterval` used in Client Components (like `document-card.tsx`) to poll Firestore for status updates during processing.
- **Server Actions:** All data mutations (create, update, delete, process) are handled by Server Actions in `app/actions/`.
- **Streaming:** AI Explanations use Server-Sent Events (SSE) for real-time text generation effects.

## Building and Running

### Prerequisites
- Node.js & npm
- Python 3.11+
- Docker & Docker Compose
- Google Cloud Credentials (ADC) & Gemini API Key

### 1. Next.js Application (Website)
Located in `website/`.

```bash
# Install dependencies
cd website
npm install

# Run development server
npm run dev
# Access at http://localhost:3000
```

### 2. Processing Service (Python)
Located in `processing-service/`.

```bash
# Method A: Docker Compose (Recommended)
cd processing-service
docker-compose up -d --build
# API runs at http://localhost:8000

# Method B: Local Python
cd processing-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# Run API
uvicorn app.main:app --reload --port 8000
# Run Worker (in separate terminal)
python -m app.worker
```

## Development Conventions

### Coding Standards
- **TypeScript:** Strict mode enabled. No `any`. Use defined interfaces in `lib/types/index.ts`.
- **Styling:** Tailwind CSS with Shadcn UI components. Use `cn()` for class merging.
- **State Management:** Server Components for fetching; Zustand for complex client state (exams); React Hook Form for forms.

### Directory Structure
- **`website/app/actions/`**: Server Actions for mutations. Naming: `verbNoun` (e.g., `uploadDocument`, `createSystemPrompt`).
- **`website/lib/db/`**: Firestore data access layers.
- **`website/lib/services/`**: Business logic.
- **`processing-service/app/`**: Python application code (`main.py`, `worker.py`, `services/`).

### Common Patterns
- **Status Polling:** The frontend often polls Firestore for status updates on long-running tasks.
- **DTOs:** Ensure data types match between the Python service (Pydantic models) and Next.js (TypeScript interfaces), especially for Firestore documents.
- **Error Handling:** Use standardized error objects `{ error: string, success: boolean }` in Server Actions.

### Environment Variables
**`website/.env.local`**
```env
GEMINI_API_KEY=...
GCP_PROJECT_ID=...
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**`processing-service/.env`**
```env
REDIS_HOST=localhost
REDIS_PORT=6379
GEMINI_API_KEY=...
```