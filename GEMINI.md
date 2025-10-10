# Ownima Admin Dashboard

## Project Overview

This is a modern, React-based admin dashboard for the Ownima platform. It's built with TypeScript and utilizes a robust set of modern web development tools and practices. The primary purpose of this application is to provide administrators with a user-friendly interface to manage users, monitor platform metrics, and view system status.

**Key Technologies & Architecture:**

*   **Frontend Framework:** React 19 with TypeScript
*   **Build Tool:** Vite for a fast development experience and optimized builds.
*   **Styling:** Tailwind CSS for a utility-first CSS workflow, combined with Headless UI for accessible component primitives.
*   **Routing:** React Router v6 for client-side navigation.
*   **State Management:**
    *   **Server State:** TanStack Query is used for fetching, caching, and managing server state.
    *   **UI State:** React Context (`AuthContext`, `ToastContext`) and local component state (`useState`) are used for managing UI-related state.
*   **API Communication:** Axios is used as the HTTP client, with interceptors for automatic JWT token handling.
*   **Forms:** React Hook Form with Zod for validation.
*   **Testing:** Vitest and React Testing Library for comprehensive unit and integration testing.
*   **Code Quality:** ESLint and Prettier are used for linting and code formatting, enforced by pre-commit hooks using Husky.

**Architectural Patterns:**

*   **Component-Based Architecture:** The UI is broken down into reusable components, organized by feature (`pages`, `components/layout`, `components/ui`).
*   **Lazy Loading:** Pages are lazy-loaded to improve initial load performance.
*   **Protected Routes:** A `ProtectedRoute` component ensures that only authenticated users can access certain parts of the application.
*   **Centralized API Services:** API logic is encapsulated in a `services` directory, separating data fetching from UI components.
*   **Error Handling:** The application uses Error Boundaries and a centralized error reporting utility.

## Building and Running

### Development

To run the development server:

```bash
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.

### Building for Production

To create a production-ready build:

```bash
npm run build
```

The output will be in the `dist/` directory.

### Running Tests

To run the test suite:

```bash
npm test
```

To run tests once and generate a coverage report:

```bash
npm run test:coverage
```

## Development Conventions

*   **Coding Style:** The project follows standard React/TypeScript best practices, with a strong emphasis on functional components and hooks. Code style is enforced by ESLint and Prettier.
*   **Testing:** New features should be accompanied by tests. The goal is to maintain a high level of test coverage. Tests are written with Vitest and React Testing Library.
*   **State Management:**
    *   Use TanStack Query for all interactions with the backend API.
    *   Use React Context for global UI state that is not tied to the server (e.g., authentication status, toast notifications).
    *   Use local component state (`useState`) for state that is specific to a single component.
*   **API Integration:** API type definitions are generated from an OpenAPI specification using `openapi-typescript`. This ensures that the frontend is always in sync with the backend API. To update the types, run `npm run generate-types`.
*   **Commits:** Commit messages should be clear and descriptive. Pre-commit hooks will run linting and testing to ensure code quality before committing.
