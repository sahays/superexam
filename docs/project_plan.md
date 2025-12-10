# SuperExam Project Plan

## Overview
A quiz application allowing users to upload PDFs. The system uses **Google Gemini APIs** to parse the PDF, extracting questions, choices, answers, and images into a fixed JSON format. The extraction happens in the background with the frontend updated with its current status. Users can take exam after the extraction is complete. The scope of exam is the document. Built with Flutter Web, Rust (gRPC), Firestore, and Gemini AI.

**Navigation:** The application features a sidebar navigation with three main sections:
- **Documents:** Manage uploads, schemas, and processing status.
- **Exams:** Configure and take exams based on processed documents.
- **Prompts:** Manage custom prompts (if applicable).

## Tech Stack
For detailed architectural patterns (Rust Controller/Service/Repository) and UI design specifications (SaaS Admin Panel), please refer to [docs/design_spec.md](design_spec.md).

- **Frontend:** Flutter Web (SaaS Admin Style)
- **Backend:** Rust (Layered Architecture)
- **Communication:** gRPC Web (Protobuf)
- **Database:** Google Cloud Firestore
- **File Storage:** Local file system (for images and raw PDFs)
- **AI:** Google Gemini (for PDF parsing/extraction and answer explanations)

---

## Epic 1: System Architecture & Setup
**Goal:** Initialize the project structure and establish communication channels.

### Story 1.1: Project Initialization
- [x] Initialize Flutter Web project.
- [x] Initialize Rust project (Cargo workspace).
- [x] Set up Git repository and ignore files.

### Story 1.2: Infrastructure & Database
- [x] Set up Firebase/Firestore project and obtain credentials.
- [x] Configure Rust Firestore client.
- [x] Create a local directory structure for storing extracted images.

### Story 1.3: gRPC & Protobuf Definition
- [x] Define strictly typed `.proto` files for all services (Ingestion, Exam, History).
- [x] Implement mapping logic in Rust to convert between Protobuf messages (API layer) and Firestore Documents/JSON (Storage layer).
- [x] Configure `tonic` (Rust) and `grpc` (Dart) code generation.

### Story 1.4: Refinement & Standards
- [x] **Auth:** Support Default Application Credentials (ADC) for Google Cloud auth (via `gcloud auth login`) to avoid managing service account keys locally.
- [x] **Documentation:** Create a `docs/design_spec.md` defining project patterns, naming conventions (Rust/Flutter/Proto), and architectural best practices.

---

## Epic 2: Data Ingestion & Document Management
**Goal:** robust document handling workflow including upload, schema management, and asynchronous background processing.

### Story 2.1: Navigation & Documents Dashboard
- [x] **Sidebar:** Implement a global sidebar with navigation items: **Documents**, **Exams**, **Prompts**.
- [x] **Documents Tab:** Create a view to list all uploaded documents and available schemas.
- [x] **Status Indicators:** Display the current status of each document (e.g., Uploaded, Processing, Succeeded, Failed) in the list view.

### Story 2.2: Document Upload (Storage Phase)
- [x] **File Upload:** Implement UI/API to upload a PDF file.
- [x] **Storage:** Save the raw file to local storage.
- [x] **Database Record:** Create an initial record in Firestore with status `Uploaded` and file metadata (name, upload date, path).

### Story 2.3: Schema Management
- [ ] **Schema Upload:** Allow users to upload or define JSON schemas that dictate how Gemini should extract data.
- [ ] **Visibility:** Ensure schemas are visible and selectable within the Documents tab.

### Story 2.4: Asynchronous Processing (Extraction Phase)
- [x] **Trigger Processing:** User selects an `Uploaded` document and a Schema, then clicks "Process".
- [x] **Long-Running Task:** Backend initiates a background task for Gemini extraction.
- [x] **State Persistence:** Create/Update a task record in Firestore to track the processing job.
- [x] **Status Updates:** The background task updates the database record to `Processing`, and finally `Succeeded` or `Failed` upon completion.

### Story 2.5: Real-time Feedback & Persistence
- [x] **Monitoring:** Frontend polls or listens (server push/stream) for status changes on the Document records.
- [x] **Persistence:** Users can navigate away from the page and return to see the updated status (no session-only state).
- [x] **Completion:** Once `Succeeded`, the extracted data (questions, images) is linked to the document and available for exams.

---

## Epic 3: Exam Management
**Goal:** Allow users to configure and generate new exam sessions.

### Story 3.1: Exam Configuration
- [ ] Create API to query total available questions in Firestore.
- [ ] Create Flutter UI to select number of questions and time limit per question (60-300s).

### Story 3.2: Exam Generation
- [ ] Implement logic to randomly select $N$ questions from Firestore.
- [ ] Implement logic to randomize choice order for each question.
- [ ] Create an "Exam Session" record in Firestore to track progress.

---

## Epic 4: Exam Execution
**Goal:** Provide the core testing interface for users.

### Story 4.1: Quiz Interface
- [ ] Specific UI for displaying Question text and **extracted Images**.
- [ ] Implement Single Choice (Radio) and Multiple Choice (Checkbox) widgets.
- [ ] Implement Countdown Timer (per question or global exam time).

### Story 4.2: Interaction & Navigation
- [ ] Handle answer selection state.
- [ ] Implement "End Exam" functionality to submit early.
- [ ] Auto-submit/advance logic when timer expires.

### Story 4.3: Scoring & Results
- [ ] Calculate score upon submission.
- [ ] Display Result Screen with score, correct/incorrect breakdown.

---

## Epic 5: History & Analytics
**Goal:** Allow users to track progress and review past performance.

### Story 5.1: Exam History
- [ ] Create API to fetch list of completed exams for the user.
- [ ] Create Flutter UI to display history list (Date, Score, Time taken).

### Story 5.2: Review & Retake
- [ ] Allow viewing details of a past exam (User answers vs Correct answers).
- [ ] Implement "Retake" button to generate a new exam with the same settings/questions.

---

## Epic 6: AI Assistance (Gemini)
**Goal:** Provide context-aware explanations for questions.

### Story 6.1: Explanation Interface
- [ ] Add "Explain this" button to the Result/Review screen. Implement **response streaming** to display the explanation text as it generates.
- [ ] Show hidden explanation text if already available (retrieve saved response).

### Story 6.2: Gemini Integration
- [ ] Integrate Gemini API in Rust backend to **stream** the explanation to the frontend.
- [ ] Specific prompt engineering: Input question + choices + correct answer; Output: Explanation of concepts and why the answer is correct.
- [ ] Logic to accumulate the streamed response and **save** it with the question document in Firestore.
