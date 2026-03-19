'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { LayoutDashboard, BookOpen, BarChart2, LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Lessons', href: '/lessons', icon: BookOpen },
    { name: 'Progress', href: '/progress', icon: BarChart2 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 lg:top-0 lg:bottom-auto bg-white border-t lg:border-t-0 lg:border-b border-secondary-inflow z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 lg:h-20 flex items-center justify-between font-body">
        <Link href="/dashboard" className="hidden lg:flex items-center gap-2 font-heading font-bold text-2xl text-teal-dark">
          FocusPoint
        </Link>

        <div className="flex flex-1 lg:flex-none justify-around lg:justify-end gap-x-1 lg:gap-x-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col lg:flex-row items-center gap-1 lg:gap-2 px-4 py-2 rounded-btn transition-all ${
                  isActive ? 'bg-secondary-inflow text-teal-dark shadow-sm' : 'text-text-secondary hover:text-foreground hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-6 h-6 lg:w-5 lg:h-5 ${isActive ? 'text-teal-mid' : 'text-gray-400'}`} />
                <span className="text-[10px] lg:text-sm font-semibold">{item.name}</span>
              </Link>
            );
          })}
          <button
            onClick={logout}
            className="flex flex-col lg:flex-row items-center gap-1 lg:gap-2 px-4 py-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-btn transition-all"
          >
            <LogOut className="w-6 h-6 lg:w-5 lg:h-5" />
            <span className="text-[10px] lg:text-sm font-semibold">Log out</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
