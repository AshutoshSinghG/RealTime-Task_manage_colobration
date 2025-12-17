# Task Manager Backend

Production-grade REST API with real-time Socket.io integration for collaborative task management.

## Architecture

### Layered Design
```
Controllers → Services → Repositories → Models
```

- **Models**: Mongoose schemas with validation and hooks
- **Repositories**: Data access layer with query abstraction
- **Services**: Business logic, audit logging, Socket.io events
- **Controllers**: HTTP request handling and response formatting

### Database Schema

#### User
- name, email (unique), password (bcrypt hashed)
- Timestamps: createdAt, updatedAt

#### Task
- title (max 100 chars), description, dueDate
- priority: Low | Medium | High | Urgent
- status: To Do | In Progress | Review | Completed
- References: creatorId, assignedToId
- Indexes on: creatorId, assignedToId, status, priority, dueDate

#### Notification
- userId, message, taskId (optional)
- isRead boolean
- Indexes on: userId+isRead, createdAt

#### AuditLog
- taskId, userId, action, previousValue, newValue, timestamp
- Indexes on: taskId+timestamp

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (returns HttpOnly cookie)
- `POST /api/auth/logout` - Logout (clears cookie)
- `GET /api/auth/me` - Get current user (protected)

### Tasks
All routes require authentication via HttpOnly cookie.

- `GET /api/tasks?status=&priority=&page=&limit=` - List tasks with filters
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/assign` - Assign task to user

### Notifications
- `GET /api/notifications` - Get all notifications
- `GET /api/notifications/unread` - Get unread notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

## Socket.io Events

### Server → Client
- `task:created` - New task created
- `task:updated` - Task modified
- `task:assigned` - Task assigned to user
- `notification:new` - New notification for user

### Authentication
Socket connections require JWT token in handshake auth.

## Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation
```bash
npm install
```

### Environment Variables
Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Testing
```bash
npm test
```

## Deployment

### MongoDB Atlas
1. Create cluster at mongodb.com/atlas
2. Whitelist IP addresses
3. Update MONGODB_URI in environment

### Render/Railway
1. Connect GitHub repository
2. Set build command: `npm install && npm run build`
3. Set start command: `npm start`
4. Add environment variables

## Security Features
- Bcrypt password hashing with salt rounds
- JWT with configurable expiration
- HttpOnly cookies (prevents XSS)
- CORS configuration
- Input validation with Zod
- MongoDB injection prevention via Mongoose

## Trade-offs

### Why MongoDB over PostgreSQL?
- Flexible schema for evolving task metadata
- Easier horizontal scaling
- Native support for nested audit logs
- Better performance for read-heavy dashboards

### Repository Pattern
- Improves testability (easy to mock)
- Separates data access from business logic
- Allows swapping data sources without changing services

### Socket.io Integration in Services
- Services emit events directly after mutations
- Keeps real-time logic close to business logic
- Alternative: Message queue (adds complexity)
