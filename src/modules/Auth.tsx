import React, { useState } from 'react';
import { Mail, Lock, User, Compass, ShieldCheck, RefreshCw, ArrowRight } from 'lucide-react';
import { loginUser, registerUser } from '../services/api';

interface AuthProps {
  onLoginSuccess: (username: string) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'verify'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (mode === 'login') {
        if (!email || !password) {
          setMessage('Please fill in all credentials.');
          setLoading(false);
          return;
        }
        const res = await loginUser({ email, password });
        setLoading(false);
        onLoginSuccess(res.user.name);
      } else if (mode === 'register') {
        if (!email || !password || !name) {
          setMessage('Please fill in all details.');
          setLoading(false);
          return;
        }
        await registerUser({ name, email, password });
        setLoading(false);
        setMessage('Verification code sent to your email address!');
        setMode('verify');
      } else if (mode === 'forgot') {
        setLoading(false);
        setMessage('Password reset instructions sent to your email.');
      } else if (mode === 'verify') {
        if (otp.length < 4) {
          setMessage('Invalid validation code.');
          setLoading(false);
          return;
        }
        // Verification succeeds by performing login
        const res = await loginUser({ email, password });
        setLoading(false);
        onLoginSuccess(res.user.name);
      }
    } catch (err: any) {
      setLoading(false);
      setMessage(err.message || 'Authentication failed. Please check details.');
    }
  };

  const handleSocialLogin = (provider: 'Google' | 'GitHub') => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem('lifesync_token', `mock_${provider.toLowerCase()}_token`);
      onLoginSuccess(provider === 'Google' ? 'GoogleUser' : 'GitWarrior');
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-950 via-slate-900 to-indigo-950 px-4">
      {/* Dynamic Background Blur Balls */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-glow" style={{ animationDelay: '2s' }} />

      <div className="w-full max-w-md glass-card rounded-2xl p-8 border border-white/10 relative overflow-hidden">
        {/* Decorative Light Glow Top Border */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-xl mb-3 text-indigo-400">
            <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: '20s' }} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white m-0">LifeSync</h1>
          <p className="text-indigo-200/60 mt-1 text-sm">Habit Tracker, To-Dos & Placement Prep</p>
        </div>

        {message && (
          <div className={`p-3 rounded-lg mb-4 text-xs font-medium border text-center ${
            message.includes('sent') || message.includes('success') 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
          }`}>
            {message}
          </div>
        )}

        {/* Dynamic Panel Modes */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold uppercase text-indigo-300/80 mb-1 ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-300/50" />
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/40 border border-indigo-500/20 focus:border-indigo-500 rounded-xl text-white outline-none text-sm transition-colors"
                  required
                />
              </div>
            </div>
          )}

          {mode !== 'verify' && (
            <div>
              <label className="block text-xs font-semibold uppercase text-indigo-300/80 mb-1 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-300/50" />
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/40 border border-indigo-500/20 focus:border-indigo-500 rounded-xl text-white outline-none text-sm transition-colors"
                  required
                />
              </div>
            </div>
          )}

          {mode !== 'forgot' && mode !== 'verify' && (
            <div>
              <div className="flex justify-between items-center mb-1 ml-1">
                <label className="block text-xs font-semibold uppercase text-indigo-300/80">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-300/50" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/40 border border-indigo-500/20 focus:border-indigo-500 rounded-xl text-white outline-none text-sm transition-colors"
                  required
                />
              </div>
            </div>
          )}

          {mode === 'verify' && (
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <ShieldCheck className="w-10 h-10 text-emerald-400" />
              </div>
              <p className="text-xs text-indigo-200/70 mb-4">
                We've simulated sending a 6-digit verification code to <strong>{email}</strong>.
              </p>
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl p-3 text-xs mb-4 text-left font-medium">
                💡 <strong>Local Demo Mode:</strong> Since this app runs locally, enter any 6-digit code (e.g., <code>123456</code>) to verify and log in immediately.
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-indigo-300/80 mb-1">Verification Code</label>
                <input
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-32 text-center tracking-widest text-lg font-bold py-2 bg-slate-950/40 border border-indigo-500/20 focus:border-indigo-500 rounded-xl text-white outline-none transition-colors"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-indigo-950 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {mode === 'login' && 'Sign In'}
                {mode === 'register' && 'Create Account'}
                {mode === 'forgot' && 'Send Reset Email'}
                {mode === 'verify' && 'Verify & Continue'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Social Authentication Separation */}
        {mode !== 'forgot' && mode !== 'verify' && (
          <div className="mt-6">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-indigo-500/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-slate-900/80 px-2 text-indigo-300/40 uppercase">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSocialLogin('Google')}
                className="flex items-center justify-center gap-2 py-2.5 bg-slate-950/30 hover:bg-slate-950/60 border border-indigo-500/10 hover:border-indigo-500/20 text-indigo-100 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                {/* Google Clean SVG */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.18 4.114-3.51 0-6.357-2.85-6.357-6.36 0-3.51 2.846-6.36 6.357-6.36 1.623 0 3.107.61 4.249 1.62l3.056-3.056C19.349 2.59 15.992 1.3 12.24 1.3 6.253 1.3 1.4 6.153 1.4 12.14S6.253 22.98 12.24 22.98c5.875 0 10.742-4.238 10.742-10.4 0-.687-.06-1.348-.172-1.995v-.3H12.24z"/>
                </svg>
                Google
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('GitHub')}
                className="flex items-center justify-center gap-2 py-2.5 bg-slate-950/30 hover:bg-slate-950/60 border border-indigo-500/10 hover:border-indigo-500/20 text-indigo-100 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
                GitHub
              </button>
            </div>
          </div>
        )}

        {/* Form Mode Toggles */}
        <div className="mt-8 text-center text-xs">
          {mode === 'login' ? (
            <p className="text-indigo-200/50">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-indigo-400 font-bold hover:underline transition-colors"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p className="text-indigo-200/50">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-indigo-400 font-bold hover:underline transition-colors"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
