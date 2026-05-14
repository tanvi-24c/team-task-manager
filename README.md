# 📋 Team Task Manager — Full Stack App

A full-stack web application for managing projects, assigning tasks, and tracking progress with **role-based access control** (Admin / Member).

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js, React Router v6, Axios, Context API |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT (JSON Web Tokens) + bcrypt |
| Deployment | Railway |

---

##  Features

- **Authentication** — Signup, Login, JWT-protected routes
- **Role-Based Access** — Admin can create/delete projects & manage members; Members can view & update tasks
- **Project Management** — Create projects, set deadlines, manage team members
- **Task Management** — Create tasks with priority, due date, assignment, and status tracking
- **Dashboard** — Stats overview: total, todo, in-progress, completed, overdue tasks
- **Overdue Tracking** — Visual alerts for tasks past due date
- **Filters** — Filter tasks by status, priority, project

---

## 📁 Project Structure

```
team-task-manager/
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js   # Register, login, getMe
│   │   ├── projectController.js
│   │   └── taskController.js
│   ├── middleware/
│   │   ├── auth.js             # JWT verify middleware
│   │   └── role.js             # Role-based authorization
│   ├── models/
│   │   ├── User.js             # User schema (name, email, password, role)
│   │   ├── Project.js          # Project schema (name, members, deadline)
│   │   └── Task.js             # Task schema (title, priority, status, dueDate)
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── tasks.js
│   │   └── users.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.js  # Global auth state
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── Dashboard.js
    │   │   ├── Projects.js
    │   │   ├── ProjectDetail.js
    │   │   ├── Tasks.js
    │   │   └── Users.js
    │   ├── components/
    │   │   └── Layout.js       # Sidebar + nav
    │   ├── styles/
    │   │   └── global.css
    │   ├── utils/
    │   │   └── api.js          # Axios instance + interceptors
    │   ├── App.js              # Routes setup
    │   └── index.js
    └── package.json
```

---

## 🔌 REST API Endpoints

### Auth
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | /api/auth/register | Register user | Public |
| POST | /api/auth/login | Login user | Public |
| GET | /api/auth/me | Get current user | Private |

### Projects
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/projects | Get all projects | Private |
| POST | /api/projects | Create project | Admin |
| GET | /api/projects/:id | Get single project | Private |
| PUT | /api/projects/:id | Update project | Admin |
| DELETE | /api/projects/:id | Delete project + tasks | Admin |
| POST | /api/projects/:id/members | Add member | Admin |
| DELETE | /api/projects/:id/members/:userId | Remove member | Admin |

### Tasks
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/tasks/dashboard | Dashboard stats | Private |
| GET | /api/tasks | Get tasks (with filters) | Private |
| POST | /api/tasks | Create task | Private |
| GET | /api/tasks/:id | Get single task | Private |
| PUT | /api/tasks/:id | Update task | Private |
| DELETE | /api/tasks/:id | Delete task | Private |

### Users
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/users | Get all users | Admin |
| GET | /api/users/members | Get members | Private |
| PUT | /api/users/:id/role | Change user role | Admin |

---

## 🛠️ Local Setup

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/team-task-manager.git
cd team-task-manager
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env and fill in MONGO_URI and JWT_SECRET
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

---

## ☁️ Deploy to Railway

### Step 1: Create MongoDB Atlas Database
1. Go to https://cloud.mongodb.com
2. Create a free cluster
3. Add database user and get connection string

### Step 2: Deploy Backend on Railway
1. Go to https://railway.app and login
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your repo → Set root directory to `/backend`
4. Add environment variables:
   - `MONGO_URI` = your MongoDB connection string
   - `JWT_SECRET` = any long random string
   - `CLIENT_URL` = your frontend URL (after deploying frontend)
5. Railway will auto-deploy. Copy the generated URL.

### Step 3: Deploy Frontend on Railway
1. In same project, add another service
2. Set root directory to `/frontend`
3. Add environment variable:
   - `REACT_APP_API_URL` = `https://team-task-manager-1-re2v.onrender.com/`
4. Deploy and get your frontend URL.
   
5. Frontend_Url = `https://team-task-manager-frontend-5rt5.onrender.com`

---

## 🔐 Role-Based Access

| Feature | Admin | Member |
|---------|-------|--------|
| Create/Delete Project | ✅ | ❌ |
| Add/Remove Members | ✅ | ❌ |
| Create Tasks | ✅ | ✅ |
| Update Task Status | ✅ | ✅ |
| Delete Tasks | ✅ | ❌ |
| View Users Page | ✅ | ❌ |
| Change User Roles | ✅ | ❌ |

---

