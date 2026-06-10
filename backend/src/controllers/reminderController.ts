import { Response } from 'express';
import Reminder from '../models/Reminder';
import { AuthRequest } from '../middleware/auth';

const DEFAULT_REMINDERS = [
  { id: 'r1', time: '06:00', title: 'Wake Up Reminder', category: 'Daily Routine', active: true },
  { id: 'r2', time: '08:00', title: 'Breakfast Time', category: 'Health', active: true },
  { id: 'r3', time: '10:00', title: 'Java & Coding Practice', category: 'Coding', active: true },
  { id: 'r4', time: '12:30', title: 'Lunch Time', category: 'Health', active: true },
  { id: 'r5', time: '14:00', title: 'HTML & CSS Practice', category: 'Learning', active: true },
  { id: 'r6', time: '16:00', title: 'LeetCode Problem Solving', category: 'Coding', active: true },
  { id: 'r7', time: '18:00', title: 'Learn MERN Stack', category: 'Learning', active: true },
  { id: 'r8', time: '19:30', title: 'Dinner Time', category: 'Health', active: true },
  { id: 'r9', time: '20:30', title: 'Aptitude Preparation', category: 'Study', active: true },
  { id: 'r10', time: '21:30', title: 'Daily review & Tomorrow Planning', category: 'Personal Development', active: true },
];

export const getReminders = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  try {
    // 1. Fetch user reminders
    const rows = await Reminder.find({ user_id: userId }).sort({ reminder_id: 1 });

    // 2. If empty, seed defaults and return them
    if (rows.length === 0) {
      console.log(`Seeding default reminders for user ${userId}...`);
      const seeded = [];
      for (const r of DEFAULT_REMINDERS) {
        await Reminder.create({
          user_id: userId,
          reminder_id: r.id,
          time: r.time,
          title: r.title,
          category: r.category,
          active: r.active
        });
        seeded.push(r);
      }
      return res.json(seeded);
    }

    const reminders = rows.map((r) => ({
      id: r.reminder_id,
      time: r.time,
      title: r.title,
      category: r.category,
      active: r.active
    }));

    res.json(reminders);
  } catch (err) {
    console.error('Error fetching reminders:', err);
    res.status(500).json({ error: 'Failed to fetch reminder settings.' });
  }
};

export const toggleReminder = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const reminderId = req.params.id;

  try {
    // Check if configuration exists
    const existing = await Reminder.findOne({ user_id: userId, reminder_id: reminderId });

    if (!existing) {
      // Seed default reminders first, toggling target reminder state
      for (const r of DEFAULT_REMINDERS) {
        const isActive = r.id === reminderId ? !r.active : r.active;
        await Reminder.create({
          user_id: userId,
          reminder_id: r.id,
          time: r.time,
          title: r.title,
          category: r.category,
          active: isActive
        });
      }
    } else {
      existing.active = !existing.active;
      await existing.save();
    }

    res.json({ success: true, message: 'Reminder toggled successfully.' });
  } catch (err) {
    console.error('Error toggling reminder:', err);
    res.status(500).json({ error: 'Failed to toggle reminder status.' });
  }
};
