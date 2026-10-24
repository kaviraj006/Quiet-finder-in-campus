'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Volume2,
  MapPin,
  Moon,
  Sun,
  Shield,
  User,
  PlusCircle,
  FlaskConical,
  ExternalLink,
  ChevronDown,
  Info,
} from 'lucide-react';
import { store } from '@/lib/store';
import { TIME_SLOTS } from '@/lib/constants';
import { getCurrentCampusTimeSlot } from '@/lib/noise';
import { UserProfile } from '@/lib/types';

export default function Navbar() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [showDemoData, setShowDemoData] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [activeSlot, setActiveSlot] = useState(0);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setCurrentUser(store.getCurrentUser());
    setShowDemoData(store.isShowDemoData());
    setActiveSlot(getCurrentCampusTimeSlot());

    const unsubscribe = store.subscribe(() => {
      setCurrentUser(store.getCurrentUser());
      setShowDemoData(store.isShowDemoData());
    });

    const isDarkMode =
      document.documentElement.getAttribute('data-theme') === 'dark' ||
      document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);

    return () => unsubscribe();
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.classList.remove('dark');
    }
  };

  const handleRoleSwitch = (role: 'student' | 'admin') => {
    store.switchRole(role);
    setUserDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      {/* Demo Data Warning Banner (Preserves master requirement: visible, distinct demo indicator) */}
      {showDemoData && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-900 dark:text-amber-200 px-4 py-1.5 text-xs flex items-center justify-between font-medium">
          <div className="flex items-center gap-1.5 max-w-4xl">
            <FlaskConical className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong>DEMO DATA ACTIVE:</strong> Displaying simulated 216 paper test observations across 9 locations. Real student submissions are marked separately.
            </span>
          </div>
          <button
            onClick={() => store.setShowDemoData(false)}
            className="text-[11px] underline hover:no-underline font-semibold ml-2 shrink-0 cursor-pointer text-amber-800 dark:text-amber-300"
          >
            Switch to Clean Real Data
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-teal-800 dark:bg-teal-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            {/* Custom Soundwave + Pin Icon */}
            <svg
              className="w-5 h-5 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              <path
                d="M3 13v-2m18 2v-2M1 15v-6m22 6v-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                Quiet Finder
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300">
                VIT Chennai
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 -mt-0.5 hidden sm:block">
              Find your quiet on campus
            </p>
          </div>
        </Link>

        {/* Current Campus Context Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs">
          <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">Vandalur-Kelambakkam Rd</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500">Slot: {TIME_SLOTS[activeSlot].label}</span>
        </div>

        {/* Actions & Profile */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/report"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-800 hover:bg-teal-900 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-medium text-xs shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Report Noise</span>
            <span className="sm:hidden">Report</span>
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Account / Role Menu */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-medium text-slate-700 dark:text-slate-200"
            >
              <div className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold text-xs">
                {currentUser?.role === 'admin' ? 'A' : 'S'}
              </div>
              <span className="hidden md:inline max-w-[120px] truncate">
                {currentUser?.display_name || 'Guest'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 text-xs">
                <div className="p-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {currentUser?.display_name}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 font-semibold text-[10px] uppercase">
                      {currentUser?.role}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ID: {currentUser?.vit_reg_no || 'VIT-2026'}
                    </span>
                  </div>
                </div>

                <div className="py-1 flex flex-col gap-0.5">
                  <Link
                    href="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-300"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>My Profile & Preferences</span>
                  </Link>

                  <Link
                    href="/my-contributions"
                    onClick={() => setUserDropdownOpen(false)}
                    className="px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-300"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>My Noise Reports</span>
                  </Link>

                  {currentUser?.role === 'admin' ? (
                    <Link
                      href="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>Admin Dashboard</span>
                    </Link>
                  ) : null}
                </div>

                {/* Instant Role Switching for evaluation/demo */}
                <div className="mt-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] uppercase text-slate-400 font-bold px-2 py-1">
                    Demo Mode Switcher
                  </p>
                  <div className="grid grid-cols-2 gap-1 px-1">
                    <button
                      onClick={() => handleRoleSwitch('student')}
                      className={`py-1 px-2 rounded text-center font-medium transition-colors ${
                        currentUser?.role === 'student'
                          ? 'bg-teal-800 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Student View
                    </button>
                    <button
                      onClick={() => handleRoleSwitch('admin')}
                      className={`py-1 px-2 rounded text-center font-medium transition-colors ${
                        currentUser?.role === 'admin'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Admin View
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
