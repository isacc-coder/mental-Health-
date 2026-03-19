'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { mockDB, UserStats, DailyCheckin } from '@/lib/mock-api';
import Navbar from '@/components/Navbar';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, Flame, Target, Trophy, Star, CheckCircle2 } from 'lucide-react';

import ProtectedRoute from '@/components/ProtectedRoute';

export default function ProgressPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      const s = await mockDB.getUserStats(user.id);
      setStats(s);
    };

    if (user) {
      loadData();
    }
  }, [user]);

  if (!user || !stats) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  // Prepare chart data from checkins
  const chartData = stats.checkins.map((c: DailyCheckin) => ({
    date: new Date(c.date).toLocaleDateString(undefined, { weekday: 'short' }),
    rating: c.rating
  })).slice(-7); // Last 7 days

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white pb-20 lg:pt-20 font-body">
        <Navbar />
        
        <main className="max-w-6xl mx-auto px-6 py-12">
          <header className="mb-12">
            <h1 className="text-4xl font-heading font-bold text-foreground tracking-tight">Your Progress</h1>
            <p className="text-text-secondary mt-2 text-lg">A science-backed look at your focus journey.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
            <StatCard 
              title="Focus Points" 
              value={stats.points} 
              icon={<Star className="w-6 h-6 text-yellow-600" />}
              color="bg-yellow-50"
            />
            <StatCard 
              title="Lessons" 
              value={stats.lessonsCompleted} 
              icon={<Target className="w-6 h-6 text-teal-dark" />}
              color="bg-secondary-inflow"
            />
            <StatCard 
              title="Focus Sessions" 
              value={stats.focusSessionsCompleted} 
              icon={<Calendar className="w-6 h-6 text-teal-mid" />}
              color="bg-secondary-inflow"
            />
            <StatCard 
              title="Current Streak" 
              value={`${stats.currentStreak} Days`} 
              icon={<Flame className="w-6 h-6 text-orange-600" />}
              color="bg-orange-50"
            />
            <StatCard 
              title="Level" 
              value={Math.floor(stats.points / 100) + 1} 
              icon={<Trophy className="w-6 h-6 text-teal-dark" />}
              color="bg-secondary-inflow"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12">
            <section className="lg:col-span-2 bg-white p-10 rounded-card shadow-inflow border border-secondary-inflow">
              <h2 className="text-2xl font-heading font-bold text-foreground mb-10">Focus Levels (Last 7 Days)</h2>
              <div className="h-72 w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} />
                      <YAxis domain={[0, 5]} hide />
                      <Tooltip 
                        cursor={{fill: '#EEF7F5'}} 
                        contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 24px 40px -10px rgba(0, 0, 0, 0.07)', fontFamily: 'Work Sans' }} 
                      />
                      <Bar dataKey="rating" fill="#227282" radius={[10, 10, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-text-secondary opacity-50">
                    <p className="text-lg font-medium">Begin your journey to see focus trends!</p>
                  </div>
                )}
              </div>
            </section>

            <section className="bg-white p-10 rounded-card shadow-inflow border border-secondary-inflow">
              <h2 className="text-2xl font-heading font-bold text-foreground mb-8">Rewards Path</h2>
              <div className="space-y-6">
                {[
                  { name: 'Bronze Focus', points: 100, reward: 'New App Icon' },
                  { name: 'Silver Deep Work', points: 300, reward: 'Premium Theme' },
                  { name: 'Gold Productivity', points: 600, reward: 'Focus Master Badge' },
                ].map((tier, idx) => {
                  const isUnlocked = stats.points >= tier.points;
                  return (
                    <div key={idx} className={`p-5 rounded-btn border-2 transition-all ${
                      isUnlocked ? 'border-primary-inflow bg-secondary-inflow' : 'border-gray-50 bg-gray-50/30'
                    }`}>
                      <div className="flex justify-between items-center mb-3">
                        <span className={`font-bold ${isUnlocked ? 'text-teal-dark' : 'text-gray-400 opacity-60'}`}>
                          {tier.name}
                        </span>
                        {isUnlocked && <CheckCircle2 className="w-5 h-5 text-teal-mid" />}
                      </div>
                      <p className={`text-sm font-medium ${isUnlocked ? 'text-teal-mid' : 'text-gray-400 opacity-50'}`}>
                        {isUnlocked ? `Reward: ${tier.reward}` : `Unlock at ${tier.points} pts`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <section className="bg-white p-10 rounded-card shadow-inflow border border-secondary-inflow flex flex-col justify-center">
              <h2 className="text-2xl font-heading font-bold text-foreground mb-6">Consistency Insights</h2>
              <p className="text-text-secondary mb-10 text-lg leading-relaxed">You&apos;ve dedicated approximately <span className="text-teal-dark font-bold">{stats.focusSessionsCompleted * 25} minutes</span> to deep work. Every minute counts toward building new cognitive patterns.</p>
              
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-secondary-inflow rounded-2xl flex items-center justify-center text-teal-dark font-bold text-xl shadow-sm">1</div>
                  <div>
                    <h4 className="text-lg font-bold text-foreground">Steady Progress</h4>
                    <p className="text-text-secondary font-medium">Your current streak is {stats.currentStreak} days. Keep the momentum!</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-secondary-inflow rounded-2xl flex items-center justify-center text-teal-dark font-bold text-xl shadow-sm">2</div>
                  <div>
                    <h4 className="text-lg font-bold text-foreground">Curiosity & Learning</h4>
                    <p className="text-text-secondary font-medium">You&apos;ve completed {Math.round((stats.lessonsCompleted / 4) * 100)}% of your available ADHD toolkit.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className="bg-white p-8 rounded-card shadow-inflow border border-secondary-inflow flex flex-col gap-6 transform hover:scale-[1.02] transition-all">
      <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center shadow-sm`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-3xl font-heading font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}
