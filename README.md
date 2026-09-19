# TickTick — Task Scheduler App

A full-stack task management web app built with the MERN stack. Supports user authentication, full CRUD on tasks, priority and status tracking, search, filtering, sorting, and a fully responsive UI.

![Tech Stack](https://img.shields.io/badge/Stack-MERN-blue) ![License](https://img.shields.io/badge/License-ISC-green)

---

## Features

- **Auth** — Register & login with JWT-based authentication, bcrypt password hashing
- **Tasks** — Create, edit, delete tasks with title, description, priority, status, and due date
- **Status Workflow** — Cycle tasks through `Pending → In Progress → Completed`
- **Search** — Instantly search tasks by title or description
- **Filter** — Filter by status (with live counts) and by priority
- **Sort** — Sort by date created, due date, or priority in asc/desc order
- **Overdue Indicator** — Tasks past their due date are visually flagged
- **Error Feedback** — All API errors surface as visible banners, not silent console logs
- **Responsive** — Works on desktop, tablet, and mobile

---

## Tech Stack

| Layer     | Tech                              |
|-----------|-----------------------------------|
| Frontend  | React 19, Vite, React Router v7, Axios |
| Backend   | Node.js, Express 5                |
| Database  | MongoDB Atlas, Mongoose           |
| Auth      | JWT, bcryptjs                     |

---

## Project Structure

```
TickTick-Task-Scheduler-App/
├── backend/
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT protect middleware
│   ├── models/
│   │   ├── Task.js             # Task schema
│   │   └── User.js             # User schema
│   ├── routes/
│   │   ├── authRoutes.js       # POST /api/auth/register & /login
│   │   └── taskRoutes.js       # GET/POST/PUT/DELETE /api/tasks
│   ├── server.js               # Express entry point
│   ├── .env.example            # Template for environment variables
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── PrivateRoute.jsx
    │   │   ├── TaskForm.jsx
    │   │   └── TaskItem.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── Login.jsx
    │   │   └── Register.jsx
    │   ├── api.js              # Axios instance with JWT interceptor
    │   ├── App.jsx
    │   └── index.css
    ├── index.html
    └── package.json
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- A free [MongoDB Atlas](https://mongodb.com/cloud/atlas) account

### 1. Clone the repo

```bash
git clone https://github.com/deepthi314/TickTick-Task-Scheduler-App.git
cd TickTick-Task-Scheduler-App
```

### 2. Set up MongoDB Atlas

1. Create a free M0 cluster on Atlas
2. Under **Database Access** — create a database user with a username and password
3. Under **Network Access** — add `0.0.0.0/0` to allow all IPs (for development)
4. Click **Connect → Drivers** and copy the connection string

### 3. Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and fill in your values:

```env
PORT=5000
MONGO_URI=mongodb+srv://your_user:your_password@cluster0.xxxxx.mongodb.net/taskmanager
JWT_SECRET=your_random_secret_min_32_chars
ALLOWED_ORIGINS=http://localhost:5173
```

Install dependencies and start:

```bash
npm install
npm run dev
```

Backend runs on `http://localhost:5000`

### 4. Configure the frontend

```bash
cd frontend
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

Install dependencies and start:

```bash
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## Environment Variables

### Backend (`backend/.env`)

| Variable          | Description                                    |
|-------------------|------------------------------------------------|
| `PORT`            | Port for the Express server (default: 5000)    |
| `MONGO_URI`       | MongoDB Atlas connection string                |
| `JWT_SECRET`      | Secret key for signing JWTs (min 32 chars)     |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins   |

### Frontend (`frontend/.env`)

| Variable       | Description                        |
|----------------|------------------------------------|
| `VITE_API_URL` | Base URL for the backend API       |

---

## API Endpoints

### Auth
| Method | Endpoint              | Description       |
|--------|-----------------------|-------------------|
| POST   | `/api/auth/register`  | Register new user |
| POST   | `/api/auth/login`     | Login user        |

### Tasks (all protected — requires Bearer token)
| Method | Endpoint           | Description                                      |
|--------|--------------------|--------------------------------------------------|
| GET    | `/api/tasks`       | Get all tasks (supports `?search`, `?sortBy`, `?order`) |
| POST   | `/api/tasks`       | Create a new task                                |
| PUT    | `/api/tasks/:id`   | Update a task                                    |
| DELETE | `/api/tasks/:id`   | Delete a task                                    |

---

## License

ISC
