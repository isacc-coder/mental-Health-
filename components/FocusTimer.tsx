'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';
import { mockDB } from '@/lib/mock-api';
import { useAuth } from '@/context/AuthContext';

interface FocusTimerProps {
  onComplete?: () => void;
}

export default function FocusTimer({ onComplete }: FocusTimerProps) {
  const { user } = useAuth();
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  const switchMode = useCallback(() => {
    const nextMode = mode === 'focus' ? 'break' : 'focus';
    setMode(nextMode);
    setTimeLeft(nextMode === 'focus' ? 25 * 60 : 5 * 60);
    setIsActive(false);
  }, [mode]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (mode === 'focus' && user) {
        mockDB.saveFocusSession(user.id, 25);
        if (onComplete) onComplete();
      }
      // Defer to avoid cascading render warning
      setTimeout(() => switchMode(), 0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode, user, switchMode, onComplete]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (timeLeft / (mode === 'focus' ? 25 * 60 : 5 * 60)) * 100;

  return (
    <div className="bg-white p-10 rounded-card shadow-inflow border border-secondary-inflow flex flex-col items-center font-body">
      <div className="flex items-center gap-2 mb-8 text-xs font-bold uppercase tracking-widest text-teal-dark opacity-60">
        <Clock className="w-4 h-4" />
        {mode === 'focus' ? 'Focus Session' : 'Short Break'}
      </div>

      <div className="relative w-56 h-56 flex items-center justify-center mb-10">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="112"
            cy="112"
            r="100"
            fill="none"
            stroke="#EEF7F5"
            strokeWidth="12"
          />
          <circle
            cx="112"
            cy="112"
            r="100"
            fill="none"
            stroke={mode === 'focus' ? '#227282' : '#BEE3DB'}
            strokeWidth="12"
            strokeDasharray={628.3}
            strokeDashoffset={628.3 * (progress / 100)}
            strokeLinecap="round"
            className="transition-all duration-1000 linear"
          />
        </svg>
        <span className="absolute text-5xl font-heading font-bold text-foreground tracking-tighter">
          {formatTime(timeLeft)}
        </span>
      </div>

      <div className="flex gap-6">
        <button
          onClick={toggleTimer}
          className={`flex items-center justify-center w-20 h-20 rounded-full transition-all transform active:scale-95 shadow-lg ${
            isActive 
              ? 'bg-secondary-inflow text-teal-dark hover:bg-primary-inflow' 
              : 'bg-teal-dark text-white hover:opacity-90 shadow-teal-900/20'
          }`}
        >
          {isActive ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-1" />}
        </button>
        <button
          onClick={resetTimer}
          className="flex items-center justify-center w-20 h-20 rounded-full bg-gray-50 text-gray-400 hover:bg-secondary-inflow hover:text-teal-dark transition-all transform active:scale-95"
        >
          <RotateCcw className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
}
