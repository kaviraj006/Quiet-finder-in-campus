'use client';

import React, { useState } from 'react';
import { NoiseReading } from '@/lib/types';
import { formatCampusTime, getNoiseCategory, getNoiseColor } from '@/lib/noise';
import { TIME_SLOTS } from '@/lib/constants';
import { AlertTriangle, Smartphone, MessageSquare, Flag, ShieldCheck } from 'lucide-react';
import FlagModal from './FlagModal';

interface SpotHistoryTableProps {
  readings: NoiseReading[];
}

export default function SpotHistoryTable({ readings }: SpotHistoryTableProps) {
  const [flaggingReading, setFlaggingReading] = useState<NoiseReading | null>(null);

  if (readings.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
        No individual observations recorded for this study space yet. Be the first to contribute!
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-3">Time & Slot</th>
              <th className="py-2.5 px-3">Method</th>
              <th className="py-2.5 px-3">Sound Level</th>
              <th className="py-2.5 px-3">Duration</th>
              <th className="py-2.5 px-3">Context Note</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {readings.map((reading) => {
              const isPhone = reading.method === 'phone_meter';
              const db = reading.db_level;
              const slotLabel = TIME_SLOTS[reading.time_slot]?.label || 'Slot';

              return (
                <tr key={reading.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 text-slate-900 dark:text-slate-200">
                    <div className="font-semibold">{formatCampusTime(reading.observation_time)}</div>
                    <span className="text-[10px] text-slate-400">Slot: {slotLabel}</span>
                  </td>

                  <td className="py-2.5 px-3">
                    {isPhone ? (
                      <span className="inline-flex items-center gap-1 font-medium text-teal-800 dark:text-teal-300">
                        <Smartphone className="w-3.5 h-3.5" />
                        Phone Meter
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-medium text-amber-700 dark:text-amber-300">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Estimate
                      </span>
                    )}
                  </td>

                  <td className="py-2.5 px-3">
                    {isPhone && db !== null ? (
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: getNoiseColor(db) }}
                        />
                        <span className="font-bold text-slate-900 dark:text-white">
                          {db} dB(A)
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-semibold border ${
                            getNoiseCategory(db).badgeBg
                          }`}
                        >
                          {getNoiseCategory(db).label}
                        </span>
                      </div>
                    ) : (
                      <span className="capitalize px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {reading.estimate_level || 'Estimate'}
                      </span>
                    )}
                  </td>

                  <td className="py-2.5 px-3 text-slate-500">{reading.duration_seconds}s</td>

                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 max-w-[200px] truncate">
                    {reading.note || '—'}
                  </td>

                  <td className="py-2.5 px-3 text-right">
                    {reading.review_status === 'flagged' ? (
                      <span className="text-[10px] text-amber-600 font-bold bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded">
                        Under Review
                      </span>
                    ) : (
                      <button
                        onClick={() => setFlaggingReading(reading)}
                        title="Report inaccurate or suspicious reading"
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <FlagModal reading={flaggingReading} onClose={() => setFlaggingReading(null)} />
    </>
  );
}
