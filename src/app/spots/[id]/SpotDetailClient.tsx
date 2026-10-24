'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import SlotSelector from '@/components/dashboard/SlotSelector';
import SpotNoiseChart from '@/components/spots/SpotNoiseChart';
import SpotHistoryTable from '@/components/spots/SpotHistoryTable';
import { store } from '@/lib/store';
import { getCurrentCampusTimeSlot, getNoiseCategory, getNoiseColor, formatCampusTime } from '@/lib/noise';
import { TIME_SLOTS } from '@/lib/constants';
import { CampusSpot, NoiseReading, SpotStats } from '@/lib/types';
import Link from 'next/link';
import {
  MapPin,
  Volume2,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  ArrowLeft,
  Share2,
  Clock,
} from 'lucide-react';

export default function SpotDetailClient({ spotId }: { spotId: string }) {
  const router = useRouter();
  const [spot, setSpot] = useState<CampusSpot | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number>(0);
  const [currentSlotStats, setCurrentSlotStats] = useState<SpotStats | null>(null);
  const [statsAcrossSlots, setStatsAcrossSlots] = useState<Record<number, SpotStats>>({});
  const [readings, setReadings] = useState<NoiseReading[]>([]);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    setSelectedSlot(getCurrentCampusTimeSlot());

    const loadSpotData = () => {
      const foundSpot = store.getSpotById(spotId);
      if (!foundSpot) {
        return;
      }
      setSpot(foundSpot);
      setIsSaved(store.isSpotSaved(foundSpot.id));

      // Calculate stats for all 8 slots
      const across: Record<number, SpotStats> = {};
      for (let s = 0; s < 8; s++) {
        across[s] = store.getSpotStats(foundSpot.id, s);
      }
      setStatsAcrossSlots(across);
      setCurrentSlotStats(across[selectedSlot] || null);

      // Load individual readings for this spot
      const spotReadings = store.getReadings({ spotId: foundSpot.id });
      setReadings(spotReadings);
    };

    loadSpotData();
    const unsub = store.subscribe(loadSpotData);
    return () => unsub();
  }, [spotId, selectedSlot]);

  if (!spot) {
    return (
      <AppLayout>
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-md mx-auto my-12">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h2 className="font-extrabold text-lg text-slate-900 dark:text-white">
            Campus Study Space Not Found
          </h2>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            The requested location ID does not exist or may have been unmapped by administrators.
          </p>
          <Link
            href="/"
            className="px-4 py-2 bg-teal-800 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Campus Map</span>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const db = currentSlotStats?.energyAvgDb ?? null;
  const slotLabel = TIME_SLOTS[selectedSlot]?.label || 'Slot';

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Discovery Map</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold flex items-center gap-1 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied Link!' : 'Share'}</span>
            </button>

            <button
              onClick={() => {
                store.toggleSaveSpot(spot.id);
                setIsSaved(!isSaved);
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isSaved
                  ? 'bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-300'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
              <span>{isSaved ? 'Saved Space' : 'Save as Favourite'}</span>
            </button>

            <Link
              href={`/report?spotId=${spot.id}`}
              className="px-3.5 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Log Reading</span>
            </Link>
          </div>
        </div>

        {/* Location Hero Header */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {spot.category}
                </span>

                {spot.is_verified ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified GPS Coordinates
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                    <AlertCircle className="w-3 h-3" />
                    Pending GPS Verification
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {spot.name}
              </h1>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                {spot.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  {spot.building_name || 'Campus Building'}
                </span>
                <span>•</span>
                <span>Floor: {spot.floor || 'Standard Floor'}</span>
                {spot.latitude && spot.longitude && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-[11px]">
                      {spot.latitude.toFixed(6)}, {spot.longitude.toFixed(6)}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Live Reading Callout for selected slot */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 min-w-[200px] shrink-0 text-right md:text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Sound Level ({slotLabel})
              </span>
              {db !== null ? (
                <div>
                  <div className="text-3xl font-black text-slate-900 dark:text-white">
                    {db} <span className="text-sm font-semibold text-slate-500">dB(A)</span>
                  </div>
                  <span
                    className={`inline-block mt-1 text-xs px-2 py-0.5 rounded font-bold border ${
                      getNoiseCategory(db).badgeBg
                    }`}
                  >
                    {getNoiseCategory(db).label}
                  </span>
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic">No readings for {slotLabel}</div>
              )}
            </div>
          </div>
        </div>

        {/* 2-Hour Slot Selector */}
        <SlotSelector selectedSlot={selectedSlot} onSelectSlot={setSelectedSlot} />

        {/* Diurnal 24h Variation Acoustic Curve */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-teal-700 dark:text-teal-400" />
              <span>Diurnal Noise Profile (07:00 – 23:00)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Energy-averaged sound levels across the eight 2-hour campus time blocks.
            </p>
          </div>

          <SpotNoiseChart statsAcrossSlots={statsAcrossSlots} />
        </div>

        {/* Observations Table */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-700 dark:text-teal-400" />
                <span>Recorded Community Observations ({readings.length})</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Individual phone meter measurements and manual estimates reported by students.
              </p>
            </div>

            <Link
              href={`/report?spotId=${spot.id}`}
              className="text-xs text-teal-700 dark:text-teal-400 font-bold hover:underline"
            >
              + Add Reading
            </Link>
          </div>

          <SpotHistoryTable readings={readings} />
        </div>
      </div>
    </AppLayout>
  );
}
