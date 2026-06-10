import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Habit, Task, Goal } from '../context/AppContext';
import { 
  CheckSquare, Calendar, Target, Award, Flame, 
  Droplet, Sparkles, BookOpen, Quote, Plus, Activity,
  Layers, Clock, ShieldCheck
} from 'lucide-react';
export const Dashboard: React.FC = () => {
  const { 
    user, habits, tasks, goals, planner, addHabit, addTask, addGoal, addNotification, addXP, logHabit
  } = useApp();

  const [activeModal, setActiveModal] = useState<'habit' | 'task' | 'goal' | 'water' | null>(null);

  // Forms states
  const [habitName, setHabitName] = useState('');
  const [habitCategory, setHabitCategory] = useState<'Health' | 'Study' | 'Coding' | 'Interview Preparation' | 'Learning' | 'Personal Development' | 'Daily Routine'>('Daily Routine');
  const [habitType, setHabitType] = useState<'boolean' | 'counter'>('boolean');
  const [habitTargetVal, setHabitTargetVal] = useState(1);
  const [habitUnit, setHabitUnit] = useState('times');

  const [taskName, setTaskName] = useState('');
  const [taskCategory, setTaskCategory] = useState('Study');
  const [taskPriority, setTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [taskDueDate, setTaskDueDate] = useState('');

  const [goalName, setGoalName] = useState('');
  const [goalCategory, setGoalCategory] = useState('Placement');
  const [goalType, setGoalType] = useState<'Short-Term' | 'Long-Term'>('Short-Term');
  const [goalDeadline, setGoalDeadline] = useState('');
  const [milestone1, setMilestone1] = useState('');
  const [milestone2, setMilestone2] = useState('');

  // Daily Water Quick Log state
  const waterHabit = habits.find(h => h.name.includes('Water Intake'));
  const currentWater = waterHabit ? waterHabit.value : 0;
  const targetWater = waterHabit ? waterHabit.targetValue : 3;

  // Calculators
  const totalHabits = habits.length;
  const completedHabitsToday = habits.filter(h => h.value >= h.targetValue).length;
  const activeGoals = goals.filter(g => g.status === 'active').length;
  
  // Streak is per-user (75% daily threshold) — all habits carry the same streak value
  const currentStreak = habits.length > 0 ? habits[0].streak : 0;

  const longestStreak = habits.length > 0
    ? Math.max(...habits.map(h => h.longestStreak || 0))
    : 0;

  // Dynamic Category and Day Completion Calculators
  const getCategoryCompletionRate = (categoryKey: string) => {
    const catHabits = habits.filter(h => {
      if (categoryKey === 'Coding') return h.category === 'Coding';
      if (categoryKey === 'Interview') return h.category === 'Interview Preparation';
      if (categoryKey === 'Study') return h.category === 'Study' || h.category === 'Learning';
      if (categoryKey === 'Health') return h.category === 'Health' || h.category === 'Daily Routine';
      return false;
    });
    if (catHabits.length === 0) return 0;
    const completed = catHabits.filter(h => h.value >= h.targetValue).length;
    return Math.round((completed / catHabits.length) * 100);
  };

  const getDayCompletionRate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() - offsetDays);
    const dateStr = d.toISOString().split('T')[0];
    
    if (habits.length === 0) return 0;
    
    const completed = habits.filter(h => {
      const val = h.history ? (h.history[dateStr] ?? 0) : 0;
      return val >= h.targetValue;
    }).length;
    
    return Math.round((completed / habits.length) * 100);
  };

  const getWeeklyData = () => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = dayNames[d.getDay()];
      const rate = getDayCompletionRate(i);
      data.push({
        day: dayName,
        completion: rate,
        color: i === 0 ? '#4F46E5' : '#7C3AED'
      });
    }
    return data;
  };

  // Compute Productivity Score (0 - 100)
  const habitRatio = totalHabits > 0 ? completedHabitsToday / totalHabits : 0;
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const goalRatio = goals.length > 0 ? completedGoals / goals.length : 0;
  
  const productivityScore = Math.min(100, Math.round(
    (habitRatio * 75) + (goalRatio * 20) + (currentStreak * 1.5)
  )) || 0;

  // Handles quick logs
  const addWater = (amount: number) => {
    if (waterHabit) {
      const newVal = Math.min(waterHabit.targetValue, currentWater + amount);
      logHabit(waterHabit.id, newVal);
      addNotification('Hydration Logged 💧', `Added ${amount}L water. Current intake: ${newVal}L / ${targetWater}L`, 'reminder');
    }
  };

  // Form Submissions
  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    addHabit({
      name: habitName,
      category: habitCategory,
      type: habitType,
      targetValue: habitType === 'boolean' ? 1 : habitTargetVal,
      unit: habitType === 'boolean' ? '' : habitUnit,
      target: habitType === 'boolean' ? 'Complete' : `${habitTargetVal} ${habitUnit}`
    });
    setHabitName('');
    setActiveModal(null);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    addTask({
      name: taskName,
      category: taskCategory,
      priority: taskPriority,
      dueDate: taskDueDate || new Date().toISOString().split('T')[0],
      subtasks: [],
      recurrence: 'None'
    });
    setTaskName('');
    setActiveModal(null);
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const milestones = [];
    if (milestone1) milestones.push({ id: `m_${Date.now()}_1`, name: milestone1, completed: false });
    if (milestone2) milestones.push({ id: `m_${Date.now()}_2`, name: milestone2, completed: false });

    addGoal({
      name: goalName,
      category: goalCategory,
      type: goalType,
      deadline: goalDeadline || new Date().toISOString().split('T')[0],
      milestones
    });
    setGoalName('');
    setMilestone1('');
    setMilestone2('');
    setActiveModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Upper Welcomer Panel */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div>
          <h2 className="text-2xl font-bold tracking-tight m-0 text-slate-900 dark:text-white flex items-center gap-2">
            Welcome back, {user.name.split(' ')[0]} <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Analyze your preparation progress and complete your habits to reach level 3!
          </p>
        </div>
        
        {/* Quick actions box */}
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setActiveModal('habit')} 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Habit
          </button>
          <button 
            onClick={() => setActiveModal('goal')} 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Goal
          </button>
          <button 
            onClick={() => setActiveModal('water')} 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow transition-all cursor-pointer"
          >
            <Droplet className="w-3.5 h-3.5" /> Water Log
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="glass-card p-4 rounded-xl relative overflow-hidden flex flex-col justify-between h-28">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Habits Completed</span>
            <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-500"><ShieldCheck className="w-4 h-4" /></div>
          </div>
          <div>
            <div className="text-2xl font-extrabold tracking-tight">{completedHabitsToday} / {totalHabits}</div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${(completedHabitsToday / (totalHabits || 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="glass-card p-4 rounded-xl relative overflow-hidden flex flex-col justify-between h-28">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Longest Streak</span>
            <div className="p-1.5 bg-purple-500/10 rounded-lg text-purple-500"><Award className="w-4 h-4" /></div>
          </div>
          <div>
            <div className="text-2xl font-extrabold tracking-tight">{longestStreak} Days</div>
            <p className="text-[10px] text-slate-400 mt-1">Your record consistency length</p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="glass-card p-4 rounded-xl relative overflow-hidden flex flex-col justify-between h-28">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Productivity Score</span>
            <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-500"><Award className="w-4 h-4" /></div>
          </div>
          <div>
            <div className="text-2xl font-extrabold tracking-tight">{productivityScore}%</div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${productivityScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="glass-card p-4 rounded-xl relative overflow-hidden flex flex-col justify-between h-28">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Preparation Streak</span>
            <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-500"><Flame className="w-4 h-4" /></div>
          </div>
          <div>
            <div className="text-2xl font-extrabold tracking-tight">{currentStreak} Days</div>
            <p className="text-[10px] text-slate-400 mt-1">Consistency leads to placement!</p>
          </div>
        </div>
      </div>

      {/* Main Panel Content (Split Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Analytics & Widgets */}
        <div className="lg:col-span-2 space-y-6">
          {/* Custom SVG Line Chart - Weekly Progression */}
          <div className="glass-panel p-5 rounded-2xl">
            <h3 className="text-sm font-bold tracking-tight mb-4 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-indigo-500" /> Weekly Habit Completion Progress
            </h3>
            <div className="h-44 w-full flex items-end justify-between px-2 pt-4 border-b border-l border-slate-200 dark:border-slate-800 relative">
              {/* Grid Lines */}
              <div className="absolute left-0 right-0 top-1/4 border-t border-slate-100 dark:border-slate-800/40 text-[9px] text-slate-400 pl-1">75%</div>
              <div className="absolute left-0 right-0 top-2/4 border-t border-slate-100 dark:border-slate-800/40 text-[9px] text-slate-400 pl-1">50%</div>
              <div className="absolute left-0 right-0 top-3/4 border-t border-slate-100 dark:border-slate-800/40 text-[9px] text-slate-400 pl-1">25%</div>
              {/* Day Bars */}
              {getWeeklyData().map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-2 w-10 z-10 group cursor-pointer">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-1 bg-slate-950 text-white text-[9px] font-semibold py-1 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.completion}%
                  </div>
                  {/* Visual Bar */}
                  <div 
                    className="w-4 rounded-t-md transition-all duration-1000 origin-bottom" 
                    style={{ 
                      height: `${(d.completion / 100) * 120}px`,
                      backgroundColor: d.color
                    }}
                  />
                  <span className="text-[10px] text-slate-400 font-semibold">{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Habit Categories Doughnut / Breakdown & Goals Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Breakdown (Progress Indicator) */}
            <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
              <h3 className="text-sm font-bold tracking-tight mb-3 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-500" /> Category Distribution
              </h3>
              <div className="space-y-2.5">
                {[
                  { name: 'Coding & Development', ratio: getCategoryCompletionRate('Coding'), color: 'bg-indigo-500' },
                  { name: 'Interview Preparation', ratio: getCategoryCompletionRate('Interview'), color: 'bg-purple-500' },
                  { name: 'Aptitude & Subject prep', ratio: getCategoryCompletionRate('Study'), color: 'bg-amber-500' },
                  { name: 'Health & Hydration', ratio: getCategoryCompletionRate('Health'), color: 'bg-emerald-500' }
                ].map((cat, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-500 dark:text-gray-400">{cat.name}</span>
                      <span>{cat.ratio}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800/80 h-2 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${cat.color}`} style={{ width: `${cat.ratio}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Goals Track */}
            <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
              <h3 className="text-sm font-bold tracking-tight mb-3 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-500" /> Goal Success Rate
              </h3>
              <div className="space-y-3">
                {goals.map(g => (
                  <div key={g.id} className="p-2.5 bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200/40 dark:border-slate-800/60 rounded-xl">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-[130px]">{g.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-semibold">{g.type}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[10px] text-slate-400">Deadline: {g.deadline}</span>
                      <span className="text-xs font-extrabold text-indigo-500">{g.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full" style={{ width: `${g.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Motivation, Planner Quick Glance & Water Hydrator */}
        <div className="space-y-6">
          {/* Motivation Box */}
          <div className="glass-panel p-5 rounded-2xl bg-gradient-to-br from-indigo-600/15 via-purple-600/5 to-slate-900/40 relative overflow-hidden border border-indigo-500/20">
            <div className="absolute -top-6 -right-6 w-16 h-16 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 mb-2">
              <Quote className="w-3.5 h-3.5" /> Daily Inspiration
            </h3>
            <p className="text-xs font-semibold italic text-slate-700 dark:text-slate-200 leading-relaxed">
              "The secret of your future is hidden in your daily routine. Small adjustments, consistent effort, and practice lead to absolute mastery."
            </p>
            
            <hr className="my-3 border-indigo-500/10" />
            
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3 h-3" /> AI Productivity Insight
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-300 leading-normal">
              Analyzing your coding habits... You solved a LeetCode problem 6 days in a row! Java and MERN stacks are highly correlated. Complete HTML practice at 4 PM to keep your streak.
            </p>
          </div>

          {/* Glass Water Intake Tracker */}
          <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-sky-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold tracking-tight flex items-center gap-1.5">
                <Droplet className="w-4 h-4 text-sky-500" /> Hydration Progress
              </h3>
              <span className="text-xs font-bold text-sky-400">{currentWater}L / {targetWater}L</span>
            </div>
            
            {/* Visual Glass/Water Wave level */}
            <div className="w-full bg-slate-100 dark:bg-slate-800/80 h-10 rounded-xl overflow-hidden relative flex items-center justify-center border border-slate-200/50 dark:border-slate-800/70">
              <div 
                className="absolute left-0 bottom-0 top-0 bg-sky-500/20 backdrop-blur-xs transition-all duration-500" 
                style={{ width: `${(currentWater / targetWater) * 100}%` }}
              />
              <span className="text-xs font-bold z-10 text-sky-600 dark:text-sky-300">
                {currentWater >= targetWater ? 'Target hydration achieved! 🏆' : 'Keep hydrating!'}
              </span>
            </div>

            <div className="flex gap-2 mt-3">
              <button 
                onClick={() => addWater(0.25)} 
                className="flex-1 py-1.5 bg-sky-500/10 hover:bg-sky-500/25 border border-sky-500/20 text-sky-500 hover:text-sky-400 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                +250ml
              </button>
              <button 
                onClick={() => addWater(0.5)} 
                className="flex-1 py-1.5 bg-sky-500/10 hover:bg-sky-500/25 border border-sky-500/20 text-sky-500 hover:text-sky-400 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                +500ml
              </button>
              <button 
                onClick={() => addWater(1.0)} 
                className="flex-1 py-1.5 bg-sky-500/10 hover:bg-sky-500/25 border border-sky-500/20 text-sky-500 hover:text-sky-400 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                +1 Litre
              </button>
            </div>
          </div>

          {/* Daily Schedule Glance */}
          <div className="glass-panel p-5 rounded-2xl">
            <h3 className="text-sm font-bold tracking-tight mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-500" /> Planner Schedule Today
            </h3>
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {planner.map((b) => (
                <div key={b.id} className="flex items-center gap-2.5 py-1.5 px-2 bg-slate-100/40 dark:bg-slate-800/30 rounded-lg text-xs">
                  <span className="font-semibold text-indigo-400 w-10">{b.hour}</span>
                  <span className={`flex-1 text-slate-600 dark:text-slate-300 truncate ${b.completed ? 'line-through opacity-50' : ''}`}>
                    {b.task || 'Available Time slot'}
                  </span>
                  <span className={`w-1.5 h-1.5 rounded-full ${b.completed ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACTION MODALS (SIMULATED DOCK) */}
      {activeModal === 'habit' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 relative">
            <h3 className="text-lg font-bold text-white mb-4">Quick Add Habit</h3>
            <form onSubmit={handleAddHabit} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Habit Title</label>
                <input 
                  type="text" 
                  value={habitName}
                  onChange={(e) => setHabitName(e.target.value)}
                  placeholder="e.g. Read placement preparation papers" 
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500 text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Category</label>
                  <select 
                    value={habitCategory}
                    onChange={(e) => setHabitCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500 text-xs"
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
                  <label className="block text-xs text-slate-400 mb-1">Type</label>
                  <select 
                    value={habitType}
                    onChange={(e) => setHabitType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500 text-xs"
                  >
                    <option value="boolean">Checklist Target</option>
                    <option value="counter">Counter Target</option>
                  </select>
                </div>
              </div>

              {habitType === 'counter' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Target Count</label>
                    <input 
                      type="number" 
                      value={habitTargetVal}
                      onChange={(e) => setHabitTargetVal(parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500 text-sm"
                      min={1}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Unit</label>
                    <input 
                      type="text" 
                      value={habitUnit}
                      onChange={(e) => setHabitUnit(e.target.value)}
                      placeholder="e.g. Litres, tasks"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500 text-sm"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 justify-end mt-4">
                <button 
                  type="button" 
                  onClick={() => setActiveModal(null)} 
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs cursor-pointer font-semibold"
                >
                  Create Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {activeModal === 'goal' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Quick Add Goal</h3>
            <form onSubmit={handleAddGoal} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Goal Name</label>
                <input 
                  type="text" 
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  placeholder="e.g. Learn System Design basics" 
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500 text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Category</label>
                  <input 
                    type="text" 
                    value={goalCategory}
                    onChange={(e) => setGoalCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Term Type</label>
                  <select 
                    value={goalType}
                    onChange={(e) => setGoalType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500 text-xs"
                  >
                    <option value="Short-Term">Short-Term</option>
                    <option value="Long-Term">Long-Term</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Goal Deadline</label>
                <input 
                  type="date" 
                  value={goalDeadline}
                  onChange={(e) => setGoalDeadline(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs text-slate-400">Milestones (Optional)</label>
                <input 
                  type="text" 
                  value={milestone1}
                  onChange={(e) => setMilestone1(e.target.value)}
                  placeholder="Milestone 1 e.g. Finish handbook chapter 1" 
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-white outline-none focus:border-indigo-500 text-xs animate-fade-in"
                />
                <input 
                  type="text" 
                  value={milestone2}
                  onChange={(e) => setMilestone2(e.target.value)}
                  placeholder="Milestone 2 e.g. Complete practical laboratory task" 
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-white outline-none focus:border-indigo-500 text-xs"
                />
              </div>

              <div className="flex gap-2 justify-end mt-4">
                <button 
                  type="button" 
                  onClick={() => setActiveModal(null)} 
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs cursor-pointer font-semibold"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'water' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-2xl p-6 text-center">
            <Droplet className="w-12 h-12 text-sky-400 mx-auto animate-bounce mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Water Hydration Intake Log</h3>
            <p className="text-xs text-slate-400 mb-4">Logged progress: {currentWater}L of target {targetWater}L.</p>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => { addWater(0.25); setActiveModal(null); }} 
                className="w-full py-2 bg-sky-500 text-white font-semibold rounded-xl text-sm transition-transform cursor-pointer"
              >
                Log +250ml Glass
              </button>
              <button 
                onClick={() => { addWater(0.5); setActiveModal(null); }} 
                className="w-full py-2 bg-sky-600 text-white font-semibold rounded-xl text-sm transition-transform cursor-pointer"
              >
                Log +500ml Bottle
              </button>
              <button 
                onClick={() => setActiveModal(null)} 
                className="w-full py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs transition-transform cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
