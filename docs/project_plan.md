# SuperExam Project Plan

## Overview
A quiz application allowing users to upload PDFs. The system uses **Google Gemini APIs** to parse the PDF, extracting questions, choices, answers, and images into a fixed JSON format. The extraction happens in the background with the frontend updated with its current status. Users can take exam after the extraction is complete. The scope of exam is the document. Built with Flutter Web, Rust (gRPC), Firestore, and Gemini AI.

## Tech Stack
For detailed architectural patterns (Rust Controller/Service/Repository) and UI design specifications (SaaS Admin Panel), please refer to [docs/design_spec.md](design_spec.md).

- **Frontend:** Flutter Web (SaaS Admin Style)
- **Backend:** Rust (Layered Architecture)
- **Communication:** gRPC Web (Protobuf)
- **Database:** Google Cloud Firestore
- **File Storage:** Local file system (for images)
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

## Epic 2: Data Ingestion (Gemini-Powered)
**Goal:** Extract questions and images from PDFs using AI and stream results to the user.

### Story 2.1: File Upload Interface
- [x] Create Flutter UI for selecting a PDF file. (No schema upload required).
- [x] **User Prompt Input:** Add a text input field for the user to provide specific instructions to guide the extraction (e.g., "Only extract multiple-choice questions" or "Translate questions to Spanish").
- [x] Implement gRPC client in Flutter to upload the file and the **user prompt**, then listen to the response stream.

### Story 2.2: PDF Parsing & Extraction (Gemini + Rust)
- [x] Implement Rust logic to receive PDF upload and the `user_prompt`.
- [x] **Integration:** Construct the final prompt for Gemini by combining the **User Prompt** (context/instruction) with the **System Prompt** (JSON schema enforcement).
- [x] **Image Handling:** Use a Rust PDF library (e.g., `lopdf` or `pdf-extract`) to extract binary image data from the PDF where Gemini identifies an image context.
- [x] **Status Updates:** Process Gemini's JSON output in the background and stream status updates to the frontend.

### Story 2.3: Data Persistence
- [x] Save extracted images to local disk and generate accessible URIs.
- [x] Batch write the extracted Questions and Answers (as JSON/Documents) to Firestore.

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
