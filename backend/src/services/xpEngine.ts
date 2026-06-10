import User from '../models/User';
import Achievement from '../models/Achievement';
import Notification from '../models/Notification';
import Habit from '../models/Habit';
import HabitCompletion from '../models/HabitCompletion';

export interface XPGainResult {
  xpEarned: number;
  newXP: number;
  oldLevel: number;
  newLevel: number;
  leveledUp: boolean;
  unlockedBadges: string[];
}

export const awardXP = async (
  userId: string,
  amount: number,
  reason: string
): Promise<XPGainResult> => {
  // 1. Fetch current user XP and level
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const oldXP = user.xp_points;
  const oldLevel = user.current_level;

  const newXP = oldXP + amount;
  // Level Formula: Level = floor(sqrt(XP / 100)) + 1
  const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1;
  const leveledUp = newLevel > oldLevel;

  // 2. Update user XP and level in DB
  user.xp_points = newXP;
  user.current_level = newLevel;
  await user.save();

  // 3. Insert notification for XP gain
  await Notification.create({
    user_id: userId,
    title: `+${amount} XP Awarded`,
    message: reason,
    type: 'achievement'
  });

  const unlockedBadges: string[] = [];

  // 4. Handle level up trigger
  if (leveledUp) {
    await Notification.create({
      user_id: userId,
      title: 'Level Up! ⚡',
      message: `Congratulations! You leveled up to Level ${newLevel}! 🎉`,
      type: 'achievement'
    });

    // If level reaches 3, automatically unlock "Productivity Expert" badge
    if (newLevel >= 3) {
      const unlocked = await checkAndUnlockBadge(userId, 'Productivity Expert', 100);
      if (unlocked) unlockedBadges.push('Productivity Expert');
    }
  }

  return {
    xpEarned: amount,
    newXP,
    oldLevel,
    newLevel,
    leveledUp,
    unlockedBadges
  };
};

export const checkAndUnlockBadge = async (
  userId: string,
  badgeName: string,
  xpEarned: number = 100
): Promise<boolean> => {
  // Check if badge is already unlocked
  const existing = await Achievement.findOne({ user_id: userId, badge_name: badgeName });
  if (existing) {
    return false; // Already unlocked
  }

  // Insert into achievements
  await Achievement.create({
    user_id: userId,
    badge_name: badgeName,
    xp_earned: xpEarned
  });

  // Insert notification for badge unlock
  let icon = '🏆';
  if (badgeName === 'Early Bird') icon = '🌅';
  if (badgeName === 'Coding Warrior') icon = '⚔';
  if (badgeName === 'MERN Explorer') icon = '🚀';

  await Notification.create({
    user_id: userId,
    title: `Achievement Unlocked ${icon}`,
    message: `You earned the "${badgeName}" badge and +${xpEarned} XP!`,
    type: 'achievement'
  });

  // Award the badge's XP
  await awardXP(userId, xpEarned, `Unlocked Achievement Badge: ${badgeName}`);
  return true;
};

export const checkAllHabitsCompleted = async (
  userId: string,
  dateString: string
): Promise<boolean> => {
  // 1. Check if user has habits
  const habits = await Habit.find({ user_id: userId });
  if (habits.length === 0) return false;

  // 2. Fetch completed habits for today
  const completions = await HabitCompletion.find({
    user_id: userId,
    completion_date: dateString
  });

  // Match habits and their completions
  let allCompleted = true;
  for (const habit of habits) {
    const comp = completions.find((c) => String(c.habit_id) === String(habit._id));
    if (!comp || comp.value < habit.target_value) {
      allCompleted = false;
      break;
    }
  }

  if (allCompleted) {
    // Check if "All Habits Completed Today" bonus was already awarded
    const startOfDay = new Date(dateString);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dateString);
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await Notification.findOne({
      user_id: userId,
      title: 'All Habits Completed Today',
      created_date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (!existing) {
      // Award the +100 XP bonus
      await Notification.create({
        user_id: userId,
        title: 'All Habits Completed Today',
        message: 'Incredible! You completed all your habits today. +100 XP awarded!',
        type: 'achievement'
      });
      await awardXP(userId, 100, 'Completed all habits today! 🌟');
      return true;
    }
  }

  return false;
};
