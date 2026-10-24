'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { TIME_SLOTS } from '@/lib/constants';
import { SpotStats } from '@/lib/types';
import { getNoiseCategory } from '@/lib/noise';

interface SpotNoiseChartProps {
  statsAcrossSlots: Record<number, SpotStats>;
}

export default function SpotNoiseChart({ statsAcrossSlots }: SpotNoiseChartProps) {
  const chartData = TIME_SLOTS.map((slot) => {
    const stats = statsAcrossSlots[slot.index];
    const db = stats && stats.energyAvgDb !== null ? stats.energyAvgDb : null;

    return {
      slotIndex: slot.index,
      timeSlot: slot.label,
      dbLevel: db,
      totalCount: stats?.totalCount || 0,
    };
  });

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="noiseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0f6b7a" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#0f6b7a" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
          <XAxis
            dataKey="timeSlot"
            tick={{ fontSize: 11, fill: '#64748b' }}
            interval={0}
            angle={-15}
            textAnchor="end"
            height={40}
          />
          <YAxis
            domain={[30, 85]}
            tick={{ fontSize: 11, fill: '#64748b' }}
            unit=" dB"
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                const db = data.dbLevel;
                return (
                  <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-md text-xs">
                    <p className="font-bold text-slate-800 dark:text-slate-200">{data.timeSlot}</p>
                    {db !== null ? (
                      <div className="mt-1">
                        <span className="text-base font-black text-teal-800 dark:text-teal-400">
                          {db} dB(A)
                        </span>
                        <p className="text-[11px] text-slate-500">
                          {getNoiseCategory(db).label} • {data.totalCount} readings
                        </p>
                      </div>
                    ) : (
                      <p className="text-slate-400 italic mt-1">No readings for this slot</p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          <ReferenceLine
            y={45}
            stroke="#10b981"
            strokeDasharray="4 4"
            label={{ value: 'Library baseline (45 dB)', position: 'insideTopLeft', fontSize: 10, fill: '#10b981' }}
          />
          <ReferenceLine
            y={65}
            stroke="#f97316"
            strokeDasharray="4 4"
            label={{ value: 'Elevated noise (65 dB)', position: 'insideTopLeft', fontSize: 10, fill: '#f97316' }}
          />
          <Area
            type="monotone"
            dataKey="dbLevel"
            stroke="#0f6b7a"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#noiseGradient)"
            connectNulls={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
