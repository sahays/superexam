# SuperExam Project Plan (v2: Next.js Monolith)

## Overview
A web application allowing users to upload PDFs to generate and take interactive exams. The system uses **Google Gemini APIs** to parse content and extract questions.
This version replaces the previous Flutter/Rust architecture with a **Next.js Monolith**, simplifying deployment and development velocity.

## Tech Stack
- **Framework:** [Next.js 14+](https://nextjs.org/) (App Router, Server Actions/API Routes)
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
- [ ] Initialize Next.js project (`npx create-next-app@latest`).
- [ ] Configure Tailwind CSS.
- [ ] Initialize Shadcn UI (`npx shadcn-ui@latest init`).
- [ ] Install core dependencies: `zustand`, `zod`, `react-hook-form`, `lucide-react`, `firebase-admin`, `next-themes`.

### Story 1.2: Layout & Navigation
- [ ] Implement `AppShell` layout (Sidebar + Header + Main Content).
- [ ] Create Navigation Sidebar with items: **Documents**, **Exams**, **History**.
- [ ] Implement Dark/Light mode toggle.

### Story 1.3: Infrastructure
- [ ] Configure Firebase Admin SDK (Server-side) for Firestore access.
- [ ] Configure Environment Variables (`FIREBASE_CREDENTIALS`, `GEMINI_API_KEY`).

---

## Epic 2: Document Ingestion (The "Backend" Logic)
**Goal:** Port the extraction pipeline to Node.js/Next.js Server Actions.

### Story 2.1: Document Management UI
- [ ] Create `/documents` page.
- [ ] Implement "Upload Document" Dialog (File dropzone).
- [ ] List existing documents (Cards with Status: Uploaded, Processing, Ready, Failed).
- [ ] Implement Delete action.

### Story 2.2: Ingestion Pipeline (Server Actions)
- [ ] Implement file upload handler (save to local `/tmp` or keep in memory buffer).
- [ ] Implement PDF Text Extraction service (using `pdf-parse`).
- [ ] Implement Gemini Extraction service (Prompt engineering to output JSON).
- [ ] Save Questions/Answers to Firestore.
- [ ] Update Document Status in Firestore.

### Story 2.3: Processing Feedback
- [ ] Implement polling or real-time listeners (Firestore `onSnapshot`) to show processing progress in UI.
- [ ] Handle errors and display toast notifications (Shadcn Toast).

---

## Epic 3: Exam Module
**Goal:** Interactive quiz interface.

### Story 3.1: Exam Configuration
- [ ] UI to select a Document source.
- [ ] UI to configure exam settings (Number of questions, Timer).

### Story 3.2: Exam Interface
- [ ] Create Quiz UI (Question Card, Multiple Choice/Single Choice).
- [ ] Implement Timer functionality.
- [ ] State management (Zustand) for current exam session (answers, navigation).

### Story 3.3: Submission & Scoring
- [ ] Calculate score upon submission.
- [ ] Display Results Page (Score, Breakdown).
- [ ] Save Exam Result to Firestore (`history` collection).

---

## Epic 4: History & Analytics
**Goal:** Review past performance.

### Story 4.1: History Dashboard
- [ ] List past exam sessions.
- [ ] Show key metrics (Average score, Total exams taken).

### Story 4.2: Exam Review
- [ ] Detailed view of a past exam.
- [ ] "Explain this Answer" feature using Gemini (Streamed response).

---

## Architecture Notes
- **Monolith:** All API logic lives in `app/api` or Server Actions. No separate Rust backend.
- **Server Actions:** Preferred for form submissions and mutations.
- **Client Components:** Used for interactive UI (Quiz, Dashboard charts).
- **Storage:** PDFs can be stored in Firestore (Base64) for small files or just transiently processed. *Decision: Transient processing first (upload -> parse -> save text/questions -> discard PDF) to simplify storage needs.*