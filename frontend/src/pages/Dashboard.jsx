import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Plus, CheckCircle2, Flame, BarChart3, Settings, 
  LogOut, LayoutDashboard, Loader2, Trophy, Clock, X, Trash2,
  Calendar, Repeat, TrendingUp, Globe, ArrowLeft
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const isLogging = useRef(false);
  
  const [view, setView] = useState('dashboard');
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [processingId, setProcessingId] = useState(null); 
  
  const [newHabit, setNewHabit] = useState({ 
    name: '', category: 'Coding', frequency: 'Daily', frequencyValue: '', reminderTime: '08:00' 
  });

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
    if (view === 'dashboard') {
      fetchDashboardData();
    }
  }, [fetchDashboardData, view]);

  const handleToggleComplete = async (habitId) => {

    if (isLogging.current) return;

    const targetHabit = (habits || []).find(h => h.id === habitId);
    if (!targetHabit || targetHabit.completedToday) return;

    isLogging.current = true; 
    setHabits(prev => prev.map(h => 
      h.id === habitId ? { ...h, completedToday: true, streak: (h.streak || 0) + 1 } : h
    ));

    try {
      await api.post('/tracking/log', { habitId, userId: user.id });
    } catch (err) {
  
      if (err.response?.status !== 400) {
        console.error("Tracking log failed", err);
        fetchDashboardData(true); 
      }
    } finally {
    
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
  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans selection:bg-indigo-100">
  
      <aside className="w-72 bg-white border-r border-slate-200/60 p-8 flex flex-col sticky top-0 h-screen">
        <div className="flex items-center gap-4 mb-12 group cursor-pointer" onClick={() => setView('dashboard')}>
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-2.5 rounded-2xl shadow-xl shadow-indigo-200 rotate-3">
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
          
        </nav>

        <div className="bg-slate-50 rounded-3xl p-6 mb-8 border border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Developer</p>
          <p className="text-sm font-black text-slate-800 truncate">{user.username}</p>
          <p className="text-[10px] text-indigo-600 font-bold">RMK CSE '26</p>
        </div>

        <button onClick={logout} className="flex items-center gap-3 text-slate-400 hover:text-red-500 transition-all p-3 font-bold text-sm">
          <LogOut size={18}/> Logout
        </button>
      </aside>

      {/* Conditional Content Switcher */}
      {view === 'analytics' ? (
        <AnalyticsPage onBack={() => setView('dashboard')} />
      ) : (
        <main className="flex-1 p-12 max-w-7xl mx-auto w-full">
          <header className="flex justify-between items-end mb-12">
            <div>
              <h1 className="text-4xl font-black text-slate-900 mb-2">My Daily Rituals</h1>
              <p className="text-slate-500 font-medium italic italic">Systems over goals.</p>
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
      )}

      {showModal && (
        <HabitModal onClose={() => setShowModal(false)} onSubmit={createHabit} setNewHabit={setNewHabit} newHabit={newHabit} />
      )}
    </div>
  );
};

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
        setStats({ global: globalRes.data, performance: perfRes.data, heatmap: heatRes.data });
      } catch (err) { console.error("Analytics fetch failed"); } 
      finally { setLoading(false); }
    };
    fetchAnalytics();
  }, [user.id]);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={48} /></div>
  );

  return (
    <div className="flex-1 p-12 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold mb-8 group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform"/> Back to Rituals
      </button>

      <header className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 mb-2">Insight Engine</h1>
        <p className="text-slate-500 font-medium">Tracking your RMK '26 trajectory.</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Personal Mastery */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600"><TrendingUp size={24}/></div>
            <h2 className="text-xl font-black text-slate-800">Category Mastery</h2>
          </div>
          <div className="space-y-8">
            {stats.performance.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between mb-3 items-end">
                  <span className="font-bold text-slate-700">{item._id}</span>
                  <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{Math.round(item.score)}%</span>
                </div>
                <div className="w-full h-4 bg-slate-50 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${item.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Trends */}
        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-white/10 p-3 rounded-2xl text-indigo-400"><Globe size={24}/></div>
            <h2 className="text-xl font-black">Global Focus</h2>
          </div>
          <div className="space-y-6">
            {stats.global.map((item, i) => (
              <div key={i} className="flex justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <span className="font-bold">{item._id}</span>
                <span className="text-indigo-400 font-black">{item.count} Users</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- SUBCOMPONENTS ---

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
  <div className={`bg-white p-8 rounded-[2rem] border transition-all flex items-center justify-between group ${completed ? 'border-emerald-100 bg-emerald-50/10' : 'border-slate-100 hover:shadow-2xl hover:-translate-y-1'}`}>
    <div className="flex items-center gap-6">
      <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center ${completed ? 'bg-emerald-500' : 'bg-indigo-50'}`}>
        {completed ? <CheckCircle2 className="text-white" size={32} /> : <Clock className="text-indigo-600" size={32} />}
      </div>
      <div>
        {/* Added Category label above the name for better design */}
        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">
          {habit?.category || 'General'}
        </p>
        <p className={`text-xl font-black tracking-tight ${completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
          {habit?.name}
        </p>
        <div className="flex items-center gap-3 mt-2">
          <span className="flex items-center gap-1 text-xs font-black text-orange-500 uppercase tracking-widest">
            <Flame size={14} fill="currentColor"/> {habit?.streak || 0} Streak
          </span>
          <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 bg-slate-100 rounded-md flex items-center gap-1">
            <Calendar size={10}/> {habit?.frequency} • {habit?.reminderTime || 'No Time'}
          </span>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-2">
      {!completed && (
        <button onClick={() => onTick(habit.id)} className="bg-white border-2 border-slate-100 p-4 rounded-2xl text-slate-300 hover:border-indigo-600 hover:text-indigo-600 transition-all active:scale-90">
          <CheckCircle2 size={24} strokeWidth={3}/>
        </button>
      )}
      <button onClick={() => onDelete(habit.id)} className="p-4 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
        <Trash2 size={20} />
      </button>
    </div>
  </div>
);
const HabitModal = ({ onClose, onSubmit, setNewHabit, newHabit }) => (
  <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6 z-50">
    <div className="bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl animate-in zoom-in duration-200 relative">
      <button onClick={onClose} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600"><X size={24} /></button>
      <h2 className="text-3xl font-black text-slate-900 mb-2">New Ritual</h2>
      <form onSubmit={onSubmit} className="space-y-6 mt-8">
        <InputField label="Ritual Name" placeholder="e.g. Java Logic" onChange={(v) => setNewHabit({...newHabit, name: v})} />
        <div className="grid grid-cols-2 gap-4">
          <SelectField label="Category" options={['Coding', 'Placement', 'Fitness', 'Reading', 'Finance']} onChange={(v) => setNewHabit({...newHabit, category: v})} />
          <SelectField label="Frequency" options={['Daily', 'Weekly', 'Monthly']} onChange={(v) => setNewHabit({...newHabit, frequency: v, frequencyValue: ''})} />
        </div>
        {newHabit.frequency === 'Weekly' && (
          <SelectField label="Day of Week" options={['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']} onChange={(v) => setNewHabit({...newHabit, frequencyValue: v})} />
        )}
        <InputField label="Reminder Time" type="time" onChange={(v) => setNewHabit({...newHabit, reminderTime: v})} />
        <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black shadow-xl hover:bg-indigo-700 transition-all">Initiate</button>
      </form>
    </div>
  </div>
);

// --- SHARED UI ---
const SidebarLink = ({ icon, label, active }) => (
  <div className={`flex items-center gap-4 px-5 py-4 rounded-2xl cursor-pointer transition-all ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}>
    {icon} <span className="font-bold text-sm">{label}</span>
  </div>
);

const InputField = ({ label, type = "text", placeholder, onChange }) => (
  <div>
    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 block tracking-widest">{label}</label>
    <input type={type} required onChange={(e) => onChange(e.target.value)} className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-bold" placeholder={placeholder} />
  </div>
);

const SelectField = ({ label, options, onChange }) => (
  <div>
    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 block tracking-widest">{label}</label>
    <select onChange={(e) => onChange(e.target.value)} className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-bold cursor-pointer">
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

export default Dashboard;