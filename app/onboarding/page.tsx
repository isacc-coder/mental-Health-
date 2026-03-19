'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { mockDB, UserProfile } from '@/lib/mock-api';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

const steps = [
  {
    question: "What is your biggest challenge?",
    options: ["Procrastination", "Focus", "Organization", "Motivation"],
    key: "challenge" as keyof UserProfile
  },
  {
    question: "Are you a...",
    options: ["Student", "Professional", "Entrepreneur", "Other"],
    key: "role" as keyof UserProfile
  },
  {
    question: "What do you want to improve most?",
    options: ["Focus", "Productivity", "Habits", "Mental Clarity"],
    key: "goal" as keyof UserProfile
  }
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<UserProfile>>({});
  const { user } = useAuth();
  const router = useRouter();

  const handleOptionSelect = (option: string) => {
    const key = steps[currentStep].key;
    const newAnswers = { ...answers, [key]: option };
    setAnswers(newAnswers);

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      finishOnboarding(newAnswers as UserProfile);
    }
  };

  const finishOnboarding = async (finalAnswers: UserProfile) => {
    if (user) {
      await mockDB.saveOnboarding(user.id, finalAnswers);
      router.push('/dashboard');
    }
  };

  const currentProgress = ((currentStep + 1) / steps.length) * 100;

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl">
        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-100 rounded-full mb-12">
          <div 
            className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${currentProgress}%` }}
          />
        </div>

        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="space-y-4">
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
              Step {currentStep + 1} of {steps.length}
            </span>
            <h2 className="text-3xl font-bold text-gray-900 leading-tight">
              {steps[currentStep].question}
            </h2>
          </div>

          <div className="grid gap-4">
            {steps[currentStep].options.map((option) => (
              <button
                key={option}
                onClick={() => handleOptionSelect(option)}
                className="group flex items-center justify-between w-full p-6 text-left border-2 border-gray-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all active:scale-[0.98]"
              >
                <span className="text-lg font-medium text-gray-800 group-hover:text-blue-700">{option}</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-transform group-hover:translate-x-1" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
