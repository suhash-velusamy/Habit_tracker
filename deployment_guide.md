# LifeSync Productivity Platform: Deployment Guide

This guide details instructions on how to install, test, transpile, and deploy both the **Vite + React Frontend** and the **Express + MongoDB Backend** of the LifeSync platform.

---

## 💻 Local Setup & Development

### 1. Frontend Web Client
The React application runs client-side out-of-the-box by persisting user metrics, streaks, task items, Pomodoro sessions, and experience points inside `localStorage`.

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Start Dev Server**:
   ```bash
   npm run dev
   ```
   *The client will start instantly on your local machine, usually at `http://localhost:5173/`.*

---

### 2. Backend API Server
The Express application is configured inside the `backend/` directory.

1. **Navigate to backend and initialize npm**:
   ```bash
   cd backend
   npm init -y
   ```
2. **Install Backend Dependencies**:
   ```bash
   npm install express cors mongoose bcryptjs jsonwebtoken dotenv
   npm install -D typescript @types/express @types/cors @types/node @types/bcryptjs @types/jsonwebtoken ts-node
   ```
3. **Configure local env settings**:
   Create a `.env` file inside `backend/` with parameters:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/lifesync
   JWT_SECRET=your_super_strong_custom_jwt_secret_key
   ```
4. **Boot Server locally using ts-node**:
   ```bash
   npx ts-node src/server.ts
   ```
   *The REST API server will boot and listen for frontend clients on `http://localhost:5000`.*

---

## 🔌 Connecting Frontend to REST API

To switch the React frontend from the out-of-the-box `localStorage` mock engine to the backend REST API, connect your client API requests to the server endpoint.

1. Create a `src/services/api.ts` file on the frontend to define Axios / fetch endpoints:
   ```typescript
   const API_BASE = 'http://localhost:5000/api';

   export const fetchHabits = async (token: string) => {
     const res = await fetch(`${API_BASE}/habits`, {
       headers: { 'Authorization': `Bearer ${token}` }
     });
     return res.json();
   };
   ```
2. Import these handlers in `src/context/AppContext.tsx` inside `useEffect` calls to sync habits, tasks, and goals states with the database.

---

## ☁ Production Deployment

### 1. Database Setup (MongoDB Atlas)
1. Register for an account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Deploy a free tier cluster and name your database (e.g. `lifesync-prod`).
3. Under **Network Access**, add IP address `0.0.0.0/0` to allow hosting providers to connect.
4. Under **Database Access**, create a user profile and save the password credentials safely.
5. Copy your cluster connection string link. It will look like:
   `mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/lifesync-prod?retryWrites=true&w=majority`

---

### 2. Backend Hosting (Render, Heroku, or Fly.io)
This example details deployment on **Render**:
1. Sign up on [Render](https://render.com) and link your GitHub project repository.
2. Select **New Web Service** and select your repository branch.
3. Configure the following parameters:
   - **Environment**: `Node`
   - **Root Directory**: `backend` (Points Render directly to your Express code)
   - **Build Command**: `npm install && npx tsc` (Compiles TypeScript files to JS)
   - **Start Command**: `node dist/server.js`
4. Under **Environment Variables**, add:
   - `MONGODB_URI` = *(Your MongoDB Atlas connection link)*
   - `JWT_SECRET` = *(Generate a secure random hex key string)*
   - `PORT` = `10000` (Render binds ports dynamically, or standard 10000)
5. Click **Deploy Web Service**. Render will build and host your server at a public URL (e.g., `https://lifesync-api.onrender.com`).

---

### 3. Frontend Hosting (Vercel, Netlify, or GitHub Pages)
This example details deployment on **Vercel**:
1. Build the Vite production bundle locally to verify compile states:
   ```bash
   npm run build
   ```
2. Log in on [Vercel](https://vercel.com) and connect your repository.
3. Select **Add New Project**, select the root directory `./` of your project, and choose template **Vite**.
4. Configure environment settings if Axios base URL is configured.
5. Click **Deploy**. Vercel will host your web client dashboard live on a secure HTTPS domain!
