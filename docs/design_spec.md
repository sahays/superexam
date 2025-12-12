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
- **Design Philosophy:** **"Professional Admin Dashboard"**
  - Clean, enterprise-grade minimalism with emphasis on data readability
  - Balanced density with whitespace, using cards to segment information
  - SVG grid background patterns for subtle visual interest
  - Strong color contrast for accessibility in both light and dark modes
  - Professional SaaS aesthetic similar to modern admin dashboards

- **Design Tokens (Tailwind Config):**
  - **Colors (Dark Mode):**
    - `bg-background`: `#0F1117` (Solid dark gray with subtle grid SVG overlay)
    - `bg-card`: `#1C1F26` (Clean card background)
    - `border`: `#2E3342` (Visible borders for clear separation)
    - `text-primary`: `#FFFFFF`
    - `text-muted`: `#A1A7B8`
    - `accent-primary`: `#5750F1` (Purple - primary action color)
    - `accent-success`: `#3FD97F` (Green - positive metrics)
    - `accent-warning`: `#FF9C55` (Orange - warnings)
    - `accent-danger`: `#F87171` (Red - errors)
  - **Colors (Light Mode):**
    - `bg-background`: `#F9FAFB` (Light gray with subtle grid SVG overlay)
    - `bg-card`: `#FFFFFF` (Pure white cards)
    - `border`: `#E5E7EB` (Clear borders)
    - `text-primary`: `#111827`
    - `text-muted`: `#6B7280`
    - `accent-primary`: `#5750F1` (Purple - consistent with dark)
    - `accent-success`: `#10B981` (Green)
    - `accent-warning`: `#F59E0B` (Orange)
    - `accent-danger`: `#EF4444` (Red)
  - **Typography:**
    - **System Font Stack:** Inter or system sans-serif
    - **Headings:** `font-semibold` to `font-bold`
    - **Body:** `font-normal` (400) and `font-medium` (500)
    - **Sizes:** Clear hierarchy from `text-sm` to `text-3xl`
  - **Backgrounds:**
    - **Subtle Gradients:** Diagonal gradients for visual depth
    - **Light Mode:** `linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 50%, #E5E7EB 100%)`
    - **Dark Mode:** `linear-gradient(135deg, #0F1117 0%, #1C1F26 50%, #0F1117 100%)`
    - **Fixed Attachment:** Background stays fixed while content scrolls
  - **Component Styles:**
    - **Card Radius:** `rounded-[10px]` (10px - clean and modern)
    - **Button/Input Radius:** `rounded-md` to `rounded-lg` (6-8px)
    - **Shadows:**
      - Light: `shadow-sm` for cards, `shadow-lg` on hover
      - Dark: Subtle shadows or none
    - **Hover States:**
      - Cards: `hover:-translate-y-1 hover:shadow-lg hover:border-primary/30`
      - Buttons: `hover:scale-105 hover:shadow-lg` with active state `active:scale-95`
      - Menu Items: `hover:pl-3` (slide right animation)
    - **Transitions:**
      - Standard: `transition-all duration-300 ease-in-out`
      - Buttons: `transition-all duration-300 ease-in-out`
      - Menus: `transition-all duration-200`

### Layout & Components
- **Core Layout:** **Mobile-First Admin Dashboard Shell**
  - **Structure:**
    - **Sidebar:** Clean vertical navigation with clear sections. **Collapsible** via icon-only mode (click hamburger icon). Drawer on mobile. Uses `<Sidebar collapsible="icon">` component.
      - Navigation items: **Documents**, **Prompts**, **Exams**
      - Logo/Home link at top → navigates to `/`
      - No Dashboard or History sections
    - **Header:** Minimal top bar with SidebarTrigger button, breadcrumbs, and theme toggle.
    - **Main Content:** Padded content area with consistent spacing.
  - **Responsiveness:**
    - **Mobile:** Single column layout. Hamburger menu reveals sidebar drawer.
    - **Tablet:** `sm:grid-cols-2` for cards
    - **Desktop:** `xl:grid-cols-4` for dashboard widgets. Sidebar visible by default.
    - **Large Desktop:** `2xl:gap-7.5` for increased spacing
  - **Grid System:**
    - Use responsive grid: `grid-cols-1 sm:grid-cols-2 xl:grid-cols-4`
    - Consistent gaps: `gap-4 md:gap-6 2xl:gap-7.5`
    - 12-column layout support for complex dashboards (`xl:grid-cols-12`)
- **Component Patterns:**
  - **Cards:**
    - Structure: `bg-card border border-border rounded-[10px] shadow-sm p-6`
    - Hover: `hover:shadow transition-shadow duration-200`
    - No backdrop blur or glassmorphism
  - **Stat Cards:**
    - Icon/metric display with clear hierarchy
    - Percentage changes with color-coded indicators
    - Support for trend arrows and sparklines
  - **Tables:**
    - Striped rows: `even:bg-gray-2 dark:even:bg-dark-2`
    - Centered headers, right-aligned numbers
    - Responsive with horizontal scroll
  - **Charts:** Use Recharts with professional color schemes
  - **Loading States:** Skeleton loaders with `animate-pulse` on neutral backgrounds

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
    ├── documents/        # Document cards, upload, process dialogs
    ├── prompts/          # Prompt cards, create/edit dialogs
    ├── exams/            # Quiz UI, exam config
    └── layout/           # Sidebar, Header
    ```
