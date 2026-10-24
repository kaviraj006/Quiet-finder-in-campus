'use client';

import React, { useEffect, useState } from 'react';
import { TIME_SLOTS } from '@/lib/constants';
import { getCurrentCampusTimeSlot } from '@/lib/noise';
import { Clock } from 'lucide-react';

interface SlotSelectorProps {
  selectedSlot: number;
  onSelectSlot: (slotIndex: number) => void;
}

export default function SlotSelector({
  selectedSlot,
  onSelectSlot,
}: SlotSelectorProps) {
  const [currentLiveSlot, setCurrentLiveSlot] = useState<number | null>(null);

  useEffect(() => {
    setCurrentLiveSlot(getCurrentCampusTimeSlot());
  }, []);

  return (
    <div className="w-full bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-teal-700 dark:text-teal-400" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Two-Hour Study Time Slot
          </h3>
        </div>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          VIT Chennai Local Time (Asia/Kolkata, UTC+05:30)
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-1.5">
        {TIME_SLOTS.map((slot) => {
          const isSelected = selectedSlot === slot.index;
          const isLive = currentLiveSlot === slot.index;

          return (
            <button
              key={slot.index}
              onClick={() => onSelectSlot(slot.index)}
              className={`relative flex flex-col items-center justify-center py-2 px-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-teal-800 text-white shadow dark:bg-teal-600'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 dark:text-slate-300 dark:border-slate-750'
              }`}
            >
              <span>{slot.label}</span>
              {isLive && (
                <span
                  className={`mt-1 text-[9px] px-1 py-0.2 rounded-full font-bold uppercase tracking-wider ${
                    isSelected
                      ? 'bg-teal-600 text-teal-100 dark:bg-teal-700'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                  }`}
                >
                  Live Now
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
