import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Play, Pause, RotateCcw, Smile, Flame, Zap, Meh, Frown, AlertTriangle, 
  BookOpen, Plus, Heart, Calendar, Clock, Check, Save, Award, Volume2
} from 'lucide-react';

export const SelfManagement: React.FC = () => {
  const { 
    planner, updateTimeBlock, journals, addJournal, addXP, addNotification, currentDateStr
  } = useApp();

  // --- Pomodoro State ---
  const [focusTime, setFocusTime] = useState(25); // Minutes
  const [breakTime, setBreakTime] = useState(5); // Minutes
  const [timeLeft, setTimeLeft] = useState(25 * 60); // Seconds
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionsCount, setSessionsCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Audio helper using Web Audio API (Zero dependencies, runs on any browser)
  const playAlarmSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(520, audioCtx.currentTime); // Sound Frequency
      gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
      
      oscillator.start();
      setTimeout(() => oscillator.stop(), 800); // Ring for 800ms
    } catch (e) {
      console.warn("AudioContext block by client policy:", e);
    }
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      playAlarmSound();

      if (!isBreak) {
        // Focus period completed
        addXP(20, 'Completed a 25-minute Focus Pomodoro Session! 🧠');
        addNotification('Focus Session Finished! ⚡', 'Time to take a break. Take a stretch or drink water!', 'reminder');
        setSessionsCount(s => s + 1);
        setIsBreak(true);
        setTimeLeft(breakTime * 60);
      } else {
        // Break finished
        addNotification('Break Finished 🔔', 'Ready to focus? Start your next Pomodoro session!', 'reminder');
        setIsBreak(false);
        setTimeLeft(focusTime * 60);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, isBreak, focusTime, breakTime]);

  const handleStartPause = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setIsBreak(false);
    setTimeLeft(focusTime * 60);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Adjust timers
  const adjustTimer = (type: 'focus' | 'break', amount: number) => {
    if (type === 'focus') {
      const newMins = Math.max(1, focusTime + amount);
      setFocusTime(newMins);
      if (!isBreak) setTimeLeft(newMins * 60);
    } else {
      const newMins = Math.max(1, breakTime + amount);
      setBreakTime(newMins);
      if (isBreak) setTimeLeft(newMins * 60);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // --- Journal & Mood State ---
  const [selectedMood, setSelectedMood] = useState<'Happy' | 'Motivated' | 'Neutral' | 'Sad' | 'Stressed'>('Happy');
  const [gratitude1, setGratitude1] = useState('');
  const [gratitude2, setGratitude2] = useState('');
  const [reflections, setReflections] = useState('');
  const [journalNotes, setJournalNotes] = useState('');

  // Check if today's journal has been saved
  const savedTodayJournal = journals.find(j => j.date === currentDateStr);

  const handleSaveJournal = (e: React.FormEvent) => {
    e.preventDefault();
    const gratitudes = [gratitude1, gratitude2].filter(g => g.trim().length > 0);
    addJournal({
      mood: selectedMood,
      gratitude: gratitudes,
      reflections,
      notes: journalNotes
    });
    setGratitude1('');
    setGratitude2('');
    setReflections('');
    setJournalNotes('');
  };

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case 'Happy': return '😊';
      case 'Motivated': return '⚡';
      case 'Neutral': return '😐';
      case 'Sad': return '😔';
      case 'Stressed': return '😰';
      default: return '😐';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Col 1: Pomodoro & Mood (left 5 spans) */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Pomodoro Focus Card */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-between text-center relative overflow-hidden h-[360px]">
          <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-full">
            <Volume2 className="w-3 h-3" /> Web Audio Alert
          </div>

          <div>
            <h3 className="text-sm font-bold tracking-tight text-slate-800 dark:text-white uppercase">
              {isBreak ? '☕ Break Session' : '🧠 Focus Mode'}
            </h3>
            <span className="text-[10px] text-slate-400">Completed Sessions today: {sessionsCount}</span>
          </div>

          {/* Circle Visual countdown */}
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* SVG Circle progress */}
            <svg className="absolute w-full h-full -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="rgba(var(--border-color), 0.2)"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke={isBreak ? '#10B981' : '#4F46E5'}
                strokeWidth="6"
                fill="transparent"
                strokeDasharray="440"
                strokeDashoffset={440 - (440 * (timeLeft / (isBreak ? breakTime * 60 : focusTime * 60)))}
                className="pomodoro-circle"
              />
            </svg>
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Time adjusting buttons */}
          <div className="flex gap-4 items-center">
            <div className="text-center">
              <span className="text-[9px] text-slate-400 block font-bold uppercase">Focus</span>
              <div className="flex items-center gap-1.5 mt-1">
                <button onClick={() => adjustTimer('focus', -1)} className="w-5 h-5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 rounded text-xs select-none cursor-pointer">-</button>
                <span className="text-xs font-bold w-5">{focusTime}</span>
                <button onClick={() => adjustTimer('focus', 1)} className="w-5 h-5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 rounded text-xs select-none cursor-pointer">+</button>
              </div>
            </div>
          </div>

          {/* Start/Pause Control panel */}
          <div className="flex gap-2">
            <button
              onClick={handleStartPause}
              className={`px-5 py-2 rounded-xl text-xs font-bold shadow transition-all flex items-center gap-1 cursor-pointer ${
                isActive 
                  ? 'bg-amber-600 hover:bg-amber-500 text-white' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isActive ? 'Pause' : 'Start Focus'}
            </button>
            <button
              onClick={handleReset}
              className="p-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-600 dark:text-slate-300 rounded-xl text-xs transition-colors cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mood select Log panel */}
        <div className="glass-panel p-5 rounded-2xl">
          <h3 className="text-sm font-bold tracking-tight mb-2 text-slate-800 dark:text-white flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-rose-500" /> Mood Log Correlation
          </h3>
          <p className="text-[10px] text-slate-400 mb-4">
            Select your mood rating today. AI will cross-reference this with your study routine.
          </p>

          <div className="grid grid-cols-5 gap-2 text-center">
            {[
              { label: 'Happy', emoji: '😊', style: 'hover:bg-emerald-500/10 text-emerald-400 hover:border-emerald-500/30' },
              { label: 'Motivated', emoji: '⚡', style: 'hover:bg-indigo-500/10 text-indigo-400 hover:border-indigo-500/30' },
              { label: 'Neutral', emoji: '😐', style: 'hover:bg-slate-500/10 text-slate-400 hover:border-slate-500/30' },
              { label: 'Sad', emoji: '😔', style: 'hover:bg-sky-500/10 text-sky-400 hover:border-sky-500/30' },
              { label: 'Stressed', emoji: '😰', style: 'hover:bg-rose-500/10 text-rose-400 hover:border-rose-500/30' }
            ].map(m => (
              <button
                key={m.label}
                onClick={() => setSelectedMood(m.label as any)}
                className={`flex flex-col items-center p-2 border rounded-xl transition-all cursor-pointer ${m.style} ${
                  selectedMood === m.label 
                    ? 'border-indigo-500 bg-indigo-500/10 scale-105 shadow-md' 
                    : 'border-slate-200/50 dark:border-slate-800/40'
                }`}
              >
                <span className="text-xl select-none">{m.emoji}</span>
                <span className="text-[8px] mt-1.5 font-bold tracking-wide uppercase">{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Col 2: Journal Entries (right 7 spans) */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Reflection Gratitude Journal logs */}
        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-purple-500" /> Gratitude & Reflection Journal
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-0.5">
              <Calendar className="w-3.5 h-3.5" /> {currentDateStr}
            </span>
          </div>

          {savedTodayJournal ? (
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-1 font-bold text-emerald-400">
                <Check className="w-4 h-4" /> Reflection Saved for Today!
              </div>
              <p className="text-slate-500 dark:text-slate-300">
                Mood logged: <strong className="text-indigo-400">{getMoodEmoji(savedTodayJournal.mood)} {savedTodayJournal.mood}</strong>
              </p>
              {savedTodayJournal.gratitude.length > 0 && (
                <div>
                  <span className="font-semibold text-slate-400 block mt-1">Grateful for:</span>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-600 dark:text-slate-300">
                    {savedTodayJournal.gratitude.map((g, idx) => <li key={idx}>{g}</li>)}
                  </ul>
                </div>
              )}
              {savedTodayJournal.reflections && (
                <div>
                  <span className="font-semibold text-slate-400 block mt-1">Journal Thoughts:</span>
                  <p className="italic text-slate-600 dark:text-slate-300">"{savedTodayJournal.reflections}"</p>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSaveJournal} className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-500" /> Gratitude Points (Write 2 things you appreciate)
                </label>
                <input
                  type="text"
                  placeholder="1. e.g. Supportive classmates, fresh morning tea"
                  value={gratitude1}
                  onChange={(e) => setGratitude1(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500 text-slate-950 dark:text-white"
                  required
                />
                <input
                  type="text"
                  placeholder="2. e.g. Understanding LinkedList structures clearly"
                  value={gratitude2}
                  onChange={(e) => setGratitude2(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500 text-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Today's Daily Reflections</label>
                <textarea
                  placeholder="What went well today? What code challenges did you solve? Where did you struggle?"
                  value={reflections}
                  onChange={(e) => setReflections(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500 text-slate-950 dark:text-white h-20 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Notes / Reminders for Tomorrow</label>
                <input
                  type="text"
                  placeholder="e.g. Schedule MERN tutorial at 3:00 PM, prepare mock interview questions"
                  value={journalNotes}
                  onChange={(e) => setJournalNotes(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500 text-slate-950 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow active:scale-98"
              >
                <Save className="w-3.5 h-3.5" /> Save Reflection Journal
              </button>
            </form>
          )}
        </div>

        {/* Daily Timeblocking Planner grid */}
        <div className="glass-panel p-5 rounded-2xl">
          <h3 className="text-sm font-bold tracking-tight mb-2 text-slate-800 dark:text-white flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-indigo-500" /> Timeblocking Hourly Planner
          </h3>
          <p className="text-[10px] text-slate-400 mb-4">
            Block out specific study or coding intervals. Complete each target to earn +5 XP levels.
          </p>

          <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
            {planner.map(block => (
              <div 
                key={block.id}
                className={`flex items-center gap-3 p-2 border rounded-xl text-xs transition-all ${
                  block.completed 
                    ? 'bg-emerald-500/5 border-emerald-500/20' 
                    : 'bg-slate-100/40 border-slate-200/40 dark:bg-slate-800/10 dark:border-slate-800/30'
                }`}
              >
                <span className="font-bold text-indigo-400 w-12 text-center">{block.hour}</span>
                <input
                  type="text"
                  value={block.task}
                  onChange={(e) => updateTimeBlock(block.id, e.target.value, block.completed)}
                  placeholder="Block out this slot e.g. Mock interview questions review"
                  className={`flex-1 bg-transparent border-none outline-none text-xs text-slate-800 dark:text-slate-200 ${
                    block.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => updateTimeBlock(block.id, block.task, !block.completed)}
                  disabled={!block.task}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center border cursor-pointer transition-all ${
                    block.completed
                      ? 'bg-emerald-500 border-emerald-600 text-white'
                      : 'border-slate-300 dark:border-slate-800 hover:border-indigo-500 text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
