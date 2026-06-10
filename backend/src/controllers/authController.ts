import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Notification from '../models/Notification';
import Achievement from '../models/Achievement';
import Habit from '../models/Habit';
import HabitCompletion from '../models/HabitCompletion';
import Task from '../models/Task';
import Goal from '../models/Goal';
import Journal from '../models/Journal';
import WaterIntake from '../models/WaterIntake';
import Timeblock from '../models/Timeblock';
import Reminder from '../models/Reminder';
import { AuthRequest } from '../middleware/auth';
import { sendNotificationEmail } from '../services/emailService';

const JWT_SECRET = process.env.JWT_SECRET || 'lifesync_super_secret_jwt_sign_key_9876';

export const register = async (req: AuthRequest, res: Response) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please provide name, email, and password.' });
  }

  try {
    // 1. Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    // 2. Hash Password
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Determine Role (First user or matching email domain gets Admin)
    const userCount = await User.countDocuments({});
    const isFirstUser = userCount === 0;
    const isAdminDomain = email.endsWith('@lifesync.io');
    const role = (isFirstUser || isAdminDomain) ? 'admin' : 'user';

    // 4. Create User
    const user = await User.create({
      full_name: name,
      email,
      password: passwordHash,
      role
    });

    // 5. Push Welcome Notification
    await Notification.create({
      user_id: user._id,
      title: 'Welcome to LifeSync! 🎉',
      message: 'Start completing your placement preparation habits to gain XP points and badges!',
      type: 'achievement'
    });

    // 6. Dispatch welcome email
    await sendNotificationEmail(
      email,
      'Welcome to LifeSync Productivity Platform!',
      `Hi ${name},\n\nWelcome to LifeSync! Create your first habits to start tracking your daily progress and placement preparation. Let's make every day count!\n\nBest wishes,\nThe LifeSync team`
    );

    res.status(201).json({ message: 'User registered successfully. Start tracking now!' });
  } catch (err) {
    console.error('Registration server error:', err);
    res.status(500).json({ error: 'Server registration error.' });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password.' });
  }

  try {
    // 1. Find User
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // 2. Check status
    if (user.status === 'Suspended') {
      return res.status(403).json({ error: 'Account suspended. Please contact system admin.' });
    }

    // 3. Verify Password
    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // 4. Update last login timestamp
    user.last_login = new Date();
    await user.save();

    // 5. Issue JWT Token
    const token = jwt.sign({ id: String(user._id), role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: String(user._id),
        name: user.full_name,
        email: user.email,
        avatar: user.profile_image,
        xp: user.xp_points,
        level: user.current_level,
        role: user.role,
        bio: user.bio,
        joinedDate: user.created_date
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server authentication error.' });
  }
};

export const logout = async (req: AuthRequest, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully.' });
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Get badges
    const achievements = await Achievement.find({ user_id: req.user?.id });
    const badges = achievements.map((a) => a.badge_name);

    res.json({
      id: String(user._id),
      name: user.full_name,
      email: user.email,
      avatar: user.profile_image,
      xp: user.xp_points,
      level: user.current_level,
      role: user.role,
      bio: user.bio,
      status: user.status,
      joinedDate: user.created_date,
      badges
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching user profile.' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  const { name, avatar, bio } = req.body;
  try {
    await User.findByIdAndUpdate(req.user?.id, {
      full_name: name,
      profile_image: avatar,
      bio
    });

    res.json({ success: true, message: 'Profile updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Error updating user profile.' });
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
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

    res.json({ success: true, message: 'Account deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting user account.' });
  }
};
