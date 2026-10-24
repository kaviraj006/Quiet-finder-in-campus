'use client';

import React, { useState } from 'react';
import { TIME_SLOTS } from '@/lib/constants';
import { getNoiseColor, formatCampusTime } from '@/lib/noise';
import { CampusSpot, SpotStats } from '@/lib/types';
import Link from 'next/link';
import { Info, Volume2, Sparkles, ExternalLink } from 'lucide-react';

interface NoiseHeatmapTableProps {
  spots: CampusSpot[];
  allStatsMatrix: Record<string, Record<number, SpotStats>>;
  selectedSlot: number;
  onSelectSlot: (slot: number) => void;
  onSelectSpot?: (spot: CampusSpot) => void;
}

export default function NoiseHeatmapTable({
  spots,
  allStatsMatrix,
  selectedSlot,
  onSelectSlot,
  onSelectSpot,
}: NoiseHeatmapTableProps) {
  const [inspectedCell, setInspectedCell] = useState<{
    spot: CampusSpot;
    slotIndex: number;
    stats: SpotStats | null;
  } | null>(null);

  const handleCellClick = (spot: CampusSpot, slotIndex: number) => {
    const stats = allStatsMatrix[spot.id]?.[slotIndex] || null;
    setInspectedCell({ spot, slotIndex, stats });
    onSelectSlot(slotIndex);
    if (onSelectSpot) onSelectSpot(spot);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-teal-700 dark:text-teal-400" />
            <span>Campus Noise Matrix & Diurnal Variations</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Average sound level (dB) across all eight time blocks. Click any cell to inspect.
          </p>
        </div>

        {/* Legend Preview */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
          <span>Quiet (35 dB)</span>
          <div className="w-24 h-2 rounded bg-gradient-to-r from-[hsl(190,60%,38%)] via-[hsl(45,90%,47%)] to-[hsl(5,70%,46%)]" />
          <span>Loud (85 dB)</span>
        </div>
      </div>

      {/* Responsive Scrollable Table */}
      <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
        <table className="w-full text-xs text-center border-collapse min-w-[640px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
              <th className="text-left font-bold py-2.5 px-3 text-slate-700 dark:text-slate-300 w-44">
                Campus Location
              </th>
              {TIME_SLOTS.map((slot) => {
                const isSelected = slot.index === selectedSlot;
                return (
                  <th
                    key={slot.index}
                    onClick={() => onSelectSlot(slot.index)}
                    className={`font-semibold py-2 px-1 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-teal-800 text-white font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div>{slot.label.split('–')[0]}h</div>
                    <div className="text-[10px] opacity-80">{slot.label.split('–')[1]}h</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {spots.map((spot) => (
              <tr key={spot.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="text-left py-2 px-3 font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                  <Link
                    href={`/spots/${spot.id}`}
                    className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
                  >
                    {spot.name}
                  </Link>
                </td>
                {TIME_SLOTS.map((slot) => {
                  const stats = allStatsMatrix[spot.id]?.[slot.index];
                  const hasData = stats && stats.energyAvgDb !== null;
                  const isSelectedColumn = slot.index === selectedSlot;
                  const db = hasData ? stats.energyAvgDb! : null;
                  const cellBg = hasData ? getNoiseColor(db!) : undefined;

                  return (
                    <td
                      key={slot.index}
                      onClick={() => handleCellClick(spot, slot.index)}
                      className={`p-1 cursor-pointer transition-transform hover:scale-105 ${
                        isSelectedColumn ? 'ring-1 ring-teal-700/60' : ''
                      }`}
                    >
                      {hasData ? (
                        <div
                          className="h-8 rounded flex items-center justify-center font-bold text-white shadow-xs text-xs"
                          style={{ backgroundColor: cellBg }}
                          title={`${spot.name} @ ${slot.label}: ${db} dB (${stats.totalCount} readings)`}
                        >
                          {Math.round(db!)}
                        </div>
                      ) : (
                        <div
                          className="h-8 rounded bg-slate-100 dark:bg-slate-800/60 border border-dashed border-slate-200 dark:border-slate-700 text-slate-400 flex items-center justify-center text-[10px]"
                          title="No observations for this slot"
                        >
                          —
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selected Cell Inspector Banner */}
      {inspectedCell ? (
        <div className="mt-3 p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div>
            <span className="font-bold text-teal-900 dark:text-teal-200">
              {inspectedCell.spot.name}
            </span>
            <span className="text-teal-700 dark:text-teal-400 ml-2">
              Slot {TIME_SLOTS[inspectedCell.slotIndex].label}:
            </span>
            {inspectedCell.stats && inspectedCell.stats.energyAvgDb !== null ? (
              <span className="font-extrabold text-teal-900 dark:text-teal-100 ml-1">
                Average {inspectedCell.stats.energyAvgDb} dB(A) based on{' '}
                {inspectedCell.stats.totalCount} reading
                {inspectedCell.stats.totalCount > 1 ? 's' : ''}
              </span>
            ) : (
              <span className="text-slate-500 italic ml-1">No recorded readings for this slot</span>
            )}
          </div>
          <Link
            href={`/spots/${inspectedCell.spot.id}`}
            className="inline-flex items-center gap-1 font-semibold text-teal-800 dark:text-teal-300 hover:underline"
          >
            <span>Location History</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <p className="mt-2 text-center text-xs text-slate-400">
          Select any cell in the table above to view reading details and sample statistics.
        </p>
      )}
    </div>
  );
}
