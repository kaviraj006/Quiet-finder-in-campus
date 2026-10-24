'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { store } from '@/lib/store';
import { formatCampusTime, getNoiseCategory, getNoiseColor } from '@/lib/noise';
import { TIME_SLOTS } from '@/lib/constants';
import { NoiseReading } from '@/lib/types';
import Link from 'next/link';
import {
  History,
  Volume2,
  Trash2,
  Smartphone,
  MessageSquare,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from 'lucide-react';

export default function MyContributionsPage() {
  const [readings, setReadings] = useState<NoiseReading[]>([]);
  const user = store.getCurrentUser();

  useEffect(() => {
    const loadData = () => {
      // Find readings where author_id matches current user or demo-system
      const all = store.getReadings({ includeDemo: true });
      const userReadings = all.filter(
        (r) => r.author_id === user?.id || (!r.is_demo && r.author_name === user?.display_name)
      );
      setReadings(userReadings);
    };

    loadData();
    const unsub = store.subscribe(loadData);
    return () => unsub();
  }, [user]);

  const spots = store.getSpots();
  const getSpotName = (spotId: string) => spots.find((s) => s.id === spotId)?.name || spotId;

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this noise reading contribution?')) {
      store.deleteReading(id);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-6 h-6 text-teal-700 dark:text-teal-400" />
              <span>My Noise Contributions</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and manage your submitted acoustic sound measurements and community estimates.
            </p>
          </div>

          <Link
            href="/report"
            className="px-3.5 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Submit New Reading</span>
          </Link>
        </div>

        {/* Quick Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Submissions
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {readings.length}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Phone dB Readings
            </span>
            <div className="text-2xl font-black text-teal-700 dark:text-teal-400 mt-1">
              {readings.filter((r) => r.method === 'phone_meter').length}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Manual Estimates
            </span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {readings.filter((r) => r.method === 'manual_estimate').length}
            </div>
          </div>
        </div>

        {/* Contributions List */}
        {readings.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <Volume2 className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-200">
              No contributions submitted yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Whenever you study at the library, academic blocks, or campus cafes, record a 25-second phone sound meter reading to support fellow students!
            </p>
            <Link
              href="/report"
              className="px-4 py-2 bg-teal-800 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5"
            >
              Submit Your First Reading
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Method & Value</th>
                    <th className="py-3 px-4">Time Slot</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {readings.map((reading) => {
                    const isPhone = reading.method === 'phone_meter';
                    const db = reading.db_level;
                    const slot = TIME_SLOTS[reading.time_slot]?.label || 'Slot';

                    return (
                      <tr key={reading.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-3 px-4">
                          <Link
                            href={`/spots/${reading.spot_id}`}
                            className="font-bold text-slate-900 dark:text-white hover:text-teal-700 transition-colors"
                          >
                            {getSpotName(reading.spot_id)}
                          </Link>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {formatCampusTime(reading.observation_time)}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          {isPhone && db !== null ? (
                            <div className="flex items-center gap-1.5">
                              <Smartphone className="w-3.5 h-3.5 text-teal-600" />
                              <span className="font-extrabold text-slate-900 dark:text-white">
                                {db} dB(A)
                              </span>
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${
                                  getNoiseCategory(db).badgeBg
                                }`}
                              >
                                {getNoiseCategory(db).label}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                              <span className="capitalize font-semibold text-slate-800 dark:text-slate-200">
                                {reading.estimate_level}
                              </span>
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          {slot} ({reading.duration_seconds}s)
                        </td>

                        <td className="py-3 px-4">
                          {reading.review_status === 'approved' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" />
                              Approved
                            </span>
                          ) : reading.review_status === 'flagged' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-full">
                              <AlertTriangle className="w-3 h-3" />
                              Under Review
                            </span>
                          ) : (
                            <span className="text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                              Excluded
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDelete(reading.id)}
                            title="Delete this reading"
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
