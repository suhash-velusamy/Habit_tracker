import { Response } from 'express';
import User from '../models/User';
import Habit from '../models/Habit';
import HabitCompletion from '../models/HabitCompletion';
import WaterIntake from '../models/WaterIntake';
import Task from '../models/Task';
import { AuthRequest } from '../middleware/auth';

const getTodayString = (): string => {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - (offset * 60 * 1000));
  return local.toISOString().split('T')[0];
};

export const getDashboardAnalytics = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const todayStr = getTodayString();

  try {
    // 1. Fetch User details (XP, level)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 2. Fetch total habits
    const totalHabits = await Habit.countDocuments({ user_id: userId });

    // 3. Fetch completed habits today
    const completedHabits = await HabitCompletion.countDocuments({
      user_id: userId,
      completion_date: todayStr,
      completion_status: 'completed'
    });
    const pendingHabits = Math.max(0, totalHabits - completedHabits);

    // 4. Fetch current streak (Average streak of user habits)
    const habits = await Habit.find({ user_id: userId });
    let totalStreak = 0;
    habits.forEach((h) => {
      totalStreak += h.streak;
    });
    const currentStreak = habits.length > 0 ? Math.round(totalStreak / habits.length) : 0;

    // 5. Fetch water progress today
    const water = await WaterIntake.findOne({ user_id: userId, date: todayStr });
    const waterProgress = water ? water.litres_consumed : 0.0;

    // 6. Fetch weekly consistency (Percentage of habits completed over past 7 days)
    const startRange = new Date();
    startRange.setDate(startRange.getDate() - 7);
    const startRangeStr = startRange.toISOString().split('T')[0];

    const completedPastWeek = await HabitCompletion.countDocuments({
      user_id: userId,
      completion_status: 'completed',
      completion_date: { $gte: startRangeStr }
    });

    const weeklyConsistency = totalHabits > 0 
      ? Math.min(100, Math.round((completedPastWeek / (totalHabits * 7)) * 100)) 
      : 0;

    // 7. Category progress metrics over last 7 days (Coding, Interview Prep)
    const codingHabits = habits.filter((h) => h.category === 'Coding');
    const codingHabitIds = codingHabits.map((h) => h._id);
    const completedCoding = await HabitCompletion.countDocuments({
      user_id: userId,
      habit_id: { $in: codingHabitIds },
      completion_status: 'completed',
      completion_date: { $gte: startRangeStr }
    });
    const codingProgress = codingHabits.length > 0 
      ? Math.min(100, Math.round((completedCoding / (codingHabits.length * 7)) * 100)) 
      : 70; // fallback default value

    const interviewHabits = habits.filter((h) => h.category === 'Interview Preparation');
    const interviewHabitIds = interviewHabits.map((h) => h._id);
    const completedInterview = await HabitCompletion.countDocuments({
      user_id: userId,
      habit_id: { $in: interviewHabitIds },
      completion_status: 'completed',
      completion_date: { $gte: startRangeStr }
    });
    const interviewProgress = interviewHabits.length > 0 
      ? Math.min(100, Math.round((completedInterview / (interviewHabits.length * 7)) * 100)) 
      : 60; // fallback default value

    res.json({
      completedHabits,
      pendingHabits,
      currentStreak,
      waterProgress,
      xp: user.xp_points,
      level: user.current_level,
      weeklyConsistency,
      codingProgress,
      interviewProgress
    });
  } catch (err) {
    console.error('Error generating dashboard analytics:', err);
    res.status(500).json({ error: 'Error generating dashboard analytics.' });
  }
};

export const getHabitsAnalytics = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  try {
    const habits = await Habit.find({ user_id: userId });
    const result = [];
    for (const h of habits) {
      const completionsCount = await HabitCompletion.countDocuments({
        habit_id: h._id,
        completion_status: 'completed'
      });
      result.push({
        name: h.name,
        category: h.category,
        streak: h.streak,
        longest_streak: h.longest_streak,
        total_completions: completionsCount
      });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching habits analytics.' });
  }
};

export const getStudyProgress = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  try {
    // Pull progress aggregates for Study category habits & tasks
    const studyHabitsList = await Habit.find({ user_id: userId, category: 'Study' });
    const studyHabits = [];
    for (const h of studyHabitsList) {
      const completionsCount = await HabitCompletion.countDocuments({
        habit_id: h._id,
        completion_status: 'completed'
      });
      studyHabits.push({
        name: h.name,
        completions: completionsCount
      });
    }

    const tasks = await Task.find({ user_id: userId, category: 'Study' });
    const studyTasks = tasks.map((t) => ({
      title: t.title,
      status: t.status,
      due_date: t.due_date ? new Date(t.due_date).toISOString().split('T')[0] : ''
    }));

    res.json({ studyHabits, studyTasks });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching study progress analytics.' });
  }
};

export const getProductivityScore = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const startRange = new Date();
  startRange.setDate(startRange.getDate() - 7);
  const startRangeStr = startRange.toISOString().split('T')[0];

  try {
    const completions = await HabitCompletion.find({
      user_id: userId,
      completion_status: 'completed',
      completion_date: { $gte: startRangeStr }
    });

    const totalHabits = await Habit.countDocuments({ user_id: userId }) || 1;

    // Group by date
    const counts: Record<string, number> = {};
    completions.forEach((c) => {
      counts[c.completion_date] = (counts[c.completion_date] || 0) + 1;
    });

    const scores = Object.keys(counts).map((date) => ({
      date,
      score: Math.min(100, Math.round((counts[date] / totalHabits) * 100))
    }));

    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: 'Error calculating productivity score.' });
  }
};

export const getWeeklyReport = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const startRange = new Date();
  startRange.setDate(startRange.getDate() - 7);
  const startRangeStr = startRange.toISOString().split('T')[0];

  try {
    const completions = await HabitCompletion.find({
      user_id: userId,
      completion_status: 'completed',
      completion_date: { $gte: startRangeStr }
    });

    // Group by date
    const counts: Record<string, number> = {};
    completions.forEach((c) => {
      counts[c.completion_date] = (counts[c.completion_date] || 0) + 1;
    });

    const formattedCompletions = Object.keys(counts).map((date) => ({
      date,
      completed_count: counts[date]
    }));

    const startRangeDate = new Date(startRangeStr);
    const completedTasksThisWeek = await Task.countDocuments({
      user_id: userId,
      status: 'done',
      created_date: { $gte: startRangeDate }
    });

    res.json({
      completions: formattedCompletions,
      completedTasksThisWeek
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching weekly report.' });
  }
};

export const getMonthlyReport = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const startRange = new Date();
  startRange.setDate(startRange.getDate() - 30);
  const startRangeStr = startRange.toISOString().split('T')[0];

  try {
    const completions = await HabitCompletion.find({
      user_id: userId,
      completion_status: 'completed',
      completion_date: { $gte: startRangeStr }
    });

    // Group by date
    const counts: Record<string, number> = {};
    completions.forEach((c) => {
      counts[c.completion_date] = (counts[c.completion_date] || 0) + 1;
    });

    const heatmapRows = Object.keys(counts).map((date) => ({
      date,
      completed_count: counts[date]
    }));

    res.json(heatmapRows);
  } catch (err) {
    res.status(500).json({ error: 'Error compiling monthly report.' });
  }
};
