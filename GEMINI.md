# SuperExam Project Context

## Project Overview
**SuperExam** is a modern web application designed to generate and administer interactive exams from PDF documents using **Google Gemini AI**. 

Currently, the project is in the **Inception/Planning Phase**, transitioning from a previous architecture (Rust/Flutter) to a **Next.js 16 Monolith**. The core goal is to simplify deployment and accelerate development by unifying the frontend and backend into a single Next.js application using Server Actions and Firestore.

## Architecture & Tech Stack
The project is being architected as a **Server-First Next.js Application**.

*   **Framework:** [Next.js 16+](https://nextjs.org/) (App Router, Server Actions)
*   **Language:** TypeScript
*   **UI Library:** React 19
*   **Styling:** Tailwind CSS (Mobile-First, "Luminous Data" Dark Mode)
*   **Components:** Shadcn UI (Radix Primitives)
*   **State:** Zustand (Client), React Server Components (Server)
*   **Database:** Google Cloud Firestore (via `firebase-admin`)
*   **AI Engine:** Google Gemini API

## Directory Structure
The project is currently defined by its documentation. The code structure (to be implemented) will follow standard Next.js App Router conventions.

```text
/home/admin_sanjeetsahay_altostrat_com/superexam/
├── docs/                 # Project documentation and specifications
│   ├── project_plan.md   # Roadmap, Epics, and Stories
│   └── design_spec.md    # Architecture, Design Tokens, and Coding Standards
├── .gitignore            # Git ignore rules (includes legacy patterns)
└── (Planned: app/)       # Future location of Next.js App Router
```

## Development Conventions (Planned)
Based on `docs/design_spec.md`:

*   **Strict Typing:** No `any`. Use **Zod** for all runtime validation (especially Server Actions).
*   **Server Actions:** Use for all data mutations. Name files `actions.ts`.
*   **Naming:**
    *   Files: `kebab-case.tsx`
    *   Components: `PascalCase`
    *   Functions: `camelCase`
*   **Styling:** Use `clsx` or `cn()` utility for conditional Tailwind classes. Adhere strictly to the "Neon Glassmorphism" design tokens defined in the spec.

## Building and Running (TODO)
*The project has not yet been initialized. The following commands are anticipated standard workflows:*

### 1. Installation
```bash
# TODO: Initialize project
# npx create-next-app@latest .
npm install
```

### 2. Local Development
```bash
npm run dev
```

### 3. Production Build
```bash
npm run build
npm start
```

## Key Documentation
*   **`docs/project_plan.md`**: The source of truth for features and progress.
*   **`docs/design_spec.md`**: The strict guide for visual design and code architecture.
