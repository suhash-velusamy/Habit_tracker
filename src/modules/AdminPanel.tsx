import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, UserMinus, ShieldAlert, CheckCircle, BarChart3, TrendingUp, 
  Trash2, UserCheck, ShieldClose, Activity 
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { adminUsers, toggleUserStatus, deleteUser, addNotification } = useApp();

  // Stats calculators
  const totalUsers = adminUsers.length;
  const activeCount = adminUsers.filter(u => u.status === 'Active').length;
  const suspendedCount = adminUsers.filter(u => u.status === 'Suspended').length;

  const handleToggle = (id: string, name: string, curStatus: string) => {
    toggleUserStatus(id);
    const nextStatus = curStatus === 'Active' ? 'Suspended' : 'Active';
    addNotification('Admin Action ⚙', `User "${name}" has been ${nextStatus.toLowerCase()}!`, 'reminder');
  };

  const handleDelete = (id: string, name: string) => {
    deleteUser(id);
    addNotification('Admin Action ⚙', `User "${name}" has been deleted from database!`, 'reminder');
  };

  return (
    <div className="space-y-6">
      
      {/* Upper Analytics row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl"><Users className="w-5 h-5" /></div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Registered</span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">{totalUsers} Users</span>
          </div>
        </div>
        <div className="glass-card p-4 rounded-xl flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl"><CheckCircle className="w-5 h-5" /></div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Active Accounts</span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">{activeCount} Users</span>
          </div>
        </div>
        <div className="glass-card p-4 rounded-xl flex items-center gap-3">
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl"><ShieldAlert className="w-5 h-5" /></div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Suspended accounts</span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">{suspendedCount} Users</span>
          </div>
        </div>
        <div className="glass-card p-4 rounded-xl flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl"><TrendingUp className="w-5 h-5" /></div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Weekly Growth</span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">+18.5%</span>
          </div>
        </div>
      </div>

      {/* Main split: Accounts table (spans 8) and visual metrics (spans 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* User table grid (spans 8) */}
        <div className="lg:col-span-8 glass-panel p-5 rounded-2xl overflow-x-auto">
          <h3 className="text-sm font-bold tracking-tight mb-4 flex items-center gap-1.5 text-slate-800 dark:text-white">
            <Users className="w-4 h-4 text-indigo-500" /> Platform Accounts Registry
          </h3>

          <table className="w-full text-left text-xs border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-slate-200/20 text-slate-400 font-bold">
                <th className="py-2.5">User Details</th>
                <th className="py-2.5">Level/XP Score</th>
                <th className="py-2.5">Role</th>
                <th className="py-2.5">Status</th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/10">
              {adminUsers.map(u => (
                <tr key={u.id} className="hover:bg-slate-100/5 transition-colors">
                  <td className="py-3.5 flex items-center gap-2.5">
                    <img 
                      src={u.avatar} 
                      alt={u.name} 
                      className="w-7 h-7 rounded-lg bg-slate-200/50"
                    />
                    <div>
                      <span className="font-bold block text-slate-700 dark:text-white">{u.name}</span>
                      <span className="text-[10px] text-slate-400">{u.email}</span>
                    </div>
                  </td>
                  <td className="py-3.5 font-bold text-indigo-400">
                    Level {Math.floor(Math.sqrt(u.xp / 100)) + 1} ({u.xp} XP)
                  </td>
                  <td className="py-3.5 uppercase font-semibold text-[10px]">
                    <span className={`px-1.5 py-0.5 rounded ${u.role === 'admin' ? 'bg-purple-500/10 text-purple-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      u.status === 'Active' 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-right space-x-1">
                    <button
                      onClick={() => handleToggle(u.id, u.name, u.status)}
                      className={`p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer ${
                        u.status === 'Active' ? 'bg-amber-500/10 hover:bg-amber-600' : 'bg-emerald-500/10 hover:bg-emerald-600'
                      }`}
                      title={u.status === 'Active' ? 'Suspend Account' : 'Activate Account'}
                    >
                      {u.status === 'Active' ? <UserMinus className="w-3.5 h-3.5 text-amber-500" /> : <UserCheck className="w-3.5 h-3.5 text-emerald-500" />}
                    </button>
                    <button
                      onClick={() => handleDelete(u.id, u.name)}
                      className="p-1.5 bg-rose-500/10 hover:bg-rose-600 rounded-lg text-rose-500 hover:text-white transition-colors cursor-pointer"
                      title="Remove Account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Growth Statistics display widget (spans 4) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel p-5 rounded-2xl">
            <h3 className="text-sm font-bold tracking-tight mb-4 flex items-center gap-1.5 text-slate-800 dark:text-white">
              <Activity className="w-4 h-4 text-purple-500" /> Server Engagement
            </h3>
            
            <div className="space-y-3.5">
              {[
                { label: 'Weekly Active Rate', percent: 88, count: '3.6k users' },
                { label: 'Daily Habit completion rate', percent: 64, count: '12.4k inputs' },
                { label: 'Average Streak lengths', percent: 76, count: '5.2 days' }
              ].map((stat, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex justify-between font-bold mb-1 text-slate-400">
                    <span>{stat.label}</span>
                    <span className="text-indigo-400">{stat.percent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800/80 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${stat.percent}%` }} />
                  </div>
                  <span className="text-[9px] text-slate-500 mt-1 block">{stat.count} logged today</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl bg-indigo-600/10 border border-indigo-500/20">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <BarChart3 className="w-4 h-4" /> System Health Status
            </h4>
            <ul className="text-[10px] space-y-1.5 text-slate-400">
              <li>• API Server latency: <strong className="text-emerald-400">12ms (Normal)</strong></li>
              <li>• MongoDB connection cluster: <strong className="text-emerald-400">Connected</strong></li>
              <li>• FCM Push notification server: <strong className="text-emerald-400">Online</strong></li>
              <li>• Firebase Auth sync status: <strong className="text-emerald-400">Synchronized</strong></li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
};
