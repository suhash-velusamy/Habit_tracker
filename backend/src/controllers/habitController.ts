import { Response } from 'express';
import Habit from '../models/Habit';
import HabitCompletion from '../models/HabitCompletion';
import WaterIntake from '../models/WaterIntake';
import Notification from '../models/Notification';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { awardXP, checkAndUnlockBadge, checkAllHabitsCompleted } from '../services/xpEngine';

// Helper: compute % of habits completed for a given date
const getCompletionRateForDate = async (userId: string | undefined, dateStr: string): Promise<number> => {
  if (!userId) return 0;
  const habits = await Habit.find({ user_id: userId });
  if (habits.length === 0) return 0;
  const completions = await HabitCompletion.find({ user_id: userId, completion_date: dateStr });
  let completedCount = 0;
  for (const h of habits) {
    const comp = completions.find((c) => String(c.habit_id) === String(h._id));
    if (comp && comp.value >= h.target_value) completedCount++;
  }
  return completedCount / habits.length;
};

// Helper: recalculate and persist the user's overall streak
// Returns the updated streak value
const recalcUserStreak = async (userId: string, todayStr: string, yesterdayStr: string): Promise<{ streak: number; longest: number }> => {
  const user = await User.findById(userId);
  if (!user) return { streak: 0, longest: 0 };

  const todayRate = await getCompletionRateForDate(userId, todayStr);
  const yesterdayRate = await getCompletionRateForDate(userId, yesterdayStr);

  const todayQualifies = todayRate >= 0.75;
  const yesterdayQualified = yesterdayRate >= 0.75;

  let currentStreak = (user as any).streak ?? 0;
  let longestStreak = (user as any).longest_streak ?? 0;

  if (!todayQualifies && !yesterdayQualified) {
    // Streak broken — neither today nor yesterday hit 75%
    currentStreak = 0;
  }
  // If today qualifies, streak was already incremented when the 75% threshold was first crossed

  if (currentStreak > longestStreak) longestStreak = currentStreak;
  (user as any).streak = currentStreak;
  (user as any).longest_streak = longestStreak;
  await user.save();

  return { streak: currentStreak, longest: longestStreak };
};

// Get today's local date string YYYY-MM-DD
const getTodayString = (): string => {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - (offset * 60 * 1000));
  return local.toISOString().split('T')[0];
};

// Get yesterday's local date string YYYY-MM-DD
const getYesterdayString = (): string => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - (offset * 60 * 1000));
  return local.toISOString().split('T')[0];
};

export const getHabits = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const todayStr = getTodayString();
  const yesterdayStr = getYesterdayString();

  try {
    // 1. Fetch habits
    const habits = await Habit.find({ user_id: userId }).sort({ _id: 1 });

    // 2. Fetch completions for history mapping
    const completions = await HabitCompletion.find({ user_id: userId });

    // 3. Map values; streak is per-user (75% daily threshold)
    const user = await User.findById(userId);
    const userStreak = (user as any)?.streak ?? 0;
    const userLongest = (user as any)?.longest_streak ?? 0;

    // Check if streak should be reset (neither today nor yesterday hit 75%)
    const todayRate = await getCompletionRateForDate(userId, todayStr);
    const yesterdayRate = await getCompletionRateForDate(userId, yesterdayStr);
    let displayStreak = userStreak;
    if (todayRate < 0.75 && yesterdayRate < 0.75 && userStreak > 0) {
      displayStreak = 0;
      if (user) {
        (user as any).streak = 0;
        await user.save();
      }
    }

    const responseHabits = habits.map((h) => {
      const history: Record<string, number> = {};
      completions
        .filter((c) => String(c.habit_id) === String(h._id))
        .forEach((c) => {
          history[c.completion_date] = c.value;
        });

      const todayVal = history[todayStr] || 0;

      return {
        id: String(h._id),
        name: h.name,
        category: h.category,
        target: h.target,
        type: h.type,
        value: todayVal,
        targetValue: h.target_value,
        unit: h.unit,
        history,
        streak: displayStreak,
        longestStreak: userLongest
      };
    });

    res.json(responseHabits);
  } catch (err) {
    console.error('Error loading habits:', err);
    res.status(500).json({ error: 'Error fetching habits list.' });
  }
};

