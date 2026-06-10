const API_BASE = 'http://localhost:5000/api';

let token: string | null = typeof window !== 'undefined' ? localStorage.getItem('lifesync_token') : null;

export const setAuthToken = (newToken: string | null) => {
  token = newToken;
  if (newToken) {
    localStorage.setItem('lifesync_token', newToken);
  } else {
    localStorage.removeItem('lifesync_token');
  }
};

const apiFetch = async (path: string, options: RequestInit = {}) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! Status: ${res.status}`);
  }

  return res.json();
};

// ================= AUTH APIs =================
export const loginUser = async (credentials: any) => {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
  if (data.token) {
    setAuthToken(data.token);
  }
  return data;
};

export const registerUser = async (details: any) => {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(details)
  });
};

export const fetchProfile = async () => {
  return apiFetch('/auth/profile');
};

export const updateProfile = async (profile: any) => {
  return apiFetch('/auth/update-profile', {
    method: 'PUT',
    body: JSON.stringify(profile)
  });
};

export const deleteAccount = async () => {
  return apiFetch('/auth/delete-account', {
    method: 'DELETE'
  });
};

// ================= HABITS APIs =================
export const fetchHabits = async () => {
  return apiFetch('/habits');
};

export const createHabit = async (habit: any) => {
  return apiFetch('/habits', {
    method: 'POST',
    body: JSON.stringify(habit)
  });
};

export const modifyHabit = async (id: string, name: string, targetValue: number) => {
  return apiFetch(`/habits/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name, targetValue })
  });
};

export const removeHabit = async (id: string) => {
  return apiFetch(`/habits/${id}`, {
    method: 'DELETE'
  });
};

export const logHabitCompletion = async (id: string, value: number) => {
  return apiFetch(`/habits/${id}/complete`, {
    method: 'POST',
    body: JSON.stringify({ value })
  });
};

export const bulkResetHabits = async (category: string) => {
  return apiFetch('/habits/reset', {
    method: 'POST',
    body: JSON.stringify({ category })
  });
};

// ================= TASKS APIs =================
export const fetchTasks = async () => {
  return apiFetch('/tasks');
};

export const createTask = async (task: any) => {
  return apiFetch('/tasks', {
    method: 'POST',
    body: JSON.stringify(task)
  });
};

export const modifyTask = async (id: string, updates: any) => {
  return apiFetch(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
};

export const removeTask = async (id: string) => {
  return apiFetch(`/tasks/${id}`, {
    method: 'DELETE'
  });
};

export const changeTaskStatus = async (id: string, status: string) => {
  return apiFetch(`/tasks/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
};

// ================= GOAL APIs =================
export const fetchGoals = async () => {
  return apiFetch('/goals');
};

export const createGoal = async (goal: any) => {
  return apiFetch('/goals', {
    method: 'POST',
    body: JSON.stringify(goal)
  });
};

export const modifyGoal = async (id: string, updates: any) => {
  return apiFetch(`/goals/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
};

export const removeGoal = async (id: string) => {
  return apiFetch(`/goals/${id}`, {
    method: 'DELETE'
  });
};

export const changeGoalProgress = async (id: string, progress: number, milestones: any) => {
  return apiFetch(`/goals/${id}/progress`, {
    method: 'PATCH',
    body: JSON.stringify({ progress, milestones })
  });
};

// ================= JOURNAL APIs =================
export const fetchJournals = async () => {
  return apiFetch('/journal');
};

export const createJournal = async (entry: any) => {
  return apiFetch('/journal', {
    method: 'POST',
    body: JSON.stringify(entry)
  });
};

// ================= NOTIFICATIONS APIs =================
export const fetchNotifications = async () => {
  return apiFetch('/notifications');
};

export const markNotificationsAsRead = async () => {
  return apiFetch('/notifications/read', {
    method: 'POST'
  });
};

// ================= AI APIs =================
export const chatAI = async (prompt: string, persona: string) => {
  return apiFetch('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ prompt, persona })
  });
};

// ================= ADMIN APIs =================
export const fetchAdminUsers = async () => {
  return apiFetch('/admin/users');
};

export const toggleUserStatus = async (id: string, status: string) => {
  return apiFetch(`/admin/users/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });
};

export const removeUser = async (id: string) => {
  return apiFetch(`/admin/users/${id}`, {
    method: 'DELETE'
  });
};

// ================= ANALYTICS APIs =================
export const fetchDashboardAnalytics = async () => {
  return apiFetch('/analytics/dashboard');
};

// ================= TIMEBLOCKS APIs =================
export const fetchTimeBlocks = async () => {
  return apiFetch('/timeblocks');
};

export const updateTimeBlockValue = async (id: string, updates: { task: string; completed: boolean }) => {
  return apiFetch(`/timeblocks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
};

// ================= REMINDERS APIs =================
export const fetchReminders = async () => {
  return apiFetch('/reminders');
};

export const toggleReminderSetting = async (id: string) => {
  return apiFetch(`/reminders/${id}/toggle`, {
    method: 'PUT'
  });
};
