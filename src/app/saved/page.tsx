'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { store } from '@/lib/store';
import { getCurrentCampusTimeSlot, getNoiseCategory, getNoiseColor } from '@/lib/noise';
import { TIME_SLOTS } from '@/lib/constants';
import { CampusSpot, SpotStats } from '@/lib/types';
import Link from 'next/link';
import { Bookmark, MapPin, Volume2, Trash2, ExternalLink, PlusCircle, Compass } from 'lucide-react';

export default function SavedPage() {
  const [savedSpots, setSavedSpots] = useState<CampusSpot[]>([]);
  const [statsMap, setStatsMap] = useState<Record<string, SpotStats>>({});
  const [activeSlot, setActiveSlot] = useState<number>(0);

  useEffect(() => {
    const slot = getCurrentCampusTimeSlot();
    setActiveSlot(slot);

    const loadData = () => {
      const userSaved = store.getSavedSpots();
      const allSpots = store.getSpots();
      const userSpotList = allSpots.filter((s) => userSaved.some((sv) => sv.spot_id === s.id));
      setSavedSpots(userSpotList);
      setStatsMap(store.getAllSpotStats(slot));
    };

    loadData();
    const unsub = store.subscribe(loadData);
    return () => unsub();
  }, []);

  const slotLabel = TIME_SLOTS[activeSlot]?.label || 'Current Slot';

  const handleRemove = (spotId: string) => {
    store.toggleSaveSpot(spotId);
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Bookmark className="w-6 h-6 text-amber-500 fill-amber-500" />
              <span>Saved Study Spaces</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Your personal shortlist of campus locations with live sound levels for {slotLabel}.
            </p>
          </div>

          <Link
            href="/"
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Compass className="w-3.5 h-3.5 text-teal-600" />
            <span>Discover More Spaces</span>
          </Link>
        </div>

        {savedSpots.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <Bookmark className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-200">
              No saved spaces yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Click the bookmark icon on any campus spot to pin your favourite study spots here for quick sound level checking.
            </p>
            <Link
              href="/"
              className="px-4 py-2 bg-teal-800 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5"
            >
              Explore Campus Map
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedSpots.map((spot) => {
              const stats = statsMap[spot.id];
              const db = stats && stats.energyAvgDb !== null ? stats.energyAvgDb : null;
              const color = db !== null ? getNoiseColor(db) : '#94a3b8';

              return (
                <div
                  key={spot.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {spot.category}
                        </span>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1.5">
                          {spot.name}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {spot.building_name} • {spot.floor || 'Campus'}
                        </p>
                      </div>

                      <button
                        onClick={() => handleRemove(spot.id)}
                        title="Remove from saved"
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3.5 h-3.5 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <span className="font-black text-lg text-slate-900 dark:text-white">
                            {db !== null ? `${db} dB(A)` : 'No slot data'}
                          </span>
                        </div>
                        {db !== null && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                              getNoiseCategory(db).badgeBg
                            }`}
                          >
                            {getNoiseCategory(db).label}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-1">
                        Active slot: {slotLabel} • {stats ? stats.totalCount : 0} readings
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Link
                      href={`/spots/${spot.id}`}
                      className="flex-1 text-center py-2 px-3 bg-teal-800 hover:bg-teal-900 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>View Spot History</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href={`/report?spotId=${spot.id}`}
                      className="py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-1 transition-colors"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-teal-600" />
                      <span>Log</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
