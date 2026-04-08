# Workflow Orchestrator

Workflow Orchestrator is a prototype HR and employee management system built for a college project. It includes:

- Admin dashboard
- Employee panel
- Task assignment and tracking
- Announcements
- Chat
- Leave management
- Employee onboarding
- Application approval flow

## Tech Stack

- Frontend: React, Axios, React Router
- Backend: Node.js, Express
- Database: MongoDB Atlas

## Project Structure

```text
workflow-orchestrator/
├── client/   # React frontend
└── server/   # Express backend
```

## Local Setup

### 1. Clone the project

```bash
git clone <your-repo-url>
cd workflow-orchestrator
```

### 2. Install dependencies

Frontend:

```bash
cd client
npm install
```

Backend:

```bash
cd ../server
npm install
```

### 3. Configure backend environment

Create `server/.env` using this template:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=demo_secret
APP_BASE_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

### 4. Run the app locally

Backend:

```bash
cd server
npm start
```

Frontend:

```bash
cd client
npm start
```

Frontend runs at:

```text
http://localhost:3000
```

Backend runs at:

```text
http://localhost:5000
```

## Deployment

Recommended deployment:

- Frontend: Vercel
- Backend: Railway

### Backend Deployment on Railway

1. Push the project to GitHub.
2. Create a new project in Railway.
3. Select the GitHub repository.
4. Set the root directory to `server`.
5. Railway will install dependencies automatically.
6. Set the start command:

```bash
npm start
```

### Railway Environment Variables

Add these in Railway:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=demo_secret
APP_BASE_URL=https://your-vercel-frontend-url
CORS_ORIGIN=https://your-vercel-frontend-url
```

After deploy, Railway will give you a backend URL like:

```text
https://your-backend-name.up.railway.app
```

### Frontend Deployment on Vercel

1. Import the GitHub repository into Vercel.
2. Set the root directory to `client`.
3. Build command:

```bash
npm run build
```

4. Output directory:

```text
build
```

### Vercel Environment Variable

Add this in Vercel:

```env
REACT_APP_API_BASE_URL=https://your-backend-name.up.railway.app
```

## Important Notes

- This project is a prototype built for academic/demo use.
- Do not commit real secrets or database credentials publicly.
- If frontend and backend are deployed separately, make sure:
  - `REACT_APP_API_BASE_URL` points to the deployed backend
  - `APP_BASE_URL` points to the deployed frontend
  - `CORS_ORIGIN` matches the deployed frontend URL

## Verified for Prototype Deploy

- Backend syntax check passed
- Missing backend leaderboard import bug was fixed
- Frontend build artifacts are generated
- Frontend API base URL support was added for deployment

## Future Improvements

- Replace plain-text password logic with hashed passwords
- Add proper authentication with JWT or sessions
- Add route protection on the backend
- Add automated tests for backend APIs
- Improve production build verification

## Author

College project prototype by the repository owner.
