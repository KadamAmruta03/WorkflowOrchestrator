# Workflow Orchestrator

Workflow Orchestrator is a centralized, full-stack management platform designed to automate human resource operations. It bridges the gap between administrators and employees through real-time task automation, workforce visibility, and an integrated communication hub.

**Live Demo:** [https://workflow-orchestrator.vercel.app/](https://workflow-orchestrator.vercel.app/)

---

## Tech Stack

* **Frontend:** React 18, React Router DOM, Axios, Lucide React, Recharts
* **Backend:** Node.js, Express.js, Mongoose, Node-cron (Automation)
* **Database:** MongoDB Atlas (Cloud)
* **Infrastructure:** Vercel (Frontend), Railway (Backend)
* **Version Control:** Git & GitHub

---

## Project Structure & Directory Map

The repository utilizes a dual-root architecture to separate client concerns from server-side business logic.

```text
workflow-orchestrator/
├── client/                      <-- React Frontend Root
│   ├── src/
│   │   ├── admin/               <-- Onboarding, Performance & Analytics
│   │   ├── employee/            <-- Tasks, Directory & Personal Chat
│   │   ├── auth/                <-- Session & Role-based routing
│   │   ├── components/          <-- Reusable UI (Lucide Icons, Charts)
│   │   └── api.js               <-- Axios instance with Dynamic Base URL
├── server/                      <-- Node.js Backend Root
│   ├── controllers/             <-- Task, Leave, and Chat logic
│   ├── models/                  <-- Mongoose Schemas (User, Task, Announcement)
│   ├── routes/                  <-- Express API Endpoints
│   ├── middleware/              <-- Error handling & Route protection
│   └── scripts/                 <-- Cron jobs for Task Escalation
└── README.md
```
## Environment Variables Configuration

To ensure secure communication between the frontend and backend, the following environment variables must be configured.

### Backend (`.env` - `/server`)
Create a `.env` file in the `server` directory for local development:

| Variable | Description | Example (Local) |
| :--- | :--- | :--- |
| `PORT` | Port for the Express server | `5000` |
| `MONGO_URI` | MongoDB Connection String | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for token generation | `your_secret_key` |
| `CORS_ORIGIN` | The URL of your frontend | `http://localhost:3000` |
| `APP_BASE_URL` | Base URL for server-side redirects | `http://localhost:3000` |

### Frontend (`.env` - `/client`)
Create a `.env` file in the `client` directory:

| Variable | Description | Example (Local) |
| :--- | :--- | :--- |
| `REACT_APP_API_BASE_URL` | The URL of your running backend | `http://localhost:5000` |

---

## Core Workflows (The "Circle of Life")

* **Onboarding:** Admin reviews candidate data → Updates status → System generates Employee ID → Triggers onboarding path.
* **Task Life Cycle:** Admin assigns task → Employee updates status → Cron job monitors for "stale" tasks → Automatic escalation if stuck.
* **Communication:** Admin broadcasts announcements → Employees view via unread-tracking logic → Real-time peer-to-peer chat.
* **Leave Management:** Employee requests leave → Admin reviews via specialized panel → Status synchronized across dashboards.

---

## Security & Reliability Features

* **Role-Based Access Control (RBAC):** Strict client-side separation between Admin and Employee panels via protected routes.
* **Environment Isolation:** Dynamic API switching using `REACT_APP_API_BASE_URL` for seamless deployment across dev/prod environments.
* **Automated Maintenance:** Integrated `node-cron` for background task tracking and system health checks.
* **CORS Hardening:** Explicit origin filtering configured on Railway to permit only the verified Vercel production domain.

---

## Cloud Infrastructure & Deployment

* **Frontend (Vercel):** Hosted from the `/client` directory. Requires setting `REACT_APP_API_BASE_URL` in Vercel Project Settings.
* **Backend (Railway):** Hosted from the `/server` directory. Requires all `.env` variables added to the Railway Variables tab.
* **Data Tier (Atlas):** Managed NoSQL clusters providing high-availability data storage.

---

## Installation & Local Setup

### 1. Clone & Install
```bash
git clone [https://github.com/KadamAmruta03/WorkflowOrchestrator.git](https://github.com/KadamAmruta03/WorkflowOrchestrator.git)
cd WorkflowOrchestrator
```
### Install Frontend
```bash
cd client && npm install
```
# Install Backend
```bash
cd ../server && npm install
```
