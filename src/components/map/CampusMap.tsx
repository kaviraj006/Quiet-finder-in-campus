'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { CampusSpot, SpotStats } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface CampusMapProps {
  spots: CampusSpot[];
  statsMap: Record<string, SpotStats>;
  activeSlotIndex: number;
  showHeatmap: boolean;
  onSelectSpot?: (spot: CampusSpot) => void;
  selectedSpotId?: string | null;
  adminPickerMode?: boolean;
  onPickCoordinates?: (coords: { lat: number; lng: number }) => void;
  pickedCoords?: { lat: number; lng: number } | null;
}

const DynamicCampusMap = dynamic(() => import('./CampusMapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[420px] rounded-xl bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center gap-3 border border-slate-200 dark:border-slate-800">
      <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      <p className="text-sm text-slate-500 font-medium">Loading VIT Chennai Campus Map...</p>
    </div>
  ),
});

export default function CampusMap(props: CampusMapProps) {
  return <DynamicCampusMap {...props} />;
}
