import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Plus, CheckCircle2, Flame, BarChart3, Settings, 
  LogOut, LayoutDashboard, Loader2, Trophy, Clock, X, Trash2,
  Calendar, Repeat, TrendingUp, Globe, ArrowLeft, User, Shield, Bell
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const isLogging = useRef(false); 
  
  const [view, setView] = useState('dashboard'); // 'dashboard', 'analytics', or 'settings'
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [newHabit, setNewHabit] = useState({ 
    name: '', category: 'Coding', frequency: 'Daily', frequencyValue: '', reminderTime: '08:00' 
  });

  // 1. Unified Fetch Logic (Supports Midnight Reset via Backend Aggregation)
  const fetchDashboardData = useCallback(async (isSilent = false) => {
    if (!user?.id) return;
    try {
      if (!isSilent) setLoading(true); 
      const res = await api.get(`/habits/user/${user.id}`);
      setHabits(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch error", err);
      setHabits([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (view === 'dashboard') fetchDashboardData();
  }, [fetchDashboardData, view]);

  // 2. Idempotent Toggle Logic (Prevents 400 Bad Request Errors)
  const handleToggleComplete = async (habitId) => {
    if (isLogging.current) return;
    const targetHabit = habits.find(h => h.id === habitId);
    if (!targetHabit || targetHabit.completedToday) return;

    isLogging.current = true;
    
    // Optimistic UI Update
    setHabits(prev => prev.map(h => 
      h.id === habitId ? { ...h, completedToday: true, streak: (h.streak || 0) + 1 } : h
    ));

    try {
      await api.post('/tracking/log', { habitId, userId: user.id });
    } catch (err) {
      // If server returns 400, it means it's already logged (Idempotency)
      if (err.response?.status !== 400) {
        console.error("Real system failure", err);
        fetchDashboardData(true); 
      }
    } finally {
      // Small delay to prevent double-tap race conditions
      setTimeout(() => { isLogging.current = false; }, 500);
    }
  };

  const createHabit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/habits/create', { ...newHabit, userId: user.id });
      setShowModal(false);
      setNewHabit({ name: '', category: 'Coding', frequency: 'Daily', frequencyValue: '', reminderTime: '08:00' });
      fetchDashboardData();
    } catch (err) { console.error("Creation failed"); }
  };

  const handleDelete = async (habitId) => {
    if (!window.confirm("Remove this ritual?")) return;
    try {
      await api.delete(`/habits/${habitId}`);
      setHabits(prev => prev.filter(h => h.id !== habitId));
    } catch (err) { alert("Delete failed."); }
  };

  if (!user) return null;

  // --- VIEW SWITCHER ---
  const renderView = () => {
    if (view === 'analytics') return <AnalyticsPage onBack={() => setView('dashboard')} />;
    if (view === 'settings') return <SettingsPage user={user} onBack={() => setView('dashboard')} />;
    
    return (
      <main className="flex-1 p-12 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter">My Daily Rituals</h1>
            <p className="text-slate-500 font-medium italic">Systems over goals.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-indigo-600 transition-all shadow-2xl active:scale-95"
          >
            <Plus size={22} strokeWidth={3}/> New Habit
          </button>
        </header>

        {loading ? (
          <div className="flex justify-center py-32"><Loader2 className="animate-spin text-indigo-600" size={48} /></div>
        ) : (
          <div className="space-y-16">
            <HabitSection title="Still To Do" habits={habits.filter(h => !h.completedToday)} onTick={handleToggleComplete} onDelete={handleDelete} />
            <HabitSection title="Victory Lap" habits={habits.filter(h => h.completedToday)} completed onDelete={handleDelete} />
          </div>
        )}
      </main>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans selection:bg-indigo-100">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200/60 p-8 flex flex-col sticky top-0 h-screen">
        <div className="flex items-center gap-4 mb-12 group cursor-pointer" onClick={() => setView('dashboard')}>
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-2.5 rounded-2xl shadow-xl shadow-indigo-200 rotate-3 transition-transform group-hover:rotate-0">
            <Trophy className="text-white" size={24} />
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tighter">HabitFlow</span>
        </div>
        
        <nav className="flex-1 space-y-2">
          <div onClick={() => setView('dashboard')}>
            <SidebarLink icon={<LayoutDashboard size={20}/>} label="Dashboard" active={view === 'dashboard'} />
          </div>
          <div onClick={() => setView('analytics')}>
            <SidebarLink icon={<BarChart3 size={20}/>} label="Analytics" active={view === 'analytics'} />
          </div>
          <div onClick={() => setView('settings')}>
            <SidebarLink icon={<Settings size={20}/>} label="Settings" active={view === 'settings'} />
          </div>
        </nav>

        <div className="bg-slate-50 rounded-3xl p-6 mb-8 border border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Developer</p>
          <p className="text-sm font-black text-slate-800 truncate">{user.username}</p>
          <p className="text-[10px] text-indigo-600 font-bold tracking-tight uppercase">RMK CSE '26</p>
        </div>

        <button onClick={logout} className="flex items-center gap-3 text-slate-400 hover:text-red-500 transition-all p-3 font-bold text-sm group">
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> Logout
        </button>
      </aside>

      {renderView()}

      {showModal && (
        <HabitModal onClose={() => setShowModal(false)} onSubmit={createHabit} setNewHabit={setNewHabit} newHabit={newHabit} />
      )}
    </div>
  );
};

// --- ANALYTICS PAGE (Fixed NaN Mastery) ---
const AnalyticsPage = ({ onBack }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ global: [], performance: [], heatmap: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [globalRes, perfRes, heatRes] = await Promise.all([
          api.get('/analytics/global/categories'),
          api.get(`/analytics/user/${user.id}/performance`),
          api.get(`/analytics/user/${user.id}/heatmap`)
        ]);
        setStats({ 
          global: globalRes.data || [], 
          performance: perfRes.data || [], 
          heatmap: heatRes.data || [] 
        });
      } catch (err) { console.error("Analytics failed"); } 
      finally { setLoading(false); }
    };
    fetchAnalytics();
  }, [user.id]);

  if (loading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={48} /></div>;

  return (
    <div className="flex-1 p-12 max-w-7xl mx-auto w-full animate-in slide-in-from-right-4 duration-500">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold mb-8 group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform"/> Back to Rituals
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-4">
            <TrendingUp className="text-indigo-600" size={28}/> Category Mastery
          </h2>
          <div className="space-y-10">
            {stats.performance.map((item, i) => {
              const safeScore = isNaN(item.score) || !item.score ? 0 : item.score;
              return (
                <div key={i}>
                  <div className="flex justify-between mb-3 items-end">
                    <span className="font-bold text-slate-700 text-lg">{item._id}</span>
                    <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-100">
                      {Math.round(safeScore)}% Success
                    </span>
                  </div>
                  <div className="w-full h-4 bg-slate-50 rounded-full overflow-hidden p-0.5 border border-slate-100">
                    <div className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${safeScore}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10"><Globe size={120} /></div>
          <h2 className="text-2xl font-black mb-10 flex items-center gap-4 relative z-10"><Globe className="text-indigo-400" /> Global meta</h2>
          <div className="space-y-6 relative z-10">
            {stats.global.slice(0, 5).map((item, i) => (
              <div key={i} className="flex justify-between p-5 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
                <span className="font-bold tracking-tight">{item._id}</span>
                <span className="text-indigo-400 font-black tracking-widest">{item.count} USERS</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingsPage = ({ user, onBack }) => (
  <div className="flex-1 p-12 max-w-4xl mx-auto w-full animate-in slide-in-from-bottom-4 duration-500">
    <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold mb-8 group">
      <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform"/> Back to Dashboard
    </button>
    <h1 className="text-5xl font-black text-slate-900 mb-2 tracking-tight">System Settings</h1>
    <p className="text-slate-500 font-medium mb-12 italic">Identity and Security Protocol.</p>
    
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-100 transition-colors">
        <div className="flex items-center gap-6">
          <div className="bg-slate-100 p-5 rounded-3xl text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors"><User size={28}/></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Authenticated Developer</p>
            <p className="font-black text-slate-800 text-2xl tracking-tight">{user.username}</p>
          </div>
        </div>
        <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg active:scale-95">Edit Profile</button>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-100 transition-colors">
        <div className="flex items-center gap-6">
          <div className="bg-slate-100 p-5 rounded-3xl text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors"><Shield size={28}/></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Security Status</p>
            <p className="font-black text-slate-800 text-2xl tracking-tight">Encryption Active</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-emerald-500 font-black text-xs uppercase bg-emerald-50 px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Secure
        </div>
      </div>

      <div className="bg-indigo-600 p-10 rounded-[3rem] text-white shadow-2xl shadow-indigo-100 flex items-center justify-between relative overflow-hidden group">
        <div className="absolute right-0 top-0 p-12 opacity-10 group-hover:scale-110 transition-transform"><Trophy size={140} /></div>
        <div className="flex items-center gap-8 relative z-10">
          <div className="bg-white/20 p-5 rounded-3xl text-white"><Bell size={32}/></div>
          <div>
            <p className="text-xs font-bold text-indigo-200 uppercase tracking-[0.2em] mb-2">Campus Credentials</p>
            <p className="font-black text-3xl tracking-tighter">RMK CSE - CLASS OF 2026</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);



const HabitSection = ({ title, habits, onTick, onDelete, completed }) => (
  <section className={completed ? "opacity-75" : ""}>
    <h2 className={`text-xs font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-3 ${completed ? 'text-emerald-500' : 'text-slate-400'}`}>
      <span className={`w-8 h-[2px] ${completed ? 'bg-emerald-100' : 'bg-slate-200'}`}></span> {title}
    </h2>
    <div className="grid lg:grid-cols-2 gap-8">
      {habits.map(habit => (
        <HabitCard key={habit.id} habit={habit} onTick={onTick} onDelete={onDelete} completed={completed} />
      ))}
    </div>
  </section>
);

const HabitCard = ({ habit, onTick, onDelete, completed }) => (
  <div className={`bg-white p-8 rounded-[2.5rem] border transition-all flex items-center justify-between group ${completed ? 'border-emerald-100 bg-emerald-50/10' : 'border-slate-100 hover:shadow-2xl hover:-translate-y-1'}`}>
    <div className="flex items-center gap-6">
      <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-colors ${completed ? 'bg-emerald-500' : 'bg-indigo-50 group-hover:bg-indigo-600'}`}>
        {completed ? <CheckCircle2 className="text-white" size={32} /> : <Clock className={`group-hover:text-white transition-colors ${completed ? 'text-white' : 'text-indigo-600'}`} size={32} />}
      </div>
      <div>
        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
          {habit?.category || 'Dev Ritual'}
        </p>
        <p className={`text-2xl font-black tracking-tight ${completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
          {habit?.name}
        </p>
        <div className="flex items-center gap-4 mt-3">
          <span className="flex items-center gap-1.5 text-xs font-black text-orange-500 uppercase tracking-wider">
            <Flame size={16} fill="currentColor"/> {habit?.streak || 0} Streak
          </span>
          <span className="text-[10px] font-bold text-slate-400 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-2">
            <Calendar size={12}/> {habit?.frequency} • {habit?.reminderTime}
          </span>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-3">
      {!completed && (
        <button onClick={() => onTick(habit.id)} className="bg-white border-2 border-slate-100 p-4 rounded-2xl text-slate-300 hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm active:scale-90 hover:shadow-indigo-100">
          <CheckCircle2 size={24} strokeWidth={3}/>
        </button>
      )}
      <button onClick={() => onDelete(habit.id)} className="p-4 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <Trash2 size={22} />
      </button>
    </div>
  </div>
);

const HabitModal = ({ onClose, onSubmit, setNewHabit, newHabit }) => (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-in fade-in duration-300">
    <div className="bg-white rounded-[3.5rem] p-12 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200 relative">
      <button onClick={onClose} className="absolute top-10 right-10 text-slate-300 hover:text-slate-600 transition-colors"><X size={28} /></button>
      <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter">New Habit</h2>
      <p className="text-slate-500 font-medium mb-10">Configure your daily performance system.</p>
      
      <form onSubmit={onSubmit} className="space-y-8">
        <InputField label="Ritual Name" placeholder="e.g. LeetCode 3x" onChange={(v) => setNewHabit({...newHabit, name: v})} />
        <div className="grid grid-cols-2 gap-6">
          <SelectField label="Category" options={['Coding', 'Placement', 'Fitness', 'Reading', 'Finance']} onChange={(v) => setNewHabit({...newHabit, category: v})} />
          <SelectField label="Frequency" options={['Daily', 'Weekly', 'Monthly']} onChange={(v) => setNewHabit({...newHabit, frequency: v, frequencyValue: ''})} />
        </div>
        <InputField label="Reminder Time" type="time" onChange={(v) => setNewHabit({...newHabit, reminderTime: v})} />
        <button type="submit" className="w-full py-6 bg-slate-900 text-white rounded-3xl font-black text-lg shadow-2xl hover:bg-indigo-600 transition-all active:scale-[0.98]">Deploy Ritual</button>
      </form>
    </div>
  </div>
);

const SidebarLink = ({ icon, label, active }) => (
  <div className={`flex items-center gap-4 px-6 py-5 rounded-3xl cursor-pointer transition-all duration-300 ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 translate-x-1' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}>
    {icon} <span className="font-bold tracking-tight">{label}</span>
  </div>
);

const InputField = ({ label, type = "text", placeholder, onChange }) => (
  <div>
    <label className="text-[10px] font-black text-slate-400 uppercase ml-4 mb-3 block tracking-[0.2em]">{label}</label>
    <input type={type} required onChange={(e) => onChange(e.target.value)} className="w-full px-8 py-5 bg-slate-50 rounded-[1.5rem] border-2 border-transparent outline-none focus:border-indigo-600 focus:bg-white transition-all font-bold text-slate-800" placeholder={placeholder} />
  </div>
);

const SelectField = ({ label, options, onChange }) => (
  <div>
    <label className="text-[10px] font-black text-slate-400 uppercase ml-4 mb-3 block tracking-[0.2em]">{label}</label>
    <select onChange={(e) => onChange(e.target.value)} className="w-full px-8 py-5 bg-slate-50 rounded-[1.5rem] outline-none border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all font-bold text-slate-800 cursor-pointer appearance-none">
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

export default Dashboard;