'use client';

import React from 'react';
import { Volume2, MapPin, Database, Clock, Sparkles, CheckCircle2 } from 'lucide-react';
import { CampusSpot, SpotStats } from '@/lib/types';
import { getNoiseCategory, getNoiseColor, formatCampusTime } from '@/lib/noise';
import Link from 'next/link';

interface SummaryCardsProps {
  spots: CampusSpot[];
  statsMap: Record<string, SpotStats>;
  selectedSlotLabel: string;
}

export default function SummaryCards({
  spots,
  statsMap,
  selectedSlotLabel,
}: SummaryCardsProps) {
  // Find quietest spot that has measured data
  const spotsWithMeasured = spots
    .filter((s) => statsMap[s.id] && statsMap[s.id].energyAvgDb !== null)
    .sort((a, b) => (statsMap[a.id].energyAvgDb || 999) - (statsMap[b.id].energyAvgDb || 999));

  const quietestSpot = spotsWithMeasured[0] || null;
  const quietestDb = quietestSpot ? statsMap[quietestSpot.id].energyAvgDb! : null;

  // Spots with valid observations in this slot
  const spotsWithDataCount = spots.filter(
    (s) => statsMap[s.id] && statsMap[s.id].totalCount > 0
  ).length;

  // Total valid reports in this slot
  const totalReportsCount = Object.values(statsMap).reduce(
    (acc, st) => acc + (st.totalCount || 0),
    0
  );

  // Most recent timestamp among all spots in this slot
  const mostRecentTimestamp = Object.values(statsMap).reduce<string | null>((latest, st) => {
    if (!st.mostRecentReadingTime) return latest;
    if (!latest) return st.mostRecentReadingTime;
    return new Date(st.mostRecentReadingTime) > new Date(latest)
      ? st.mostRecentReadingTime
      : latest;
  }, null);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* 1. Quietest Spot Card */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Quietest Spot</span>
            <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          {quietestSpot ? (
            <div>
              <Link
                href={`/spots/${quietestSpot.id}`}
                className="font-bold text-base text-slate-900 dark:text-white hover:text-teal-700 dark:hover:text-teal-400 transition-colors line-clamp-1"
              >
                {quietestSpot.name}
              </Link>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {quietestDb} <span className="text-xs font-semibold text-slate-500">dB(A)</span>
                </span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-md font-semibold border ${
                    getNoiseCategory(quietestDb!).badgeBg
                  }`}
                >
                  {getNoiseCategory(quietestDb!).label}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-500 italic mt-1">
              No measurements yet in {selectedSlotLabel}
            </div>
          )}
        </div>
        <p className="text-[11px] text-slate-400 mt-2">Slot: {selectedSlotLabel}</p>
      </div>

      {/* 2. Spots with Data */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Campus Coverage</span>
            <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {spotsWithDataCount}{' '}
            <span className="text-sm font-normal text-slate-500">of {spots.length} spaces</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {Math.round((spotsWithDataCount / (spots.length || 1)) * 100)}% mapped with active reports
          </p>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
          <div
            className="bg-emerald-600 h-full rounded-full"
            style={{
              width: `${Math.round((spotsWithDataCount / (spots.length || 1)) * 100)}%`,
            }}
          />
        </div>
      </div>

      {/* 3. Valid Reports in Slot */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Community Reports</span>
            <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {totalReportsCount}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Contributing readings for {selectedSlotLabel}
          </p>
        </div>
        <p className="text-[11px] text-slate-400 mt-2">Validated via client & server rules</p>
      </div>

      {/* 4. Last Updated Timestamp */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Latest Update</span>
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="font-bold text-sm text-slate-900 dark:text-white mt-1">
            {formatCampusTime(mostRecentTimestamp)}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Campus local time (Asia/Kolkata)
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-time aggregation engine active</span>
        </div>
      </div>
    </div>
  );
}
