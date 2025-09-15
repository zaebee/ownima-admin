# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ownima Admin Dashboard is a React-based admin interface for managing Ownima platform users. It's built with TypeScript, Vite, and connects to the Ownima backend API at `https://beta.ownima.com/api/v1`.

## Development Commands

### Package Managers
This project supports both npm and bun:
- `npm run dev` / `bun run dev` - Start development server (runs on http://localhost:5173)
- `npm run build` / `bun run build` - Build for production (TypeScript compilation + Vite build)
- `npm run lint` / `bun run lint` - Run ESLint with auto-fix
- `npm run preview` / `bun run preview` - Preview production build locally

### Important Notes
- **Always run linting before committing**: The project has strict ESLint rules and all errors must be resolved
- **No test framework configured**: This project does not currently have automated tests
- **Bun is preferred**: Faster package management and script execution when available

## Architecture

### Core Structure
- **Frontend**: React 18 + TypeScript with Vite build system
- **State Management**: TanStack Query for server state, React Context for auth
- **Styling**: Tailwind CSS v4 with Headless UI components
- **Routing**: React Router v7 with nested routes under `/dashboard/*`
- **HTTP**: Axios with automatic JWT token injection and 401 handling

### Authentication Flow
- JWT-based auth with tokens stored in localStorage
- AuthContext in `src/contexts/AuthContext.tsx` provides auth state management
- `useAuth()` hook in `src/hooks/useAuth.ts` provides auth access across components
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
├── hooks/               # useAuth, useToast and other custom hooks
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
- **TypeScript Strict Mode**: All `any` types have been replaced with proper interfaces
- Service interfaces extend `Record<string, unknown>` for API client compatibility

### Routing Structure
- Public routes: `/` (landing), `/login`
- Protected routes under `/dashboard/*`:
  - `/dashboard` redirects to `/dashboard/users`
  - `/dashboard/overview` - Analytics dashboard
  - `/dashboard/users` - User management

### UI Patterns
- Tailwind CSS v4 for styling with custom configuration
- Headless UI for accessible components (modals, dropdowns, etc.)
- Heroicons for consistent iconography
- Toast notifications via useToast hook
- Loading states with LoadingSpinner component
- Confirmation dialogs with ConfirmDialog component

## Development Guidelines

### Code Quality
- **Strict ESLint configuration**: All errors must be resolved before committing
- **TypeScript strict mode**: No `any` types allowed, all interfaces properly typed
- **React best practices**: Hooks follow exhaustive-deps rules, proper useCallback usage
- **Import organization**: Centralized hooks in `/hooks` directory, contexts separated

### Architecture Decisions
- **Authentication separation**: `useAuth` hook separated from `AuthContext` for react-refresh compatibility
- **Service layer pattern**: API calls abstracted through service classes with proper typing
- **Component isolation**: Reusable UI components in `/components/ui`, page-specific components in respective directories
- **State management**: TanStack Query for server state, React Context for global client state

### API Development
- Current API endpoint: `https://beta.ownima.com/api/v1`
- All endpoints require Bearer token authentication
- API client handles 401 responses with automatic logout
- Service methods return properly typed responses matching backend API structure