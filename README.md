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
- **Dashboard:** Comprehensive BI overview with charts (Revenue, Reservations, Vehicle Status, OpenSearch Stats). Modularized metric cards and dashboard components.
- **Entities Management:**
  - Users (Owners & Riders) listing, details, and dynamic avatar/image parsing via `getMediaUrl`.
  - Vehicles listing and details with dynamic server-side pagination.
  - Reservations listing and details.
  - Billing & Transactions.
  - Verification processing page.
- **Global Search:** Command palette (`cmd+k`) style quick search.
- **Responsive Layout:** Sidebar navigation with responsive breakpoints.
- **Real API Integration:** Connected live endpoints for Dashboard metrics, Users, Vehicles, and Reservations using dynamic environment variables (`VITE_API_URL`).
- **Data Modeling:** Extracted fully typed interfaces into dedicated files (`src/types/`).
- **Theming:** Full System/Dark/Light theme toggle support applied via Tailwind context.

---

## 🔍 Pending Refactoring & Improvements

### 1. State & Data Fetching Management
- **Issue:** Standard `useEffect` and `useState` are used for fetching data. This lacks built-in caching, automatic retries, background refetching, and pagination optimization.
- **Improvement:** 
  - Introduce **TanStack Query (React Query)** in the future. This will heavily clean up loading states, error handling, and simplify the components.

### 2. API Layer Refactoring (`src/lib/api.ts`)
- **Issue:** The `api.ts` has a hardcoded redirect logic inside the Axios interceptor (`window.location.href = "/login"`).
- **Improvement:** 
  - This is an anti-pattern as it breaks React Router's SPA lifecycle. Instead, we should dispatch an event or use a central Error Boundary / Context state to trigger the logout gracefully using `useNavigate()`.

---

## 🐛 Known Bugs & Technical Debt

- **Partial Mock Fallbacks:** While most lists and details pages are connected to the live API, some peripheral features or edge-cases might still rely on UI mock data if the server endpoints are WIP.
- **Server Sorting & Filtering:** Advanced filtering and multi-column sorting need full implementation matching API specs.
- **Auth Flow Security:** Current authentication uses `localStorage` for the raw `admin_token` which is vulnerable to XSS. Need to transition to HttpOnly cookies or a more secure JWT storage strategy.
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
