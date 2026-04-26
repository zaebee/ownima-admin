# EV/Ride-Sharing Admin Dashboard

## 📋 Overview
This project is an administrative dashboard built for managing an EV Fleet and Ride-Sharing platform. It allows administrators to monitor platform health, manage users (owners/riders), track vehicles, handle reservations, and monitor billing/transactions.

## 🛠 Tech Stack
- **Framework:** React 18+ & Vite
- **Language:** TypeScript
- **Routing:** React Router v7
- **Styling:** Tailwind CSS 4 & shadcn/ui
- **Icons:** Lucide React
- **Data Visualization:** Recharts
- **HTTP Client:** Axios
- **Animations:** Motion (Framer Motion)

## ✨ Implemented Features
- **Authentication:** Protected routes with mock JWT-based auth flow (`AuthContext`).
- **Dashboard:** Comprehensive BI overview with charts (Revenue, Reservations, Vehicle Status, OpenSearch Stats).
- **Entities Management:**
  - Users (Owners & Riders) listing and details.
  - Vehicles listing and details.
  - Reservations listing and details.
  - Billing & Transactions.
  - Verification processing page.
- **Global Search:** Command palette (`cmd+k`) style quick search.
- **Responsive Layout:** Sidebar navigation with responsive breakpoints.

---

## 🔍 Code Review & Refactoring Opportunities

During the recent code review, several structural and functional areas were identified for refactoring to improve maintainability, performance, and scalability.

### 1. Component Refactoring (Dashboard.tsx)
- **Issue:** The `Dashboard.tsx` file is overly complex (> 600 lines) and handles data fetching, business logic, and multiple complex UI renderings (Charts, Bento boxes, Data lists).
- **Improvement:**
  - Extract charts into separate dedicated components (e.g., `components/dashboard/RevenueChart.tsx`, `components/dashboard/FleetStatusPie.tsx`).
  - Extract metric cards into reusable components.
  - Separate mock data definitions into a dedicated `tests/mocks/` or `lib/mockData.ts` file until the real backend replaces it.

### 2. State & Data Fetching Management
- **Issue:** Standard `useEffect` and `useState` are used for fetching data. This lacks built-in caching, automatic retries, background refetching, and pagination optimization.
- **Improvement:** 
  - Introduce **TanStack Query (React Query)** in the future. This will heavily clean up loading states, error handling, and simplify the components.

### 3. API Layer Refactoring (`src/lib/api.ts`)
- **Issue:** The `api.ts` has a hardcoded redirect logic inside the Axios interceptor (`window.location.href = "/login"`).
- **Improvement:** 
  - This is an anti-pattern as it breaks React Router's SPA lifecycle. Instead, we should dispatch an event or use a central Error Boundary / Context state to trigger the logout gracefully using `useNavigate()`.

### 4. Reusable Type Definitions
- **Issue:** Types (like `MetricsData` in `Dashboard.tsx`) are defined directly inside component files.
- **Improvement:**
  - Create a dedicated `src/types/` folder (e.g., `src/types/api.ts`, `src/types/models.ts`) and export interfaces globally so they can be reused across pages and the API layer.

---

## 🐛 Known Bugs & Technical Debt

- **Missing Real Backend:** Most pages are currently simulating data or using a mock API based on the `TASK-*.md` documents. A real backend (Node.js/Firebase) needs to be wired up.
- **Pagination & Filtering:** The UI lists (`UsersPage`, `VehiclesPage`) currently assume all data is fetched at once. Server-side pagination, sorting, and filtering logic must be implemented both in the UI tables and the API requests.
- **Auth Flow Security:** Current authentication uses `localStorage` for the raw `admin_token` which is vulnerable to XSS. Need to transition to HttpOnly cookies or a more secure JWT storage strategy when connecting the real API.
- **Route Error Handling:** Missing a global `NotFound` (404) page component. Unmatched routes currently render blank or crash.

---

## 🚀 Future Features Roadmap

1. **WebSockets for Real-time Updates:**
   - Implement real-time tracking for vehicles currently on a trip.
   - Live notifications for admins when a user submits KYC/Verification documents.

2. **Role-Based Access Control (RBAC):**
   - Introduce different admin tiers (e.g., Super Admin, Support Agent, Financial Auditor) to restrict access to pages like Billing or destructive actions (Delete User).

3. **Export Functionality:**
   - Add "Export to CSV/Excel" buttons to data tables for external reporting.

4. **Audit Logs:**
   - Implement an "Admin Audit Log" page that tracks who did what (e.g., "Admin X approved User Y's verification").

5. **Advanced Filtering:**
   - Complex table filters (e.g., "Vehicles that are 'Free' AND 'Battery > 80%' in specific City").

## 💻 Getting Started

1. Install dependencies: `npm install`
2. Start the dev server: `npm run dev`
3. The server runs on port 3000 mapping by default.
