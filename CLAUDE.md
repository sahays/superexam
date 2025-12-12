# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**SuperExam** is a Next.js 16 web application that generates and administers interactive exams from PDF documents using Google Gemini AI. The project follows a server-first architecture with a monolithic Next.js application using Server Actions and Google Cloud Firestore.

## Development Commands

### Setup
```bash
cd website
npm install
```

### Development
```bash
cd website
npm run dev
# Server runs at http://localhost:3000
```

### Build & Production
```bash
cd website
npm run build
npm start
```

### Linting
```bash
cd website
npm run lint
```

## Architecture Overview

### Monorepo Structure
- **`docs/`** - Project planning and design specifications (source of truth)
- **`website/`** - Next.js 16 application (all code lives here)

### Navigation Structure
- **`/`** - Welcome landing page with quick stats and CTAs
- **`/documents`** - Upload and manage PDF documents
- **`/prompts`** - Create and manage system/custom prompts
- **`/exams`** - Configure and take exams from processed documents

**Note:** No Dashboard or History sections in current architecture.

### Next.js Application Structure (`website/`)

**Core Directories:**
- **`app/`** - Next.js App Router
  - `(dashboard)/` - Route group for authenticated pages (documents, exams, history)
  - `actions/` - Server Actions (e.g., `documents.ts`)
  - `layout.tsx` - Root layout with theme provider
  - `page.tsx` - Dashboard/landing page
- **`lib/`** - Business logic and utilities
  - `db/` - Firestore initialization and data access (`firebase.ts`, `documents.ts`)
  - `services/` - Core business logic (`ai.ts` for Gemini, `pdf.ts`)
  - `types/` - TypeScript interfaces and Zod schemas (`index.ts`)
  - `utils.ts` - Helper utilities (e.g., `cn()` for Tailwind)
- **`components/`** - React components
  - `ui/` - Shadcn UI primitives (Radix-based)
  - `documents/` - Feature-specific components
  - `app-sidebar.tsx`, `mode-toggle.tsx`, etc.

### Tech Stack
- **Framework:** Next.js 16 (App Router, Server Actions)
- **Language:** TypeScript (strict mode, no `any`)
- **UI:** React 19, Tailwind CSS 4, Shadcn UI (Radix Primitives)
- **State:** Zustand (client), Server Components (server)
- **Database:** Google Cloud Firestore (via `firebase-admin`)
- **AI:** Google Gemini API (`@google/generative-ai`)
- **Forms:** React Hook Form + Zod validation
- **Icons:** Lucide React

### Data Flow Pattern

**Server Actions for Mutations:**
- All data mutations use Server Actions (files named `actions.ts`)
- Patterns:
  - `app/actions/documents.ts`: `uploadDocument`, `processDocument`, `deleteDocument`
  - `app/actions/prompts.ts`: `createSystemPrompt`, `updateSystemPrompt`, `deleteSystemPrompt`, `createCustomPrompt`, `updateCustomPrompt`, `deleteCustomPrompt`
- Always use Zod for input validation
- Return standardized responses: `{ success?: boolean, error?: string, data?: T }`

**Server Components for Fetching:**
- Use Server Components to fetch data from Firestore
- Direct database access via `lib/db/firebase.ts` exported `db` instance

**Client-Side Status Polling:**
- Document cards poll Firestore every 2-3 seconds when status is `processing`
- Use `useEffect` with `setInterval` or React Query
- Update UI with progress indicators (`progress`, `currentStep` fields)
- Stop polling when status becomes `ready` or `failed`

**Firestore Collections:**
- `documents` - Document metadata
  - Fields: `id`, `title`, `status` (uploaded | processing | ready | failed), `filePath`, `questionCount`, `createdAt`, `progress`, `currentStep`, `error`
  - Subcollection: `documents/{id}/questions`
- `system-prompts` - System prompts (role/behavior instructions)
  - Fields: `id`, `name`, `content`, `createdAt`, `updatedAt`
- `custom-prompts` - Custom prompts (user-specific instructions)
  - Fields: `id`, `name`, `content`, `createdAt`, `updatedAt`
- `exam-sessions` - Exam results and history
  - Fields: `id`, `documentId`, `userId`, `answers`, `score`, `startedAt`, `completedAt`
- Collection names use `kebab-case`

### Document Processing Workflow

