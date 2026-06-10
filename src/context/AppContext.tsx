import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../services/api';

// === Type Definitions ===

export interface UserProfile {
  name: string;
  avatar: string;
  bio: string;
  xp: number;
  level: number;
  badges: string[];
  role: 'user' | 'admin';
  joinedDate: string;
}

export interface Habit {
  id: string;
  name: string;
  category: 'Health' | 'Study' | 'Coding' | 'Interview Preparation' | 'Learning' | 'Personal Development' | 'Daily Routine';
  target: string;
  type: 'boolean' | 'counter';
  value: number; // Current value for today
  targetValue: number; // Target numeric value (e.g. 5, 3, 1)
  unit: string;
  history: Record<string, number>; // Date (YYYY-MM-DD) -> value
  streak: number;
  longestStreak: number;
}

export interface SubTask {
  id: string;
  name: string;
  completed: boolean;
}

export interface Task {
  id: string;
  name: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'todo' | 'in_progress' | 'done';
  dueDate: string;
  notes?: string;
  subtasks: SubTask[];
  recurrence: 'None' | 'Daily' | 'Weekly' | 'Monthly';
}

export interface Goal {
  id: string;
  name: string;
  category: string;
  type: 'Short-Term' | 'Long-Term';
  deadline: string;
  milestones: { id: string; name: string; completed: boolean }[];
  progress: number; // percentage
  status: 'active' | 'completed';
}

export interface JournalEntry {
  id: string;
  date: string;
  mood: 'Happy' | 'Motivated' | 'Neutral' | 'Sad' | 'Stressed';
  gratitude: string[];
  reflections: string;
  notes: string;
}

export interface TimeBlock {
  id: string;
  hour: string; // "08:00", "09:00", etc.
  task: string;
  completed: boolean;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'achievement' | 'reminder' | 'habit' | 'task' | 'goal';
  timestamp: string;
  read: boolean;
}

export interface ReminderSetting {
  id: string;
  time: string; // "HH:MM"
  title: string;
  category: string;
  active: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  xp: number;
  status: 'Active' | 'Suspended';
  role: 'user' | 'admin';
}

interface AppContextType {
  user: UserProfile;
  habits: Habit[];
  tasks: Task[];
  goals: Goal[];
  journals: JournalEntry[];
  planner: TimeBlock[];
  notifications: SystemNotification[];
  reminders: ReminderSetting[];
  adminUsers: AdminUser[];
  theme: 'light' | 'dark';
  currentDateStr: string;
  
  // State Setters & Actions
  updateUser: (updates: Partial<UserProfile>) => void;
  addXP: (amount: number, reason: string) => void;
  toggleTheme: () => void;
  
  // Habits actions
  addHabit: (habit: Omit<Habit, 'id' | 'value' | 'history' | 'streak' | 'longestStreak'>) => void;
  editHabit: (id: string, name: string, targetValue: number) => void;
  deleteHabit: (id: string) => void;
  logHabit: (id: string, value: number) => void;
  resetDailyHabits: (category?: string) => Promise<void>;
  
  // Tasks actions
  addTask: (task: Omit<Task, 'id' | 'status'>) => void;
  editTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  updateTaskStatus: (id: string, status: Task['status']) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  
  // Goals actions
  addGoal: (goal: Omit<Goal, 'id' | 'progress' | 'status'>) => void;
  toggleMilestone: (goalId: string, milestoneId: string) => void;
  deleteGoal: (id: string) => void;
  
  // Journal actions
  addJournal: (entry: Omit<JournalEntry, 'id' | 'date'>) => void;
  
  // Planner actions
  updateTimeBlock: (id: string, task: string, completed: boolean) => void;
  
  // Notification actions
  addNotification: (title: string, message: string, type: SystemNotification['type']) => void;
  markNotificationsRead: () => void;
  
  // Reminder actions
  toggleReminder: (id: string) => void;
  
  // Admin actions
  toggleUserStatus: (id: string) => void;
  deleteUser: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helpers
const getTodayDateString = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - (offset * 60 * 1000));
  return local.toISOString().split('T')[0];
};

