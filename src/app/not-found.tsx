'use client';

import React from 'react';
import Link from 'next/link';
import { Volume2, MapPin, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-teal-800 text-white flex items-center justify-center font-bold mb-4 shadow-lg">
        <Volume2 className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
        404 — Campus Space Not Found
      </h1>
      <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
        The study spot, observation report, or campus route you are searching for does not exist or has been relocated.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-md transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to VIT Chennai Campus Map</span>
      </Link>
    </div>
  );
}
