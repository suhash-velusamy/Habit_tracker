import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Activity, Flame, Award, CheckCircle2, Circle, 
  Smile, Target, ListTodo, Sparkles, Filter, Calendar as CalIcon
} from 'lucide-react';

export const Calendar: React.FC = () => {
  const { habits, tasks, goals, journals, currentDateStr } = useApp();
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [selectedDateStr, setSelectedDateStr] = useState<string>(currentDateStr);
  const [hoveredCell, setHoveredCell] = useState<{
    dateStr: string;
    x: number;
    y: number;
    completed: number;
    total: number;
    rate: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Categories list derived from habits
  const categories = ['All', 'Health', 'Study', 'Coding', 'Interview Preparation', 'Learning', 'Personal Development', 'Daily Routine'];

  // Helper: Format date readable (e.g. Saturday, Jun 6, 2026)
  const formatReadableDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Helper: Formats month names
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Generate 53 weeks (371 days) starting on a Monday to fill grid columns
  const getHeatmapData = () => {
    const today = new Date();
    const start = new Date(today);
    // Go back exactly 364 days (52 weeks)
    start.setDate(today.getDate() - 364);
    
    // Align starting day to preceding Monday
    const startDay = start.getDay(); // 0 = Sun, 1 = Mon, ...
    const diffToMonday = startDay === 0 ? 6 : startDay - 1;
    start.setDate(start.getDate() - diffToMonday);

    const dates: Date[] = [];
    const current = new Date(start);

    // 53 weeks * 7 days = 371 cells
    for (let i = 0; i < 371; i++) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    const weeks: Date[][] = [];
    for (let i = 0; i < 53; i++) {
      weeks.push(dates.slice(i * 7, (i + 1) * 7));
    }

    return { weeks, start, end: dates[dates.length - 1] };
  };

  const { weeks } = getHeatmapData();

  // Helper: Calculate completion rate for a specific date and category
  const getCompletionsForDate = (dateStr: string) => {
    const filteredHabits = habits.filter(h => 
      categoryFilter === 'All' || h.category === categoryFilter
    );

    if (filteredHabits.length === 0) {
      return { completed: 0, total: 0, rate: 0, list: [] };
    }

    let completed = 0;
    const list = filteredHabits.map(h => {
      const val = h.history ? (h.history[dateStr] ?? 0) : 0;
      const isCompleted = val >= h.targetValue;
      if (isCompleted) completed++;
      return {
        id: h.id,
        name: h.name,
        category: h.category,
        value: val,
        targetValue: h.targetValue,
        completed: isCompleted,
        unit: h.unit
      };
    });

    const rate = Math.round((completed / filteredHabits.length) * 100);
    return { completed, total: filteredHabits.length, rate, list };
  };

  // Color mapper based on completion rate
  const getCellColorClass = (rate: number, isFuture: boolean) => {
    if (isFuture) return 'bg-slate-200/5 border border-dashed border-slate-700/30 cursor-not-allowed';
    if (rate === 0) return 'bg-slate-100/5 hover:bg-slate-100/10 dark:bg-slate-800/15 dark:hover:bg-slate-800/25 border border-slate-200/5 dark:border-slate-800/20';
    if (rate <= 25) return 'bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/10 text-emerald-400';
    if (rate <= 50) return 'bg-emerald-500/30 hover:bg-emerald-500/40 border border-emerald-500/20 text-emerald-300';
    if (rate <= 75) return 'bg-emerald-500/60 hover:bg-emerald-500/70 border border-emerald-500/40 text-emerald-200';
    return 'bg-emerald-500 hover:bg-emerald-400 border border-emerald-400 text-slate-950 shadow-sm shadow-emerald-500/20';
  };

  // Calculate stats based on current filter
  const getOverallStats = () => {
    const allDates = new Set<string>();
    habits.forEach(h => {
      if (h.history) {
        Object.keys(h.history).forEach(dateStr => {
          allDates.add(dateStr);
        });
      }
    });

    let totalCompletions = 0;
    let activeDays = 0;
    let perfectDays = 0;

    allDates.forEach(dateStr => {
      const stats = getCompletionsForDate(dateStr);
      if (stats.completed > 0) {
        totalCompletions += stats.completed;
        activeDays++;
        if (stats.completed === stats.total) {
          perfectDays++;
        }
      }
    });

    // Longest Streak calculation based on history completions
    let currentStreak = 0;
    let longestStreak = 0;
    
    
    // Check consecutive days starting from today backward
    const today = new Date(currentDateStr);
    let checkDate = new Date(today);
    for (let i = 0; i < 365; i++) {
      const checkStr = checkDate.toISOString().split('T')[0];
      const stats = getCompletionsForDate(checkStr);
      if (stats.completed > 0) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Longest streak in history
    let tempStreak = 0;
    const historyDates = Array.from(allDates).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    let prevTime: number | null = null;
    
    historyDates.forEach(dateStr => {
      const stats = getCompletionsForDate(dateStr);
      if (stats.completed > 0) {
        const currTime = new Date(dateStr).getTime();
        if (prevTime === null) {
          tempStreak = 1;
        } else {
          const diffDays = (currTime - prevTime) / (1000 * 60 * 60 * 24);
          if (diffDays <= 1.1) { // consecutive day
            tempStreak++;
          } else {
            tempStreak = 1;
          }
        }
        if (tempStreak > longestStreak) longestStreak = tempStreak;
        prevTime = currTime;
      }
    });

    return { totalCompletions, activeDays, perfectDays, currentStreak, longestStreak };
  };

  const stats = getOverallStats();

  // Selected Date detailed info
  const selectedCompletions = getCompletionsForDate(selectedDateStr);
  const selectedTasks = tasks.filter(t => t.dueDate === selectedDateStr);
  const selectedGoals = goals.filter(g => g.deadline === selectedDateStr);
  const selectedJournal = journals.find(j => j.date === selectedDateStr);

  // Generate Month Label Positioning
  const monthLabels: { index: number; label: string }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, index) => {
    const midDay = week[3];
    if (midDay) {
      const m = midDay.getMonth();
      if (m !== lastMonth) {
        monthLabels.push({ index, label: monthNames[m] });
        lastMonth = m;
      }
    }
  });

  return (
    <div className="space-y-6">
      
      {/* 1. Metric Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl flex items-center gap-4 border border-slate-200/50 dark:border-slate-800/40">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Actions</span>
            <span className="text-xl font-black text-slate-900 dark:text-white mt-0.5 block">{stats.totalCompletions}</span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl flex items-center gap-4 border border-slate-200/50 dark:border-slate-800/40">
          <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Current Streak</span>
            <span className="text-xl font-black text-slate-900 dark:text-white mt-0.5 block">{stats.currentStreak} Days</span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl flex items-center gap-4 border border-slate-200/50 dark:border-slate-800/40">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Perfect Days</span>
            <span className="text-xl font-black text-slate-900 dark:text-white mt-0.5 block">{stats.perfectDays} Days</span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl flex items-center gap-4 border border-slate-200/50 dark:border-slate-800/40">
          <div className="p-3 bg-pink-500/10 text-pink-400 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Active Days</span>
            <span className="text-xl font-black text-slate-900 dark:text-white mt-0.5 block">{stats.activeDays} Days</span>
          </div>
        </div>
      </div>

      {/* 2. Main Heatmap View */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 relative">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <CalIcon className="w-4 h-4 text-emerald-400" /> Habit Completion Grid
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">Visualize your habit completions and active routine streaks over the past 12 months.</p>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto bg-slate-200/50 dark:bg-slate-800/30 p-1.5 rounded-xl border border-slate-200/10">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent border-0 text-[11px] font-bold text-slate-700 dark:text-white outline-none cursor-pointer pr-4"
            >
              {categories.map(cat => (
                <option key={cat} value={cat} className="bg-slate-950 text-slate-300 font-semibold">{cat} Category</option>
              ))}
            </select>
          </div>
        </div>

        {/* Heatmap Grid Wrapper */}
        <div ref={containerRef} className="relative w-full overflow-x-auto pr-2 pb-4 pt-1 scrollbar-thin select-none">
          {/* Months label row */}
          <div className="flex text-[9px] text-slate-500 font-bold mb-1.5 h-4 min-w-[850px] pl-[32px] relative">
            {monthLabels.map(({ index, label }) => (
              <span 
                key={index} 
                className="absolute" 
                style={{ left: `${32 + index * 15.3}px` }}
              >
                {label}
              </span>
            ))}
          </div>

          <div className="flex gap-[3.2px] min-w-[850px]">
            {/* Weekday indicators column */}
            <div className="flex flex-col justify-between text-[9px] font-bold text-slate-500 w-[24px] pr-2.5 h-[105px] pt-1">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
              <span>Sun</span>
            </div>

            {/* Contribution Grid Columns */}
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-[3.2px]">
                {week.map((date, dIdx) => {
                  const dateStr = date.toISOString().split('T')[0];
                  const isTodayStr = dateStr === currentDateStr;
                  const isSelected = dateStr === selectedDateStr;
                  const todayObj = new Date(currentDateStr);
                  const isFuture = date > todayObj;
                  const statsForDay = getCompletionsForDate(dateStr);
                  
                  return (
                    <div 
                      key={dIdx}
                      onClick={() => {
                        if (!isFuture) setSelectedDateStr(dateStr);
                      }}
                      onMouseEnter={(e) => {
                        if (isFuture) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        const containerRect = containerRef.current?.getBoundingClientRect();
                        if (containerRect) {
                          setHoveredCell({
                            dateStr,
                            x: rect.left - containerRect.left + rect.width / 2,
                            y: rect.top - containerRect.top,
                            completed: statsForDay.completed,
                            total: statsForDay.total,
                            rate: statsForDay.rate
                          });
                        }
                      }}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`w-[12px] h-[12px] rounded-[3px] transition-all cursor-pointer ${
                        getCellColorClass(statsForDay.rate, isFuture)
                      } ${
                        isTodayStr ? 'outline outline-1 outline-indigo-500 outline-offset-1' : ''
                      } ${
                        isSelected ? 'ring-2 ring-white scale-110 shadow-md' : ''
                      }`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend Row */}
        <div className="flex justify-between items-center text-[10px] text-slate-400 mt-4 border-t border-slate-200/5 dark:border-slate-800/40 pt-4">
          <span>Click any cell to inspect detailed logged achievements</span>
          <div className="flex items-center gap-1.5 font-semibold text-slate-400">
            <span>Less</span>
            <div className="w-[10px] h-[10px] rounded-[2.5px] bg-slate-100/5 dark:bg-slate-800/15 border border-slate-200/5 dark:border-slate-800/20" />
            <div className="w-[10px] h-[10px] rounded-[2.5px] bg-emerald-500/15 border border-emerald-500/10" />
            <div className="w-[10px] h-[10px] rounded-[2.5px] bg-emerald-500/30 border border-emerald-500/20" />
            <div className="w-[10px] h-[10px] rounded-[2.5px] bg-emerald-500/60 border border-emerald-500/40" />
            <div className="w-[10px] h-[10px] rounded-[2.5px] bg-emerald-500 border border-emerald-400" />
            <span>More</span>
          </div>
        </div>

        {/* Hover Tooltip Render */}
        {hoveredCell && (
          <div 
            className="absolute z-50 bg-slate-950/95 border border-slate-800/80 p-2.5 rounded-xl shadow-xl text-[10px] space-y-1 backdrop-blur-md min-w-[150px] pointer-events-none transition-all duration-150 animate-scale-up"
            style={{ 
              left: `${hoveredCell.x}px`, 
              top: `${hoveredCell.y - 65}px`,
              transform: 'translateX(-50%)'
            }}
          >
            <div className="font-extrabold text-slate-200">{formatReadableDate(hoveredCell.dateStr)}</div>
            <div className="flex items-center gap-1 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{hoveredCell.completed} / {hoveredCell.total} habits completed ({hoveredCell.rate}%)</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Detailed Inspection Card for Selected Date */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Habits Checklist for Selected Date */}
        <div className="lg:col-span-7 glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-400" /> Habits - {formatReadableDate(selectedDateStr)}
            </h4>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-md font-bold">
              {selectedCompletions.completed}/{selectedCompletions.total} Completed
            </span>
          </div>

          <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
            {selectedCompletions.list.map((h) => (
              <div 
                key={h.id} 
                className={`p-3 rounded-xl flex items-center justify-between gap-4 border transition-all ${
                  h.completed 
                    ? 'bg-emerald-500/5 border-emerald-500/10' 
                    : 'bg-slate-100/30 dark:bg-slate-900/40 border-slate-200/10 dark:border-slate-800/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  {h.completed ? (
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <Circle className="w-4.5 h-4.5 text-slate-500 flex-shrink-0" />
                  )}
                  <div>
                    <span className={`text-xs font-bold ${h.completed ? 'text-slate-200' : 'text-slate-400'}`}>
                      {h.name}
                    </span>
                    <span className="text-[9px] font-semibold text-slate-500 block mt-0.5">{h.category}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[10px] font-bold ${h.completed ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {h.value} / {h.targetValue} {h.unit}
                  </span>
                  <div className="w-16 bg-slate-200/10 rounded-full h-1 mt-1 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${h.completed ? 'bg-emerald-400' : 'bg-slate-500'}`}
                      style={{ width: `${Math.min(100, (h.value / h.targetValue) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}

            {selectedCompletions.list.length === 0 && (
              <div className="text-center text-xs text-slate-500 py-12 italic">
                No habits matches filter category.
              </div>
            )}
          </div>
        </div>

        {/* Tasks, Goals, and Journals for Selected Date */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Tasks Due Card */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ListTodo className="w-4 h-4 text-purple-400" /> Tasks Scheduled
            </h4>
            <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
              {selectedTasks.map((t) => (
                <div 
                  key={t.id} 
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                    t.status === 'done'
                      ? 'bg-purple-500/5 border-purple-500/10 text-slate-400 line-through'
                      : 'bg-slate-100/30 dark:bg-slate-900/40 border-slate-200/10 dark:border-slate-800/20 text-slate-200'
                  }`}
                >
                  <span>{t.name}</span>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                    t.priority === 'High' ? 'bg-rose-500/10 text-rose-400' :
                    t.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-slate-500/10 text-slate-400'
                  }`}>
                    {t.priority}
                  </span>
                </div>
              ))}

              {selectedTasks.length === 0 && (
                <p className="text-xs text-slate-500 italic text-center py-6">No tasks due on this date</p>
              )}
            </div>
          </div>

          {/* Goal Milestones Card */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-amber-400" /> Goal Deadlines
            </h4>
            <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
              {selectedGoals.map((g) => (
                <div 
                  key={g.id} 
                  className="p-2.5 bg-slate-100/30 dark:bg-slate-900/40 border border-slate-200/10 dark:border-slate-800/20 rounded-xl text-xs font-semibold text-slate-300 flex justify-between items-center"
                >
                  <span>{g.name}</span>
                  <span className="text-[9px] font-bold text-amber-400">{g.progress}% Complete</span>
                </div>
              ))}

              {selectedGoals.length === 0 && (
                <p className="text-xs text-slate-500 italic text-center py-6">No goal deadlines due today</p>
              )}
            </div>
          </div>

          {/* Daily Journal Reflection Card */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Smile className="w-4 h-4 text-pink-400" /> Mood & Journal Logs
            </h4>
            {selectedJournal ? (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">Logged Mood:</span>
                  <span className="text-xs font-black text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-md">
                    {selectedJournal.mood}
                  </span>
                </div>
                <div className="text-xs font-medium text-slate-300 bg-slate-100/30 dark:bg-slate-900/40 border border-slate-200/10 dark:border-slate-800/20 p-2.5 rounded-xl leading-relaxed italic">
                  "{selectedJournal.reflections}"
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic text-center py-6">No journal diary entries logged</p>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