export const addHabit = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { name, category, type, targetValue, unit, target } = req.body;

  if (!name || !category) {
    return res.status(400).json({ error: 'Habit name and category are required.' });
  }

  try {
    const duplicate = await Habit.findOne({
      user_id: userId,
      name: { $regex: new RegExp(`^${name.trim().replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') }
    });

    if (duplicate) {
      return res.status(400).json({ error: 'A habit with this name already exists.' });
    }

    const finalTargetValue = type === 'boolean' ? 1 : (targetValue || 1);
    const finalUnit = type === 'boolean' ? '' : (unit || '');
    const finalTarget = type === 'boolean' ? 'Complete' : (target || `${finalTargetValue} ${finalUnit}`);

    const habit = await Habit.create({
      user_id: userId,
      name,
      category,
      target: finalTarget,
      type: type || 'boolean',
      target_value: finalTargetValue,
      unit: finalUnit
    });

    // Create notification
    await Notification.create({
      user_id: userId,
      title: 'Habit Added 🏷',
      message: `"${name}" has been added under "${category}".`,
      type: 'habit'
    });

    res.status(201).json({
      id: String(habit._id),
      name,
      category,
      target: finalTarget,
      type: type || 'boolean',
      value: 0,
      targetValue: finalTargetValue,
      unit: finalUnit,
      history: {},
      streak: 0,
      longestStreak: 0
    });
  } catch (err) {
    console.error('Add habit error:', err);
    res.status(400).json({ error: 'Invalid habit payload.' });
  }
};

export const editHabit = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const habitId = req.params.id as string;
  const { name, targetValue } = req.body;

  try {
    const habit = await Habit.findOne({ _id: habitId, user_id: userId });
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found.' });
    }

    if (name && name.trim() !== habit.name) {
      const duplicate = await Habit.findOne({
        user_id: userId,
        name: { $regex: new RegExp(`^${name.trim().replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') },
        _id: { $ne: habitId }
      });
      if (duplicate) {
        return res.status(400).json({ error: 'A habit with this name already exists.' });
      }
      habit.name = name.trim();
    }
    habit.target_value = targetValue !== undefined ? targetValue : habit.target_value;
    habit.target = habit.type === 'boolean' ? 'Complete' : `${habit.target_value} ${habit.unit}`;
    await habit.save();

    res.json({ success: true, message: 'Habit updated successfully.' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to update habit.' });
  }
};

export const deleteHabit = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const habitId = req.params.id as string;

  try {
    const result = await Habit.deleteOne({ _id: habitId, user_id: userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Habit not found.' });
    }

    // Cascade delete completions
    await HabitCompletion.deleteMany({ habit_id: habitId, user_id: userId });

    res.json({ success: true, message: 'Habit deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting habit.' });
  }
};

export const completeHabit = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const habitId = req.params.id as string;
  const { value } = req.body;

  if (value === undefined) {
    return res.status(400).json({ error: 'Please supply a logged value.' });
  }

  const todayStr = getTodayString();
  const yesterdayStr = getYesterdayString();

  try {
    const habit = await Habit.findOne({ _id: habitId, user_id: userId });
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found.' });
    }

    const targetVal = habit.target_value;
    const isCompleted = value >= targetVal;

    // Fetch existing completion for today
    const existingComp = await HabitCompletion.findOne({
      user_id: userId,
      habit_id: habitId,
      completion_date: todayStr
    });

    let xpEarned = 0;
    let oldCompleted = false;

    if (existingComp) {
      oldCompleted = existingComp.completion_status === 'completed';
    }

    if (!oldCompleted && isCompleted) {
      xpEarned = habit.xp_reward || 10;
    }

    // Update or insert completion record
    if (existingComp) {
      existingComp.value = value;
      existingComp.completion_status = isCompleted ? 'completed' : 'partial';
      existingComp.xp_earned = xpEarned;
      await existingComp.save();
    } else {
      await HabitCompletion.create({
        user_id: userId,
        habit_id: habitId,
        value,
        completion_status: isCompleted ? 'completed' : 'partial',
        completion_date: todayStr,
        xp_earned: xpEarned
      });
    }

    // Streak is per-user based on 75% daily threshold
    const userDoc = await User.findById(userId);
    let finalStreak = (userDoc as any)?.streak ?? 0;
    let finalLongest = (userDoc as any)?.longest_streak ?? 0;

    // After logging this habit, check today's overall completion rate
    const newTodayRate = await getCompletionRateForDate(userId, todayStr);
    const crossed75 = newTodayRate >= 0.75;

    if (crossed75) {
      // Check if yesterday also qualified (for consecutive streak)
      const yesterdayRate = await getCompletionRateForDate(userId, yesterdayStr);
      const yesterdayQualified = yesterdayRate >= 0.75;

      // Only increment streak if we haven't already incremented for today
      const alreadyIncrementedToday = (userDoc as any)?.streak_last_updated === todayStr;
      if (!alreadyIncrementedToday) {
        if (yesterdayQualified) {
          finalStreak += 1;
        } else {
          finalStreak = 1;
        }
        finalLongest = Math.max(finalLongest, finalStreak);
        if (userDoc) {
          (userDoc as any).streak = finalStreak;
          (userDoc as any).longest_streak = finalLongest;
          (userDoc as any).streak_last_updated = todayStr;
          await userDoc.save();
        }
      }
    } else {
      // Rate dropped below 75% — reset current streak but keep longest as historical record
      // Also clear streak_last_updated so tomorrow's consecutive check works correctly
      if (finalStreak > 0 && userDoc) {
        finalStreak = 0;
        (userDoc as any).streak = 0;
        (userDoc as any).streak_last_updated = '';
        await userDoc.save();
      }
    }

    // Award XP
    if (xpEarned > 0) {
      await awardXP(userId!, xpEarned, `Completed habit: "${habit.name}"`);
    }

    // Check Badges
    if (isCompleted) {
      const nameLower = habit.name.toLowerCase();
      if (nameLower.includes('wake up')) {
        await checkAndUnlockBadge(userId!, 'Early Bird', 100);
      }
      if (nameLower.includes('leetcode')) {
        await checkAndUnlockBadge(userId!, 'Coding Warrior', 100);
      }
      if (nameLower.includes('mern')) {
        await checkAndUnlockBadge(userId!, 'MERN Explorer', 100);
      }
      if (nameLower.includes('aptitude')) {
        await checkAndUnlockBadge(userId!, 'Aptitude Champion', 100);
      }

      // Sync Water Intake
      if (nameLower.includes('water intake') || nameLower.includes('water')) {
        let water = await WaterIntake.findOne({ user_id: userId, date: todayStr });
        if (water) {
          water.litres_consumed = value;
          await water.save();
        } else {
          await WaterIntake.create({
            user_id: userId,
            litres_consumed: value,
            date: todayStr
          });
        }

        if (value >= 3.0) {
          await checkAndUnlockBadge(userId!, 'Super Hydrator', 50);
        }
      }
    }

    const allDone = await checkAllHabitsCompleted(userId!, todayStr);

    // Return user-level streak in response
    const updatedUser = await User.findById(userId);
    const respStreak = (updatedUser as any)?.streak ?? finalStreak;
    const respLongest = (updatedUser as any)?.longest_streak ?? finalLongest;

    res.json({
      success: true,
      completed: isCompleted,
      streak: respStreak,
      longestStreak: respLongest,
      todayCompletionRate: Math.round(newTodayRate * 100),
      xpAwarded: xpEarned,
      allHabitsCompletedToday: allDone
    });
  } catch (err) {
    console.error('Error completing habit:', err);
    res.status(500).json({ error: 'Failed to log habit completion.' });
  }
};

export const getHabitsStreak = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const todayStr = getTodayString();
  const yesterdayStr = getYesterdayString();

  try {
    // Streak is per-user based on 75% daily threshold
    const userDoc = await User.findById(userId);
    let currentStreak = (userDoc as any)?.streak ?? 0;
    let longestStreak = (userDoc as any)?.longest_streak ?? 0;

    // Check if streak should be reset
    const todayRate = await getCompletionRateForDate(userId, todayStr);
    const yesterdayRate = await getCompletionRateForDate(userId, yesterdayStr);
    if (todayRate < 0.75 && yesterdayRate < 0.75 && currentStreak > 0) {
      currentStreak = 0;
      if (userDoc) {
        (userDoc as any).streak = 0;
        await userDoc.save();
      }
    }
    if (currentStreak > longestStreak) longestStreak = currentStreak;

    res.json({
      currentStreak,
      longestStreak,
      totalStreak: currentStreak
    });
  } catch (err) {
    res.status(500).json({ error: 'Error calculating streaks.' });
  }
};

