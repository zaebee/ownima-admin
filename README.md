# Ownima Admin Dashboard

A modern React-based admin dashboard for managing Ownima platform users and beta testers.

## Features

- 🔐 **Authentication** - Secure login with JWT token management
- 👥 **User Management** - View and manage platform users with search and filtering
- 📊 **Dashboard Analytics** - Overview of key metrics and statistics
- 🎨 **Modern UI** - Built with Tailwind CSS and Headless UI components
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with Headless UI components
- **State Management**: TanStack Query for server state management
- **Routing**: React Router v6 for client-side routing
- **HTTP Client**: Axios with automatic token handling
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Heroicons for consistent iconography

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ownima-admin
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
   - The app is configured to connect to `https://beta.ownima.com/api/v1`
   - Update the API base URL in `src/services/api.ts` if needed

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

### Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components (Header, Sidebar, etc.)
│   └── ui/             # Base UI components (Button, LoadingSpinner, etc.)
├── contexts/           # React contexts (AuthContext)
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # API service layer
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Key Components

### Authentication
- JWT-based authentication with automatic token refresh
- Protected routes that redirect to login when unauthenticated
- Persistent login state using localStorage

### User Management
- Paginated user listings with search functionality
- Filter by user status (active/inactive)
- User profile display with role-based badges


### Dashboard
- Key metrics overview cards
- Real-time data updates

## API Integration

The admin dashboard integrates with the Ownima backend API:

- **Authentication**: OAuth2 password flow
- **Users**: CRUD operations and user management
- **Analytics**: Statistics and metrics endpoints

## Contributing

1. Follow the existing code style and patterns
2. Use TypeScript for all new code
3. Implement proper error handling and loading states
4. Add appropriate type definitions
5. Test changes thoroughly before submitting

## License

This project is proprietary software for Ownima platform administration.