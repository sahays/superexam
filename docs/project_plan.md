# SuperExam Project Plan

## Overview
A quiz application allowing users to upload PDFs. The system uses **Google Gemini APIs** to parse the PDF, extracting questions, choices, answers, and images into a fixed JSON format. This extraction process is **streamed** to the frontend via gRPC. Users can then take timed exams based on this data. Built with Flutter Web, Rust (gRPC), Firestore, and Gemini AI.

## Tech Stack
- **Frontend:** Flutter Web
- **Backend:** Rust
- **Communication:** gRPC Web (Protobuf)
- **Database:** Google Cloud Firestore
- **File Storage:** Local file system (for images)
- **AI:** Google Gemini (for PDF parsing/extraction and answer explanations)

---

## Epic 1: System Architecture & Setup
**Goal:** Initialize the project structure and establish communication channels.

### Story 1.1: Project Initialization
- **Task:** Initialize Flutter Web project.
- **Task:** Initialize Rust project (Cargo workspace).
- **Task:** Set up Git repository and ignore files.

### Story 1.2: Infrastructure & Database
- **Task:** Set up Firebase/Firestore project and obtain credentials.
- **Task:** Configure Rust Firestore client.
- **Task:** Create a local directory structure for storing extracted images.

### Story 1.3: gRPC & Protobuf Definition
- **Task:** Define strictly typed `.proto` files for all services (Ingestion, Exam, History).
- **Task:** Implement mapping logic in Rust to convert between Protobuf messages (API layer) and Firestore Documents/JSON (Storage layer).
- **Task:** Configure `tonic` (Rust) and `grpc` (Dart) code generation.

---

## Epic 2: Data Ingestion (Gemini-Powered)
**Goal:** Extract questions and images from PDFs using AI and stream results to the user.

### Story 2.1: File Upload Interface
- **Task:** Create Flutter UI for selecting a PDF file. (No schema upload required).
- **Task:** Implement gRPC client in Flutter to upload the file and listen to the response stream.

### Story 2.2: PDF Parsing & Extraction (Gemini + Rust)
- **Task:** Implement Rust logic to receive PDF upload.
- **Task:** **Integration:** Send PDF content/context to Google Gemini API with a fixed system prompt enforcing a specific JSON structure.
- **Task:** **Image Handling:** Implement logic to extract binary image data from the PDF where Gemini identifies an image context.
- **Task:** **Streaming:** Deserialize Gemini's JSON output, map it to Protobuf messages, and stream them to the frontend in real-time.

### Story 2.3: Data Persistence
- **Task:** Save extracted images to local disk and generate accessible URIs.
- **Task:** Batch write the extracted Questions and Answers (as JSON/Documents) to Firestore.

---

## Epic 3: Exam Management
**Goal:** Allow users to configure and generate new exam sessions.

### Story 3.1: Exam Configuration
- **Task:** Create API to query total available questions in Firestore.
- **Task:** Create Flutter UI to select number of questions and time limit per question (60-300s).

### Story 3.2: Exam Generation
- **Task:** Implement logic to randomly select $N$ questions from Firestore.
- **Task:** Implement logic to randomize choice order for each question.
- **Task:** Create an "Exam Session" record in Firestore to track progress.

---

## Epic 4: Exam Execution
**Goal:** Provide the core testing interface for users.

### Story 4.1: Quiz Interface
- **Task:** Specific UI for displaying Question text and **extracted Images**.
- **Task:** Implement Single Choice (Radio) and Multiple Choice (Checkbox) widgets.
- **Task:** Implement Countdown Timer (per question or global exam time).

### Story 4.2: Interaction & Navigation
- **Task:** Handle answer selection state.
- **Task:** Implement "End Exam" functionality to submit early.
- **Task:** Auto-submit/advance logic when timer expires.

### Story 4.3: Scoring & Results
- **Task:** Calculate score upon submission.
- **Task:** Display Result Screen with score, correct/incorrect breakdown.

---

## Epic 5: History & Analytics
**Goal:** Allow users to track progress and review past performance.

### Story 5.1: Exam History
- **Task:** Create API to fetch list of completed exams for the user.
- **Task:** Create Flutter UI to display history list (Date, Score, Time taken).

### Story 5.2: Review & Retake
- **Task:** Allow viewing details of a past exam (User answers vs Correct answers).
- **Task:** Implement "Retake" button to generate a new exam with the same settings/questions.

---

## Epic 6: AI Assistance (Gemini)
**Goal:** Provide context-aware explanations for questions.

### Story 6.1: Explanation Interface
- **Task:** Add "Explain this" button to the Result/Review screen.
- **Task:** Show hidden explanation text if already available.

### Story 6.2: Gemini Integration
- **Task:** Integrate Gemini API in Rust backend (reuse client from Epic 2).
- **Task:** Specific prompt engineering: Input question + choices + correct answer; Output: Explanation of concepts and why the answer is correct.
- **Task:** Logic to cache Gemini response in Firestore with the question document to avoid re-querying.