export const getHabitsProgress = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const today = new Date();
  
  // Calculate date 7 days ago
  const startRange = new Date();
  startRange.setDate(today.getDate() - 7);
  const startRangeStr = startRange.toISOString().split('T')[0];

  try {
    const completions = await HabitCompletion.find({
      user_id: userId,
      completion_status: 'completed',
      completion_date: { $gte: startRangeStr }
    });

    const totalHabits = await Habit.countDocuments({ user_id: userId });
    const denominator = totalHabits || 1;

    // Group completions by date
    const dateCounts: Record<string, number> = {};
    completions.forEach((c) => {
      dateCounts[c.completion_date] = (dateCounts[c.completion_date] || 0) + 1;
    });

    const weeklyProgress = Object.keys(dateCounts).map((date) => ({
      date,
      completionRate: Math.min(100, Math.round((dateCounts[date] / denominator) * 100))
    }));

    res.json({
      weeklyProgress,
      totalHabitsCount: totalHabits
    });
  } catch (err) {
    res.status(500).json({ error: 'Error calculating habits progress.' });
  }
};

export const resetHabits = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { category } = req.body;
  const todayStr = getTodayString();

  try {
    const filter: any = { user_id: userId };
    if (category && category !== 'All') {
      filter.category = category;
    }

    const habitsToReset = await Habit.find(filter);
    if (habitsToReset.length === 0) {
      return res.json({ success: true, message: 'No habits to reset.' });
    }

    const habitIds = habitsToReset.map((h) => h._id);

    // Find today's completions for these habits and zero them out
    const completions = await HabitCompletion.find({
      user_id: userId,
      completion_date: todayStr,
      habit_id: { $in: habitIds }
    });

    if (completions.length > 0) {
      for (const comp of completions) {
        comp.value = 0;
        comp.completion_status = 'partial';
        comp.xp_earned = 0;
        await comp.save();
      }
    }

    // After resetting, check if today's overall rate drops below 75%
    // If so, reset the user-level current streak
    const newTodayRate = await getCompletionRateForDate(userId, todayStr);
    if (newTodayRate < 0.75) {
      const userDoc = await User.findById(userId);
      if (userDoc && (userDoc as any).streak > 0) {
        (userDoc as any).streak = 0;
        (userDoc as any).streak_last_updated = ''; // Clear so tomorrow's check works
        await userDoc.save();
      }
    }

    res.json({ success: true, message: 'Habits reset successfully.' });
  } catch (err) {
    console.error('Reset habits error:', err);
    res.status(500).json({ error: 'Failed to reset habits.' });
  }
};
