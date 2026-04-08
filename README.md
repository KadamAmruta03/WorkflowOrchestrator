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
## Core Workflows (The "Circle of Life")

* **Onboarding:** Admin reviews candidate data $\rightarrow$ Updates status $\rightarrow$ System generates Employee ID $\rightarrow$ Triggers onboarding path.
* **Task Life Cycle:** Admin assigns task $\rightarrow$ Employee updates status $\rightarrow$ Cron job monitors for "stale" tasks $\rightarrow$ Automatic escalation if stuck.
* **Communication:** Admin broadcasts announcements $\rightarrow$ Employees view via unread-tracking logic $\rightarrow$ Real-time peer-to-peer chat.
* **Leave Management:** Employee requests leave $\rightarrow$ Admin reviews via specialized panel $\rightarrow$ Status synchronized across dashboards.

---

## Security & Reliability Features

* **Role-Based Access Control (RBAC):** Strict client-side separation between Admin and Employee panels via protected routes.
* **Environment Isolation:** Dynamic API switching using `REACT_APP_API_BASE_URL` to ensure zero-config deployment across environments.
* **Automated Maintenance:** Integrated `node-cron` for background task tracking and system health checks.
* **CORS Hardening:** Explicit origin filtering configured on Railway to permit only the verified Vercel production domain.

---

## Cloud Infrastructure & Deployment

The application utilizes a distributed cloud architecture for maximum uptime and scalability.

* **Frontend (Vercel):** Hosted from the `/client` directory with production builds served via Vercel Edge.
* **Backend (Railway):** Hosted from the `/server` directory with environment-injected MongoDB connection strings.
* **Data Tier (Atlas):** Managed NoSQL clusters providing high-availability data storage.

---

## Installation & Local Setup

### 1. Clone & Install
```bash
git clone [https://github.com/KadamAmruta03/WorkflowOrchestrator.git](https://github.com/KadamAmruta03/WorkflowOrchestrator.git)
cd WorkflowOrchestrator

# Install Frontend
cd client && npm install

# Install Backend
cd ../server && npm install
