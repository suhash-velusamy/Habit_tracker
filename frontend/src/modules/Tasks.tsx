import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Task, SubTask } from '../context/AppContext';
import { 
  CheckSquare, Plus, Trash2, Edit2, Play, CheckCircle2, AlertCircle, 
  Tag, Calendar, Clock, List, LayoutGrid, CalendarRange, ChevronRight, ChevronLeft
} from 'lucide-react';

export const Tasks: React.FC = () => {
  const { 
    tasks, addTask, editTask, deleteTask, toggleTaskStatus, updateTaskStatus, toggleSubtask, currentDateStr
  } = useApp();

  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'calendar'>('list');
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Study');
  const [priority, setPriority] = useState<Task['priority']>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [recurrence, setRecurrence] = useState<Task['recurrence']>('None');
  const [subtasksInput, setSubtasksInput] = useState('');

  // Editing states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Parse subtasks separated by commas
    const parsedSubtasks: SubTask[] = subtasksInput
      ? subtasksInput.split(',').map((s, idx) => ({
          id: `sub_${Date.now()}_${idx}`,
          name: s.trim(),
          completed: false
        })).filter(s => s.name.length > 0)
      : [];

    addTask({
      name,
      category,
      priority,
      dueDate: dueDate || currentDateStr,
      notes,
      recurrence,
      subtasks: parsedSubtasks
    });

    // Reset Form
    setName('');
    setCategory('Study');
    setPriority('Medium');
    setDueDate('');
    setNotes('');
    setRecurrence('None');
    setSubtasksInput('');
    setIsAdding(false);
  };

  const handleSaveEdit = (id: string) => {
    editTask(id, { name: editName });
    setEditingId(null);
  };

  const startEdit = (t: Task) => {
    setEditingId(t.id);
    setEditName(t.name);
  };

  const getPriorityColor = (p: Task['priority']) => {
    switch (p) {
      case 'High': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case 'Medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'Low': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-slate-500 bg-slate-500/10';
    }
  };

  // --- Views Renders ---

  // Render 1: List View
  const renderListView = () => {
    return (
      <div className="space-y-3">
        {tasks.map(t => {
          const isDone = t.status === 'done';
          const completedSubs = t.subtasks.filter(s => s.completed).length;
          const totalSubs = t.subtasks.length;

          return (
            <div 
              key={t.id} 
              className={`glass-panel p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border transition-all ${
                isDone 
                  ? 'border-emerald-500/20 bg-emerald-500/2.5' 
                  : 'border-slate-200/50 dark:border-slate-800/40'
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                {/* Complete checkbox */}
                <button
                  onClick={() => toggleTaskStatus(t.id)}
                  className={`mt-1 flex-shrink-0 cursor-pointer ${isDone ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-600 hover:text-indigo-500'}`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                </button>

                <div className="space-y-1 flex-1">
                  {editingId === t.id ? (
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-white outline-none"
                      />
                      <button 
                        onClick={() => handleSaveEdit(t.id)}
                        className="px-2 py-1 bg-indigo-600 text-white rounded text-[10px] font-bold cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <h4 className={`text-sm font-bold text-slate-800 dark:text-white m-0 ${isDone ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                      {t.name}
                    </h4>
                  )}

                  {t.notes && <p className="text-xs text-slate-400">{t.notes}</p>}

                  {/* Badges metadata info */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400 mt-1">
                    <span className="font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      {t.category}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded font-bold border ${getPriorityColor(t.priority)}`}>
                      {t.priority} Priority
                    </span>
                    <span className="flex items-center gap-0.5 font-semibold">
                      <Calendar className="w-3 h-3" /> Due: {t.dueDate}
                    </span>
                    {t.recurrence !== 'None' && (
                      <span className="flex items-center gap-0.5 text-indigo-400 font-semibold">
                        <Clock className="w-3 h-3" /> {t.recurrence}
                      </span>
                    )}
                  </div>

                  {/* Render subtasks checklist inside task */}
                  {totalSubs > 0 && (
                    <div className="mt-2.5 space-y-1.5 pl-2 border-l-2 border-indigo-500/20">
                      <div className="text-[10px] text-slate-400 font-semibold mb-1">
                        Subtasks: {completedSubs} / {totalSubs} completed
                      </div>
                      {t.subtasks.map(sub => (
                        <label key={sub.id} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={sub.completed}
                            onChange={() => toggleSubtask(t.id, sub.id)}
                            className="w-3 h-3 text-indigo-500 rounded border-slate-300 dark:border-slate-800"
                          />
                          <span className={sub.completed ? 'line-through opacity-50' : ''}>{sub.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Task action triggers */}
              <div className="flex items-center gap-2 self-end md:self-auto">
                <button
                  onClick={() => startEdit(t)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 hover:text-indigo-500 rounded-lg text-slate-400 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteTask(t.id)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 hover:text-rose-500 rounded-lg text-slate-400 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render 2: Kanban Board
  const renderKanbanView = () => {
    const columns: { title: string; status: Task['status']; color: string }[] = [
      { title: 'To-Do List', status: 'todo', color: 'bg-indigo-500' },
      { title: 'In Progress', status: 'in_progress', color: 'bg-amber-500' },
      { title: 'Completed', status: 'done', color: 'bg-emerald-500' }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.status);

          return (
            <div key={col.status} className="glass-panel p-4 rounded-2xl flex flex-col min-h-[400px]">
              <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-800/50 pb-2">
                <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.color}`} /> {col.title}
                </h4>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200/50 dark:bg-slate-800 font-bold">
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks List */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px] pr-1">
                {colTasks.map(t => (
                  <div key={t.id} className="p-3 bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200/40 dark:border-slate-800/60 rounded-xl relative hover:border-indigo-500/20 transition-all">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-white block leading-tight">{t.name}</span>
                      <span className={`text-[8px] px-1 py-0.5 rounded font-bold uppercase ${getPriorityColor(t.priority)}`}>
                        {t.priority}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[9px] text-slate-400 mt-3">
                      <span>Due: {t.dueDate}</span>
                      <span className="font-semibold uppercase text-[8px] px-1 bg-slate-200 dark:bg-slate-800 text-slate-400 rounded">
                        {t.category}
                      </span>
                    </div>

                    {/* Column controls to shift columns */}
                    <div className="flex justify-end gap-1.5 mt-2.5 border-t border-slate-200/10 pt-2">
                      {col.status !== 'todo' && (
                        <button
                          onClick={() => updateTaskStatus(t.id, col.status === 'done' ? 'in_progress' : 'todo')}
                          className="p-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                          title="Move Left"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {col.status !== 'done' && (
                        <button
                          onClick={() => updateTaskStatus(t.id, col.status === 'todo' ? 'in_progress' : 'done')}
                          className="p-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                          title="Move Right"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteTask(t.id)}
                        className="p-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-400 hover:text-rose-500 cursor-pointer"
                        title="Delete Task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {colTasks.length === 0 && (
                  <div className="text-center text-xs text-slate-500 py-12 italic">
                    No tasks here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render 3: Calendar View
  const renderCalendarView = () => {
    // Generate dates for current month calendar view (simple 3x4 layout or standard 4-week layout)
    const dates = [];
    const baseDate = new Date();
    // Start from Monday this week
    const startOfWeek = new Date();
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    startOfWeek.setDate(diff);

    for (let i = 0; i < 14; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      dates.push(d);
    }

    return (
      <div className="glass-panel p-4 rounded-2xl">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 text-center">
          Task Deadlines Scheduler (2 Weeks Overview)
        </h4>
        <div className="w-full overflow-x-auto pb-2">
          <div className="grid grid-cols-7 gap-2 min-w-[550px]">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(dayName => (
            <div key={dayName} className="text-center font-bold text-xs text-slate-400 py-1.5">
              {dayName}
            </div>
          ))}
          {dates.map((d, index) => {
            const dateStr = d.toISOString().split('T')[0];
            const tasksOnDate = tasks.filter(t => t.dueDate === dateStr);

            return (
              <div 
                key={index} 
                className="min-h-20 p-2 border border-slate-200/50 dark:border-slate-800/40 bg-slate-100/30 dark:bg-slate-800/10 rounded-xl flex flex-col justify-between"
              >
                <span className="text-[10px] font-bold text-slate-400">{d.getDate()}</span>
                
                <div className="flex-1 mt-1 space-y-1 overflow-y-auto max-h-12">
                  {tasksOnDate.map(t => (
                    <div 
                      key={t.id} 
                      className={`text-[8px] font-bold px-1 py-0.5 rounded truncate ${
                        t.status === 'done' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 line-through' 
                          : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      }`}
                      title={t.name}
                    >
                      {t.name}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Top View Toggle header bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-1 bg-slate-200/50 dark:bg-slate-800/40 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'list' 
                ? 'bg-indigo-600 text-white shadow' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <List className="w-3.5 h-3.5" /> List View
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'kanban' 
                ? 'bg-indigo-600 text-white shadow' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Kanban Board
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'calendar' 
                ? 'bg-indigo-600 text-white shadow' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CalendarRange className="w-3.5 h-3.5" /> Tasks Calendar
          </button>
        </div>

        {/* Task Creation toggle button */}
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" /> {isAdding ? 'Close Builder' : 'Create Task'}
        </button>
      </div>

      {/* Task Creation form drawer */}
      {isAdding && (
        <div className="glass-panel p-5 rounded-2xl border border-indigo-500/20 animate-fade-in">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3">Add Custom Task</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Task Title</label>
              <input
                type="text"
                placeholder="e.g. Build LifeSync dashboard structure, Leetcode practice problems"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-500 text-slate-950 dark:text-white"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Category</label>
                <input
                  type="text"
                  placeholder="e.g. Coding, Study"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500 text-slate-950 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500 text-slate-950 dark:text-white"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500 text-slate-950 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Recurrence</label>
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value as any)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500 text-slate-950 dark:text-white"
                >
                  <option value="None">None</option>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Task Description / Notes</label>
              <textarea
                placeholder="Details about constraints, requirements..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500 text-slate-950 dark:text-white h-16 resize-none"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Subtasks (comma-separated list)</label>
              <input
                type="text"
                placeholder="e.g. Set environment, Code sorting module, Write testing cases"
                value={subtasksInput}
                onChange={(e) => setSubtasksInput(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500 text-slate-950 dark:text-white"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold cursor-pointer text-slate-800 dark:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Create Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main view renderer */}
      {viewMode === 'list' && renderListView()}
      {viewMode === 'kanban' && renderKanbanView()}
      {viewMode === 'calendar' && renderCalendarView()}

    </div>
  );
};
