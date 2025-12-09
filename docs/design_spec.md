# SuperExam Design Specification

## Backend Architecture (Rust)
The backend implementation must strictly adhere to a **Layered Architecture** inspired by Spring Boot patterns to ensure separation of concerns and maintainability.

### Layered Structure
- **Controller Layer (Interface):**
  - Implemented as **gRPC Service** handlers.
  - Responsible for request validation and mapping Protobuf messages to internal DTOs.
  - Delegates business logic to the Service layer.
- **Service Layer (Business Logic):**
  - Contains all core application logic.
  - Operates on **DTOs (Data Transfer Objects)** and Domain Entities.
  - Completely decoupled from the transport layer (gRPC/HTTP) and data access details.
- **Repository Layer (Data Access):**
  - Handles all interactions with **Google Cloud Firestore**.
  - Abstracts query logic and schema mapping.
  - Returns Domain Entities to the Service layer.
- **DTOs:**
  - Distinct Rust structs used to pass data between layers, ensuring the API contract (Protobuf) and Database Schema (Firestore) can evolve independently.

## Frontend Design (Flutter Web)
The frontend will be designed as a **SaaS-style Admin Dashboard**, prioritizing a rich, responsive, and visually engaging user experience.

### UX & Theming
- **Design Philosophy:**
  - **Mobile-First:** Fully responsive layouts that adapt seamlessly from mobile screens to large desktop monitors.
  - **Theme:** Automatic switching between **Dark** and **Light** modes based on system settings.
- **Visuals & Styling:**
  - **Color Scheme:** High-contrast, vibrant design using **gradients** (e.g., Blue-Purple, Orange-Red) and bright accent colors.
  - **Typography:** Modern, legible Sans-Serif fonts (e.g., *Poppins* or *Inter*).

### Layout & Components
- **Core Layout:**
  - **Navigation:** Collapsible Sidebar (Drawer) for main navigation + Top Bar for global actions/profile.
  - **Content:** Card-based layout with adequate padding and distinct separation of sections.
- **Components:**
  - **Rich Interactions:** Buttons with ripple effects, cards with hover elevation, and smooth route transitions.
  - **Data Visualization:** Use charts (Bar, Pie, Line) to visualize exam results and history.
  - **Animations:** Subtle entrance animations for lists and loading states (shimmer effects).
