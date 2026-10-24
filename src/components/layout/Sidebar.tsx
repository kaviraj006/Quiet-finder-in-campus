'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Compass,
  Map as MapIcon,
  BarChart3,
  PlusCircle,
  Bookmark,
  History,
  Shield,
  HelpCircle,
  MapPin,
  ListFilter,
  CheckSquare,
  AlertTriangle,
  Sliders,
  ChevronRight,
} from 'lucide-react';
import { store } from '@/lib/store';
import { UserProfile } from '@/lib/types';

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    setUser(store.getCurrentUser());
    const unsub = store.subscribe(() => {
      setUser(store.getCurrentUser());
    });
    return () => unsub();
  }, []);

  const navItems = [
    { href: '/', label: 'Overview & Map', icon: Compass },
    { href: '/map', label: 'Full Campus Map', icon: MapIcon },
    { href: '/rankings', label: 'Quietest Rankings', icon: BarChart3 },
    { href: '/report', label: 'Report Noise', icon: PlusCircle },
    { href: '/saved', label: 'Saved Study Spaces', icon: Bookmark },
    { href: '/my-contributions', label: 'My Contributions', icon: History },
    { href: '/how-it-works', label: 'How Quiet Finder Works', icon: HelpCircle },
  ];

  const adminItems = [
    { href: '/admin', label: 'Admin Overview', icon: Shield },
    { href: '/admin/spots', label: 'Campus Spots & GPS', icon: MapPin },
    { href: '/admin/readings', label: 'Reading Moderation', icon: CheckSquare },
    { href: '/admin/reports', label: 'Flagged Submissions', icon: AlertTriangle },
    { href: '/admin/settings', label: 'System Settings', icon: Sliders },
  ];

  const isAdmin = user?.role === 'admin';

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm hidden lg:flex flex-col justify-between p-4 shrink-0 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      <div className="space-y-6">
        {/* Main Navigation */}
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Campus Navigation
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-teal-800 text-white font-semibold shadow-sm dark:bg-teal-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Administration Section */}
        {isAdmin && (
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between px-3 mb-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Administration
              </p>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                Admin
              </span>
            </div>
            <nav className="space-y-1">
              {adminItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Campus Summary Box */}
      <div className="p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60 rounded-xl">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
          <span className="text-xs font-bold text-teal-900 dark:text-teal-200">
            VIT Chennai Campus
          </span>
        </div>
        <p className="text-[11px] text-teal-800/80 dark:text-teal-300/80 leading-relaxed">
          Crowdsourced noise intelligence for students, by students. Measured via phone apps & community observations.
        </p>
      </div>
    </aside>
  );
}
