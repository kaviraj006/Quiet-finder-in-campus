'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { store, DEFAULT_DEMO_USER, DEFAULT_ADMIN_USER } from '@/lib/store';
import { Volume2, MapPin, Mail, Lock, ArrowRight, Shield, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide email and password');
      return;
    }

    // Role detection
    if (email.includes('admin')) {
      store.setCurrentUser({
        ...DEFAULT_ADMIN_USER,
        email,
      });
      router.push('/admin');
    } else {
      store.setCurrentUser({
        ...DEFAULT_DEMO_USER,
        email,
        display_name: email.split('@')[0],
      });
      router.push('/');
    }
  };

  const handleQuickLogin = (role: 'student' | 'admin') => {
    store.switchRole(role);
    router.push(role === 'admin' ? '/admin' : '/');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold">
            <Volume2 className="w-6 h-6" />
          </div>
          <span className="font-black text-xl text-slate-900 dark:text-white">Quiet Finder</span>
        </Link>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">
          Sign In to Quiet Finder
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Access VIT Chennai campus noise mapping and log quiet study spaces
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-md rounded-2xl border border-slate-200 dark:border-slate-800 sm:px-8 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Student Email (@vitstudent.ac.in)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student.name@vitstudent.ac.in"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-teal-700 dark:text-teal-400 font-semibold hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              Sign In
            </button>
          </form>

          {/* Quick Demo Credentials Login for Evaluation */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <p className="text-[10px] uppercase font-bold text-slate-400 text-center tracking-wider">
              Quick Evaluation Credentials
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('student')}
                className="py-2 px-3 rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 text-xs font-bold text-center hover:bg-teal-100 transition-colors"
              >
                Demo Student
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="py-2 px-3 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-200 text-xs font-bold text-center hover:bg-indigo-100 transition-colors"
              >
                Demo Admin
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link href="/signup" className="text-teal-700 font-bold hover:underline">
              Sign up with institutional email
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
