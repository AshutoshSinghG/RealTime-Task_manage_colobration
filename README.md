# AbleBase Task Manager

A full-stack, real-time collaborative task management application built with the MERN stack featuring Socket.io for instant updates across multiple users.
---

## Features

### Core Functionality
- **Complete CRUD Operations** - Create, read, update, and delete tasks with 7 comprehensive fields
- **Real-Time Collaboration** - Instant updates using Socket.io when any user creates, edits, or deletes tasks
- **Task Assignment** - Assign tasks to team members with instant notifications
- **Smart Permissions** - Only task creators can delete tasks (enforced on frontend & backend)
- **Rich Task Details** - Title, description, due date, priority, status, creator, and assignee

### Dashboard Features
- **Multiple Views**
  - All Tasks
  - Assigned to Me
  - Created by Me
  - Overdue Tasks (highlighted in red)
- **Statistics Cards** - Quick overview of task counts
- **Advanced Filtering** - By status, priority, and assignment
- **Flexible Sorting** - By due date, priority, or status

### Notifications
- **In-App Notifications** - Real-time alerts when assigned to tasks
- **Unread Count Badge** - Visual indicator for new notifications
- **Notification History** - View all past notifications

### User Experience
- **Overdue Detection** - Automatic highlighting of past-due tasks
- **Inline Editing** - Update tasks directly in the dashboard
- **Color-Coded UI** - Visual priority and status indicators
- **Responsive Design** - Works on desktop and tablet devices

---

## Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd AbleBase-Task-Manager
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

3. **Setup Frontend** (in a new terminal)
```bash
cd frontend
npm install
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

---

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Lightning-fast build tool
- **React Query (TanStack Query)** - Server state management
- **React Router** - Client-side routing
- **Socket.io Client** - Real-time communication
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client

### Backend
- **Node.js** with Express
- **TypeScript** - Type safety
- **MongoDB** with Mongoose - Database
- **Socket.io** - WebSocket server
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **cookie-parser** - Cookie handling

---

## Project Structure

```
AbleBase-Task-Manager/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── services/         # Business logic
│   │   ├── repositories/     # Database layer
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API routes
│   │   ├── middlewares/     # Express middleware
│   │   ├── socket/          # Socket.io setup
│   │   └── app.ts           # App entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   ├── sockets/        # Socket.io client
│   │   ├── types/          # TypeScript types
│   │   └── App.tsx         # App entry point
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

---

## Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=your-super-secret-jwt-key-change-this
FRONTEND_URL=http://localhost:5173
PORT=5000
NODE_ENV=development
```

### Frontend (.env) - Optional
```env
VITE_API_URL=http://localhost:5000/api
```

---

## API Documentation

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user |

### Tasks
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tasks` | Get all tasks (filtered) | ✅ |
| POST | `/api/tasks` | Create new task | ✅ |
| PUT | `/api/tasks/:id` | Update task | ✅ |
| DELETE | `/api/tasks/:id` | Delete task (creator only) | ✅ |
| PUT | `/api/tasks/:id/assign` | Assign task to user | ✅ |

### Notifications
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/notifications` | Get user notifications | ✅ |
| GET | `/api/notifications/unread/count` | Get unread count | ✅ |
| PUT | `/api/notifications/:id/read` | Mark as read | ✅ |
| PUT | `/api/notifications/read-all` | Mark all as read | ✅ |

### Users
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users` | Get all users | ✅ |

---

## Usage Examples

### Creating a Task
1. Login to your account
2. Click **"Create Task"** button
3. Fill in all fields:
   - Title (required)
   - Description (required)
   - Due Date (required)
   - Priority: Low, Medium, High, or Urgent
   - Status: To Do, In Progress, Review, or Completed
   - Assign To: Select a user (optional)
4. Click **"Create"**
5. Task appears instantly for both you and the assignee!

### Real-Time Collaboration
1. **User A** creates a task assigned to **User B**
2. **User B** sees the task **instantly** without refreshing
3. Either user updates the task
4. Changes appear in **real-time** for both users
5. Only **User A** (creator) can delete the task

### Managing Notifications
1. Click the **bell icon** in the navbar
2. View unread notification count
3. Click **"View All"** to see notification list
4. Click notification to mark as read

---

## Security Features

- **JWT Authentication** - Secure token-based auth
- **HttpOnly Cookies** - XSS attack prevention
- **Password Hashing** - bcrypt with salt rounds
- **CORS Protection** - Whitelist allowed origins
- **Input Validation** - Server-side validation
- **Authorization Checks** - Role-based permissions
- **Secure Socket.io** - Cookie-based authentication

---

##  Testing

### Manual Testing
```bash
# Backend (from backend directory)
npm run dev
# Check console for:
# - Server running on port 5000
# - MongoDB connected
# - Socket.io initialized

# Frontend (from frontend directory)
npm run dev
# Open http://localhost:5173
# Check browser console for:
# -  Socket connected successfully
# - No CORS errors
```

### Multi-User Testing
1. Open browser window 1 - Login as User A
2. Open browser window 2 (incognito) - Login as User B
3. User A creates task assigned to User B
4. Verify User B sees task **instantly**
5. User B updates the task
6. Verify User A sees update **instantly**

---

## Troubleshooting

### Socket Connection Issues

**Problem:** "Invalid token" error in console

**Solution:**
1. Clear browser cookies (F12 → Application → Cookies)
2. Logout and login again
3. Verify backend is running
4. Check console for ` Socket connected successfully`

### Tasks Not Updating in Real-Time

**Solution:**
1. Verify socket is connected (check console)
2. Ensure both users are logged in
3. Check backend terminal for emission logs (📡 emoji)
4. Refresh page and try again

### CORS Errors

**Solution:**
1. Verify `FRONTEND_URL` in backend `.env`
2. Check `allowedOrigins` in `backend/src/app.ts`
3. Ensure frontend is running on allowed port (5173 or 5174)

---

## Deployment

### Backend Deployment (Heroku/Railway/Render)
```bash
cd backend
npm run build
# Deploy dist/ folder
# Set environment variables in hosting platform
```

### Frontend Deployment (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy dist/ folder
# Set VITE_API_URL to production backend URL
```

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Use MongoDB Atlas (not local)
- [ ] Set strong `JWT_SECRET`
- [ ] Enable `secure: true` for cookies
- [ ] Configure production CORS origins
- [ ] Set up SSL/HTTPS
- [ ] Enable rate limiting
- [ ] Set up monitoring/logging

---

##  Roadmap

### Completed
- [x] Complete CRUD operations
- [x] Real-time Socket.io integration
- [x] Task assignment system
- [x] Authentication & authorization
- [x] Dashboard with multiple views
- [x] Notifications system
- [x] Filtering and sorting

### 🚧 Future Enhancements
- [ ] Task comments and discussions
- [ ] File attachments
- [ ] Email notifications
- [ ] Search functionality
- [ ] Task dependencies
- [ ] Recurring tasks
- [ ] Team/workspace management
- [ ] Mobile app (React Native)
- [ ] Dark mode theme
- [ ] Export to CSV/PDF

---