// Preloaded default habits array removed to keep habit lists empty by default

const DEFAULT_TIMEBLOCKS: TimeBlock[] = [
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

const DEFAULT_REMINDERS: ReminderSetting[] = [
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

const DEFAULT_ADMIN_USERS: AdminUser[] = [
  { id: 'u1', name: 'Alex Johnson', email: 'alex@lifesync.io', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=alex', xp: 4200, status: 'Active', role: 'user' },
  { id: 'u2', name: 'Priya Sharma', email: 'priya@lifesync.io', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=priya', xp: 5800, status: 'Active', role: 'user' },
  { id: 'u3', name: 'Marcus Aurelius', email: 'marcus@lifesync.io', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=marcus', xp: 8200, status: 'Active', role: 'admin' },
  { id: 'u4', name: 'David Beckham', email: 'david@lifesync.io', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=david', xp: 1200, status: 'Suspended', role: 'user' }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentDateStr = getTodayDateString();

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    return 'dark'; // Dark Mode by default
  });
  const [user, setUser] = useState<UserProfile>(() => {
    return {
      name: 'User',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=LifeSync',
      bio: 'Placement Candidate | Coding Aspirant. Preparing for MERN Stack Developer roles, Java DSA interviews, and general Aptitude tests.',
      xp: 0,
      level: 1,
      badges: [],
      role: 'user',
      joinedDate: '2026-05-15'
    };
  });

  const [habits, setHabits] = useState<Habit[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('lifesync_token'));

  // Local storage persisted configs
  const [planner, setPlanner] = useState<TimeBlock[]>(() => {
    const saved = localStorage.getItem('lifesync_planner');
    if (saved) return JSON.parse(saved);
    return DEFAULT_TIMEBLOCKS;
  });

  const [reminders, setReminders] = useState<ReminderSetting[]>(() => {
    const saved = localStorage.getItem('lifesync_reminders');
    if (saved) return JSON.parse(saved);
    return DEFAULT_REMINDERS;
  });

  // Keep theme, planner, and reminders in local storage
  useEffect(() => {
    localStorage.setItem('lifesync_planner', JSON.stringify(planner));
  }, [planner]);

  useEffect(() => {
    localStorage.setItem('lifesync_reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Synchronise state tables with the backend REST API
  const syncWithServer = async () => {
    const activeToken = localStorage.getItem('lifesync_token');
    if (!activeToken) return;

    try {
      const profile = await api.fetchProfile();
      setUser({
        name: profile.name,
        avatar: profile.avatar,
        bio: profile.bio,
        xp: profile.xp,
        level: profile.level,
        badges: profile.badges || [],
        role: profile.role,
        joinedDate: profile.joinedDate
      });

      const habitsList = await api.fetchHabits();
      setHabits(habitsList);

      const tasksList = await api.fetchTasks();
      setTasks(tasksList);

      const goalsList = await api.fetchGoals();
      setGoals(goalsList);

      const journalsList = await api.fetchJournals();
      setJournals(journalsList);

      const notificationsList = await api.fetchNotifications();
      setNotifications(notificationsList);

      const timeblocksList = await api.fetchTimeBlocks();
      setPlanner(timeblocksList);

      const remindersList = await api.fetchReminders();
      setReminders(remindersList);

      if (profile.role === 'admin') {
        const adminUsersList = await api.fetchAdminUsers();
        setAdminUsers(adminUsersList);
      }
    } catch (err) {
      console.error('Failed to sync states with REST API:', err);
    }
  };

  // Watch for auth token changes reactively
  useEffect(() => {
    const checkToken = setInterval(() => {
      const currentToken = localStorage.getItem('lifesync_token');
      if (currentToken && !token) {
        setToken(currentToken);
        syncWithServer();
      } else if (!currentToken && token) {
        setToken(null);
        // Clear state
        setUser({
          name: 'User',
          avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=LifeSync',
          bio: 'Placement Candidate | Coding Aspirant. Preparing for MERN Stack Developer roles, Java DSA interviews, and general Aptitude tests.',
          xp: 0,
          level: 1,
          badges: [],
          role: 'user',
          joinedDate: '2026-05-15'
        });
        setHabits([]);
        setTasks([]);
        setGoals([]);
        setJournals([]);
        setNotifications([]);
        setAdminUsers([]);
        setPlanner(DEFAULT_TIMEBLOCKS);
        setReminders(DEFAULT_REMINDERS);
      }
    }, 500);

    return () => clearInterval(checkToken);
  }, [token]);

  // Initial mount load and polling for notifications / updates
  useEffect(() => {
    syncWithServer();

    // Pull notifications & user levels dynamically every 10 seconds (important for Cron Smart Reminders!)
    const polling = setInterval(async () => {
      const activeToken = localStorage.getItem('lifesync_token');
      if (activeToken) {
        try {
          const notificationsList = await api.fetchNotifications();
          setNotifications(notificationsList);
          
          const profile = await api.fetchProfile();
          setUser(prev => ({
            ...prev,
            xp: profile.xp,
            level: profile.level,
            badges: profile.badges || []
          }));
        } catch (e) {
          // Fail silently during background polling
        }
      }
    }, 10000);

    return () => clearInterval(polling);
  }, []);

  const addXP = (amount: number, reason: string) => {
    // Gamification state is managed on database level, but we add local feedback
    setUser(prev => {
      const nextXP = prev.xp + amount;
      const nextLevel = Math.floor(Math.sqrt(nextXP / 100)) + 1;
      return { ...prev, xp: nextXP, level: nextLevel };
    });
    addLocalNotification(`+${amount} XP Requested`, reason, 'achievement');
  };

  const updateUser = async (updates: Partial<UserProfile>) => {
    try {
      const finalProfile = {
        name: updates.name !== undefined ? updates.name : user.name,
        avatar: updates.avatar !== undefined ? updates.avatar : user.avatar,
        bio: updates.bio !== undefined ? updates.bio : user.bio
      };
      await api.updateProfile(finalProfile);
      setUser(prev => ({ ...prev, ...updates }));
      addLocalNotification('Profile Updated ⚙', 'Your settings have been saved.', 'reminder');
    } catch (err) {
      console.error('Failed to update profile settings:', err);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // --- Habits Operations ---
  const addHabit = async (newHab: Omit<Habit, 'id' | 'value' | 'history' | 'streak' | 'longestStreak'>) => {
    try {
      await api.createHabit(newHab);
      await syncWithServer();
    } catch (err) {
      console.error(err);
    }
  };

  const editHabit = async (id: string, name: string, targetValue: number) => {
    try {
      await api.modifyHabit(id, name, targetValue);
      await syncWithServer();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteHabit = async (id: string) => {
    try {
      await api.removeHabit(id);
      await syncWithServer();
    } catch (err) {
      console.error(err);
    }
  };

  const logHabit = async (id: string, val: number) => {
    try {
      const res = await api.logHabitCompletion(id, val);
      await syncWithServer();
      
      if (res.completed && res.xpAwarded > 0) {
        addLocalNotification(`+${res.xpAwarded} XP Unlocked`, 'Habit completion target met!', 'achievement');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetDailyHabits = async (category: string = 'All') => {
    try {
      await api.bulkResetHabits(category);
      await syncWithServer();
    } catch (err) {
      console.error('Failed to reset daily habits:', err);
    }
  };

  // --- Tasks Operations ---
  const addTask = async (newTask: Omit<Task, 'id' | 'status'>) => {
    try {
      await api.createTask(newTask);
      await syncWithServer();
    } catch (err) {
      console.error(err);
    }
  };

  const editTask = async (id: string, updates: Partial<Task>) => {
    try {
      await api.modifyTask(id, updates);
      await syncWithServer();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await api.removeTask(id);
      await syncWithServer();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTaskStatus = async (id: string) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) return;
      const nextStatus = task.status === 'done' ? 'todo' : 'done';
      await api.changeTaskStatus(id, nextStatus);
      await syncWithServer();
    } catch (err) {
      console.error(err);
    }
  };

  const updateTaskStatus = async (id: string, status: Task['status']) => {
    try {
      await api.changeTaskStatus(id, status);
      await syncWithServer();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSubtask = async (taskId: string, subtaskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      const updatedSubs = task.subtasks.map(sub => 
        sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
      );
      await api.modifyTask(taskId, { subtasks: updatedSubs });
      await syncWithServer();
    } catch (err) {
      console.error(err);
    }
  };

  // --- Goals Operations ---
  const addGoal = async (newGoal: Omit<Goal, 'id' | 'progress' | 'status'>) => {
    try {
      await api.createGoal(newGoal);
      await syncWithServer();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleMilestone = async (goalId: string, milestoneId: string) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;
      const updatedMilestones = goal.milestones.map(m => 
        m.id === milestoneId ? { ...m, completed: !m.completed } : m
      );
      const completedCount = updatedMilestones.filter(m => m.completed).length;
      const progress = Math.round((completedCount / updatedMilestones.length) * 100) || 0;
      await api.changeGoalProgress(goalId, progress, updatedMilestones);
      await syncWithServer();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      await api.removeGoal(id);
      await syncWithServer();
    } catch (err) {
      console.error(err);
    }
  };

  // --- Journal Operations ---
  const addJournal = async (entry: Omit<JournalEntry, 'id' | 'date'>) => {
    try {
      await api.createJournal(entry);
      await syncWithServer();
    } catch (err) {
      console.error(err);
    }
  };

  // --- Planner Operations ---
  const updateTimeBlock = async (id: string, task: string, completed: boolean) => {
    try {
      setPlanner(prev => prev.map(b => b.id === id ? { ...b, task, completed } : b));
      const activeToken = localStorage.getItem('lifesync_token');
      if (activeToken) {
        await api.updateTimeBlockValue(id, { task, completed });
        await syncWithServer();
      }
    } catch (err) {
      console.error('Failed to update timeblock:', err);
    }
  };

  // --- Notification Operations ---
  const addLocalNotification = (title: string, message: string, type: SystemNotification['type']) => {
    const notif: SystemNotification = {
      id: `n_${Date.now()}`,
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [notif, ...prev].slice(0, 50));
    if (Notification.permission === 'granted') {
      new Notification(title, { body: message });
    }
  };

  const addNotification = (title: string, message: string, type: SystemNotification['type']) => {
    addLocalNotification(title, message, type);
  };

  const markNotificationsRead = async () => {
    try {
      await api.markNotificationsAsRead();
      await syncWithServer();
    } catch (err) {
      console.error(err);
    }
  };

  // --- Reminders Operations ---
  const toggleReminder = async (id: string) => {
    try {
      setReminders(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
      const activeToken = localStorage.getItem('lifesync_token');
      if (activeToken) {
        await api.toggleReminderSetting(id);
        await syncWithServer();
      }
    } catch (err) {
      console.error('Failed to toggle reminder:', err);
    }
  };

  // --- Admin Panel Operations ---
  const toggleUserStatus = async (id: string) => {
    try {
      const u = adminUsers.find(user => user.id === id);
      if (!u) return;
      const nextStatus = u.status === 'Active' ? 'Suspended' : 'Active';
      await api.toggleUserStatus(id, nextStatus);
      await syncWithServer();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await api.removeUser(id);
      await syncWithServer();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        habits,
        tasks,
        goals,
        journals,
        planner,
        notifications,
        reminders,
        adminUsers,
        theme,
        currentDateStr,
        updateUser,
        addXP,
        toggleTheme,
        addHabit,
        editHabit,
        deleteHabit,
        logHabit,
        resetDailyHabits,
        addTask,
        editTask,
        deleteTask,
        toggleTaskStatus,
        updateTaskStatus,
        toggleSubtask,
        addGoal,
        toggleMilestone,
        deleteGoal,
        addJournal,
        updateTimeBlock,
        addNotification,
        markNotificationsRead,
        toggleReminder,
        toggleUserStatus,
        deleteUser
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside an AppProvider');
  return context;
};
