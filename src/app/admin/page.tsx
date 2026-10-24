'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { store } from '@/lib/store';
import { CampusSpot, NoiseReading, ReadingFlag, UserProfile } from '@/lib/types';
import Link from 'next/link';
import {
  Shield,
  MapPin,
  CheckSquare,
  AlertTriangle,
  Sliders,
  FileSpreadsheet,
  Users,
  Database,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function AdminOverviewPage() {
  const [spots, setSpots] = useState<CampusSpot[]>([]);
  const [readings, setReadings] = useState<NoiseReading[]>([]);
  const [flags, setFlags] = useState<ReadingFlag[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    setUser(store.getCurrentUser());
    const load = () => {
      setSpots(store.getSpots(true));
      setReadings(store.getReadings({ includeDemo: true }));
      setFlags(store.getFlags());
    };
    load();
    const unsub = store.subscribe(load);
    return () => unsub();
  }, []);

  const verifiedSpotsCount = spots.filter((s) => s.is_verified).length;
  const pendingSpotsCount = spots.filter((s) => !s.is_verified).length;
  const demoReadingsCount = readings.filter((r) => r.is_demo).length;
  const genuineReadingsCount = readings.filter((r) => !r.is_demo).length;
  const pendingFlagsCount = flags.filter((f) => f.status === 'pending').length;

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                Administration
              </span>
              <span className="text-xs text-slate-400">VIT Chennai Campus Operations</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              Quiet Finder Administrative Control Center
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/settings"
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
              <span>Export CSV</span>
            </Link>
          </div>
        </div>

        {/* Core Administrative KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Campus Spaces</span>
              <MapPin className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {spots.length}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {verifiedSpotsCount} verified GPS • {pendingSpotsCount} pending coords
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Sound Readings</span>
              <Database className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {readings.length}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {genuineReadingsCount} genuine • {demoReadingsCount} simulated paper seed
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Flagged Submissions</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {pendingFlagsCount}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Pending review by moderators
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">System Role</span>
              <Shield className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-lg font-black text-slate-900 dark:text-white capitalize">
              {user?.role || 'Admin'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Authoritative backend validation
            </p>
          </div>
        </div>

        {/* Administration Navigation Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/admin/spots"
            className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-teal-600 dark:hover:border-teal-500 shadow-xs transition-all group flex items-start justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center mb-3">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-teal-700 transition-colors">
                Manage Campus Locations & GPS
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Add, edit, deactivate study spaces, assign precise latitude/longitude, or use the interactive map click picker to verify coordinates.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-teal-700 group-hover:translate-x-1 transition-all mt-2" />
          </Link>

          <Link
            href="/admin/readings"
            className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-teal-600 dark:hover:border-teal-500 shadow-xs transition-all group flex items-start justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center mb-3">
                <CheckSquare className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                Readings Moderation & Quality
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Inspect raw student measurements, filter out implausible outliers, approve community readings, or exclude disputed noise data.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all mt-2" />
          </Link>

          <Link
            href="/admin/reports"
            className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-teal-600 dark:hover:border-teal-500 shadow-xs transition-all group flex items-start justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center mb-3">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
                Flagged Submissions Queue ({pendingFlagsCount})
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Review community reports where students flagged suspicious or inaccurate readings, review reasons, and resolve flags.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-1 transition-all mt-2" />
          </Link>

          <Link
            href="/admin/settings"
            className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-teal-600 dark:hover:border-teal-500 shadow-xs transition-all group flex items-start justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center mb-3">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-teal-700 transition-colors">
                System Settings & CSV Export
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Configure sample confidence thresholds, email restrictions, reset or purge paper demo seed records, and export datasets.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-teal-700 group-hover:translate-x-1 transition-all mt-2" />
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
