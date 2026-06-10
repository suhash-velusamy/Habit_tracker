import { Response } from 'express';
import Journal from '../models/Journal';
import Notification from '../models/Notification';
import { AuthRequest } from '../middleware/auth';
import { awardXP } from '../services/xpEngine';

// Get today's local date string YYYY-MM-DD
const getTodayString = (): string => {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - (offset * 60 * 1000));
  return local.toISOString().split('T')[0];
};

export const getJournals = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  try {
    const journals = await Journal.find({ user_id: userId }).sort({ created_date: -1 });

    const formatted = journals.map((j) => ({
      id: String(j._id),
      date: j.created_date,
      mood: j.mood,
      gratitude: j.gratitude || [],
      reflections: j.content,
      notes: j.notes || ''
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Error loading reflections diary.' });
  }
};

export const addJournal = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { mood, gratitude, reflections, notes } = req.body;

  if (!mood || !reflections) {
    return res.status(400).json({ error: 'Mood and reflections content are required.' });
  }

  const todayStr = getTodayString();

  try {
    // 1. Check if journal entry already exists for today
    const existing = await Journal.findOne({ user_id: userId, created_date: todayStr });

    let xpResult = null;
    let entryId = null;

    if (existing) {
      // Update today's reflection
      entryId = existing._id;
      existing.content = reflections;
      existing.mood = mood;
      existing.gratitude = gratitude || [];
      existing.notes = notes || '';
      await existing.save();
    } else {
      // Insert new reflection
      const journal = await Journal.create({
        user_id: userId,
        content: reflections,
        mood,
        gratitude: gratitude || [],
        notes: notes || '',
        created_date: todayStr
      });
      entryId = journal._id;

      // Award 20 XP for logging daily reflection
      xpResult = await awardXP(userId!, 20, 'Logged Daily Journal Reflections 📝');

      // Create notification
      await Notification.create({
        user_id: userId,
        title: 'Reflection Saved 📔',
        message: 'Your gratitude notes and reflection thoughts have been saved.',
        type: 'reminder'
      });
    }

    res.status(201).json({
      id: String(entryId),
      date: todayStr,
      mood,
      gratitude: gratitude || [],
      reflections,
      notes: notes || '',
      xpAwarded: xpResult ? 20 : 0
    });
  } catch (err) {
    console.error('Error adding journal:', err);
    res.status(400).json({ error: 'Journal logging validation fail.' });
  }
};

export const editJournal = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const journalId = req.params.id;
  const { mood, gratitude, reflections, notes } = req.body;

  try {
    const journal = await Journal.findOne({ _id: journalId, user_id: userId });
    if (!journal) {
      return res.status(404).json({ error: 'Journal entry not found.' });
    }

    journal.mood = mood !== undefined ? mood : journal.mood;
    journal.content = reflections !== undefined ? reflections : journal.content;
    journal.notes = notes !== undefined ? notes : journal.notes;
    journal.gratitude = gratitude !== undefined ? gratitude : journal.gratitude;
    await journal.save();

    res.json({ success: true, message: 'Journal updated.' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to update journal.' });
  }
};

export const deleteJournal = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const journalId = req.params.id;

  try {
    const result = await Journal.deleteOne({ _id: journalId, user_id: userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Journal entry not found.' });
    }

    res.json({ success: true, message: 'Journal entry deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete journal.' });
  }
};
