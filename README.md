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
