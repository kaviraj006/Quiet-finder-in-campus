'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import SlotSelector from '@/components/dashboard/SlotSelector';
import { store } from '@/lib/store';
import { getCurrentCampusTimeSlot, getNoiseCategory, getNoiseColor, formatCampusTime } from '@/lib/noise';
import { TIME_SLOTS, SPOT_CATEGORIES } from '@/lib/constants';
import { CampusSpot, SpotStats } from '@/lib/types';
import Link from 'next/link';
import {
  BarChart3,
  Volume2,
  Filter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Bookmark,
  PlusCircle,
  Search,
} from 'lucide-react';

export default function RankingsPage() {
  const [spots, setSpots] = useState<CampusSpot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number>(0);
  const [statsMap, setStatsMap] = useState<Record<string, SpotStats>>({});
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'quietest' | 'loudest' | 'samples' | 'updated'>('quietest');
  const [onlySufficientData, setOnlySufficientData] = useState<boolean>(false);

  useEffect(() => {
    setSelectedSlot(getCurrentCampusTimeSlot());

    const loadData = () => {
      const allSpots = store.getSpots();
      setSpots(allSpots);
      setStatsMap(store.getAllSpotStats(selectedSlot));
    };

    loadData();
    const unsub = store.subscribe(loadData);
    return () => unsub();
  }, [selectedSlot]);

  const slotLabel = TIME_SLOTS[selectedSlot]?.label || 'Slot';

  // Process spots with stats
  const items = spots
    .map((spot) => ({
      spot,
      stats: statsMap[spot.id],
    }))
    .filter(({ spot, stats }) => {
      const matchesSearch =
        spot.name.toLowerCase().includes(search.toLowerCase()) ||
        spot.building_name?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || spot.category === selectedCategory;
      const matchesSufficient =
        !onlySufficientData || (stats && stats.isSufficientData);

      return matchesSearch && matchesCategory && matchesSufficient;
    });

  // Separate measured spots vs no-data spots
  const withMeasured = items.filter(
    (item) => item.stats && item.stats.energyAvgDb !== null
  );

  const withoutMeasured = items.filter(
    (item) => !item.stats || item.stats.energyAvgDb === null
  );

  // Sorting
  withMeasured.sort((a, b) => {
    if (sortBy === 'quietest') {
      return (a.stats.energyAvgDb || 999) - (b.stats.energyAvgDb || 999);
    }
    if (sortBy === 'loudest') {
      return (b.stats.energyAvgDb || 0) - (a.stats.energyAvgDb || 0);
    }
    if (sortBy === 'samples') {
      return (b.stats.totalCount || 0) - (a.stats.totalCount || 0);
    }
    if (sortBy === 'updated') {
      const tA = a.stats.mostRecentReadingTime
        ? new Date(a.stats.mostRecentReadingTime).getTime()
        : 0;
      const tB = b.stats.mostRecentReadingTime
        ? new Date(b.stats.mostRecentReadingTime).getTime()
        : 0;
      return tB - tA;
    }
    return 0;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-teal-700 dark:text-teal-400" />
            <span>Quietest Study Space Rankings</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Compare campus locations ranked by energy-averaged decibel sound levels for any 2-hour window.
          </p>
        </div>

        {/* Slot Selector */}
        <SlotSelector selectedSlot={selectedSlot} onSelectSlot={setSelectedSlot} />

        {/* Filters and Search Bar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by name or block..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <label className="text-xs text-slate-500 font-medium">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 px-2.5 text-xs text-slate-900 dark:text-white font-medium"
              >
                <option value="quietest">Quietest First (Lowest dB)</option>
                <option value="loudest">Loudest First (Highest dB)</option>
                <option value="samples">Most Observations</option>
                <option value="updated">Recently Updated</option>
              </select>

              <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium cursor-pointer ml-2">
                <input
                  type="checkbox"
                  checked={onlySufficientData}
                  onChange={(e) => setOnlySufficientData(e.target.checked)}
                  className="rounded accent-teal-800"
                />
                <span>Min 3 readings only</span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-teal-800 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              All Campus
            </button>
            {SPOT_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat.value
                    ? 'bg-teal-800 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ranked Results Cards */}
        <div className="space-y-3">
          {withMeasured.map(({ spot, stats }, index) => {
            const db = stats.energyAvgDb!;
            const color = getNoiseColor(db);
            const isSaved = store.isSpotSaved(spot.id);

            return (
              <div
                key={spot.id}
                className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                      index === 0
                        ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 ring-2 ring-amber-400'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    #{index + 1}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/spots/${spot.id}`}
                        className="font-extrabold text-base text-slate-900 dark:text-white hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
                      >
                        {spot.name}
                      </Link>
                      {index === 0 && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                          Quietest
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {spot.building_name} • {spot.floor || 'Campus'} • Category: {spot.category}
                    </p>
                  </div>
                </div>

                {/* Sound Level & Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-full sm:w-48">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {db} dB(A)
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-bold border ${
                          getNoiseCategory(db).badgeBg
                        }`}
                      >
                        {getNoiseCategory(db).label}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max(10, Math.min(100, ((db - 30) / 60) * 100))}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>{stats.totalCount} readings</span>
                      <span
                        className={
                          stats.isSufficientData
                            ? 'text-emerald-600 font-medium'
                            : 'text-amber-600 font-medium'
                        }
                      >
                        {stats.isSufficientData ? '✓ Sufficient' : '⚠ Limited'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/spots/${spot.id}`}
                      className="px-3 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                    >
                      <span>Details</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      onClick={() => store.toggleSaveSpot(spot.id)}
                      className={`p-2 rounded-lg border text-xs transition-colors ${
                        isSaved
                          ? 'bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {withMeasured.length === 0 && (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <Volume2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
                No matching study spaces found
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Try loosening your filters or switch to another 2-hour slot.
              </p>
            </div>
          )}
        </div>

        {/* Separate No Data Section */}
        {withoutMeasured.length > 0 && (
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">
              Locations Without Sufficient Reports In {slotLabel} ({withoutMeasured.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {withoutMeasured.map(({ spot, stats }) => (
                <div
                  key={spot.id}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                      {spot.name}
                    </p>
                    <span className="text-[11px] text-slate-400">
                      {stats && stats.estimateCount > 0
                        ? `${stats.estimateCount} manual estimates`
                        : 'No observations logged'}
                    </span>
                  </div>
                  <Link
                    href={`/report?spotId=${spot.id}`}
                    className="text-xs text-teal-700 dark:text-teal-400 font-bold hover:underline"
                  >
                    + Log
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
