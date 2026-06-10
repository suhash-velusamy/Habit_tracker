import { Router, Response } from 'express';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';

// Import Models
import Notification from '../models/Notification';
import User from '../models/User';
import Habit from '../models/Habit';
import HabitCompletion from '../models/HabitCompletion';
import Task from '../models/Task';
import Goal from '../models/Goal';
import Journal from '../models/Journal';
import WaterIntake from '../models/WaterIntake';
import Timeblock from '../models/Timeblock';
import Reminder from '../models/Reminder';
import Achievement from '../models/Achievement';

// Import Controllers
import {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  deleteAccount
} from '../controllers/authController';

import {
  getHabits,
  addHabit,
  editHabit,
  deleteHabit,
  completeHabit,
  getHabitsStreak,
  getHabitsProgress,
  resetHabits
} from '../controllers/habitController';

import {
  getTasks,
  addTask,
  editTask,
  deleteTask,
  updateTaskStatus
} from '../controllers/taskController';

import {
  getGoals,
  addGoal,
  editGoal,
  deleteGoal,
  updateGoalProgress
} from '../controllers/goalController';

import {
  getJournals,
  addJournal,
  editJournal,
  deleteJournal
} from '../controllers/journalController';

import {
  getDashboardAnalytics,
  getHabitsAnalytics,
  getStudyProgress,
  getProductivityScore,
  getWeeklyReport,
  getMonthlyReport
} from '../controllers/analyticsController';

import { getTimeBlocks, updateTimeBlock } from '../controllers/timeblockController';
import { getReminders, toggleReminder } from '../controllers/reminderController';

const router = Router();

// ================= AUTHENTICATION APIs =================
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/logout', logout);
router.get('/auth/profile', authenticateToken, getProfile);
router.put('/auth/update-profile', authenticateToken, updateProfile);
router.delete('/auth/delete-account', authenticateToken, deleteAccount);

// ================= HABITS APIs =================
router.get('/habits', authenticateToken, getHabits);
router.post('/habits', authenticateToken, addHabit);
router.put('/habits/:id', authenticateToken, editHabit);
router.delete('/habits/:id', authenticateToken, deleteHabit);
router.post('/habits/:id/complete', authenticateToken, completeHabit);
router.post('/habits/reset', authenticateToken, resetHabits);
router.get('/habits/streak', authenticateToken, getHabitsStreak);
router.get('/habits/progress', authenticateToken, getHabitsProgress);

// ================= TASKS APIs =================
router.get('/tasks', authenticateToken, getTasks);
router.post('/tasks', authenticateToken, addTask);
router.put('/tasks/:id', authenticateToken, editTask);
router.delete('/tasks/:id', authenticateToken, deleteTask);
router.patch('/tasks/:id/status', authenticateToken, updateTaskStatus);

// ================= GOAL APIs =================
router.get('/goals', authenticateToken, getGoals);
router.post('/goals', authenticateToken, addGoal);
router.put('/goals/:id', authenticateToken, editGoal);
router.delete('/goals/:id', authenticateToken, deleteGoal);
router.patch('/goals/:id/progress', authenticateToken, updateGoalProgress);

// ================= JOURNAL APIs =================
router.get('/journal', authenticateToken, getJournals);
router.post('/journal', authenticateToken, addJournal);
router.put('/journal/:id', authenticateToken, editJournal);
router.delete('/journal/:id', authenticateToken, deleteJournal);

// ================= ANALYTICS APIs =================
router.get('/analytics/dashboard', authenticateToken, getDashboardAnalytics);
router.get('/analytics/habits', authenticateToken, getHabitsAnalytics);
router.get('/analytics/study-progress', authenticateToken, getStudyProgress);
router.get('/analytics/productivity', authenticateToken, getProductivityScore);
router.get('/analytics/weekly-report', authenticateToken, getWeeklyReport);
router.get('/analytics/monthly-report', authenticateToken, getMonthlyReport);

// ================= TIMEBLOCKS & REMINDERS APIs =================
router.get('/timeblocks', authenticateToken, getTimeBlocks);
router.put('/timeblocks/:id', authenticateToken, updateTimeBlock);
router.get('/reminders', authenticateToken, getReminders);
router.put('/reminders/:id/toggle', authenticateToken, toggleReminder);

// ================= NOTIFICATIONS APIs =================
router.get('/notifications', authenticateToken, async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  try {
    const notifications = await Notification.find({ user_id: userId })
      .sort({ created_date: -1 })
      .limit(50);

    res.json(notifications.map((n) => ({
      id: String(n._id),
      title: n.title,
      message: n.message,
      type: n.type,
      read: n.read_status,
      timestamp: n.created_date.toISOString()
    })));
  } catch (err) {
    res.status(500).json({ error: 'Error loading notifications.' });
  }
});

router.post('/notifications/read', authenticateToken, async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  try {
    await Notification.updateMany({ user_id: userId }, { read_status: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error marking notifications as read.' });
  }
});

// ================= AI PRODUCTIVITY CHAT =================
router.post('/ai/chat', authenticateToken, (req: AuthRequest, res) => {
  const { prompt, persona } = req.body;
  let reply = '';

  if (persona === 'mentor') {
    reply = `[Coding Mentor] Practicing algorithms? For Java, review dynamic arrays and stacks. In MERN, make sure you configure your express CORS origins and handle JWT hashes appropriately.`;
  } else if (persona === 'interviewer') {
    reply = `[Interview Guide] Let's rehearse: 'Explain the event loop in NodeJS, and how database indices speed up search queries.' Send your thoughts!`;
  } else {
    reply = `[Productivity Coach] Let's analyze. You have pending tasks. Start a 25-minute Pomodoro block to focus, review your milestones, and check off Java practice routines.`;
  }

  res.json({ reply });
});

// ================= ADMIN CONSOLE MANAGEMENT =================
router.get('/admin/users', [authenticateToken, requireAdmin], async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find({});
    res.json(users.map((u) => ({
      id: String(u._id),
      name: u.full_name,
      email: u.email,
      avatar: u.profile_image,
      xp: u.xp_points,
      status: u.status,
      role: u.role
    })));
  } catch (err) {
    res.status(500).json({ error: 'Administrative fetch users failed.' });
  }
});

router.put('/admin/users/:id/status', [authenticateToken, requireAdmin], async (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  try {
    await User.findByIdAndUpdate(req.params.id, { status });
    res.json({ success: true, message: 'Status updated.' });
  } catch (err) {
    res.status(400).json({ error: 'Admin toggle status failed.' });
  }
});

router.delete('/admin/users/:id', [authenticateToken, requireAdmin], async (req: AuthRequest, res: Response) => {
  const userId = req.params.id;
  try {
    await Promise.all([
      User.findByIdAndDelete(userId),
      Habit.deleteMany({ user_id: userId }),
      HabitCompletion.deleteMany({ user_id: userId }),
      Task.deleteMany({ user_id: userId }),
      Goal.deleteMany({ user_id: userId }),
      Journal.deleteMany({ user_id: userId }),
      WaterIntake.deleteMany({ user_id: userId }),
      Notification.deleteMany({ user_id: userId }),
      Achievement.deleteMany({ user_id: userId }),
      Timeblock.deleteMany({ user_id: userId }),
      Reminder.deleteMany({ user_id: userId })
    ]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Admin delete user failed.' });
  }
});

export default router;
