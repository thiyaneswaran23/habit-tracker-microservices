import React, { useState, useEffect } from 'react';
import { 
  Plus, CheckCircle2, Flame, BarChart3, Settings, 
  LogOut, LayoutDashboard, Loader2, Trophy, Clock, X 
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Updated state to include all fields requested by the Java Entity
  const [newHabit, setNewHabit] = useState({ 
    name: '', 
    category: 'Coding', 
    reminderTime: '08:00' 
  });

  useEffect(() => {
    if (user?.id) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/habits/user/${user.id}`);
      setHabits(res.data);
    } catch (err) {
      console.error("Dashboard fetch error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (habitId) => {
    try {
      // 1. Optimistic Update: Move it to completed in the UI instantly
      setHabits(prev => prev.map(h => 
        h.id === habitId ? { ...h, completedToday: true } : h
      ));

      // 2. Persist to Tracking-Service (Port 8083)
      await api.post('/tracking/log', { habitId, userId: user.id });
    } catch (err) {
      // Rollback if the backend fails (e.g., already logged)
      fetchDashboardData();
      alert("This ritual is already locked in for today!");
    }
  };

  const createHabit = async (e) => {
    e.preventDefault();
    try {
      // POSTing all fields to Habit-Service via Gateway
      await api.post('/habits/create', { ...newHabit, userId: user.id });
      setShowModal(false);
      fetchDashboardData();
    } catch (err) {
      console.error("Creation failed");
    }
  };

  // Logic for the two dashboard sections
  const pendingHabits = habits.filter(h => !h.completedToday);
  const completedHabits = habits.filter(h => h.completedToday);

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans selection:bg-indigo-100">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200/60 p-8 flex flex-col sticky top-0 h-screen">
        <div className="flex items-center gap-4 mb-12 group cursor-pointer">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-2.5 rounded-2xl shadow-xl shadow-indigo-200 rotate-3 transition-transform">
            <Trophy className="text-white" size={24} />
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tighter">HabitFlow</span>
        </div>
        
        <nav className="flex-1 space-y-2">
          <SidebarLink icon={<LayoutDashboard size={20}/>} label="Dashboard" active />
          <SidebarLink icon={<BarChart3 size={20}/>} label="Progress" />
        </nav>

        <div className="bg-slate-50 rounded-3xl p-6 mb-8 border border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Identity</p>
          <p className="text-sm font-black text-slate-800 truncate">{user.username}</p>
          <p className="text-[10px] text-indigo-600 font-bold">RMK CSE '26</p>
        </div>

        <button onClick={logout} className="flex items-center gap-3 text-slate-400 hover:text-red-500 transition-all p-3 font-bold text-sm">
          <LogOut size={18}/> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 max-w-7xl mx-auto w-full">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 mb-2">My Daily Rituals</h1>
            <p className="text-slate-500 font-medium italic">High Performer Track</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-indigo-600 transition-all shadow-2xl shadow-slate-200 active:scale-95"
          >
            <Plus size={22} strokeWidth={3}/> New Habit
          </button>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
          </div>
        ) : (
          <div className="space-y-16">
            {/* PENDING SECTION */}
            <section>
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                <span className="w-8 h-[2px] bg-slate-200"></span> Still To Do
              </h2>
              <div className="grid lg:grid-cols-2 gap-8">
                {pendingHabits.map(habit => (
                  <HabitCard key={habit.id} habit={habit} onTick={() => handleToggleComplete(habit.id)} />
                ))}
              </div>
            </section>

            {/* COMPLETED SECTION */}
            <section className="opacity-75">
              <h2 className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                <span className="w-8 h-[2px] bg-emerald-100"></span> Victory Lap
              </h2>
              <div className="grid lg:grid-cols-2 gap-8">
                {completedHabits.map(habit => (
                  <HabitCard key={habit.id} habit={habit} completed />
                ))}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* GOD LEVEL MODAL: Asking for all Entity fields */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in duration-200 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600">
              <X size={24} />
            </button>
            <h2 className="text-3xl font-black text-slate-900 mb-2">New Ritual</h2>
            <p className="text-slate-500 text-sm mb-8 font-medium">Capture the details for your daily growth.</p>
            
            <form onSubmit={createHabit} className="space-y-5">
              <div>
                <label className="text-xs font-black text-slate-400 uppercase ml-2 mb-2 block">Habit Name</label>
                <input 
                  required className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-bold"
                  placeholder="e.g. Java Logic"
                  onChange={(e) => setNewHabit({...newHabit, name: e.target.value})}
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-400 uppercase ml-2 mb-2 block">Category</label>
                <select 
                  className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-bold appearance-none"
                  onChange={(e) => setNewHabit({...newHabit, category: e.target.value})}
                >
                  <option value="Coding">Coding</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Reading">Reading</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-black text-slate-400 uppercase ml-2 mb-2 block">Reminder Time</label>
                <input 
                  type="time" required
                  className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-bold"
                  onChange={(e) => setNewHabit({...newHabit, reminderTime: e.target.value})}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 font-black text-slate-400 hover:text-slate-600 transition-colors">Discard</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 transition-all">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const SidebarLink = ({ icon, label, active }) => (
  <div className={`flex items-center gap-4 px-5 py-4 rounded-2xl cursor-pointer transition-all ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}>
    {icon} <span className="font-bold text-sm">{label}</span>
  </div>
);

const HabitCard = ({ habit, onTick, completed }) => (
  <div className={`bg-white p-8 rounded-[2rem] border transition-all flex items-center justify-between ${completed ? 'border-emerald-100 bg-emerald-50/10' : 'border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1'}`}>
    <div className="flex items-center gap-6">
      <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center ${completed ? 'bg-emerald-500' : 'bg-indigo-50'}`}>
        {completed ? <CheckCircle2 className="text-white" size={32} /> : <Clock className="text-indigo-600" size={32} />}
      </div>
      <div>
        <p className={`text-xl font-black tracking-tight ${completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{habit.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <Flame size={14} className={completed ? 'text-slate-300' : 'text-orange-500'} fill="currentColor"/>
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{habit.streak || 0} Day Streak</span>
        </div>
      </div>
    </div>
    {!completed && (
      <button onClick={onTick} className="bg-white border-2 border-slate-100 p-4 rounded-2xl text-slate-300 hover:border-indigo-600 hover:text-indigo-600 transition-all active:scale-90">
        <CheckCircle2 size={24} strokeWidth={3}/>
      </button>
    )}
  </div>
);

export default Dashboard;