'use client';

import React, { Suspense } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Suspense fallback={<div className="h-16 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800" />}>
        <Navbar />
      </Suspense>

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Suspense fallback={<div className="w-64 hidden lg:block border-r border-slate-200 dark:border-slate-800" />}>
          <Sidebar />
        </Suspense>

        <main className="flex-1 min-w-0 p-4 sm:p-6 pb-24 lg:pb-8">
          <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading campus view...</div>}>
            {children}
          </Suspense>
        </main>
      </div>

      <Suspense fallback={null}>
        <MobileNav />
      </Suspense>
    </div>
  );
}
