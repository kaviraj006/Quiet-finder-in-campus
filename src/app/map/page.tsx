'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import CampusMap from '@/components/map/CampusMap';
import SlotSelector from '@/components/dashboard/SlotSelector';
import { store } from '@/lib/store';
import { getCurrentCampusTimeSlot, getNoiseCategory, getNoiseColor, formatCampusTime } from '@/lib/noise';
import { TIME_SLOTS, SPOT_CATEGORIES } from '@/lib/constants';
import { CampusSpot, SpotCategory, SpotStats } from '@/lib/types';
import Link from 'next/link';
import {
  Layers,
  MapPin,
  Search,
  Filter,
  Volume2,
  ExternalLink,
  PlusCircle,
  Bookmark,
  CheckCircle2,
} from 'lucide-react';

export default function MapPage() {
  const [spots, setSpots] = useState<CampusSpot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number>(0);
  const [statsMap, setStatsMap] = useState<Record<string, SpotStats>>({});
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSpot, setSelectedSpot] = useState<CampusSpot | null>(null);

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

  // Filters
  const filteredSpots = spots.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.building_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const slotLabel = TIME_SLOTS[selectedSlot]?.label || 'Slot';
  const selectedStats = selectedSpot ? statsMap[selectedSpot.id] : null;
  const isSaved = selectedSpot ? store.isSpotSaved(selectedSpot.id) : false;

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-teal-700 dark:text-teal-400" />
              <span>VIT Chennai Interactive Campus Noise Map</span>
            </h1>
            <p className="text-xs text-slate-500">
              Explore spatial sound distribution and inspect study zones across campus.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                showHeatmap
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{showHeatmap ? 'Heatmap Active' : 'Markers Only'}</span>
            </button>
          </div>
        </div>

        {/* Filters and Time Slot */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-8">
            <SlotSelector selectedSlot={selectedSlot} onSelectSlot={setSelectedSlot} />
          </div>

          <div className="md:col-span-4 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-2 shadow-xs">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search campus spot or block..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto text-xs">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-2 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-teal-800 text-white font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                All
              </button>
              {SPOT_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat.value
                      ? 'bg-teal-800 text-white font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Map with Selected Spot Inspector Overlay */}
        <div className="relative h-[550px] w-full rounded-xl overflow-hidden">
          <CampusMap
            spots={filteredSpots}
            statsMap={statsMap}
            activeSlotIndex={selectedSlot}
            showHeatmap={showHeatmap}
            selectedSpotId={selectedSpot?.id}
            onSelectSpot={(s) => setSelectedSpot(s)}
          />

          {/* Quick Inspector Card if Spot Selected */}
          {selectedSpot && (
            <div className="absolute top-4 right-4 z-[1000] w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xl text-xs">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {selectedSpot.name}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {selectedSpot.building_name} • {selectedSpot.floor || 'Campus'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSpot(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {selectedStats && selectedStats.energyAvgDb !== null ? (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-base text-slate-900 dark:text-white">
                      {selectedStats.energyAvgDb} dB(A)
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded font-bold border ${
                        getNoiseCategory(selectedStats.energyAvgDb).badgeBg
                      }`}
                    >
                      {getNoiseCategory(selectedStats.energyAvgDb).label}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 space-y-0.5">
                    <div>Slot: {slotLabel}</div>
                    <div>
                      {selectedStats.totalCount} readings ({selectedStats.measuredCount} phone meter)
                    </div>
                    <div>Updated: {formatCampusTime(selectedStats.mostRecentReadingTime)}</div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-slate-500 italic mb-3">
                  No readings logged for slot {slotLabel}.
                </div>
              )}

              <div className="flex items-center gap-2">
                <Link
                  href={`/spots/${selectedSpot.id}`}
                  className="flex-1 text-center py-2 px-3 bg-teal-800 hover:bg-teal-900 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1 shadow-xs"
                >
                  <span>Full Analytics</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>

                <button
                  onClick={() => store.toggleSaveSpot(selectedSpot.id)}
                  className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center transition-colors ${
                    isSaved
                      ? 'bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
