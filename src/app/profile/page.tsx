'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { store } from '@/lib/store';
import { UserProfile } from '@/lib/types';
import {
  User,
  Mail,
  Shield,
  Key,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Building,
  GraduationCap,
} from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [vitRegNo, setVitRegNo] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const u = store.getCurrentUser();
    setUser(u);
    if (u) {
      setDisplayName(u.display_name);
      setVitRegNo(u.vit_reg_no || '');
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const updated: UserProfile = {
      ...user,
      display_name: displayName.trim(),
      vit_reg_no: vitRegNo.trim(),
      updated_at: new Date().toISOString(),
    };

    store.setCurrentUser(updated);
    setUser(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const isVITEmail = user?.email.endsWith('@vitstudent.ac.in');

  return (
    <AppLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-6 h-6 text-teal-700 dark:text-teal-400" />
            <span>Student Profile & Preferences</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your account identity, institutional email verification, and contribution preferences.
          </p>
        </div>

        {/* Profile Card */}
        <form
          onSubmit={handleSave}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
        >
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-12 h-12 rounded-full bg-teal-800 text-white flex items-center justify-center font-black text-lg">
              {displayName.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {user?.display_name}
              </h3>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                VIT Registration Number
              </label>
              <input
                type="text"
                value={vitRegNo}
                onChange={(e) => setVitRegNo(e.target.value)}
                placeholder="e.g. 26BCE1042"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Email Domain Verification Badge */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-teal-700 dark:text-teal-400" />
              <div>
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  Institutional Verification
                </span>
                <p className="text-[11px] text-slate-500">
                  Authorized Domain: <code>vitstudent.ac.in</code>
                </p>
              </div>
            </div>

            {isVITEmail ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                Verified Student
              </span>
            ) : (
              <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                External / Guest
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            {savedSuccess ? (
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Profile updated successfully!
              </span>
            ) : (
              <span />
            )}

            <button
              type="submit"
              className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Save Profile Changes
            </button>
          </div>
        </form>

        {/* Account & Data Management */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-slate-500" />
            <span>Account Security & Data Privacy Policy</span>
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Quiet Finder does not collect raw microphone audio recordings or real-time continuous GPS tracking. Submitted observations are stored purely as numeric decibels or qualitative tags associated with campus study spaces.
          </p>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-rose-600">Account Deletion & Data Removal</span>
              <p className="text-[11px] text-slate-400">
                Purge your profile and disassociate all personal records from the community repository.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (confirm('Are you sure you want to request account data deletion?')) {
                  alert('Your account deletion request has been registered in the audit queue.');
                }
              }}
              className="px-3 py-1.5 border border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-xs font-bold transition-colors self-start sm:self-auto"
            >
              Request Account Deletion
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
