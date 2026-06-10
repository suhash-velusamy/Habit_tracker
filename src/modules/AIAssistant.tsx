import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { chatAI } from '../services/api';
import {   Sparkles, Send, Brain, ShieldAlert, Award, Calendar, CheckSquare, 
  HelpCircle, Code, Star, Loader2, ArrowRight, BookOpen
} from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const AIAssistant: React.FC = () => {
  const { habits, tasks, goals } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      sender: 'ai', 
      text: "Hello! I am your LifeSync AI Coach. I'm here to analyze your placement prep progress, mentor you on coding challenges, or practice mock interview questions. What shall we focus on today?", 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [aiPersona, setAiPersona] = useState<'coach' | 'mentor' | 'interviewer'>('coach');
  
  // Placement Analysis state
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisReport, setAnalysisReport] = useState<string | null>(null);
  
  // Daily planner state
  const [plannerLoading, setPlannerLoading] = useState(false);
  const [aiStudyPlan, setAiStudyPlan] = useState<string[] | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- Helper: Inspect Actual Progress Stats ---
  const getPrepStat = (keyword: string) => {
    const habit = habits.find(h => h.name.toLowerCase().includes(keyword.toLowerCase()));
    if (!habit) return 30; // default baseline
    const completed = habit.streak; // use streak as mock progress indicator
    return Math.min(100, Math.round((completed / 15) * 100)); 
  };

  const javaProgress = getPrepStat('java');
  const mernProgress = getPrepStat('mern');
  const leetcodeProgress = getPrepStat('leetcode');
  const aptitudeProgress = getPrepStat('aptitude');
  const interviewProgress = getPrepStat('interview');

  const overallReadiness = Math.round((javaProgress + mernProgress + leetcodeProgress + aptitudeProgress + interviewProgress) / 5) || 45;

  // --- Handle Custom Chat Prompt Responses ---
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    const prompt = inputText;
    setInputText('');

    try {
      const data = await chatAI(prompt, aiPersona);
      const aiMsg: ChatMessage = {
        sender: 'ai',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('AI chat failed:', err);
      const errorMsg: ChatMessage = {
        sender: 'ai',
        text: "I'm having trouble connecting to my service right now. Please try again in a moment.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  const triggerChipPrompt = (text: string) => {
    setInputText(text);
  };

  // --- Run Placement Readiness Analyzer ---
  const runReadinessAnalysis = () => {
    setAnalyzing(true);
    setAnalysisReport(null);

    setTimeout(() => {
      setAnalyzing(false);
      setAnalysisReport(`### LifeSync AI placement Readiness Report
* **Java DSA Index**: ${javaProgress}% (Good concepts, focus on graph traversal recursion structures).
* **MERN Stack Readiness**: ${mernProgress}% (Capable in state bindings, needs express database schema wiring review).
* **LeetCode solved rate**: ${leetcodeProgress}% (Active streaks are excellent. Maintain consistency to boost confidence).
* **Quantitative Aptitude**: ${aptitudeProgress}% (Practice time-speed-distance shortcuts).
* **Interview Readiness**: ${interviewProgress}% (Self-introduction is structured. Practice answers for behavioral mock questions).

**Action Plan**: Boost MERN Stack practice session to 45 mins. Solve 1 dynamic programming problem on LeetCode by tomorrow.`);
    }, 1500);
  };

  // --- Run AI Daily Study Planner ---
  const generateStudyPlan = () => {
    setPlannerLoading(true);
    setAiStudyPlan(null);

    setTimeout(() => {
      setPlannerLoading(false);
      setAiStudyPlan([
        "🌅 06:00 AM - 07:00 AM: Wake up, schedule preparation routine & planning review",
        "💻 09:00 AM - 10:30 AM: Java Prep - HashMaps collisions and LinkedList reversals",
        "🧩 11:30 AM - 12:30 PM: Aptitude practice - 5 quantitative questions",
        "🌐 03:00 PM - 04:30 PM: Learn MERN - Express routers setup & controller wiring",
        "🚀 05:00 PM - 06:00 PM: LeetCode challenge - Two sum two-pointer algorithm",
        "🎤 08:00 PM - 09:00 PM: Mock Interview - Practice self-introduction in mirror"
      ]);
    }, 1200);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Left Column: Analyzer (spans 5) */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Placement Readiness dashboard cards */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
          <h3 className="text-sm font-bold tracking-tight mb-4 flex items-center gap-1.5">
            <Brain className="w-4 h-4 text-indigo-500 animate-pulse" /> Placement Prep Analyzer
          </h3>

          <div className="text-center py-4 bg-slate-100/50 dark:bg-slate-800/20 border border-slate-200/40 dark:border-slate-800/60 rounded-xl mb-4">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Overall Readiness Score</span>
            <span className="text-3xl font-black text-indigo-500">{overallReadiness}%</span>
            <div className="w-32 bg-slate-200 dark:bg-slate-800 h-2 rounded-full mx-auto mt-2 overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${overallReadiness}%` }} />
            </div>
          </div>

          <div className="space-y-3.5">
            {[
              { label: 'Java DSA Prep', value: javaProgress, color: 'bg-indigo-500' },
              { label: 'MERN Stack dev', value: mernProgress, color: 'bg-purple-500' },
              { label: 'LeetCode algorithms', value: leetcodeProgress, color: 'bg-indigo-500' },
              { label: 'Aptitude tests', value: aptitudeProgress, color: 'bg-amber-500' },
              { label: 'Interview readiness', value: interviewProgress, color: 'bg-emerald-500' }
            ].map((skill, idx) => (
              <div key={idx} className="text-xs">
                <div className="flex justify-between font-bold mb-1 text-slate-600 dark:text-slate-300">
                  <span>{skill.label}</span>
                  <span>{skill.value}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${skill.color}`} style={{ width: `${skill.value}%` }} />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={runReadinessAnalysis}
            disabled={analyzing}
            className="w-full py-2.5 mt-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow"
          >
            {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Analyze Placement Readiness
          </button>
        </div>

        {/* Dynamic Study Schedule planner widget */}
        <div className="glass-panel p-5 rounded-2xl">
          <h3 className="text-sm font-bold tracking-tight mb-2 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-500" /> AI Daily study planner
          </h3>
          <p className="text-[10px] text-slate-400 mb-4">
            Generate an optimized hourly study plan mapping all your placement targets.
          </p>

          {aiStudyPlan ? (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1 animate-fade-in">
              {aiStudyPlan.map((step, idx) => (
                <div key={idx} className="p-2 bg-emerald-500/5 border border-emerald-500/20 text-[10px] text-slate-300 rounded-lg">
                  {step}
                </div>
              ))}
              <button 
                onClick={() => setAiStudyPlan(null)} 
                className="w-full mt-2 text-center text-[10px] text-slate-400 hover:underline cursor-pointer"
              >
                Reset Study Plan
              </button>
            </div>
          ) : (
            <button
              onClick={generateStudyPlan}
              disabled={plannerLoading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow"
            >
              {plannerLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
              Generate study Schedule
            </button>
          )}
        </div>
      </div>

      {/* Right Column: Chatbot Container & reports display (spans 7) */}
      <div className="lg:col-span-7 flex flex-col justify-between glass-panel p-5 rounded-2xl h-[560px]">
        {/* Chat Header Persona switcher */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white m-0">LifeSync AI Mentor</h3>
              <span className="text-[10px] text-slate-400">Persona: {aiPersona === 'coach' ? 'Productivity Coach' : aiPersona === 'mentor' ? 'Coding Mentor' : 'Interview Guide'}</span>
            </div>
          </div>

          <div className="flex gap-1 bg-slate-200/50 dark:bg-slate-800/40 p-0.5 rounded-lg text-[10px]">
            <button 
              onClick={() => setAiPersona('coach')} 
              className={`px-2.5 py-1 rounded cursor-pointer ${aiPersona === 'coach' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              Coach
            </button>
            <button 
              onClick={() => setAiPersona('mentor')} 
              className={`px-2.5 py-1 rounded cursor-pointer ${aiPersona === 'mentor' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              Mentor
            </button>
            <button 
              onClick={() => setAiPersona('interviewer')} 
              className={`px-2.5 py-1 rounded cursor-pointer ${aiPersona === 'interviewer' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              Interviewer
            </button>
          </div>
        </div>

        {/* Scrollable messages and reports area */}
        <div className="flex-1 overflow-y-auto my-4 space-y-4 pr-1">
          {analysisReport && (
            <div className="p-4 bg-indigo-500/15 border border-indigo-500/20 text-slate-700 dark:text-slate-200 rounded-2xl text-xs space-y-2 animate-fade-in relative">
              <div className="absolute top-2 right-2 text-indigo-400 font-bold uppercase tracking-wider text-[8px] px-1.5 py-0.5 rounded bg-indigo-500/10">Report</div>
              <h4 className="font-bold flex items-center gap-1.5"><Brain className="w-4 h-4" /> Readiness Analysis Feedback</h4>
              
              <div className="whitespace-pre-line leading-relaxed">
                {analysisReport}
              </div>

              <button 
                onClick={() => setAnalysisReport(null)} 
                className="text-[10px] text-indigo-400 hover:underline block mt-2 cursor-pointer"
              >
                Clear Report
              </button>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-scale-up`}
            >
              <div 
                className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-slate-100/60 border border-slate-200/50 dark:bg-slate-800/40 dark:border-slate-800/60 text-slate-800 dark:text-slate-100 rounded-bl-none'
                }`}
              >
                <p className="m-0">{msg.text}</p>
                <span className={`text-[8px] mt-1.5 block text-right ${msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Suggested chips and typing bar */}
        <div>
          {/* Action Chips */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {[
              "Review my LeetCode progress",
              "Suggest mock Java interview questions",
              "Give me a quantitative aptitude riddle",
              "Suggest a stress relief routine"
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => triggerChipPrompt(chip)}
                className="text-[9px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 border border-slate-200/15 dark:border-slate-800/40 text-slate-500 dark:text-slate-300 rounded-full px-2.5 py-1 transition-colors cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Form input bar */}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              placeholder="Ask for advice, coding hints, or study planner details..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-850 dark:text-white outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow cursor-pointer transition-colors active:scale-98"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
