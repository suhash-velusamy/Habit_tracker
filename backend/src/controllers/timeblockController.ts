import { Response } from 'express';
import Timeblock from '../models/Timeblock';
import { AuthRequest } from '../middleware/auth';

const DEFAULT_TIMEBLOCKS = [
  { id: 'p1', hour: '06:00', task: 'Wake up, Hydrate, Yoga stretch', completed: false },
  { id: 'p2', hour: '08:00', task: 'Breakfast, Review today schedule', completed: false },
  { id: 'p3', hour: '09:00', task: 'Java Prep - Collections coding session', completed: false },
  { id: 'p4', hour: '11:00', task: 'HTML/CSS UI Practice tasks', completed: false },
  { id: 'p5', hour: '13:00', task: 'Lunch, Rest period', completed: false },
  { id: 'p6', hour: '15:00', task: 'MERN Stack course tutorials', completed: false },
  { id: 'p7', hour: '17:00', task: 'LeetCode Problem solving activity', completed: false },
  { id: 'p8', hour: '19:00', task: 'Dinner, Walk outside', completed: false },
  { id: 'p9', hour: '21:00', task: 'Aptitude review, Journal logs, Schedule next day', completed: false },
];

export const getTimeBlocks = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  try {
    // 1. Fetch user's timeblocks
    const rows = await Timeblock.find({ user_id: userId }).sort({ hour: 1 });

    // 2. If user doesn't have any timeblocks, seed defaults into the DB and return them
    if (rows.length === 0) {
      console.log(`Seeding default timeblocks for user ${userId}...`);
      const seeded = [];
      for (const block of DEFAULT_TIMEBLOCKS) {
        await Timeblock.create({
          user_id: userId,
          block_id: block.id,
          hour: block.hour,
          task: block.task,
          completed: block.completed
        });
        seeded.push(block);
      }
      return res.json(seeded);
    }

    const timeblocks = rows.map((r) => ({
      id: r.block_id,
      hour: r.hour,
      task: r.task,
      completed: r.completed
    }));

    res.json(timeblocks);
  } catch (err) {
    console.error('Error fetching timeblocks:', err);
    res.status(500).json({ error: 'Failed to fetch planner timeblocks.' });
  }
};

export const updateTimeBlock = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const blockId = req.params.id as string;
  const { task, completed } = req.body;

  if (task === undefined || completed === undefined) {
    return res.status(400).json({ error: 'Please provide task and completed status.' });
  }

  try {
    // Check if block exists
    const existing = await Timeblock.findOne({ user_id: userId, block_id: blockId });

    if (!existing) {
      const hour = req.body.hour || '12:00';
      await Timeblock.create({
        user_id: userId,
        block_id: blockId,
        hour,
        task,
        completed
      });
    } else {
      existing.task = task;
      existing.completed = completed;
      await existing.save();
    }

    res.json({ success: true, message: 'Timeblock updated successfully.' });
  } catch (err) {
    console.error('Error updating timeblock:', err);
    res.status(500).json({ error: 'Failed to update planner timeblock.' });
  }
};
