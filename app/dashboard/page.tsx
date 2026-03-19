'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { mockDB, UserStats, UserProfile, Lesson, DailyCheckin } from '@/lib/mock-api';
import Navbar from '@/components/Navbar';
import FocusTimer from '@/components/FocusTimer';
import { CheckCircle2, Star, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';

import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [dailyLesson, setDailyLesson] = useState<Lesson | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [, setMoodRating] = useState(0);

  const loadData = useCallback(async () => {
    if (!user) return;
    const [s, lessons, p] = await Promise.all([
      mockDB.getUserStats(user.id),
      mockDB.getLessons(),
      mockDB.getUserProfile(user.id),
    ]);
    setStats(s);
    setDailyLesson(lessons[0]); // For MVP, just show the first lesson as daily
    setProfile(p);
    
    // Check if user checked in today
    const today = new Date().toISOString().split('T')[0];
    const checkedInToday = s.checkins.some((c: DailyCheckin) => c.date.startsWith(today));
    setHasCheckedIn(checkedInToday);
  }, [user]);

  useEffect(() => {
    if (user) {
      setTimeout(() => loadData(), 0);
    }
  }, [user, loadData]);

  const handleCheckin = async (rating: number) => {
    if (!user) return;
    await mockDB.saveDailyCheckin(user.id, rating);
    setMoodRating(rating);
    setHasCheckedIn(true);
    loadData();
  };

  if (!user || !stats) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white pb-20 lg:pt-20 font-body">
        <Navbar />
        
        <main className="max-w-6xl mx-auto px-6 py-12">
          <header className="mb-12">
            <h1 className="text-4xl font-heading font-bold text-foreground tracking-tight">
              Welcome back, {user.email.split('@')[0]}
            </h1>
            <p className="text-text-secondary mt-2 text-lg">
              {profile?.challenge ? `Staying focused on ${profile.challenge.toLowerCase()} today.` : "Let&apos;s make today productive."}
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Column: Focus & Check-in */}
            <div className="lg:col-span-2 space-y-10">
              {/* Today's Focus Card */}
              <section className="bg-white p-10 rounded-card shadow-inflow border border-secondary-inflow">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-heading font-bold text-foreground flex items-center gap-3">
                    <Star className="w-6 h-6 text-yellow-500 fill-current" />
                    Today&apos;s Focus
                  </h2>
                  <span className="text-xs font-bold px-4 py-1.5 bg-secondary-inflow text-teal-dark rounded-full tracking-wider">DAILY STEP</span>
                </div>
                
                <div className="p-8 bg-secondary-inflow rounded-btn border border-primary-inflow/30">
                  <p className="text-xl font-semibold text-teal-dark mb-6">
                    {dailyLesson?.title || "Complete your first lesson"}
                  </p>
                  <Link 
                    href={`/lessons/${dailyLesson?.id || ''}`}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-teal-dark text-white font-bold rounded-btn hover:opacity-90 transition-all shadow-md shadow-teal-900/10"
                  >
                    Start Lesson <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </section>

              {/* Daily Check-in */}
              <section className="bg-white p-10 rounded-card shadow-inflow border border-secondary-inflow text-center">
                <h2 className="text-2xl font-heading font-bold text-foreground mb-3">How focused do you feel today?</h2>
                <p className="text-text-secondary mb-8 text-lg font-medium">Rating 1 (low) – 5 (peak focus)</p>
                
                {hasCheckedIn ? (
                  <div className="flex flex-col items-center animate-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 border border-green-100/50 shadow-sm">
                      <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <p className="text-xl font-bold text-foreground">You&apos;re checked in!</p>
                  </div>
                ) : (
                  <div className="flex justify-center gap-4">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => handleCheckin(rating)}
                        className="w-16 h-16 rounded-2xl border-2 border-transparent bg-gray-50 flex items-center justify-center text-2xl font-bold text-gray-400 hover:bg-secondary-inflow hover:text-teal-dark hover:border-teal-mid/30 transition-all active:scale-95 shadow-sm"
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {/* Progress Overview Section */}
              <section className="bg-teal-dark p-10 rounded-card text-white shadow-xl shadow-teal-900/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
                <div className="flex items-center gap-4 mb-8 relative z-10">
                  <div className="p-3 bg-white/10 rounded-xl">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-heading font-bold">Progress Overview</h2>
                    <p className="text-teal-100 font-medium">Small steps, big results.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 relative z-10">
                  <div className="bg-white/10 p-6 rounded-btn border border-white/5">
                    <p className="text-teal-200 text-xs font-bold uppercase tracking-widest mb-2">Focus Points</p>
                    <p className="text-4xl font-bold text-yellow-300">{stats.points} <span className="text-xl">💎</span></p>
                  </div>
                  <div className="bg-white/10 p-6 rounded-btn border border-white/5">
                    <p className="text-teal-200 text-xs font-bold uppercase tracking-widest mb-2">Current Streak</p>
                    <p className="text-4xl font-bold">{stats.currentStreak} <span className="text-xl">🔥</span></p>
                  </div>
                  <div className="bg-white/10 p-6 rounded-btn border border-white/5">
                    <p className="text-teal-200 text-xs font-bold uppercase tracking-widest mb-2">Sessions</p>
                    <p className="text-4xl font-bold">{stats.focusSessionsCompleted}</p>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Timer */}
            <div className="space-y-10">
              <FocusTimer onComplete={loadData} />
              
              <section className="bg-white p-10 rounded-card shadow-inflow border border-secondary-inflow">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Learning Depth</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-text-secondary font-semibold text-lg">Lessons</span>
                      <span className="font-bold text-teal-dark text-lg">{stats.lessonsCompleted}/4</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary-inflow transition-all duration-1000 ease-out"
                        style={{ width: `${(stats.lessonsCompleted / 4) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
