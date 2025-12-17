# Task Manager Frontend

Modern React application with real-time collaboration features built using Vite, TypeScript, and Tailwind CSS.

## Technology Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **TanStack Query (React Query)** - Server state management
- **React Hook Form + Zod** - Form validation
- **Socket.io Client** - Real-time updates
- **React Router** - Routing
- **Axios** - HTTP client

## Architecture

### State Management
- **Server State**: React Query manages all server data with caching
- **Auth State**: Context API with React Query for user session
- **Real-time Sync**: Socket.io events trigger React Query cache invalidation

### Component Structure
```
Components
├── Layout - Navigation and layout wrapper
├── ProtectedRoute - Auth guard for routes
├── ErrorBoundary - Error handling
├── TaskCard - Individual task display with inline editing
├── TaskFilters - Filter controls
├── NotificationBell - Notification dropdown
└── SkeletonLoader - Loading states
```

### Custom Hooks
- `useAuth`: Authentication state and operations
- `useTasks`: Task CRUD with optimistic updates
- `useNotifications`: Notification fetching and management
- `useSocket`: Real-time event listeners

## Features

### Authentication
- JWT-based auth with HttpOnly cookies
- Protected routes with loading states
- Auto-redirect on 401 responses

### Task Management
- Create, update, delete tasks
- Inline editing with validation
- Optimistic UI updates
- Status change via dropdown
- Real-time updates across clients

### Real-time Features
- Socket.io connection with auth token
- Auto-reconnection on disconnect
- React Query cache invalidation on socket events
- Live task updates
- Live notification delivery

### Form Validation
- React Hook Form for performance
- Zod schemas for type-safe validation
- Client-side validation before API calls

## Setup

### Prerequisites
- Node.js 18+
- Backend server running

### Installation
```bash
npm install
```

### Environment Variables
Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

### Development
```bash
npm run dev
```
Opens at http://localhost:5173

### Production Build
```bash
npm run build
npm run preview
```

## Deployment (Vercel)

### Steps
1. Push code to GitHub
2. Import repository in Vercel
3. Configure:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variable: `VITE_API_URL`
5. Deploy

### Environment Variables
Set production API URL:
```
VITE_API_URL=https://your-backend-url.com/api
```

## Key Patterns

### Optimistic Updates
Task status changes update UI immediately, then sync with server:
```typescript
onMutate: async ({ taskId, data }) => {
  // Cancel ongoing queries
  // Save previous state
  // Update cache optimistically
}
```

### Socket Integration
Socket events trigger React Query refetch:
```typescript
socket.on('task:updated', () => {
  queryClient.invalidateQueries(['tasks']);
});
```

### Error Handling
- Axios interceptor catches 401, redirects to login
- Error boundary catches React errors
- Form validation prevents invalid submissions

## Trade-offs

### React Query vs Redux
- Chose React Query for built-in caching and async state
- Simpler code, less boilerplate
- Better DX with devtools

### Optimistic Updates
- Improves perceived performance
- Requires rollback logic on errors
- Worth it for better UX

### Tailwind CSS
- Utility-first for rapid development
- Custom component classes for reusability
- Trade-off: HTML can look verbose

## Future Improvements
- Pagination controls for large task lists
- Advanced search and filtering
- File attachments for tasks
- Task comments and activity feed
- Dark mode support
