import { PAPER_SEED_BASE_LEVELS, TIME_SLOTS } from './constants';
import { ManualEstimateLevel, NoiseReading, SpotStats } from './types';

/**
 * Calculates the true acoustic energy-based average (LAeq) in decibels.
 * Because the decibel scale is logarithmic, linear averaging underestimates
 * acoustic pressure. Standard formula:
 * LAeq = 10 * log10( (1/N) * sum(10^(L_i / 10)) )
 */
export function calculateEnergyAvgDb(levels: number[]): number | null {
  if (!levels || levels.length === 0) return null;
  const valid = levels.filter((v) => typeof v === 'number' && !isNaN(v) && v > 0);
  if (valid.length === 0) return null;
  if (valid.length === 1) return Math.round(valid[0] * 10) / 10;

  const sumEnergy = valid.reduce((acc, db) => acc + Math.pow(10, db / 10), 0);
  const meanEnergy = sumEnergy / valid.length;
  const laeq = 10 * Math.log10(meanEnergy);
  return Math.round(laeq * 10) / 10;
}

/**
 * Standard arithmetic mean for acoustic readings (for comparison/fallback).
 */
export function calculateArithmeticAvgDb(levels: number[]): number | null {
  if (!levels || levels.length === 0) return null;
  const valid = levels.filter((v) => typeof v === 'number' && !isNaN(v) && v > 0);
  if (valid.length === 0) return null;
  const sum = valid.reduce((acc, v) => acc + v, 0);
  return Math.round((sum / valid.length) * 10) / 10;
}

/**
 * Maps a numeric dB value to a smooth continuous color scale
 * ranging from Teal (quieter, ~35 dB) to Red (louder, ~85 dB).
 */
export function getNoiseColor(db: number, minDb = 35, maxDb = 85): string {
  const clamped = Math.max(minDb, Math.min(maxDb, db));
  const t = (clamped - minDb) / (maxDb - minDb); // 0 (quiet) to 1 (loud)
  const hue = Math.round(190 - 185 * t); // 190 (teal) -> 5 (red)
  const saturation = Math.round(55 + 15 * t); // 55% -> 70%
  const lightness = Math.round(38 + (t > 0.35 && t < 0.7 ? 8 : 0)); // boost mid-range yellow readability
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Provides an accessible qualitative classification for a decibel reading.
 */
export function getNoiseCategory(db: number): {
  label: string;
  description: string;
  colorClass: string;
  badgeBg: string;
} {
  if (db < 40) {
    return {
      label: 'Silent',
      description: 'Ideal for deep focus and reading',
      colorClass: 'text-teal-700 dark:text-teal-400',
      badgeBg: 'bg-teal-50 border-teal-200 text-teal-800 dark:bg-teal-950/40 dark:border-teal-800 dark:text-teal-300',
    };
  }
  if (db < 50) {
    return {
      label: 'Quiet',
      description: 'Standard library study environment',
      colorClass: 'text-emerald-700 dark:text-emerald-400',
      badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300',
    };
  }
  if (db < 60) {
    return {
      label: 'Moderate',
      description: 'Low murmurs, suitable for casual study',
      colorClass: 'text-amber-700 dark:text-amber-400',
      badgeBg: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300',
    };
  }
  if (db < 70) {
    return {
      label: 'Elevated',
      description: 'Noticeable conversational bustle',
      colorClass: 'text-orange-700 dark:text-orange-400',
      badgeBg: 'bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-950/40 dark:border-orange-800 dark:text-orange-300',
    };
  }
  return {
    label: 'Loud',
    description: 'High background noise, headphones recommended',
    colorClass: 'text-rose-700 dark:text-rose-400',
    badgeBg: 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300',
  };
}

/**
 * Returns the two-hour slot index (0..7) for a fractional 24-hour hour.
 * Slots:
 * 0: 07:00-09:00
 * 1: 09:00-11:00
 * 2: 11:00-13:00
 * 3: 13:00-15:00
 * 4: 15:00-17:00
 * 5: 17:00-19:00
 * 6: 19:00-21:00
 * 7: 21:00-23:00
 */
export function getTimeSlotIndexForHour(hour: number): number {
  if (hour < 7) return 0; // early morning defaults to first slot
  if (hour >= 23) return 7; // late night defaults to last slot
  return Math.floor((hour - 7) / 2);
}

/**
 * Computes current active time slot based on campus timezone (Asia/Kolkata).
 */
export function getCurrentCampusTimeSlot(timezone = 'Asia/Kolkata'): number {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    });
    const parts = formatter.formatToParts(new Date());
    const h = parseInt(parts.find((p) => p.type === 'hour')?.value || '12', 10);
    const m = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);
    return getTimeSlotIndexForHour(h + m / 60);
  } catch {
    const now = new Date();
    return getTimeSlotIndexForHour(now.getHours() + now.getMinutes() / 60);
  }
}

