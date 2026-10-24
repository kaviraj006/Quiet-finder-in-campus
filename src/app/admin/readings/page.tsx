'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { store } from '@/lib/store';
import { formatCampusTime, getNoiseCategory, getNoiseColor } from '@/lib/noise';
import { TIME_SLOTS } from '@/lib/constants';
import { NoiseReading } from '@/lib/types';
import {
  CheckSquare,
  Smartphone,
  MessageSquare,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Filter,
  Search,
  FlaskConical,
} from 'lucide-react';

export default function AdminReadingsPage() {
  const [readings, setReadings] = useState<NoiseReading[]>([]);
  const [spotFilter, setSpotFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [demoFilter, setDemoFilter] = useState<'all' | 'genuine' | 'demo'>('all');

  useEffect(() => {
    const load = () => {
      setReadings(store.getReadings({ includeDemo: true }));
    };
    load();
    const unsub = store.subscribe(load);
    return () => unsub();
  }, []);

  const spots = store.getSpots(true);
  const getSpotName = (id: string) => spots.find((s) => s.id === id)?.name || id;

  const handleStatusChange = (id: string, status: NoiseReading['review_status']) => {
    store.updateReadingStatus(id, status);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete reading permanently?')) {
      store.deleteReading(id);
    }
  };

  const filteredReadings = readings.filter((r) => {
    const matchesSpot = spotFilter === 'all' || r.spot_id === spotFilter;
    const matchesMethod = methodFilter === 'all' || r.method === methodFilter;
    const matchesStatus = statusFilter === 'all' || r.review_status === statusFilter;
    const matchesDemo =
      demoFilter === 'all' ||
      (demoFilter === 'genuine' && !r.is_demo) ||
      (demoFilter === 'demo' && r.is_demo);
    return matchesSpot && matchesMethod && matchesStatus && matchesDemo;
  });

  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                Administration
              </span>
              <span className="text-xs text-slate-400">Data Integrity & Noise Quality</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              Noise Reading Moderation
            </h1>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Location</label>
            <select
              value={spotFilter}
              onChange={(e) => setSpotFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs"
            >
              <option value="all">All Campus Locations</option>
              {spots.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Method</label>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs"
            >
              <option value="all">All Methods</option>
              <option value="phone_meter">Phone Sound-Meter</option>
              <option value="manual_estimate">Manual Estimate</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Dataset</label>
            <select
              value={demoFilter}
              onChange={(e) => setDemoFilter(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs"
            >
              <option value="all">All Records</option>
              <option value="genuine">Genuine Student Submissions</option>
              <option value="demo">Simulated Paper Demo Data</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs"
            >
              <option value="all">All Review States</option>
              <option value="approved">Approved</option>
              <option value="flagged">Flagged</option>
              <option value="excluded">Excluded</option>
            </select>
          </div>
        </div>

        {/* Readings Moderation Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Location & Author</th>
                  <th className="py-3 px-4">Observed Sound</th>
                  <th className="py-3 px-4">Time Slot</th>
                  <th className="py-3 px-4">Context Note</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredReadings.map((reading) => {
                  const isPhone = reading.method === 'phone_meter';
                  const db = reading.db_level;
                  const slot = TIME_SLOTS[reading.time_slot]?.label || 'Slot';

                  return (
                    <tr key={reading.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {getSpotName(reading.spot_id)}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>{reading.author_name || 'Anonymous'}</span>
                          {reading.is_demo && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                              <FlaskConical className="w-2.5 h-2.5" />
                              DEMO
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {isPhone && db !== null ? (
                          <div className="flex items-center gap-1.5">
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
                          <span className="capitalize px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
                            {reading.estimate_level}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        <div>{slot}</div>
                        <span className="text-[10px] text-slate-400">
                          {formatCampusTime(reading.observation_time)}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-500 max-w-[180px] truncate">
                        {reading.note || '—'}
                      </td>

                      <td className="py-3 px-4">
                        {reading.review_status === 'approved' ? (
                          <span className="text-emerald-600 font-bold text-[11px]">Approved</span>
                        ) : reading.review_status === 'flagged' ? (
                          <span className="text-amber-600 font-bold text-[11px]">Flagged</span>
                        ) : (
                          <span className="text-rose-600 font-bold text-[11px]">Excluded</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {reading.review_status !== 'approved' && (
                            <button
                              onClick={() => handleStatusChange(reading.id, 'approved')}
                              title="Approve reading into public statistics"
                              className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 rounded font-semibold text-[10px]"
                            >
                              Approve
                            </button>
                          )}
                          {reading.review_status !== 'excluded' && (
                            <button
                              onClick={() => handleStatusChange(reading.id, 'excluded')}
                              title="Exclude reading from rankings & map"
                              className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300 rounded font-semibold text-[10px]"
                            >
                              Exclude
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(reading.id)}
                            title="Delete permanently"
                            className="p-1 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
