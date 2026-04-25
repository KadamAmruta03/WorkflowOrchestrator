# Workflow Orchestrator — HR Automation Platform

<div align="center">

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=nodedotjs)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)
![Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?style=flat-square&logo=vercel)
![Railway](https://img.shields.io/badge/Backend-Railway-0B0D0E?style=flat-square&logo=railway)

</div>

> A full-stack HR automation platform bridging administrators and employees through real-time task management, workforce visibility, and an integrated communication hub.

<div align="center">

  <img width="850" alt="Admin Dashboard" src="https://github.com/user-attachments/assets/20e500e9-2b67-4946-b334-4d45873d2fc9" />
  <p><i>Admin Dashboard — Workforce analytics and task overview</i></p>

  <br/>

  <img width="850" alt="Task Management" src="https://github.com/user-attachments/assets/d7523702-54d6-4fb2-8dde-e9c1d3a46954" />
  <p><i>Task Lifecycle — Assignment, tracking, and auto-escalation</i></p>

  <br/>

  <img width="850" alt="Employee Panel" src="https://github.com/user-attachments/assets/d91bdef1-bec2-4a7f-a86e-f74bb7a1c466" />
  <p><i>Employee Panel — Personal tasks, leave requests, and communication</i></p>

  <br/>

  <img width="850" alt="Communication Hub" src="https://github.com/user-attachments/assets/a21e3087-605c-4199-a7ea-416e5ba3c55b" />
  <p><i>Communication Hub — Announcements and peer-to-peer chat</i></p>

</div>

**🔗 Live Demo:** [orchestrator-workflow.vercel.app/](https://orchestrator-workflow.vercel.app)

---

## Overview

Managing HR operations manually creates bottlenecks — task assignments get lost, leave requests pile up, and employees have no unified communication channel. Workflow Orchestrator solves this with a dual-panel platform: admins get full workforce visibility and automation tools, while employees get a clean interface for tasks, leaves, and real-time chat.

Built as a full-stack MERN project to demonstrate end-to-end architecture — from cron-based automation to role-based access control and cloud deployment across two separate infrastructure providers.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router DOM, Axios, Recharts, Lucide React |
| Backend | Node.js, Express.js, Mongoose, Node-cron |
| Database | MongoDB Atlas (Cloud) |
| Infrastructure | Vercel (Frontend), Railway (Backend) |
| Auth | JWT, Role-Based Access Control |

---

## Core Workflows

```text
Onboarding: Candidate → Admin Review → Employee ID Generated → Dashboard Access
Task: Assigned → In Progress → [Cron Monitor] → Escalated if Stale
Leave: Employee Request → Admin Review → Status Synced Across Dashboards
Chat: Admin Broadcasts → Unread Tracking → Peer-to-Peer Messaging
```

---

## Technical Highlights

### 1. Automated Task Escalation
A `node-cron` job runs in the background monitoring task activity. Tasks that remain in a stale state beyond a threshold are automatically escalated — no manual intervention required from admins.

### 2. Role-Based Access Control (RBAC)
Strict separation between Admin and Employee panels via protected React routes. JWT tokens carry role payloads, and middleware on the Express layer enforces access at the API level — not just the UI.

### 3. Dynamic Environment Switching
`REACT_APP_API_BASE_URL` drives all Axios calls, making the same codebase work seamlessly across local dev and production without any code changes.

### 4. CORS Hardening
The Railway backend is configured to accept requests only from the verified Vercel production domain, preventing unauthorized cross-origin access.

---

## Project Structure

```text
workflow-orchestrator/
├── client/                        <-- React Frontend
│   └── src/
│       ├── admin/                 <-- Onboarding, analytics, task assignment
│       ├── employee/              <-- Tasks, directory, personal chat
│       ├── auth/                  <-- JWT handling & protected routes
│       ├── components/            <-- Shared UI components & charts
│       └── api.js                 <-- Axios instance with dynamic base URL
├── server/                        <-- Node.js Backend
│   ├── controllers/               <-- Task, leave, and chat business logic
│   ├── models/                    <-- Mongoose schemas (User, Task, Announcement)
│   ├── routes/                    <-- Express API endpoints
│   ├── middleware/                <-- Auth guard & error handling
│   └── scripts/                   <-- Cron jobs for task escalation
└── README.md
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Steps

```bash
git clone https://github.com/KadamAmruta03/WorkflowOrchestrator.git
cd WorkflowOrchestrator
```

**Install & run frontend:**
```bash
cd client
npm install
npm start
```

**Install & run backend:**
```bash
cd ../server
npm install
npm run dev
```

---

## Environment Variables

### Backend — `/server/.env`

| Variable | Description | Example |
|---|---|---|
| `PORT` | Express server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for token signing | `your_secret_key` |
| `CORS_ORIGIN` | Allowed frontend URL | `http://localhost:3000` |
| `APP_BASE_URL` | Base URL for server redirects | `http://localhost:3000` |

### Frontend — `/client/.env`

| Variable | Description | Example |
|---|---|---|
| `REACT_APP_API_BASE_URL` | Running backend URL | `http://localhost:5000` |

---

## Cloud Deployment

| Service | Purpose | Config |
|---|---|---|
| **Vercel** | Frontend hosting | Set `REACT_APP_API_BASE_URL` in Project Settings |
| **Railway** | Backend hosting | Add all `/server/.env` vars in Variables tab |
| **MongoDB Atlas** | Database | Whitelist Railway's IP in Network Access |

---

## What I Built This To Demonstrate

- **Full-stack MERN architecture** — separate client/server roots with clean API boundaries
- **Background automation** — cron-based task monitoring without any third-party queue service
- **Multi-cloud deployment** — coordinating two separate infrastructure providers (Vercel + Railway)
- **JWT + RBAC** — token-based auth enforced at both UI and API layers

---

## Contributing

Found a bug or want to suggest a feature? Open an issue or fork the repo and submit a pull request. All contributions are welcome.

---

## License

This project is open-source. Contributions are welcome.
