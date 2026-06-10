import { Response } from 'express';
import Goal from '../models/Goal';
import Notification from '../models/Notification';
import { AuthRequest } from '../middleware/auth';
import { awardXP } from '../services/xpEngine';

export const getGoals = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  try {
    const goals = await Goal.find({ user_id: userId }).sort({ deadline: 1 });

    const formatted = goals.map((g) => ({
      id: String(g._id),
      name: g.goal_title,
      description: g.description || '',
      category: g.category || 'Placement',
      type: g.type,
      deadline: g.deadline ? new Date(g.deadline).toISOString().split('T')[0] : '',
      progress: g.progress_percentage,
      status: g.status,
      milestones: g.milestones || []
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching goal details.' });
  }
};

export const addGoal = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { name, description, category, type, deadline, milestones } = req.body;

  if (!name || !deadline) {
    return res.status(400).json({ error: 'Goal name and deadline are required.' });
  }

  try {
    const goal = await Goal.create({
      user_id: userId,
      goal_title: name,
      description: description || '',
      category: category || 'Placement',
      type: type || 'Short-Term',
      deadline,
      progress_percentage: 0,
      status: 'active',
      milestones: milestones || []
    });

    await Notification.create({
      user_id: userId,
      title: 'Goal Set 🎯',
      message: `New ${type || 'Short-Term'} Goal: "${name}" set.`,
      type: 'goal'
    });

    res.status(201).json({
      id: String(goal._id),
      name,
      description: description || '',
      category: category || 'Placement',
      type: type || 'Short-Term',
      deadline,
      progress: 0,
      status: 'active',
      milestones: milestones || []
    });
  } catch (err) {
    console.error('Error adding goal:', err);
    res.status(400).json({ error: 'Goal registration invalid.' });
  }
};

export const editGoal = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const goalId = req.params.id;
  const { name, description, category, type, deadline, status, progress, milestones } = req.body;

  try {
    const goal = await Goal.findOne({ _id: goalId, user_id: userId });
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found.' });
    }

    const finalTitle = name !== undefined ? name : goal.goal_title;
    const finalProgress = progress !== undefined ? progress : goal.progress_percentage;

    // Check if progress reached 100% to award XP
    let xpResult = null;
    if (finalProgress === 100 && goal.progress_percentage < 100) {
      xpResult = await awardXP(userId!, 100, `Achieved Goal: ${finalTitle} 🏆`);
      await Notification.create({
        user_id: userId,
        title: 'Goal Completed! 🎉',
        message: `Congratulations, you completed all milestones for "${finalTitle}"!`,
        type: 'goal'
      });
    }

    goal.goal_title = finalTitle;
    goal.description = description !== undefined ? description : goal.description;
    goal.category = category !== undefined ? category : goal.category;
    goal.type = type !== undefined ? type : goal.type;
    goal.deadline = deadline !== undefined ? deadline : goal.deadline;
    goal.status = status !== undefined ? status : goal.status;
    goal.progress_percentage = finalProgress;
    goal.milestones = milestones !== undefined ? milestones : goal.milestones;
    await goal.save();

    res.json({ success: true, message: 'Goal updated.' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to update goal.' });
  }
};

export const deleteGoal = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const goalId = req.params.id;

  try {
    const result = await Goal.deleteOne({ _id: goalId, user_id: userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Goal not found.' });
    }

    res.json({ success: true, message: 'Goal deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Error removing goal.' });
  }
};

export const updateGoalProgress = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const goalId = req.params.id;
  const { progress, milestones } = req.body;

  if (progress === undefined) {
    return res.status(400).json({ error: 'Please supply goal progress percentage.' });
  }

  try {
    const goal = await Goal.findOne({ _id: goalId, user_id: userId });
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found.' });
    }

    const finalStatus = progress === 100 ? 'completed' : 'active';
    let xpResult = null;

    if (progress === 100 && goal.progress_percentage < 100) {
      xpResult = await awardXP(userId!, 100, `Achieved Goal: ${goal.goal_title} 🏆`);
      await Notification.create({
        user_id: userId,
        title: 'Goal Completed! 🎉',
        message: `Congratulations, you completed all milestones for "${goal.goal_title}"!`,
        type: 'goal'
      });
    }

    goal.progress_percentage = progress;
    goal.status = finalStatus;
    goal.milestones = milestones || [];
    await goal.save();

    res.json({ success: true, message: 'Goal progress updated.' });
  } catch (err) {
    console.error('Error updating goal progress:', err);
    res.status(500).json({ error: 'Failed to update goal progress.' });
  }
};
