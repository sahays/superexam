# SuperExam Design Specification & Best Practices

This document outlines the architectural patterns, naming conventions, and coding standards for the SuperExam project (Next.js Monolith).

## 1. General Principles
- **Strict Typing:** Leverage TypeScript's type system extensively. Avoid `any` entirely. Use `zod` for runtime validation.
- **Server-First:** Prioritize Server Components (RSC) for data fetching and heavy lifting. Use Client Components only for interactivity.
- **Source of Truth:** TypeScript interfaces and Zod schemas define the contract between Client and Server (Actions).
- **Error Handling:** Use `try/catch` in Server Actions with standardized return types (e.g., `{ success: boolean, data?: T, error?: string }`).

## 2. API & Data Flow (Server Actions)
- **Pattern:** Use **Server Actions** for mutations and direct database access. Use **Server Components** for fetching data.
- **Naming:**
    - Actions: `verbNoun` (e.g., `uploadDocument`, `getExam`).
    - Files: `actions.ts` (inside feature folders) or `app/_actions/`.
- **Validation:** All inputs to Server Actions must be validated with Zod schemas.

## 3. Backend Architecture (Next.js)
The backend logic resides within the Next.js `app` directory and server-side utilities.

- **Framework:** Next.js 16+ (App Router).
- **Runtime:** Node.js (for `pdf-parse` compatibility) or Edge (where possible).

### Layered Structure (Folder Convention)
- **Data Access Layer (`lib/db/`):**
  - Direct interaction with Firestore using `firebase-admin`.
  - Typed helper functions to return domain objects.
- **Business Logic (`lib/services/`):**
  - Core logic (e.g., `ingestionService.ts`, `examService.ts`).
  - Decoupled from Next.js specifics (req/res objects) to allow easy testing or reuse.
- **Server Actions (`app/**/actions.ts`):**
  - The "Controller" equivalent.
  - Handles auth checks, input validation (Zod), and calls services.
- **Models (`lib/types/`):**
  - TypeScript interfaces/types sharing across client and server.

### Database (Firestore)
- **Collection Naming:** `kebab-case` (e.g., `exam-sessions`, `questions`).
- **IDs:** UUIDs or Auto-IDs.

## 4. Frontend Architecture (Next.js + Tailwind)
The frontend is a **SaaS-style Admin Dashboard**, built with React Server Components and Client Components where necessary.

### Architecture & Structure
- **UI Framework:** React 19 (via Next.js 16).
- **Styling:** Tailwind CSS.
- **Components:** Shadcn UI (Radix Primitives).
- **State Management:**
  - **Server:** URL Search Params & Server Component Data Fetching.
  - **Client:** `Zustand` for complex client-only state (e.g., active quiz session, sidebar toggle).

### UX & Theming
- **Design Philosophy:** **"Luminous Data" & "Bento Box"**.
  - The interface treats data as a vibrant, glowing entity. Content is organized into a modular grid of self-contained rectangular "Bento" boxes.
  - **Dark Mode (Default):** "Neon Glassmorphism". Deep void backgrounds, glowing neon accents, and high-contrast data visualization.
  - **Light Mode:** "Clean Frosted Glass". Soft, airy backgrounds, crisp shadows, and frosted glass panels.

- **Design Tokens (Tailwind Config):**
  - **Colors (Dark Mode):**
    - `bg-background`: Linear Gradient `#0F111A` -> `#1A1D2D`.
    - `bg-card`: `#151725` (Opacity: 0.65).
    - `border`: `#FFFFFF` (Opacity: 0.12).
    - `text-primary`: `#FFFFFF`.
    - `text-muted`: `#9CA3AF`.
    - `accent`: `#3B82F6` (Electric Blue).
    - *Glows:* Custom utility classes for `box-shadow` with `#3B82F6` & `#8B5CF6` (Opacity 0.15).
  - **Colors (Light Mode):**
    - `bg-background`: Linear Gradient `#F0F4F8` -> `#E2E8F0`.
    - `bg-card`: `#FFFFFF` (Opacity: 0.6).
    - `border`: `#FFFFFF` (Opacity: 0.8).
    - `text-primary`: `#1F2937`.
    - `text-muted`: `#64748B`.
    - `accent`: `#2563EB` (Royal Blue).
  - **Typography:**
    - **Headings:** *Plus Jakarta Sans* (`font-bold`).
    - **Body:** *Inter* (`font-normal`, `font-medium`).
  - **Animations:**
    - `transition-all duration-200 ease-in-out` (Hover).
    - `animate-in fade-in duration-800 slide-in-from-bottom-4` (Entrance).
  - **Component Styles:**
    - **Glass Blur:** `backdrop-blur-xl` (approx 20px).
    - **Card Radius:** `rounded-3xl` (24px).
    - **Button/Input Radius:** `rounded-2xl` (16px).
    - **Shadows:** `shadow-2xl` (custom deep blur).

### Layout & Components
- **Core Layout:** **Mobile-First Admin Dashboard Shell**.
  - **Structure:**
    - **Sidebar:** Collapsible (Icon-only on collapse), Glassmorphism style. Hidden on mobile (Drawer).
    - **Header:** Sticky top navbar, minimalist.
    - **Main Content:** Central area.
  - **Responsiveness:**
    - **Mobile:** Single column. Hamburger menu for sidebar.
    - **Desktop:** Visible sidebar. Main content restricted to `max-w-7xl` (1280px) centered.
  - **Bento Grid:**
    - Use CSS Grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`) for the "box" layout.
    - Gap: `gap-6` (24px).
- **Components:**
  - **Cards:** `bg-card/65 backdrop-blur-xl border border-white/10 rounded-3xl`.
  - **Glow Effects:** `hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.5)]` (Tailwind arbitrary value example).
  - **Charts:** Recharts or Visx with gradient fills (`<defs>` for SVG gradients).

## 5. Coding Standards
- **Naming:**
    - Files: `kebab-case` (e.g., `page.tsx`, `nav-bar.tsx`).
    - Components: `PascalCase`.
    - Functions/Variables: `camelCase`.
- **Directory Structure (App Router):**
    ```text
    app/
    ├── layout.tsx        # Root layout (Theme provider, Font loader)
    ├── page.tsx          # Landing/Dashboard
    ├── (dashboard)/      # Route Group for authenticated pages
    │   ├── layout.tsx    # Dashboard Shell (Sidebar + Header)
    │   ├── documents/
    │   ├── exams/
    │   └── history/
    ├── api/              # Route Handlers (if needed)
    └── global.css        # Tailwind directives
    
    lib/
    ├── db/               # Firestore init
    ├── services/         # Business logic
    ├── types/            # Zod schemas & TS Interfaces
    └── utils.ts          # cn() helper
    
    components/
    ├── ui/               # Shadcn primitives
    ├── features/         # Feature-specific components (e.g., UploadZone)
    └── layout/           # Sidebar, Header
    ```
