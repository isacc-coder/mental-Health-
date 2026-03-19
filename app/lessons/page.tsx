'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { mockDB, Lesson, UserStats } from '@/lib/mock-api';
import Navbar from '@/components/Navbar';
import { BookOpen, CheckCircle2, ChevronRight } from 'lucide-react';
import Link from 'next/link';

import ProtectedRoute from '@/components/ProtectedRoute';

export default function LessonsPage() {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      const [l, s] = await Promise.all([
        mockDB.getLessons(),
        mockDB.getUserStats(user.id),
      ]);
      setLessons(l);
      setStats(s);
    };

    if (user) {
      loadData();
    }
  }, [user]);

  if (!user || !lessons.length || !stats) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 pb-20 lg:pt-20">
        <Navbar />
        
        <main className="max-w-4xl mx-auto px-6 py-8">
          <header className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-bold text-gray-900">Learning Modules</h1>
            <p className="text-gray-500 mt-2">Short lessons designed for the ADHD brain.</p>
          </header>

          <div className="space-y-4">
            {lessons.map((lesson: Lesson, index: number) => {
              const isCompleted = stats.lessonsCompleted > index; 
              
              return (
                <Link 
                  key={lesson.id}
                  href={`/lessons/${lesson.id}`}
                  className="group block bg-white border border-gray-100 p-6 rounded-3xl shadow-sm hover:border-blue-500 hover:shadow-md transition-all active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        isCompleted ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {lesson.title}
                        </h3>
                        <p className="text-sm text-gray-500">Lesson {index + 1} • 5 min read</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
