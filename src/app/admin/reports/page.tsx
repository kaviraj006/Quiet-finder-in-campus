'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { store } from '@/lib/store';
import { ReadingFlag } from '@/lib/types';
import { formatCampusTime } from '@/lib/noise';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  ArrowRight,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminReportsPage() {
  const [flags, setFlags] = useState<ReadingFlag[]>([]);

  useEffect(() => {
    const load = () => {
      setFlags(store.getFlags());
    };
    load();
    const unsub = store.subscribe(load);
    return () => unsub();
  }, []);

  const readings = store.getReadings({ includeDemo: true });
  const spots = store.getSpots(true);

  const getReading = (id: string) => readings.find((r) => r.id === id);
  const getSpotName = (id: string) => spots.find((s) => s.id === id)?.name || id;

  const handleAction = (flagId: string, action: 'resolve_exclude' | 'dismiss') => {
    store.resolveFlag(flagId, action);
  };

  const pendingFlags = flags.filter((f) => f.status === 'pending');
  const pastFlags = flags.filter((f) => f.status !== 'pending');

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              Moderation Queue
            </span>
            <span className="text-xs text-slate-400">Community Quality Control</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            Flagged Submissions & Inaccurate Data Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review community disputes on suspicious noise readings and enforce campus data integrity.
          </p>
        </div>

        {/* Pending Flags Queue */}
        <div className="space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Pending Moderation Review ({pendingFlags.length})</span>
          </h3>

          {pendingFlags.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <p className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                Moderation Queue Is Clean
              </p>
              <p className="text-xs text-slate-500 mt-1">
                No active student flags requiring moderator intervention.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingFlags.map((flag) => {
                const reading = getReading(flag.reading_id);
                return (
                  <div
                    key={flag.id}
                    className="p-5 bg-white dark:bg-slate-900 rounded-2xl border-2 border-amber-300 dark:border-amber-700 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                          Suspicious Data Report
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {formatCampusTime(flag.created_at)}
                        </span>
                      </div>

                      <div className="text-xs text-slate-700 dark:text-slate-200">
                        <strong>Reason:</strong>{' '}
                        <span className="italic text-slate-900 dark:text-white font-medium">
                          "{flag.reason}"
                        </span>
                      </div>

                      {reading ? (
                        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs space-y-1">
                          <p>
                            <strong>Target Spot:</strong> {getSpotName(reading.spot_id)}
                          </p>
                          <p>
                            <strong>Target Value:</strong>{' '}
                            {reading.db_level ? `${reading.db_level} dB(A)` : reading.estimate_level}{' '}
                            ({reading.method}) • Author: {reading.author_name}
                          </p>
                          {reading.note && (
                            <p className="text-slate-500">Note: {reading.note}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Reading was deleted</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleAction(flag.id, 'resolve_exclude')}
                        className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Exclude Reading
                      </button>

                      <button
                        onClick={() => handleAction(flag.id, 'dismiss')}
                        className="px-3.5 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Dismiss Flag
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Resolved Flags History */}
        {pastFlags.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Past Moderated Flags ({pastFlags.length})
            </h3>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {pastFlags.map((flag) => (
                <div key={flag.id} className="p-3 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Reason: "{flag.reason}"
                    </span>
                    <span className="text-[11px] text-slate-400 ml-2">
                      {formatCampusTime(flag.created_at)}
                    </span>
                  </div>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                      flag.status === 'resolved'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {flag.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