**Three-Phase Process:**

1. **Upload Phase** (`uploadDocument` Server Action):
   - User uploads PDF via upload dialog
   - Save PDF to local filesystem (`uploads/` directory)
   - Create document record in Firestore with `status: 'uploaded'`
   - File stored as `{timestamp}-{sanitized-filename}.pdf`
   - Document appears as card with "Process" button

2. **Prompt Selection Phase** (via Process Dialog):
   - User clicks "Process" button on uploaded document card
   - Dialog opens with two steps:
     - **Step 1:** Select existing System Prompt OR create new inline
     - **Step 2:** Select existing Custom Prompt OR create new inline
   - User confirms to start processing

3. **Processing Phase** (`processDocument` Server Action):
   - Accept: `docId`, `systemPromptId`, `customPromptId`
   - Fetch prompts from Firestore (`system-prompts`, `custom-prompts` collections)
   - Read stored PDF from filesystem
   - Combine: PDF + System Prompt + Custom Prompt → Send to Gemini API
   - Update document status to `processing` immediately
   - Save processing progress to Firestore (`progress`, `currentStep`)
   - Frontend polls for status updates every 2-3 seconds
   - Parse Gemini response and save questions to subcollection
   - Update status to `ready` on success, `failed` on error

**Key Files:**
- `app/actions/documents.ts` - Upload and processing Server Actions
- `app/actions/prompts.ts` - CRUD operations for prompts
- `lib/services/ai.ts` - Gemini API integration with prompts
- `lib/db/prompts.ts` - Firestore prompt queries
- `lib/types/index.ts` - Interfaces for Document, Question, Prompt, Exam
- `components/documents/process-dialog.tsx` - Prompt selection UI
- `components/documents/document-card.tsx` - Status polling and progress display

## Design System & Styling

### Theme: Professional Admin Dashboard
- **Design Philosophy:** Clean, enterprise-grade minimalism with emphasis on data readability
- **Subtle Gradients:** Diagonal gradient backgrounds for visual depth
- **Smooth Animations:** All interactive elements have polished hover and active states
- **Strong Contrast:** Accessible color combinations in both light and dark modes
- **Collapsible Sidebar:** Icon-only mode for maximized screen space

### Color Palette
**Dark Mode:**
- Background: `linear-gradient(135deg, #0F1117 0%, #1C1F26 50%, #0F1117 100%)`
- Card: `#1C1F26`
- Border: `#2E3342`
- Text Primary: `#FFFFFF`
- Text Muted: `#A1A7B8`
- Accent Primary: `#5750F1` (Purple)
- Success: `#3FD97F` (Green)
- Warning: `#FF9C55` (Orange)
- Danger: `#F87171` (Red)

**Light Mode:**
- Background: `linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 50%, #E5E7EB 100%)`
- Card: `#FFFFFF`
- Border: `#E5E7EB`
- Text Primary: `#111827`
- Text Muted: `#6B7280`
- Accent Primary: `#5750F1` (Purple - consistent)
- Success: `#10B981` (Green)
- Warning: `#F59E0B` (Orange)
- Danger: `#EF4444` (Red)

### Typography
- **Font:** Inter or system sans-serif stack
- **Headings:** `font-semibold` to `font-bold`
- **Body:** `font-normal` (400) and `font-medium` (500)
- **Hierarchy:** Clear sizing from `text-sm` to `text-3xl`

### Component Styling Standards
**Cards:**
- Structure: `bg-card border border-border rounded-[10px] shadow-sm p-6`
- Hover: `hover:shadow-lg hover:-translate-y-1 hover:border-primary/30`
- Transitions: `transition-all duration-300 ease-in-out`
- Padding: `p-6` or `px-7.5 py-7.5` for larger cards

**Buttons:**
- Radius: `rounded-md` to `rounded-lg` (6-8px)
- Primary: Purple `#5750F1` background
- Hover: `hover:scale-105 hover:shadow-lg hover:shadow-primary/20`
- Active: `active:scale-95`
- Transitions: `transition-all duration-300 ease-in-out`

**Menus & Dropdowns:**
- Menu items slide right on hover: `hover:pl-3`
- Transitions: `transition-all duration-200`
- Smooth open/close animations with fade and zoom

