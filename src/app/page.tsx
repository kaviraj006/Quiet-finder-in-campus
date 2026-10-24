'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import CampusMap from '@/components/map/CampusMap';
import SlotSelector from '@/components/dashboard/SlotSelector';
import SummaryCards from '@/components/dashboard/SummaryCards';
import RankingList from '@/components/dashboard/RankingList';
import NoiseHeatmapTable from '@/components/dashboard/NoiseHeatmapTable';
import { store } from '@/lib/store';
import { getCurrentCampusTimeSlot } from '@/lib/noise';
import { TIME_SLOTS } from '@/lib/constants';
import { CampusSpot, SpotStats } from '@/lib/types';
import Link from 'next/link';
import {
  Layers,
  MapPin,
  Volume2,
  Search,
  PlusCircle,
  HelpCircle,
  Filter,
  CheckCircle2,
} from 'lucide-react';

export default function HomePage() {
  const [spots, setSpots] = useState<CampusSpot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number>(0);
  const [statsMap, setStatsMap] = useState<Record<string, SpotStats>>({});
  const [matrixStats, setMatrixStats] = useState<Record<string, Record<number, SpotStats>>>({});
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);

  useEffect(() => {
    // Initialize slot with current live Asia/Kolkata slot
    const liveSlot = getCurrentCampusTimeSlot();
    setSelectedSlot(liveSlot);

    const loadData = () => {
      const allSpots = store.getSpots();
      setSpots(allSpots);

      // Load stats for active slot
      const stats = store.getAllSpotStats(selectedSlot);
      setStatsMap(stats);

      // Load matrix stats across all 8 slots for heatmap table
      const matrix: Record<string, Record<number, SpotStats>> = {};
      allSpots.forEach((s) => {
        matrix[s.id] = {};
        for (let b = 0; b < 8; b++) {
          matrix[s.id][b] = store.getSpotStats(s.id, b);
        }
      });
      setMatrixStats(matrix);
    };

    loadData();
    const unsubscribe = store.subscribe(loadData);
    return () => unsubscribe();
  }, [selectedSlot]);

  // Filtered spots based on search
  const filteredSpots = spots.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.building_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const slotLabel = TIME_SLOTS[selectedSlot]?.label || 'Selected Slot';

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Campus Noise Map & Quiet Spaces
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Find the quietest study locations at VIT Chennai based on real student measurements.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
              <span>How It Works</span>
            </Link>

            <Link
              href="/report"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-800 hover:bg-teal-900 dark:bg-teal-600 dark:hover:bg-teal-500 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Log Reading</span>
            </Link>
          </div>
        </div>

        {/* Dynamic Summary Cards */}
        <SummaryCards
          spots={spots}
          statsMap={statsMap}
          selectedSlotLabel={slotLabel}
        />

        {/* Time-Slot Selector */}
        <SlotSelector
          selectedSlot={selectedSlot}
          onSelectSlot={(slot) => setSelectedSlot(slot)}
        />

        {/* Map & Quietest Rankings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Map Panel (7 cols on desktop) */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  VIT Chennai Interactive Noise Map
                </span>
              </div>

              {/* Heatmap Layer Toggle */}
              <button
                type="button"
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  showHeatmap
                    ? 'bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-200 border border-teal-300 dark:border-teal-800'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{showHeatmap ? 'Heatmap Overlay On' : 'Markers Only'}</span>
              </button>
            </div>

            {/* Interactive Leaflet Map */}
            <div className="h-[460px] w-full">
              <CampusMap
                spots={filteredSpots}
                statsMap={statsMap}
                activeSlotIndex={selectedSlot}
                showHeatmap={showHeatmap}
                selectedSpotId={selectedSpotId}
                onSelectSpot={(s) => setSelectedSpotId(s.id)}
              />
            </div>
          </div>

          {/* Quietest Study Spaces Ranking (5 cols on desktop) */}
          <div className="lg:col-span-5">
            <RankingList
              spots={filteredSpots}
              statsMap={statsMap}
              slotLabel={slotLabel}
              selectedSpotId={selectedSpotId}
              onSelectSpot={(s) => setSelectedSpotId(s.id)}
            />
          </div>
        </div>

        {/* Diurnal Heatmap Matrix Table (From paper) */}
        <NoiseHeatmapTable
          spots={spots}
          allStatsMatrix={matrixStats}
          selectedSlot={selectedSlot}
          onSelectSlot={(slot) => setSelectedSlot(slot)}
          onSelectSpot={(s) => setSelectedSpotId(s.id)}
        />
      </div>
    </AppLayout>
  );
}
