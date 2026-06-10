import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Goal } from '../context/AppContext';
import { 
  Target, Award, Calendar, CheckCircle2, Circle, Trash2, Plus, 
  ChevronDown, ChevronUp, Star, TrendingUp, ShieldAlert
} from 'lucide-react';

export const Goals: React.FC = () => {
  const { goals, addGoal, toggleMilestone, deleteGoal } = useApp();
  const [filterType, setFilterType] = useState<'all' | 'Short-Term' | 'Long-Term'>('all');
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Placement');
  const [type, setType] = useState<'Short-Term' | 'Long-Term'>('Short-Term');
  const [deadline, setDeadline] = useState('');
  const [m1, setM1] = useState('');
  const [m2, setM2] = useState('');
  const [m3, setM3] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const milestones = [];
    if (m1.trim()) milestones.push({ id: `m_${Date.now()}_1`, name: m1.trim(), completed: false });
    if (m2.trim()) milestones.push({ id: `m_${Date.now()}_2`, name: m2.trim(), completed: false });
    if (m3.trim()) milestones.push({ id: `m_${Date.now()}_3`, name: m3.trim(), completed: false });

    addGoal({
      name,
      category,
      type,
      deadline,
      milestones
    });

    setName('');
    setCategory('Placement');
    setType('Short-Term');
    setDeadline('');
    setM1('');
    setM2('');
    setM3('');
    setIsAdding(false);
  };

  // Filtered Goals
  const filteredGoals = filterType === 'all' 
    ? goals 
    : goals.filter(g => g.type === filterType);

  // Statistics
  const activeCount = goals.filter(g => g.status === 'active').length;
  const completedCount = goals.filter(g => g.status === 'completed').length;
  const successRate = goals.length > 0
    ? Math.round((completedCount / goals.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      
      {/* Top summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-xl flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl"><Target className="w-5 h-5" /></div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Active Goals</span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">{activeCount} Objects</span>
          </div>
        </div>
        <div className="glass-card p-4 rounded-xl flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl"><CheckCircle2 className="w-5 h-5" /></div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Completed Goals</span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">{completedCount} Successes</span>
          </div>
        </div>
        <div className="glass-card p-4 rounded-xl flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl"><TrendingUp className="w-5 h-5" /></div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Goal Success Rate</span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">{successRate}% Completed</span>
          </div>
        </div>
      </div>

      {/* Control menu filter */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-1 bg-slate-200/50 dark:bg-slate-800/40 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              filterType === 'all' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Goals
          </button>
          <button
            onClick={() => setFilterType('Short-Term')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              filterType === 'Short-Term' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Short-Term
          </button>
          <button
            onClick={() => setFilterType('Long-Term')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              filterType === 'Long-Term' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Long-Term
          </button>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" /> {isAdding ? 'Close builder' : 'Create Goal Target'}
        </button>
      </div>

      {/* Form builder drawer */}
      {isAdding && (
        <div className="glass-panel p-5 rounded-2xl border border-indigo-500/20 animate-fade-in">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3">Add New Goal Target</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Goal Name</label>
                <input
                  type="text"
                  placeholder="e.g. Master MERN Stack development"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-500 text-slate-950 dark:text-white"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500 text-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Term</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500 text-slate-950 dark:text-white"
                  >
                    <option value="Short-Term">Short-Term</option>
                    <option value="Long-Term">Long-Term</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Goal Deadline Target</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full md:w-1/2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500 text-slate-950 dark:text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-bold text-slate-400">Milestones Checklist</label>
              <input
                type="text"
                placeholder="Milestone 1 e.g. Finish Node.js Express setup guides"
                value={m1}
                onChange={(e) => setM1(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-indigo-500 text-slate-950 dark:text-white"
              />
              <input
                type="text"
                placeholder="Milestone 2 e.g. Integrate MongoDB database layers"
                value={m2}
                onChange={(e) => setM2(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-indigo-500 text-slate-950 dark:text-white"
              />
              <input
                type="text"
                placeholder="Milestone 3 e.g. Final deployment of demo on Render hosting"
                value={m3}
                onChange={(e) => setM3(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-indigo-500 text-slate-950 dark:text-white"
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
                Create Goal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals Display Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredGoals.map(g => {
          const isFinished = g.status === 'completed';

          return (
            <div 
              key={g.id} 
              className={`glass-panel p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                isFinished 
                  ? 'border-emerald-500/25 bg-emerald-500/2.5' 
                  : 'border-slate-200/50 dark:border-slate-800/40'
              }`}
            >
              {/* Header */}
              <div>
                <div className="flex justify-between items-start mb-2.5">
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase font-bold text-slate-400 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                      {g.category}
                    </span>
                    <h4 className={`text-sm font-extrabold text-slate-800 dark:text-white mt-1.5 leading-tight ${isFinished ? 'line-through opacity-60' : ''}`}>
                      {g.name}
                    </h4>
                  </div>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                    g.type === 'Long-Term' 
                      ? 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5' 
                      : 'text-purple-400 border-purple-500/20 bg-purple-500/5'
                  }`}>
                    {g.type}
                  </span>
                </div>

                {/* Progress bar info */}
                <div className="flex justify-between text-xs font-semibold mb-1 mt-3">
                  <span className="text-slate-400">Milestones Progress</span>
                  <span className="text-indigo-400 font-extrabold">{g.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-900/60 h-2 rounded-full overflow-hidden border border-slate-200/10">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500" 
                    style={{ width: `${g.progress}%` }} 
                  />
                </div>

                {/* Milestones list checkboxes */}
                {g.milestones.length > 0 && (
                  <div className="mt-4 space-y-2 border-t border-slate-200/10 pt-3">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Target Milestones</span>
                    <div className="space-y-1.5">
                      {g.milestones.map(m => (
                        <button
                          key={m.id}
                          onClick={() => toggleMilestone(g.id, m.id)}
                          className="w-full text-left flex items-start gap-2 py-1 hover:bg-slate-200/20 dark:hover:bg-slate-800/20 rounded-lg px-1 text-xs text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                        >
                          {m.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5 animate-scale-up" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-400 dark:text-slate-600 flex-shrink-0 mt-0.5" />
                          )}
                          <span className={m.completed ? 'line-through opacity-50' : ''}>{m.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Goal Footer Controls */}
              <div className="flex justify-between items-center mt-5 border-t border-slate-200/10 pt-3">
                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
                  <Calendar className="w-3.5 h-3.5" /> Deadline: {g.deadline}
                </span>

                <button
                  onClick={() => deleteGoal(g.id)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 hover:text-rose-500 text-slate-400 rounded-lg transition-colors cursor-pointer"
                  title="Remove Goal"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          );
        })}

        {filteredGoals.length === 0 && (
          <div className="col-span-2 text-center text-xs text-slate-500 py-16 italic glass-panel rounded-2xl">
            No goals scheduled. Add a goal to track placement prep targets.
          </div>
        )}
      </div>

    </div>
  );
};
