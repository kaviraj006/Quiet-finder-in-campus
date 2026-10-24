import { describe, expect, it } from 'vitest';
import {
  aggregateSpotReadings,
  calculateArithmeticAvgDb,
  calculateEnergyAvgDb,
  generateDemoReadings,
  getNoiseCategory,
  getNoiseColor,
  getTimeSlotIndexForHour,
} from '../noise';
import { NoiseReading } from '../types';

describe('Acoustic Science & Energy Average (LAeq)', () => {
  it('correctly calculates energy-average decibels using logarithmic formula', () => {
    // 50 dB and 50 dB should average to exactly 50 dB
    expect(calculateEnergyAvgDb([50, 50])).toBe(50);

    // Two readings of 60 dB average over time to 60 dB (time-average LAeq)
    const twoSame = calculateEnergyAvgDb([60, 60]);
    expect(twoSame).toBe(60.0);

    // In acoustic physics, linear mean of 40 dB and 80 dB is 60 dB,
    // but energy mean is dominated by the 80 dB source:
    // 10*log10((10^4 + 10^8)/2) = 10*log10(50005000) ~= 77.0 dB
    const energyAvg = calculateEnergyAvgDb([40, 80]);
    const arithmeticAvg = calculateArithmeticAvgDb([40, 80]);

    expect(arithmeticAvg).toBe(60.0);
    expect(energyAvg).toBe(77.0);
    expect(energyAvg).toBeGreaterThan(arithmeticAvg!);
  });

  it('handles empty and boundary conditions gracefully', () => {
    expect(calculateEnergyAvgDb([])).toBeNull();
    expect(calculateEnergyAvgDb([-5, 0])).toBeNull();
    expect(calculateEnergyAvgDb([45])).toBe(45);
  });
});

describe('Continuous Noise Color Mapping', () => {
  it('generates consistent continuous HSL colors bounded by min/max dB', () => {
    const quietColor = getNoiseColor(35);
    const midColor = getNoiseColor(60);
    const loudColor = getNoiseColor(85);

    expect(quietColor).toContain('hsl(190'); // Teal for quiet
    expect(loudColor).toContain('hsl(5'); // Red for loud
    expect(midColor).toBeTruthy();

    // Out of bound clamping without altering input
    const clampedBelow = getNoiseColor(20);
    const clampedAbove = getNoiseColor(110);
    expect(clampedBelow).toBe(getNoiseColor(35));
    expect(clampedAbove).toBe(getNoiseColor(85));
  });

  it('provides accessible qualitative categories for WCAG compliance', () => {
    expect(getNoiseCategory(38).label).toBe('Silent');
    expect(getNoiseCategory(44).label).toBe('Quiet');
    expect(getNoiseCategory(55).label).toBe('Moderate');
    expect(getNoiseCategory(64).label).toBe('Elevated');
    expect(getNoiseCategory(78).label).toBe('Loud');
  });
});

describe('Two-Hour Time Slot Mapping', () => {
  it('maps fractional hours to the 8 campus slots correctly', () => {
    // 07:00 -> Slot 0 (07:00–09:00)
    expect(getTimeSlotIndexForHour(7.0)).toBe(0);
    expect(getTimeSlotIndexForHour(8.5)).toBe(0);

    // 09:00 -> Slot 1 (09:00–11:00)
    expect(getTimeSlotIndexForHour(9.0)).toBe(1);
    expect(getTimeSlotIndexForHour(10.75)).toBe(1);

    // 13:00 -> Slot 3 (13:00–15:00)
    expect(getTimeSlotIndexForHour(13.0)).toBe(3);

    // 21:00 -> Slot 7 (21:00–23:00)
    expect(getTimeSlotIndexForHour(21.0)).toBe(7);
    expect(getTimeSlotIndexForHour(22.5)).toBe(7);

    // Edge hours clamp cleanly
    expect(getTimeSlotIndexForHour(5.0)).toBe(0);
    expect(getTimeSlotIndexForHour(23.5)).toBe(7);
  });
});

describe('Separation of Measured dB and Manual Estimates', () => {
  it('strictly isolates numeric measurements from subjective estimates', () => {
    const mockReadings: NoiseReading[] = [
      {
        id: '1',
        spot_id: 'test-spot',
        method: 'phone_meter',
        db_level: 42,
        estimate_level: null,
        duration_seconds: 30,
        observation_time: '2026-10-24T08:00:00Z',
        time_slot: 0,
        is_demo: false,
        review_status: 'approved',
        created_at: '2026-10-24T08:00:00Z',
      },
      {
        id: '2',
        spot_id: 'test-spot',
        method: 'phone_meter',
        db_level: 46,
        estimate_level: null,
        duration_seconds: 25,
        observation_time: '2026-10-24T08:30:00Z',
        time_slot: 0,
        is_demo: false,
        review_status: 'approved',
        created_at: '2026-10-24T08:30:00Z',
      },
      {
        id: '3',
        spot_id: 'test-spot',
        method: 'manual_estimate',
        db_level: null,
        estimate_level: 'loud',
        duration_seconds: 0,
        observation_time: '2026-10-24T08:45:00Z',
        time_slot: 0,
        is_demo: false,
        review_status: 'approved',
        created_at: '2026-10-24T08:45:00Z',
      },
    ];

    const stats = aggregateSpotReadings(mockReadings, 'test-spot', 0, 3);

    expect(stats.measuredCount).toBe(2);
    expect(stats.estimateCount).toBe(1);
    expect(stats.totalCount).toBe(3);

    // The estimate "loud" should NOT distort the measured energy avg!
    // Energy average of 42 and 46 dB is ~44.4 dB:
    expect(stats.energyAvgDb).toBeCloseTo(44.4, 0);

    // Subjective estimate breakdown is captured separately:
    expect(stats.estimateDistribution.loud).toBe(1);
    expect(stats.dominantEstimate).toBe('loud');

    // With 2 measured readings and min threshold of 3, isSufficientData should be false:
    expect(stats.isSufficientData).toBe(false);
  });
});

describe('Paper Demo Seed Generation', () => {
  it('generates exactly 216 simulated demo readings with is_demo flagged', () => {
    const demo = generateDemoReadings();
    expect(demo).toHaveLength(216);
    expect(demo.every((d) => d.is_demo === true)).toBe(true);
    expect(demo.every((d) => d.review_status === 'approved')).toBe(true);
    expect(demo.every((d) => typeof d.db_level === 'number' && d.db_level > 0)).toBe(true);
  });
});
