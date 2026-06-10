import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api';
import { initializeDatabase } from './config/db';
import { startCronJobs } from './services/cronService';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Core Middlewares
app.use(cors());
app.use(express.json());

// API routing prefix
app.use('/api', apiRouter);

// Serve Frontend Static Files for Render Hosting
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));

// Catch-all to serve index.html for React Router
app.use((req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Initialize database, Cron jobs, and startup server
const bootServer = async () => {
  try {
    // 1. Verify connection and schemas in MySQL
    await initializeDatabase();
    
    // 2. Start node-cron schedules
    startCronJobs();

    // 3. Kick off express server
    app.listen(PORT, () => {
      console.log(`LifeSync REST API Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Fatal: Failed to boot server due to database initialize failure:', err);
    console.log(`Fallback mode: running local server on port ${PORT} without active MySQL connection...`);
    app.listen(PORT, () => {
      console.log(`LifeSync REST API Server (Fallback Mode) listening on port ${PORT}`);
    });
  }
};

bootServer();
