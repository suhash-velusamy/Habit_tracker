import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Auth } from './modules/Auth';
import { Dashboard } from './modules/Dashboard';
import { Habits } from './modules/Habits';
import { Tasks } from './modules/Tasks';
import { SelfManagement } from './modules/SelfManagement';
import { Calendar } from './modules/Calendar';
import { AIAssistant } from './modules/AIAssistant';
import { Profile } from './modules/Profile';
import { AdminPanel } from './modules/AdminPanel';
import { 
  Compass, LayoutDashboard, Activity, CheckSquare, 
  Brain, User, ShieldAlert, Bell, Sparkles, LogOut, Menu, X, Award
} from 'lucide-react';

type Tab = 'dashboard' | 'habits' | 'tasks' | 'self-management' | 'calendar' | 'ai-assistant' | 'profile' | 'admin';

const AppContent: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasRedirectedAdmin, setHasRedirectedAdmin] = useState(false);

  const { 
    user, notifications, markNotificationsRead 
  } = useApp();

  // Check initial authentication state from localStorage token
  useEffect(() => {
    const token = localStorage.getItem('lifesync_token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Redirect to admin panel upon detecting admin role (runs once per session)
  useEffect(() => {
    if (user.role === 'admin' && !hasRedirectedAdmin) {
      setActiveTab('admin');
      setHasRedirectedAdmin(true);
    }
  }, [user.role, hasRedirectedAdmin]);

  const handleLoginSuccess = (username: string) => {
    setIsAuthenticated(true);
    localStorage.setItem('lifesync_username', username);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setHasRedirectedAdmin(false);
  };

  if (!isAuthenticated) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'habits', label: 'Habit Tracker', icon: <Award className="w-4 h-4" /> },
    { id: 'self-management', label: 'Self-Management', icon: <Compass className="w-4 h-4" /> },
    { id: 'calendar', label: 'Activity Heatmap', icon: <Activity className="w-4 h-4" /> },
    { id: 'ai-assistant', label: 'AI Productivity', icon: <Brain className="w-4 h-4 text-indigo-400" /> },
    { id: 'profile', label: 'Profile Settings', icon: <User className="w-4 h-4" /> },
  ];

  // If user is Admin, add Admin Panel to sidebar navigation
  const visibleNavItems = user.role === 'admin' 
    ? [...navItems, { id: 'admin', label: 'Admin Console', icon: <ShieldAlert className="w-4 h-4 text-rose-400" /> }]
    : navItems;

  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  const handleBellClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      markNotificationsRead();
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'LifeSync Dashboard';
      case 'habits': return 'Habit Tracker';
      case 'tasks': return 'Tasks To-Do Management';
      case 'self-management': return 'Self-Management Modules';
      case 'calendar': return 'Activity Heatmap';
      case 'ai-assistant': return 'AI Assistant & Placement Preparation Coach';
      case 'profile': return 'User Settings';
      case 'admin': return 'System Administration Panel';
      default: return 'LifeSync';
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Sidebar Navigation (Desktop) */}
      <aside className="hidden lg:flex flex-col justify-between w-64 glass-panel border-r border-slate-200/50 dark:border-slate-900/60 p-4 sticky top-0 h-screen select-none">
        <div>
          {/* Logo brand */}
          <div className="flex items-center gap-2 px-2 py-4 mb-4">
            <Compass className="w-7 h-7 text-indigo-500 animate-spin" style={{ animationDuration: '30s' }} />
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              LifeSync
            </span>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1">
            {visibleNavItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === item.id 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/10' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-100/10'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* User Sidebar Footer */}
        <div className="border-t border-slate-200/15 pt-4 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-8 h-8 rounded-full bg-slate-200/50"
            />
            <div>
              <span className="text-xs font-bold block truncate max-w-[120px]">{user.name}</span>
              <span className="text-[10px] text-indigo-400 font-semibold flex items-center gap-0.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> LVL {user.level} (XP: {user.xp})
              </span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        
        {/* Header toolbar */}
        <header className="sticky top-0 bg-slate-50/70 dark:bg-slate-950/70 backdrop-blur-md z-30 px-4 md:px-6 py-4 flex justify-between items-center border-b border-slate-200/10">
          <div className="flex items-center gap-3">
            {/* Hamburger trigger for mobile */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-lg bg-slate-200/50 dark:bg-slate-800 text-slate-400 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-black tracking-tight m-0 text-slate-900 dark:text-white">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications Bell trigger */}
            <div className="relative">
              <button 
                onClick={handleBellClick}
                className="p-2 bg-slate-200/50 dark:bg-slate-800/60 rounded-xl text-slate-500 dark:text-slate-400 hover:text-indigo-500 transition-colors relative cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>

              {/* Notifications dropdown panel container */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 glass-panel border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-4 shadow-2xl z-40 max-h-96 overflow-y-auto animate-scale-up">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Alerts & Logs</span>
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className="text-[10px] text-indigo-400 hover:underline cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {notifications.map(n => (
                      <div key={n.id} className="p-2.5 bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/5 dark:border-white/5 rounded-xl text-[10px]">
                        <div className="flex justify-between font-bold text-slate-700 dark:text-white">
                          <span>{n.title}</span>
                          <span className="text-[8px] text-slate-500">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <p className="text-xs text-slate-500 italic text-center py-6">No current alerts logged</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick header Level widget */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl font-bold text-xs select-none">
              <Award className="w-4 h-4 text-indigo-400 animate-bounce" /> Level {user.level}
            </div>
          </div>
        </header>

        {/* View content panel */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'habits' && <Habits />}
          {activeTab === 'self-management' && <SelfManagement />}
          {activeTab === 'calendar' && <Calendar />}
          {activeTab === 'ai-assistant' && <AIAssistant />}
          {activeTab === 'profile' && <Profile />}
          {activeTab === 'admin' && user.role === 'admin' && <AdminPanel />}
        </main>
      </div>

      {/* Sidebar Navigation Drawer (Mobile) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden animate-fade-in">
          {/* Overlay backdrop */}
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs" 
          />
          
          <aside className="relative flex flex-col justify-between w-64 bg-slate-900 border-r border-white/10 p-4 h-full">
            <div>
              <div className="flex justify-between items-center px-2 py-4 mb-4">
                <div className="flex items-center gap-2">
                  <Compass className="w-6 h-6 text-indigo-500" />
                  <span className="font-extrabold text-lg text-white">LifeSync</span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg bg-slate-800 text-slate-400 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {visibleNavItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id as Tab); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === item.id 
                        ? 'bg-indigo-600 text-white shadow' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="border-t border-white/10 pt-4 space-y-3">
              <div className="flex items-center gap-3 px-2 text-white">
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-8 h-8 rounded-full bg-slate-200/50"
                />
                <div>
                  <span className="text-xs font-bold block truncate max-w-[120px]">{user.name}</span>
                  <span className="text-[10px] text-indigo-400 font-semibold">
                    LVL {user.level} (XP: {user.xp})
                  </span>
                </div>
              </div>
              <button 
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
