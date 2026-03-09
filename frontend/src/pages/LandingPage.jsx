import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, CheckCircle, BarChart3, Clock } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-8 py-6 bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <Activity className="text-indigo-600" size={32} />
          <span className="text-2xl font-bold text-slate-800">HabitFlow</span>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="px-5 py-2 text-indigo-600 font-semibold hover:text-indigo-700"
          >
            Sign In
          </button>
          <button 
            onClick={() => navigate('/register')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-6xl mx-auto text-center py-20 px-4">
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight">
          Master Your Routine, <br />
          <span className="text-indigo-600">Achieve Your Goals.</span>
        </h1>
        <p className="mt-6 text-xl text-slate-600 max-w-2xl mx-auto">
          The all-in-one platform to track habits, maintain streaks, and analyze your progress using advanced microservices.
        </p>
        <div className="mt-10">
          <button 
            onClick={() => navigate('/register')}
            className="px-8 py-4 bg-indigo-600 text-white text-lg rounded-xl font-bold shadow-lg shadow-indigo-200 hover:scale-105 transition-transform"
          >
            Start Your First Habit
          </button>
        </div>
      </header>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 px-4 pb-20">
        <FeatureCard 
          icon={<Clock className="text-indigo-500" />} 
          title="Smart Reminders" 
          desc="Automated notifications scheduled via Spring Task Scheduler." 
        />
        <FeatureCard 
          icon={<CheckCircle className="text-green-500" />} 
          title="Streak Tracking" 
          desc="Never break the chain with our persistent NoSQL streak engine." 
        />
        <FeatureCard 
          icon={<BarChart3 className="text-purple-500" />} 
          title="Pro Analytics" 
          desc="Deep insights into your success rates and weekly heatmaps." 
        />
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-600">{desc}</p>
  </div>
);

export default LandingPage;