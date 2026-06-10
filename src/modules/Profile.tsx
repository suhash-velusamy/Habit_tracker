import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Award, Shield, Flame, Mail, User, BookOpen, Clock, 
  ToggleLeft, ToggleRight, Check, Save, Settings, BellRing, Sparkles
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, updateUser, theme, toggleTheme, habits, goals, addNotification } = useApp();

  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [language, setLanguage] = useState('English');
  const [notifBrowser, setNotifBrowser] = useState(true);
  const [notifWater, setNotifWater] = useState(true);
  const [notifStudy, setNotifStudy] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  // Gamification progression calculator
  const currentLevel = user.level;
  const currentXP = user.xp;
  // Level Formula: Level = floor(sqrt(XP / 100)) + 1 -> XP range for level
  const baseXPForCurrentLevel = Math.pow(currentLevel - 1, 2) * 100;
  const targetXPForNextLevel = Math.pow(currentLevel, 2) * 100;
  const levelXPProgress = currentXP - baseXPForCurrentLevel;
  const levelXPTarget = targetXPForNextLevel - baseXPForCurrentLevel;
  const xpPercent = Math.min(100, Math.round((levelXPProgress / (levelXPTarget || 1)) * 100));

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name, bio });
    setIsSaved(true);
    addNotification('Profile Saved 👤', 'Your details have been updated.', 'reminder');
    setTimeout(() => setIsSaved(false), 2000);
  };

  const badgeTemplates = [
    { name: 'Early Bird', description: 'Complete wake up at 6:00 AM daily routine', emoji: '🌅' },
    { name: 'Consistency Master', description: 'Maintain average streak above 5 days across habits', emoji: '🏆' },
    { name: 'Coding Warrior', description: 'Unlock by completing LeetCode practice routines', emoji: '⚔' },
    { name: 'Interview Ready', description: 'Practice self-introduction and mock interview sessions', emoji: '🎤' },
    { name: 'Aptitude Champion', description: 'Complete aptitude/subject prep routines', emoji: '🧩' },
    { name: 'MERN Explorer', description: 'Learn MERN stack dev sessions completed', emoji: '🚀' },
    { name: 'Productivity Expert', description: 'Reach Level 3 in LifeSync platform rewards', emoji: '⚡' }
  ];

  const handleRequestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          addNotification('Notifications Configured 🔔', 'Browser notifications enabled for LifeSync daily reports.', 'reminder');
        }
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left Column: Avatar & Level Progression (spans 1) */}
      <div className="space-y-6">
        {/* User Card */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-between text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="relative mt-2">
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-800 border-4 border-indigo-500/30 shadow-lg"
            />
            <span className="absolute bottom-0 right-1 px-2 py-0.5 rounded-full bg-indigo-600 text-white font-extrabold text-[10px]">
              LVL {currentLevel}
            </span>
          </div>

          <div className="mt-4">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white m-0">{user.name}</h3>
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block mt-1">
              Joined {user.joinedDate}
            </span>
            <p className="text-xs text-slate-400 mt-2 italic px-3 leading-relaxed">
              "{user.bio}"
            </p>
          </div>

          {/* Level Gauge Progress bar */}
          <div className="w-full mt-6 border-t border-slate-200/10 pt-4">
            <div className="flex justify-between text-xs font-bold text-slate-400 mb-1.5">
              <span>Level Progress</span>
              <span>{levelXPProgress} / {levelXPTarget} XP ({xpPercent}%)</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 h-3 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500" 
                style={{ width: `${xpPercent}%` }} 
              />
            </div>
            <span className="text-[9px] text-slate-500 mt-2 block font-semibold">
              Gain {targetXPForNextLevel - currentXP} XP more to reach level {currentLevel + 1}!
            </span>
          </div>
        </div>

        {/* Goals Summary stats block */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
          <h3 className="text-sm font-bold tracking-tight mb-3 flex items-center gap-1.5 text-slate-800 dark:text-white">
            <Sparkles className="w-4 h-4 text-amber-500" /> Platform Statistics
          </h3>
          <div className="space-y-3.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Total Habits Registered</span>
              <span className="font-extrabold">{habits.length}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Total Goals Set</span>
              <span className="font-extrabold">{goals.length}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Total Experience Points</span>
              <span className="font-extrabold text-indigo-400">{currentXP} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Edit Profile & Settings & Badges (spans 2) */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Badges Collection Collection Grid */}
        <div className="glass-panel p-5 rounded-2xl">
          <h3 className="text-sm font-bold tracking-tight mb-2 flex items-center gap-1.5 text-slate-800 dark:text-white">
            <Award className="w-4 h-4 text-indigo-500 animate-pulse" /> Gamification Badge Collection
          </h3>
          <p className="text-[10px] text-slate-400 mb-4">
            Earn experience points by checking off study routines to unlock badges. Colored badges are unlocked.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {badgeTemplates.map(badge => {
              const isUnlocked = user.badges.includes(badge.name);

              return (
                <div 
                  key={badge.name} 
                  className={`p-3 border rounded-2xl flex flex-col items-center justify-between text-center transition-all ${
                    isUnlocked 
                      ? 'border-indigo-500/25 bg-indigo-500/5 scale-102' 
                      : 'border-slate-200/50 dark:border-slate-800/40 opacity-40 grayscale'
                  }`}
                >
                  <span className="text-3xl select-none">{badge.emoji}</span>
                  <div className="mt-2.5">
                    <span className="text-[10px] font-bold block text-slate-700 dark:text-white truncate max-w-[90px]">{badge.name}</span>
                    <span className="text-[8px] text-slate-400 block mt-1 leading-normal max-w-[100px] mx-auto">{badge.description}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Profile Settings form */}
        <div className="glass-panel p-5 rounded-2xl">
          <h3 className="text-sm font-bold tracking-tight mb-4 flex items-center gap-1.5 text-slate-800 dark:text-white">
            <Settings className="w-4 h-4 text-purple-500" /> Account Settings & Bio
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Display Name</label>
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-950 dark:text-white outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Preferred Language</label>
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-950 dark:text-white outline-none focus:border-indigo-500"
                >
                  <option value="English">English (US)</option>
                  <option value="Spanish">Spanish (ES)</option>
                  <option value="German">German (DE)</option>
                  <option value="Hindi">Hindi (IN)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Personal Bio</label>
              <textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-950 dark:text-white outline-none focus:border-indigo-500 h-16 resize-none"
                required
              />
            </div>

            <div className="flex gap-2">
              <button 
                type="submit" 
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow active:scale-98"
              >
                {isSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                {isSaved ? 'Details Saved!' : 'Save details'}
              </button>

              <button 
                type="button" 
                onClick={toggleTheme}
                className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Switch to {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </button>
            </div>
          </form>
        </div>

        {/* Notifications toggles preferences */}
        <div className="glass-panel p-5 rounded-2xl">
          <h3 className="text-sm font-bold tracking-tight mb-2 flex items-center gap-1.5 text-slate-800 dark:text-white">
            <BellRing className="w-4 h-4 text-sky-500" /> Notifications Settings & Alerts
          </h3>
          <p className="text-[10px] text-slate-400 mb-4">
            Toggle which reminders the app triggers as web pushes or local browser alerts.
          </p>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-slate-700 dark:text-white block">Browser Push Notifications</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Triggers OS level banners for alerts</span>
              </div>
              <button onClick={() => { setNotifBrowser(!notifBrowser); handleRequestNotificationPermission(); }} className="text-slate-400 cursor-pointer">
                {notifBrowser ? <ToggleRight className="w-8 h-8 text-indigo-500" /> : <ToggleLeft className="w-8 h-8" />}
              </button>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-slate-200/10 pt-3.5">
              <div>
                <span className="font-bold text-slate-700 dark:text-white block">Hydration Drink Water Tracker</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Triggers water hydration remind indicators every 2 hours</span>
              </div>
              <button onClick={() => setNotifWater(!notifWater)} className="text-slate-400 cursor-pointer">
                {notifWater ? <ToggleRight className="w-8 h-8 text-indigo-500" /> : <ToggleLeft className="w-8 h-8" />}
              </button>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-slate-200/10 pt-3.5">
              <div>
                <span className="font-bold text-slate-700 dark:text-white block">Study Reminders Checkin</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Triggers Java, Leetcode, Aptitude alerts scheduled timings</span>
              </div>
              <button onClick={() => setNotifStudy(!notifStudy)} className="text-slate-400 cursor-pointer">
                {notifStudy ? <ToggleRight className="w-8 h-8 text-indigo-500" /> : <ToggleLeft className="w-8 h-8" />}
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