/**
 * Formats a timestamp into campus local string (Asia/Kolkata).
 */
export function formatCampusTime(isoString: string | null | undefined): string {
  if (!isoString) return 'No recent data';
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return 'Invalid date';
  }
}

/**
 * Aggregates noise readings for a single spot and time slot.
 * Strictly distinguishes measured phone readings from manual subjective estimates.
 */
export function aggregateSpotReadings(
  readings: NoiseReading[],
  spotId: string,
  timeSlot: number,
  minSamplesThreshold = 3
): SpotStats {
  const spotSlotReadings = readings.filter(
    (r) =>
      r.spot_id === spotId &&
      r.time_slot === timeSlot &&
      r.review_status !== 'excluded'
  );

  const measured = spotSlotReadings.filter(
    (r) => r.method === 'phone_meter' && typeof r.db_level === 'number'
  );
  const estimates = spotSlotReadings.filter(
    (r) => r.method === 'manual_estimate' && r.estimate_level != null
  );

  const dbValues = measured.map((r) => r.db_level as number);
  const energyAvgDb = calculateEnergyAvgDb(dbValues);
  const arithmeticAvgDb = calculateArithmeticAvgDb(dbValues);
  const minDb = dbValues.length > 0 ? Math.min(...dbValues) : null;
  const maxDb = dbValues.length > 0 ? Math.max(...dbValues) : null;

  const estimateDistribution: Record<ManualEstimateLevel, number> = {
    silent: 0,
    quiet: 0,
    chatty: 0,
    loud: 0,
  };

  estimates.forEach((r) => {
    if (r.estimate_level && estimateDistribution[r.estimate_level] !== undefined) {
      estimateDistribution[r.estimate_level]++;
    }
  });

  let dominantEstimate: ManualEstimateLevel | null = null;
  let maxCount = 0;
  (Object.keys(estimateDistribution) as ManualEstimateLevel[]).forEach((lvl) => {
    if (estimateDistribution[lvl] > maxCount) {
      maxCount = estimateDistribution[lvl];
      dominantEstimate = lvl;
    }
  });

  const timestamps = spotSlotReadings
    .map((r) => new Date(r.observation_time).getTime())
    .filter((t) => !isNaN(t));
  const mostRecentReadingTime =
    timestamps.length > 0 ? new Date(Math.max(...timestamps)).toISOString() : null;

  const totalCount = spotSlotReadings.length;
  const isSufficientData = measured.length >= minSamplesThreshold;

  return {
    spotId,
    timeSlot,
    measuredCount: measured.length,
    estimateCount: estimates.length,
    totalCount,
    energyAvgDb,
    arithmeticAvgDb,
    minDb,
    maxDb,
    estimateDistribution,
    dominantEstimate,
    mostRecentReadingTime,
    isSufficientData,
  };
}

/**
 * Deterministic pseudo-random generator matching the paper demo seed generator:
 * s = (s * 9301 + 49297) % 233280; return s / 233280;
 */
export function generateDemoReadings(): NoiseReading[] {
  let s = 7;
  function rnd(): number {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  }

  const readings: NoiseReading[] = [];
  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);

  Object.entries(PAPER_SEED_BASE_LEVELS).forEach(([spotId, slotLevels]) => {
    slotLevels.forEach((baseLevel, slotIdx) => {
      // 3 readings per slot as documented in the paper (9 spots * 8 slots * 3 = 216 readings)
      for (let k = 0; k < 3; k++) {
        const noiseDelta = (rnd() - 0.5) * 7;
        const db = Math.round(baseLevel + noiseDelta);
        const slotDef = TIME_SLOTS[slotIdx];
        const fractionalHour = slotDef.startHour + rnd() * (slotDef.endHour - slotDef.startHour);
        const hour = Math.floor(fractionalHour);
        const minute = Math.floor((fractionalHour - hour) * 60);

        const obsDate = new Date(baseDate);
        obsDate.setHours(hour, minute, 0, 0);

        readings.push({
          id: `demo-${spotId}-slot${slotIdx}-${k}`,
          spot_id: spotId,
          author_id: 'demo-system',
          author_name: 'Simulated Student Sensor',
          method: 'phone_meter',
          db_level: db,
          estimate_level: null,
          duration_seconds: 25,
          observation_time: obsDate.toISOString(),
          time_slot: slotIdx,
          note: `Simulated paper calibration reading #${k + 1}`,
          is_demo: true,
          review_status: 'approved',
          created_at: obsDate.toISOString(),
        });
      }
    });
  });

  return readings;
}
