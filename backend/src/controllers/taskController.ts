import { Response } from 'express';
import Task from '../models/Task';
import Notification from '../models/Notification';
import { AuthRequest } from '../middleware/auth';
import { awardXP } from '../services/xpEngine';

export const getTasks = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  try {
    const tasks = await Task.find({ user_id: userId }).sort({ created_date: -1 });

    const formattedTasks = tasks.map((t) => ({
      id: String(t._id),
      name: t.title,
      description: t.description || '',
      priority: t.priority,
      dueDate: t.due_date ? new Date(t.due_date).toISOString().split('T')[0] : '',
      status: t.status,
      category: t.category || 'General',
      subtasks: t.subtasks || [],
      recurrence: t.recurrence || 'None'
    }));

    res.json(formattedTasks);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching tasks.' });
  }
};

export const addTask = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { name, description, priority, dueDate, category, subtasks, recurrence } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Task title (name) is required.' });
  }

  try {
    const finalDueDate = dueDate || new Date().toISOString().split('T')[0];

    const task = await Task.create({
      user_id: userId,
      title: name,
      description: description || '',
      priority: priority || 'Medium',
      due_date: finalDueDate,
      status: 'todo',
      category: category || 'General',
      subtasks: subtasks || [],
      recurrence: recurrence || 'None'
    });

    // Insert alert
    await Notification.create({
      user_id: userId,
      title: 'Task Created 📝',
      message: `"${name}" added to tasks.`,
      type: 'task'
    });

    res.status(201).json({
      id: String(task._id),
      name,
      description: description || '',
      priority: priority || 'Medium',
      dueDate: finalDueDate,
      status: 'todo',
      category: category || 'General',
      subtasks: subtasks || [],
      recurrence: recurrence || 'None'
    });
  } catch (err) {
    console.error('Error adding task:', err);
    res.status(400).json({ error: 'Invalid task format.' });
  }
};

export const editTask = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const taskId = req.params.id;
  const { name, description, priority, dueDate, status, category, subtasks, recurrence } = req.body;

  try {
    const task = await Task.findOne({ _id: taskId, user_id: userId });
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    const finalTitle = name !== undefined ? name : task.title;
    const finalStatus = status !== undefined ? status : task.status;

    // Check if status changed to 'done' from something else to award XP
    let xpResult = null;
    if (finalStatus === 'done' && task.status !== 'done') {
      xpResult = await awardXP(userId!, 15, `Completed Task: ${finalTitle}`);
    }

    task.title = finalTitle;
    task.description = description !== undefined ? description : task.description;
    task.priority = priority !== undefined ? priority : task.priority;
    task.due_date = dueDate !== undefined ? dueDate : task.due_date;
    task.status = finalStatus;
    task.category = category !== undefined ? category : task.category;
    task.subtasks = subtasks !== undefined ? subtasks : task.subtasks;
    task.recurrence = recurrence !== undefined ? recurrence : task.recurrence;
    await task.save();

    res.json({ success: true, message: 'Task updated.', xpAwarded: xpResult ? 15 : 0 });
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(400).json({ error: 'Error modifying task.' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const taskId = req.params.id;

  try {
    const result = await Task.deleteOne({ _id: taskId, user_id: userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    res.json({ success: true, message: 'Task deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task.' });
  }
};

export const updateTaskStatus = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const taskId = req.params.id;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Please supply a task status.' });
  }

  try {
    const task = await Task.findOne({ _id: taskId, user_id: userId });
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    let xpResult = null;
    if (status === 'done' && task.status !== 'done') {
      xpResult = await awardXP(userId!, 15, `Completed Task: ${task.title}`);
    }

    task.status = status;
    await task.save();

    res.json({ success: true, message: 'Status updated.', xpAwarded: xpResult ? 15 : 0 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle status.' });
  }
};
