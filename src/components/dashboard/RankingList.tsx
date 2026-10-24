'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CampusSpot, SpotStats } from '@/lib/types';
import { getNoiseCategory, getNoiseColor, formatCampusTime } from '@/lib/noise';
import {
  Volume2,
  ChevronRight,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Filter,
} from 'lucide-react';

interface RankingListProps {
  spots: CampusSpot[];
  statsMap: Record<string, SpotStats>;
  slotLabel: string;
  onSelectSpot?: (spot: CampusSpot) => void;
  selectedSpotId?: string | null;
}

export default function RankingList({
  spots,
  statsMap,
  slotLabel,
  onSelectSpot,
  selectedSpotId,
}: RankingListProps) {
  const [filterMode, setFilterMode] = useState<'all' | 'measured' | 'estimates'>('all');

  // Categorize spots: with measured data, with estimates only, without data
  const spotsWithStats = spots.map((spot) => ({
    spot,
    stats: statsMap[spot.id],
  }));

  const measuredRankings = spotsWithStats
    .filter((item) => item.stats && item.stats.energyAvgDb !== null)
    .sort((a, b) => a.stats.energyAvgDb! - b.stats.energyAvgDb!);

  const estimatesOnly = spotsWithStats.filter(
    (item) => item.stats && item.stats.energyAvgDb === null && item.stats.estimateCount > 0
  );

  const noDataSpots = spotsWithStats.filter(
    (item) => !item.stats || item.stats.totalCount === 0
  );

  // Filter based on user selection
  const displayedRankings =
    filterMode === 'estimates'
      ? []
      : measuredRankings;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-teal-700 dark:text-teal-400" />
            <span>Quietest Study Spaces Ranking</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ranked for time slot: <strong className="text-slate-700 dark:text-slate-200">{slotLabel}</strong>
          </p>
        </div>

        {/* Measurement Method Filter */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              filterMode === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            All Verified
          </button>
          <button
            onClick={() => setFilterMode('measured')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              filterMode === 'measured'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Measured Only
          </button>
        </div>
      </div>

      {/* Measured Rankings List */}
      <div className="space-y-2">
        {displayedRankings.map(({ spot, stats }, idx) => {
          const db = stats.energyAvgDb!;
          const color = getNoiseColor(db);
          const isSelected = spot.id === selectedSpotId;
          const isQuietest = idx === 0;

          // Normalized width from 30 to 90 dB for visual bar
          const barWidthPercent = Math.max(8, Math.min(100, Math.round(((db - 30) / 60) * 100)));

          return (
            <div
              key={spot.id}
              onClick={() => onSelectSpot && onSelectSpot(spot)}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'border-teal-700 bg-teal-50/50 dark:border-teal-500 dark:bg-teal-950/30 ring-1 ring-teal-600'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      isQuietest
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/spots/${spot.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-bold text-sm text-slate-900 dark:text-white hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
                      >
                        {spot.name}
                      </Link>
                      {isQuietest && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                          Quietest
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {spot.building_name} • {spot.floor || 'Campus'}
                    </span>
                  </div>
                </div>

                {/* Numeric Reading & Qualitative Label */}
                <div className="text-right shrink-0">
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {db} <span className="text-xs font-semibold text-slate-400">dB(A)</span>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-semibold border ${
                      getNoiseCategory(db).badgeBg
                    }`}
                  >
                    {getNoiseCategory(db).label}
                  </span>
                </div>
              </div>

              {/* Acoustic Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-1.5">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${barWidthPercent}%`,
                    backgroundColor: color,
                  }}
                />
              </div>

              {/* Sample metadata & Confidence Label */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                <span>
                  {stats.totalCount} reading{stats.totalCount > 1 ? 's' : ''} ({stats.measuredCount} phone-meter)
                </span>
                <span
                  className={`font-medium ${
                    stats.isSufficientData
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {stats.isSufficientData ? '✓ Sufficient sample' : '⚠ Limited sample (provisional)'}
                </span>
              </div>
            </div>
          );
        })}

        {displayedRankings.length === 0 && (
          <div className="text-center py-6 text-sm text-slate-500">
            No measured readings logged for this time slot yet.
          </div>
        )}
      </div>

      {/* Community Estimates Section (Explicitly separated per requirement) */}
      {estimatesOnly.length > 0 && filterMode !== 'measured' && (
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
            Subjective Community Estimates (Fallback reports without phone dB):
          </p>
          <div className="space-y-1.5">
            {estimatesOnly.map(({ spot, stats }) => (
              <div
                key={spot.id}
                className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{spot.name}</span>
                  <span className="text-[11px] text-slate-500 ml-2">
                    ({stats.estimateCount} estimate{stats.estimateCount > 1 ? 's' : ''})
                  </span>
                </div>
                <span className="capitalize px-2 py-0.5 rounded font-medium bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                  {stats.dominantEstimate || 'Reported'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Data Yet Section (Requirement from paper & prompt: separate unmeasured locations) */}
      {noDataSpots.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              No Data Yet For This Slot ({noDataSpots.length})
            </span>
            <Link
              href="/report"
              className="text-xs text-teal-700 dark:text-teal-400 font-semibold hover:underline"
            >
              + Log First Reading
            </Link>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {noDataSpots.map(({ spot }) => (
              <Link
                key={spot.id}
                href={`/report?spotId=${spot.id}`}
                className="text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-teal-50 hover:text-teal-800 dark:hover:bg-teal-950 dark:hover:text-teal-300 transition-colors border border-dashed border-slate-300 dark:border-slate-700"
              >
                {spot.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
