import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Globe, Calendar, Loader2, 
  ArrowLeft, Award, Zap, Target, Activity 
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Analytics = ({ onBack }) => {
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
      } catch (err) {
        console.error("Analytics fetch failed");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [user.id]);

  if (loading) return (
    <div className="flex h-screen w-full items-center justify-center bg-[#f8fafc]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={64} />
        <p className="font-black text-slate-400 tracking-tighter animate-pulse">BOOTING INSIGHT ENGINE...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-7xl mx-auto">
        {/* Navigation */}
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold mb-10 transition-all group"
        >
          <div className="bg-white p-2 rounded-xl shadow-sm group-hover:shadow-md transition-all">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform"/> 
          </div>
          <span className="text-sm uppercase tracking-widest">Return to Dashboard</span>
        </button>
        
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">
              Insight <span className="text-indigo-600">Engine</span>
            </h1>
            <p className="text-slate-500 font-medium max-w-md">
              Real-time synchronization of your development rituals and performance metrics.
            </p>
          </div>
          <div className="flex gap-4">
            <StatPill icon={<Activity size={18}/>} label="Status" value="Optimized" color="text-emerald-500" />
            <StatPill icon={<Award size={18}/>} label="Rank" value="High Performer" color="text-indigo-600" />
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-200"><TrendingUp size={24}/></div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Skill Trajectory</h2>
              </div>
              <Target className="text-slate-200" size={32} />
            </div>
            
            <div className="space-y-10">
              {stats.performance.length > 0 ? stats.performance.map((item, i) => {
                const score = item.score || 0;
                return (
                  <div key={i} className="group">
                    <div className="flex justify-between mb-4 items-end">
                      <span className="text-lg font-black text-slate-700 group-hover:text-indigo-600 transition-colors">
                        {item._id}
                      </span>
                      <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-xl border border-indigo-100">
                        {Math.round(score)}% Mastery
                      </span>
                    </div>
                    <div className="w-full h-5 bg-slate-100 rounded-2xl overflow-hidden p-1">
                      <div 
                        className="h-full rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 transition-all duration-1000 ease-out"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                );
              }) : (
                <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                  <p className="font-bold text-slate-300">No mastery data detected yet.</p>
                </div>
              )}
            </div>
          </div>


          <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                <Globe size={120} />
            </div>
            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-10">
                <div className="bg-indigo-500 p-3 rounded-2xl text-white shadow-lg shadow-indigo-500/50"><Globe size={24}/></div>
                <h2 className="text-2xl font-black tracking-tight">Global Meta</h2>
                </div>
                <div className="space-y-4">
                {stats.global.slice(0, 6).map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all cursor-default">
                    <span className="font-bold tracking-tight text-slate-300">{item._id}</span>
                    <div className="flex items-center gap-3">
                        <span className="text-indigo-400 font-black">{item.count}</span>
                        <div className="w-1 h-1 bg-slate-600 rounded-full"/>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Users</span>
                    </div>
                    </div>
                ))}
                </div>
            </div>
          </div>


          <div className="lg:col-span-3 bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-500 p-3 rounded-2xl text-white shadow-lg shadow-emerald-200"><Calendar size={24}/></div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Consistency Heatmap</h2>
              </div>
              <div className="flex gap-2">
                 {[1,2,3,4].map(v => <div key={v} className="w-3 h-3 rounded-sm" style={{ backgroundColor: `rgba(16, 185, 129, ${v * 0.25})` }}/>)}
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-6">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                const dayNum = i + 1;
                const dayData = stats.heatmap.find(d => d._id === dayNum);
                const count = dayData ? dayData.count : 0;
                const intensity = Math.min(count * 25, 100);
                
                return (
                  <div key={day} className="group relative flex flex-col items-center gap-4">
                    <div 
                      className="w-full aspect-square rounded-[1.5rem] transition-all duration-500 cursor-pointer relative"
                      style={{ 
                        backgroundColor: intensity > 0 ? `rgba(16, 185, 129, ${intensity / 100})` : '#f1f5f9',
                        transform: intensity > 0 ? 'scale(1.05)' : 'scale(1)'
                      }}
                    >
                        {intensity > 0 && (
                            <div className="absolute inset-0 bg-emerald-400 blur-xl opacity-20 group-hover:opacity-40 transition-opacity"/>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs font-black text-emerald-800">{count}</span>
                        </div>
                    </div>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">
                        {day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};


const StatPill = ({ icon, label, value, color }) => (
    <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className={`${color} opacity-80`}>{icon}</div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] leading-none mb-1">{label}</p>
            <p className={`text-sm font-black text-slate-800`}>{value}</p>
        </div>
    </div>
);

const SidebarLink = ({ icon, label, active }) => (
    <div className={`flex items-center gap-4 px-5 py-4 rounded-2xl cursor-pointer transition-all ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}>
      {icon} <span className="font-bold text-sm">{label}</span>
    </div>
);

export default Analytics;