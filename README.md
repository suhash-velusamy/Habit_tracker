# LifeSync - Advanced Habit & Goal Tracker 🚀

Welcome to **LifeSync**, a comprehensive, modern, and highly responsive web application designed to help you build better habits, track daily tasks, and achieve your long-term goals.

## 🌟 Overview

LifeSync goes beyond simple checklists. It is a full-featured personal productivity dashboard with a beautiful glassmorphism UI, detailed analytics, and integrated self-management tools to keep you motivated and consistent.

## ✨ Key Features

- 📊 **Dynamic Dashboard**: View your weekly habit completion progress, quick actions, and active goals in one glance.
- 🔄 **Habit Tracking**: Track daily habits with streaks, completion grids, and visual heatmaps.
- 📝 **Task Management**: Organize tasks using List View, Kanban Boards, or a 14-day Calendar Scheduler.
- 🎯 **Goal Setting**: Set short-term and long-term goals with step-by-step milestones and progress bars.
- ⏱️ **Self-Management**: 
  - **Pomodoro Timer**: Built-in focus timer with Web Audio API alerts.
  - **Daily Journaling**: Log your mood, gratitude, and daily reflections.
  - **Timeblocking**: Plan your day hour-by-hour.
- 🌓 **Beautiful UI/UX**: Fully responsive design with an elegant dark/light mode toggle powered by Tailwind CSS v4.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS v4, Framer Motion, Lucide React.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Atlas) & Mongoose for seamless data persistence.

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- MongoDB URI (for the backend)

### Installation

1. **Clone the repository**
2. **Install Frontend Dependencies:**
   ```bash
   cd frontend
   npm install
   ```
3. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```
4. **Environment Variables:**
   Create a `.env` file in the `backend/` directory and add your MongoDB connection string:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_connection_string
   ```

### Running the App

1. **Start the Backend Server:**
   ```bash
   cd backend
   npm run dev
   ```
2. **Start the Frontend Development Server:**
   ```bash
   cd frontend
   npm run dev
   ```
3. Open your browser and navigate to `http://localhost:5173`.

---
*Built with ❤️ to help you stay productive and focused.*
