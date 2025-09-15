# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ownima Admin Dashboard is a React-based admin interface for managing Ownima platform users. It's built with TypeScript, Vite, and connects to the Ownima backend API at `https://beta.ownima.com/api/v1`.

## Development Commands

- `npm run dev` - Start development server (runs on http://localhost:5173)
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally

## Architecture

### Core Structure
- **Frontend**: React 18 + TypeScript with Vite build system
- **State Management**: TanStack Query for server state, React Context for auth
- **Styling**: Tailwind CSS v4 with Headless UI components
- **Routing**: React Router v7 with nested routes under `/dashboard/*`
- **HTTP**: Axios with automatic JWT token injection and 401 handling

### Authentication Flow
- JWT-based auth with tokens stored in localStorage
- AuthContext provides `useAuth()` hook for auth state
- ProtectedRoute component wraps authenticated pages
- API client automatically adds Bearer tokens and handles 401 redirects
- Token expiry triggers automatic logout and redirect to login

### Key Architectural Patterns
- Service layer pattern: All API calls go through service files (`services/`)
- Context + hooks pattern for global state (auth, toast notifications)
- Layout component structure with Header + Sidebar for admin pages
- Modal system with reusable Modal component and specific modal implementations
- Form handling with React Hook Form + Zod validation

### Directory Structure
```
src/
├── components/
│   ├── layout/          # Header, Sidebar, Layout wrapper
│   ├── modals/          # User create/edit modals
│   └── ui/              # Reusable components (Button, Modal, Toast, etc.)
├── contexts/            # AuthContext for global auth state
├── hooks/               # useToast and other custom hooks
├── pages/               # Route components (Dashboard, Users, etc.)
├── services/            # API service layer (api.ts, auth.ts, users.ts)
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

### API Integration
- Base API client class with interceptors in `src/services/api.ts`
- Separate service files for different domains (auth, users)
- All API responses typed with TypeScript interfaces in `src/types/`
- TanStack Query handles caching, loading states, and error handling

### Routing Structure
- Public routes: `/` (landing), `/login`
- Protected routes under `/dashboard/*`:
  - `/dashboard` redirects to `/dashboard/users`
  - `/dashboard/overview` - Analytics dashboard
  - `/dashboard/users` - User management

### UI Patterns
- Tailwind CSS for styling with custom configuration
- Headless UI for accessible components (modals, dropdowns, etc.)
- Heroicons for consistent iconography
- Toast notifications via useToast hook
- Loading states with LoadingSpinner component
- Confirmation dialogs with ConfirmDialog component