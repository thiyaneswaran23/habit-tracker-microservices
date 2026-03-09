import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle2, Flame, BarChart3, Settings, LogOut, LayoutDashboard } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [habits, setHabits] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', category: 'General' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Fetch Habits from Habit-Service (8082)
      const habitsRes = await api.get(`/habits/user/${user.id}`);
      
      // 2. Fetch Analytics from Analytics-Service (8084)
      const statsRes = await api.get(`/analytics/user/${user.id}/performance`);
      
      setHabits(habitsRes.data);
      setAnalytics(statsRes.data);
    } catch (err) {
      console.error("Error fetching dashboard data", err);
    }
  };

  const handleLogHabit = async (habitId) => {
    try {
      // Log completion to Tracking-Service (8083)
      await api.post('/tracking/log', { habitId, userId: user.id });
      fetchData(); // Refresh streaks and stats
    } catch (err) {
      alert("Already logged for today!");
    }
  };

  const createHabit = async () => {
    try {
      await api.post('/habits/create', { ...newHabit, userId: user.id });
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error("Creation failed");
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-indigo-600 p-2 rounded-lg text-white"><Flame size={20}/></div>
          <span className="text-xl font-bold text-slate-800">HabitFlow</span>
        </div>
        
        <nav className="flex-1 space-y-2">
          <SidebarItem icon={<LayoutDashboard size={20}/>} label="Dashboard" active />
          <SidebarItem icon={<BarChart3 size={20}/>} label="Analytics" />
          <SidebarItem icon={<Settings size={20}/>} label="Settings" />
        </nav>

        <button onClick={logout} className="flex items-center gap-3 text-slate-500 hover:text-red-600 transition-colors p-3">
          <LogOut size={20}/> <span className="font-medium">Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Welcome, {user?.username}!</h1>
            <p className="text-slate-500">You have {habits.length} active habits.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            <Plus size={20}/> New Habit
          </button>
        </header>

        {/* Habits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {habits.map((habit) => (
            <HabitCard 
              key={habit.id} 
              habit={habit} 
              onComplete={() => handleLogHabit(habit.id)} 
            />
          ))}
        </div>
      </main>

      {/* Create Habit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Create New Habit</h2>
            <input 
              className="w-full p-4 bg-slate-50 border rounded-xl mb-4 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Habit Name (e.g. Morning Run)"
              onChange={(e) => setNewHabit({...newHabit, name: e.target.value})}
            />
            <select 
              className="w-full p-4 bg-slate-50 border rounded-xl mb-6 outline-none"
              onChange={(e) => setNewHabit({...newHabit, category: e.target.value})}
            >
              <option>General</option>
              <option>Fitness</option>
              <option>Coding</option>
              <option>Reading</option>
            </select>
            <div className="flex gap-4">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 font-bold text-slate-500">Cancel</button>
              <button onClick={createHabit} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SidebarItem = ({ icon, label, active }) => (
  <div className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>
    {icon} <span className="font-semibold">{label}</span>
  </div>
);

const HabitCard = ({ habit, onComplete }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-4">
      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full uppercase tracking-wider">
        {habit.category}
      </span>
      <div className="flex items-center text-orange-500 gap-1 font-bold">
        <Flame size={18} fill="currentColor"/> {habit.currentStreak || 0}
      </div>
    </div>
    <h3 className="text-xl font-bold text-slate-800 mb-4">{habit.name}</h3>
    <button 
      onClick={onComplete}
      className="w-full py-3 bg-slate-50 text-slate-700 rounded-xl font-bold hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2 group"
    >
      <CheckCircle2 size={20} className="text-indigo-600 group-hover:text-white"/> Complete for Today
    </button>
  </div>
);

export default Dashboard;