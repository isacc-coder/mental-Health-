'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { mockDB, Lesson } from '@/lib/mock-api';
import Navbar from '@/components/Navbar';
import { ArrowLeft, CheckCircle2, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import ProtectedRoute from '@/components/ProtectedRoute';

export default function LessonDetailPage() {
  const { id } = useParams() as { id: string };
  const { user } = useAuth();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [pointsAwarded, setPointsAwarded] = useState(0);

  const loadLesson = useCallback(async () => {
    const l = await mockDB.getLesson(id);
    if (l) setLesson(l);
  }, [id]);

  useEffect(() => {
    if (id) {
      loadLesson();
    }
  }, [id, loadLesson]);

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const nextSlide = () => {
    if (lesson && currentSlide < (lesson.slides?.length || 0)) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedOption) return;

    setIsSubmitting(true);
    try {
      await mockDB.completeLesson(user.id, id, selectedOption);
      setPointsAwarded(50);
      setIsCompleted(true);
      setTimeout(() => {
        router.push('/lessons');
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!lesson) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const isQuiz = currentSlide === (lesson.slides?.length || 0);
  const progress = ((currentSlide + 1) / ((lesson.slides?.length || 0) + 1)) * 100;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 pb-20 lg:pt-20">
        <Navbar />
        
        <main className="max-w-xl mx-auto px-6 py-8">
          <Link 
            href="/lessons"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Exit Lesson
          </Link>

          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-gray-200 rounded-full mb-12 overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {isCompleted ? (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in duration-500 bg-white rounded-card p-12 shadow-inflow border border-secondary-inflow">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 relative border border-green-100">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce shadow-sm">
                  +{pointsAwarded} PTS
                </div>
              </div>
              <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Amazing Work!</h1>
              <p className="text-text-secondary mb-4 font-body">You&apos;ve taken another step toward mastering your ADHD.</p>
              <p className="text-sm text-gray-400">Heading back to your path...</p>
            </div>
          ) : (
            <article className="relative min-h-[450px] font-body">
              {!isQuiz ? (
                <div key={currentSlide} className="bg-white p-10 rounded-card shadow-inflow border border-secondary-inflow animate-in fade-in slide-in-from-right-8 duration-500">
                  <span className="text-xs font-bold text-teal-mid tracking-widest uppercase mb-4 block opacity-70">DAILY STEP {currentSlide + 1}</span>
                  <h1 className="text-3xl font-heading font-bold text-foreground mb-8 leading-tight">{lesson.title}</h1>
                  
                  <div className="prose prose-slate max-w-none mb-12">
                    <p className="text-xl text-text-secondary leading-relaxed font-medium">
                      {lesson.slides?.[currentSlide] || 'Content loading...'}
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-auto pt-8 border-t border-secondary-inflow">
                    <button
                      onClick={prevSlide}
                      disabled={currentSlide === 0}
                      className="p-4 rounded-btn bg-secondary-inflow text-teal-mid hover:bg-primary-inflow disabled:opacity-0 transition-all"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="inline-flex items-center gap-2 px-10 py-4 bg-primary-inflow text-teal-dark font-bold rounded-btn hover:opacity-90 transition-all shadow-sm"
                    >
                      Next Step <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <section className="bg-white p-10 rounded-card shadow-inflow border border-secondary-inflow animate-in fade-in slide-in-from-right-8 duration-500">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-teal-dark rounded-xl flex items-center justify-center text-white shadow-lg">
                      <span className="font-heading font-bold text-xl">?</span>
                    </div>
                    <h2 className="text-2xl font-heading font-bold text-foreground">Checkpoint</h2>
                  </div>
                  
                  <p className="text-foreground font-medium mb-10 text-xl leading-relaxed">
                    {lesson.exercise}
                  </p>

                  <div className="grid gap-4 mb-10">
                    {lesson.options.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleOptionSelect(option)}
                        className={`w-full p-6 text-left rounded-btn border-2 transition-all flex items-center justify-between group ${
                          selectedOption === option 
                          ? 'border-teal-mid bg-secondary-inflow text-teal-dark shadow-sm' 
                          : 'border-transparent bg-gray-50 text-text-secondary hover:bg-secondary-inflow hover:border-teal-mid/30'
                        }`}
                      >
                        <span className="font-semibold text-lg">{option}</span>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedOption === option ? 'border-teal-mid bg-teal-mid' : 'border-gray-300'
                        }`}>
                          {selectedOption === option && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={prevSlide}
                      className="p-4 rounded-btn bg-secondary-inflow text-teal-mid hover:bg-primary-inflow transition-all"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting || !selectedOption}
                      className="flex-1 py-5 bg-teal-dark text-white font-heading font-bold rounded-btn hover:opacity-95 disabled:opacity-50 disabled:bg-gray-300 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] shadow-lg"
                    >
                      {isSubmitting ? 'Recording...' : 'Complete Step'} <Send className="w-4 h-4" />
                    </button>
                  </div>
                </section>
              )}
            </article>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
