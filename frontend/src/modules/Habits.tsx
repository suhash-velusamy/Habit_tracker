import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { Habit } from '../context/AppContext';
import { 
  Flame, Award, CheckCircle, XCircle, Plus, Edit2, Trash2, Calendar, 
  Sparkles, ShieldAlert, Heart, Code, Briefcase, GraduationCap, Compass, HelpCircle,
  GripVertical, Check, X
} from 'lucide-react';
import { Reorder, useDragControls } from 'framer-motion';

interface HabitRowProps {
  h: Habit;
  logHabit: (id: string, val: number) => void;
  deleteHabit: (id: string) => void;
  editingHabitId: string | null;
  editName: string;
  setEditName: (val: string) => void;
  editTarget: number;
  setEditTarget: (val: number) => void;
  handleSaveEdit: (id: string) => void;
  handleStartEdit: (h: Habit) => void;
  getCategoryIcon: (cat: Habit['category']) => React.ReactNode;
}

const HabitRow: React.FC<HabitRowProps> = ({
  h,
  logHabit,
  deleteHabit,
  editingHabitId,
  editName,
  setEditName,
  editTarget,
  setEditTarget,
  handleSaveEdit,
  handleStartEdit,
  getCategoryIcon
}) => {
  const dragControls = useDragControls();
  const isCompleted = h.value >= h.targetValue;
  const progressPercent = Math.min(100, Math.round((h.value / h.targetValue) * 100));

  return (
    <Reorder.Item
      value={h}
      dragListener={false}
      dragControls={dragControls}
      className={`glass-panel p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border transition-all ${
        isCompleted 
          ? 'border-emerald-500/35 bg-emerald-500/5' 
          : 'border-slate-200/50 dark:border-slate-800/40'
      }`}
    >
      {/* Info block */}
      <div className="flex items-start gap-3 flex-1 w-full">
        {/* Drag handle */}
        <div 
          onPointerDown={(e) => dragControls.start(e)}
          className="p-2 bg-slate-200/50 dark:bg-slate-800/80 rounded-xl mt-0.5 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-200 select-none flex items-center justify-center"
        >
          <GripVertical className="w-4 h-4" />
        </div>
        
        <div className="p-2 bg-slate-200/50 dark:bg-slate-800 rounded-xl mt-0.5 flex-shrink-0">
          {getCategoryIcon(h.category)}
        </div>
        
        <div className="space-y-1 flex-1 min-w-0">
          {editingHabitId === h.id ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-white outline-none"
              />
              {h.type === 'counter' && (
                <input
                  type="number"
                  value={editTarget}
                  onChange={(e) => setEditTarget(parseInt(e.target.value) || 1)}
                  className="w-16 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-white outline-none"
                />
              )}
              <button 
                onClick={() => handleSaveEdit(h.id)} 
                className="px-2 py-1 bg-indigo-600 text-white rounded text-[10px] font-bold"
              >
                Save
              </button>
            </div>
          ) : (
            <h4 className={`text-sm font-bold text-slate-800 dark:text-white m-0 truncate ${isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
              {h.name}
            </h4>
          )}
          
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400">
            <span className="font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              {h.category}
            </span>
            <span className="font-bold flex items-center gap-0.5 text-amber-500">
              <Flame className="w-3.5 h-3.5" /> {h.streak} Day Streak
            </span>
            {h.type === 'counter' && (
              <span className="font-semibold text-indigo-400">
                Goal: {h.targetValue} {h.unit}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress Controls */}
      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
        {/* Progress slide indicator for counters */}
        {h.type === 'counter' && (
          <div className="flex items-center gap-2 flex-1 md:flex-none">
            <button
              onClick={() => logHabit(h.id, Math.max(0, h.value - 1))}
              disabled={h.value === 0}
              className="w-7 h-7 flex items-center justify-center bg-slate-200 dark:bg-slate-800/80 hover:bg-slate-300 rounded-lg disabled:opacity-40 font-extrabold text-sm select-none cursor-pointer"
            >
              -
            </button>
            <div className="w-20 text-center">
              <span className="text-xs font-extrabold text-slate-800 dark:text-white">{h.value}</span>
              <span className="text-[10px] text-slate-400 block">{progressPercent}%</span>
            </div>
            <button
              onClick={() => logHabit(h.id, Math.min(h.targetValue, h.value + 1))}
              disabled={isCompleted}
              className="w-7 h-7 flex items-center justify-center bg-slate-200 dark:bg-slate-800/80 hover:bg-slate-300 rounded-lg disabled:opacity-40 font-extrabold text-sm select-none cursor-pointer"
            >
              +
            </button>
          </div>
        )}

        {/* Complete Action triggers */}
        {h.type === 'boolean' && (
          <div className="flex gap-2">
            <button
              onClick={() => logHabit(h.id, 1)}
              title="Mark as Completed"
              className={`w-8 h-8 flex items-center justify-center rounded-full border transition-all cursor-pointer ${
                isCompleted
                  ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/40 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 border-transparent'
              }`}
            >
              <Check className="w-4 h-4 stroke-[3]" />
            </button>
            <button
              onClick={() => logHabit(h.id, 0)}
              title="Mark as Not Completed"
              className={`w-8 h-8 flex items-center justify-center rounded-full border transition-all cursor-pointer ${
                !isCompleted
                  ? 'bg-rose-500/15 text-rose-500 border-rose-500/30 shadow-sm shadow-rose-500/10'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/40 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 border-transparent'
              }`}
            >
              <X className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        )}

        {/* Actions Dropdown triggers */}
        <div className="flex gap-1">
          <button
            onClick={() => handleStartEdit(h)}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 hover:text-indigo-500 rounded-lg text-slate-400 transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => deleteHabit(h.id)}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 hover:text-rose-500 rounded-lg text-slate-400 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </Reorder.Item>
  );
};

export const Habits: React.FC = () => {
  const { 
    habits, logHabit, addHabit, editHabit, deleteHabit, currentDateStr, addNotification, resetDailyHabits
  } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editTarget, setEditTarget] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  // New habit form states
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<Habit['category']>('Daily Routine');
  const [newType, setNewType] = useState<'boolean' | 'counter'>('boolean');
  const [newTargetValue, setNewTargetValue] = useState(1);
  const [newUnit, setNewUnit] = useState('times');

  const categories = [
    'All', 'Health', 'Study', 'Coding', 'Interview Preparation', 
    'Learning', 'Personal Development', 'Daily Routine'
  ];

  const getCategoryIcon = (cat: Habit['category']) => {
    switch (cat) {
      case 'Health': return <Heart className="w-4 h-4 text-rose-500" />;
      case 'Coding': return <Code className="w-4 h-4 text-indigo-500" />;
      case 'Interview Preparation': return <Briefcase className="w-4 h-4 text-purple-500" />;
      case 'Learning': return <GraduationCap className="w-4 h-4 text-amber-500" />;
      case 'Daily Routine': return <Compass className="w-4 h-4 text-emerald-500" />;
      case 'Study': return <BookIcon className="w-4 h-4 text-sky-500" />;
      default: return <HelpCircle className="w-4 h-4 text-slate-500" />;
    }
  };

  const BookIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addHabit({
      name: newName,
      category: newCategory,
      type: newType,
      targetValue: newType === 'boolean' ? 1 : newTargetValue,
      unit: newType === 'boolean' ? '' : newUnit,
      target: newType === 'boolean' ? 'Complete' : `${newTargetValue} ${newUnit}`
    });
    setNewName('');
    setIsAdding(false);
  };

  const handleStartEdit = (h: Habit) => {
    setEditingHabitId(h.id);
    setEditName(h.name);
    setEditTarget(h.targetValue);
  };

  const handleSaveEdit = (id: string) => {
    editHabit(id, editName, editTarget);
    setEditingHabitId(null);
    addNotification('Habit Updated ✏', `"${editName}" settings updated.`, 'habit');
  };

  // Filtered Habits list
  const filteredHabits = categoryFilter === 'All' 
    ? habits 
    : habits.filter(h => h.category === categoryFilter);

  // Local state to keep track of the custom order of habits
  const [orderedHabits, setOrderedHabits] = useState<Habit[]>([]);

  useEffect(() => {
    const savedOrder = localStorage.getItem('lifesync_habits_order');
    const orderedIds: string[] = savedOrder ? JSON.parse(savedOrder) : [];
    
    // Sort habits based on the saved ID order
    const sorted = [...filteredHabits].sort((a, b) => {
      const idxA = orderedIds.indexOf(a.id);
      const idxB = orderedIds.indexOf(b.id);
      if (idxA === -1 && idxB === -1) return 0;
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });
    setOrderedHabits(sorted);
  }, [habits, categoryFilter]);

  const handleReorder = (newOrder: Habit[]) => {
    setOrderedHabits(newOrder);
    const newIds = newOrder.map(h => h.id);
    localStorage.setItem('lifesync_habits_order', JSON.stringify(newIds));
  };

  // Streaks statistics (streak is per-user based on 75% daily threshold)
  const userStreak = habits.length > 0 ? habits[0].streak : 0;
  const userLongestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.longestStreak || 0)) : 0;
  const consistencyScore = habits.length > 0
    ? Math.round((habits.filter(h => h.value >= h.targetValue).length / habits.length) * 100)
    : 0;

  // Generate date grid cells for visual Calendar Map (past 30 days)
  const renderCalendarMap = () => {
    const cells = [];
    const date = new Date();
    // Generate past 28 days for a neat grid
    for (let i = 27; i >= 0; i--) {
      const d = new Date();
      d.setDate(date.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      
      // Calculate average completion rate for this day
      const completedOnDay = habits.filter(h => {
        const val = h.history[dateString];
        return val !== undefined && val >= h.targetValue;
      }).length;
      
      let intensity = 'bg-slate-200 dark:bg-slate-800/80';
      if (completedOnDay > 0) {
        const percent = (completedOnDay / habits.length) * 100;
        if (percent <= 25) intensity = 'bg-indigo-300 dark:bg-indigo-950';
        else if (percent <= 50) intensity = 'bg-indigo-400 dark:bg-indigo-900';
        else if (percent <= 75) intensity = 'bg-indigo-500 dark:bg-indigo-700';
        else intensity = 'bg-indigo-600 dark:bg-indigo-500';
      }

      cells.push(
        <div 
          key={dateString} 
          className={`heatmap-cell ${intensity} w-6 h-6 rounded flex items-center justify-center text-[8px] font-semibold text-slate-900 dark:text-slate-100 group relative cursor-pointer`}
        >
          {d.getDate()}
          {/* Tooltip detail */}
          <div className="absolute bottom-full mb-1 bg-slate-900 text-white text-[9px] py-1 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none whitespace-nowrap">
            {d.toLocaleDateString()}: {completedOnDay} Completed
          </div>
        </div>
      );
    }
    return cells;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left 2 Cols: Main Habits Log */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Category Filter Chips & Reset Actions bar */}
        <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex flex-wrap gap-1.5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  categoryFilter === cat 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2 self-end sm:self-center">
            {categoryFilter !== 'All' && (
              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to clear all completions in "${categoryFilter}" category?`)) {
                    resetDailyHabits(categoryFilter);
                  }
                }}
                className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/25 text-rose-500 text-[10px] font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap"
              >
                Clear {categoryFilter}
              </button>
            )}
            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear all habit completions for today?')) {
                  resetDailyHabits('All');
                }
              }}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-[10px] font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Add Habit Inline Form Trigger */}
        {isAdding ? (
          <div className="glass-panel p-5 rounded-2xl border border-indigo-500/20 animate-fade-in">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3">Add Custom Habit</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Habit Name</label>
                <input
                  type="text"
                  placeholder="e.g. Read MERN stack articles, Aptitude preparation questions"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-500 text-slate-950 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500 text-slate-950 dark:text-white"
                  >
                    <option value="Daily Routine">Daily Routine</option>
                    <option value="Health">Health</option>
                    <option value="Coding">Coding</option>
                    <option value="Interview Preparation">Interview Preparation</option>
                    <option value="Learning">Learning</option>
                    <option value="Study">Study</option>
                    <option value="Personal Development">Personal Development</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Goal Metric</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500 text-slate-950 dark:text-white"
                  >
                    <option value="boolean">Checklist (Complete/Not)</option>
                    <option value="counter">Numeric (Progress Limit)</option>
                  </select>
                </div>
                {newType === 'counter' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Target</label>
                      <input
                        type="number"
                        min={1}
                        value={newTargetValue}
                        onChange={(e) => setNewTargetValue(parseInt(e.target.value) || 1)}
                        className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-2 py-2 text-xs outline-none focus:border-indigo-500 text-slate-950 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Unit</label>
                      <input
                        type="text"
                        value={newUnit}
                        onChange={(e) => setNewUnit(e.target.value)}
                        placeholder="e.g. tasks"
                        className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-2 py-2 text-xs outline-none focus:border-indigo-500 text-slate-950 dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end mt-4">
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
                  Create Habit
                </button>
              </div>
            </form>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full py-3 bg-indigo-500/10 hover:bg-indigo-500/15 border-2 border-dashed border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-bold rounded-2xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create Custom Habits
          </button>
        )}

        {/* Habits Checklist Grid */}
        <Reorder.Group axis="y" values={orderedHabits} onReorder={handleReorder} className="space-y-3.5">
          {orderedHabits.map(h => (
            <HabitRow
              key={h.id}
              h={h}
              logHabit={logHabit}
              deleteHabit={deleteHabit}
              editingHabitId={editingHabitId}
              editName={editName}
              setEditName={setEditName}
              editTarget={editTarget}
              setEditTarget={setEditTarget}
              handleSaveEdit={handleSaveEdit}
              handleStartEdit={handleStartEdit}
              getCategoryIcon={getCategoryIcon}
            />
          ))}
        </Reorder.Group>
      </div>

      {/* Right Col: Statistics, Cal map */}
      <div className="space-y-6">
        
        {/* Streak & Consistency panel */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
          <h3 className="text-sm font-bold tracking-tight mb-3 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-indigo-500" /> Consistency Metrics
          </h3>
          <div className="space-y-3.5">
            <div className="flex justify-between items-center p-2.5 bg-slate-100/40 dark:bg-slate-800/30 rounded-xl">
              <span className="text-xs font-semibold text-slate-400">Today's Progress</span>
              <span className={`text-sm font-extrabold ${consistencyScore >= 75 ? 'text-emerald-500' : 'text-amber-500'}`}>{consistencyScore}%</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-slate-100/40 dark:bg-slate-800/30 rounded-xl">
              <div>
                <span className="text-xs font-semibold text-slate-400 block">Daily Streak</span>
                <span className="text-[10px] text-slate-500">Need 75%+ to count</span>
              </div>
              <span className={`text-sm font-extrabold flex items-center gap-0.5 ${userStreak > 0 ? 'text-amber-500' : 'text-slate-400'}`}>
                <Flame className="w-4 h-4" /> {userStreak} Days
              </span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-slate-100/40 dark:bg-slate-800/30 rounded-xl">
              <span className="text-xs font-semibold text-slate-400">Best Streak Ever</span>
              <span className="text-sm font-extrabold text-indigo-400">{userLongestStreak} Days</span>
            </div>
          </div>
        </div>

        {/* Heatmap Visual Calendar grid */}
        <div className="glass-panel p-5 rounded-2xl">
          <h3 className="text-sm font-bold tracking-tight mb-3 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-indigo-500" /> Habits Consistency Grid
          </h3>
          <p className="text-[10px] text-slate-400 mb-4">
            Daily logs tracking. Denser indigo indicates higher habit completion rate on that specific day.
          </p>
          <div className="grid grid-cols-7 gap-1.5 justify-center max-w-[210px] mx-auto">
            {renderCalendarMap()}
          </div>
          <div className="flex justify-between items-center text-[8px] text-slate-400 mt-4 px-1">
            <span>Fewer Completed</span>
            <div className="flex gap-0.5">
              <div className="w-2.5 h-2.5 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="w-2.5 h-2.5 rounded bg-indigo-300 dark:bg-indigo-950" />
              <div className="w-2.5 h-2.5 rounded bg-indigo-400 dark:bg-indigo-900" />
              <div className="w-2.5 h-2.5 rounded bg-indigo-500 dark:bg-indigo-700" />
              <div className="w-2.5 h-2.5 rounded bg-indigo-600 dark:bg-indigo-500" />
            </div>
            <span>All Habits</span>
          </div>
        </div>

        {/* Warning Badge alert notification */}
        <div className="glass-panel p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs">
            <h4 className="font-bold text-rose-300 m-0">Missed Habits Warning</h4>
            <p className="text-[10px] text-rose-200/60 mt-1 leading-relaxed">
              Ensure you review and complete your "Java Preparation" and "LeetCode Practice" coding challenges by tonight to prevent breaking active strengths streaks!
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
