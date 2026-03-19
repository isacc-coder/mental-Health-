'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="space-y-4">
          <h1 className="text-6xl font-black text-gray-900 tracking-tight lg:text-7xl">
            FocusPoint
          </h1>
          <p className="text-xl text-gray-500 font-medium">
            The minimal productivity platform designed for the ADHD brain.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all transform active:scale-95 shadow-lg shadow-blue-100"
          >
            Start Your Journey
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 bg-gray-50 text-gray-900 font-bold rounded-2xl hover:bg-gray-100 transition-all transform active:scale-95 border border-gray-100"
          >
            Sign In
          </Link>
        </div>

        <div className="pt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 border-t border-gray-50">
          <div>
            <p className="font-bold text-gray-900">Pomodoro</p>
            <p className="text-sm text-gray-500">25/5 focus cycles</p>
          </div>
          <div>
            <p className="font-bold text-gray-900">Bite-sized</p>
            <p className="text-sm text-gray-500">5-min ADHD lessons</p>
          </div>
          <div>
            <p className="font-bold text-gray-900">Progress</p>
            <p className="text-sm text-gray-500">Visual focus tracking</p>
          </div>
        </div>
      </div>
    </main>
  );
}