**Layout Grid:**
- Responsive: `grid-cols-1 sm:grid-cols-2 xl:grid-cols-4`
- Gaps: `gap-4 md:gap-6 2xl:gap-7.5`
- 12-column support for complex layouts

**Tables:**
- Striped rows: `even:bg-gray-2 dark:even:bg-dark-2`
- Headers centered, numbers right-aligned

### Implementation Notes
- Use `cn()` utility for conditional Tailwind classes
- Follow Shadcn UI patterns for accessibility
- Strictly adhere to design tokens in `docs/design_spec.md`
- Subtle gradient backgrounds with fixed attachment
- All hover states must include smooth animations (300ms for major, 200ms for minor)
- Sidebar is collapsible via `<Sidebar collapsible="icon">` with SidebarTrigger button
- Interactive elements should feel responsive with scale/translate/shadow effects

## Coding Standards

### Naming Conventions
- **Files:** `kebab-case.tsx` (e.g., `app-sidebar.tsx`)
- **Components:** `PascalCase` (e.g., `AppSidebar`)
- **Functions/Variables:** `camelCase` (e.g., `uploadDocument`)
- **Server Actions:** `verbNoun` pattern (e.g., `processDocument`, `deleteDocument`)

### TypeScript
- Strict typing enforced - **never use `any`**
- Use Zod for runtime validation (especially Server Action inputs)
- Define types in `lib/types/index.ts`
- Interfaces for domain objects (Document, Question, Exam)

### File Organization
- Server Actions in `app/actions/` or co-located `actions.ts` files
- Business logic in `lib/services/` (framework-agnostic)
- Data access in `lib/db/` (Firestore helpers)
- Shared types in `lib/types/`

### Error Handling
- Use `try/catch` in Server Actions
- Return standardized error responses: `{ error: string }`
- Log errors to console with `console.error()`
- Revalidate paths after mutations with `revalidatePath()`

## Environment Variables

Required environment variables (configure in `.env.local`):
- `GEMINI_API_KEY` - Google Gemini API key
- `GCP_PROJECT_ID` - Google Cloud Project ID (optional, uses ADC if not set)

Firebase Admin SDK uses Application Default Credentials (ADC) or explicit project ID.

## Current Implementation Status

**Completed (Epic 1 & 2 - Partial):**
- Next.js project setup with Tailwind, Shadcn UI
- Professional admin dashboard design with animations
- Collapsible sidebar navigation
- Document upload and storage to local filesystem
- Document listing with status indicators

**In Progress (Epic 2, 3, 4):**
- **Epic 2 Refactor:** Separate processing from upload
  - Process button on uploaded documents
  - Status polling for processing progress
- **Epic 3:** Prompt Management
  - Create Prompts page (`/prompts`)
  - CRUD operations for system and custom prompts
  - Prompt selection in processing workflow
- **Epic 4:** Document Processing with Prompts
  - Process dialog with prompt selection
  - Backend Gemini API call with prompts
  - Real-time status updates and polling

**Planned (Epic 5 & 6):**
- **Epic 5:** Exam Module
  - Exam configuration and quiz interface
  - Timer, scoring, and results display
- **Epic 6:** Welcome Page
  - Landing page at `/` with stats and CTAs

See `docs/project_plan.md` for detailed roadmap and epic breakdown.

## Key Patterns & Conventions

### Server-First Development
- Prioritize Server Components (RSC) for data fetching
- Use Client Components (`'use client'`) only for interactivity
- Keep business logic in `lib/services/` for testability

### Database Access
- Import `db` from `lib/db/firebase.ts`
- Use Firestore `batch()` for multi-document writes
- Collection references: `db.collection('documents')`
- Subcollections: `docRef.collection('questions')`

### AI Integration
- Gemini 1.5 Flash model for question generation
- Multimodal input: PDF buffer + text prompt
- Clean JSON responses (strip markdown code blocks)
- Handle rate limits and API errors gracefully

### Form Handling
- React Hook Form + Zod resolver for validation
- Server Actions receive `FormData` or validated objects
- Use `revalidatePath()` after successful mutations
- Toast notifications via Sonner (`sonner` package)

## Documentation Reference

- **`docs/project_plan.md`** - Features, epics, and implementation progress
- **`docs/design_spec.md`** - Strict design system and architecture patterns
- **`GEMINI.md`** - Historical context (Gemini-specific development notes)
