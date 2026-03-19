'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-white font-body">
      <div className="w-full max-w-md space-y-10">
        <div className="text-center">
          <h1 className="text-5xl font-heading font-bold text-teal-dark tracking-tighter">FocusPoint</h1>
          <p className="mt-3 text-text-secondary text-lg">Your science-backed path to focus.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 space-y-8">
          {error && (
            <div className="p-4 text-sm font-semibold text-red-600 bg-red-50 rounded-btn border border-red-100">
              {error}
            </div>
          )}
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-teal-dark opacity-70 uppercase tracking-widest mb-2">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-btn focus:bg-white focus:border-primary-inflow transition-all outline-none text-foreground font-medium"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-teal-dark opacity-70 uppercase tracking-widest mb-2">Password</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-btn focus:bg-white focus:border-primary-inflow transition-all outline-none text-foreground font-medium"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-5 px-6 bg-teal-dark text-white font-heading font-bold rounded-btn hover:opacity-90 shadow-xl shadow-teal-900/10 transition-all transform active:scale-[0.98]"
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-sm font-medium text-text-secondary">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-bold text-teal-dark hover:underline decoration-primary-inflow decoration-2">
            Join the community
          </Link>
        </p>
      </div>
    </main>
  );
}
