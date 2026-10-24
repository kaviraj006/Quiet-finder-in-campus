import { beforeEach, describe, expect, it } from 'vitest';
import { store } from '../store';

describe('Quiet Finder Store & Data Integrity', () => {
  beforeEach(() => {
    // Reset store data to known clean demo baseline
    store.resetDemoData();
  });

  it('initializes with the 9 core campus spots from the paper', () => {
    const spots = store.getSpots();
    expect(spots.length).toBeGreaterThanOrEqual(9);

    const libReading = spots.find((s) => s.id === 'spot-lib-reading');
    expect(libReading).toBeDefined();
    expect(libReading?.name).toBe('Library – Reading Hall');
    expect(libReading?.is_verified).toBe(true);
    expect(libReading?.latitude).toBeCloseTo(12.841022, 4);
    expect(libReading?.longitude).toBeCloseTo(80.154029, 4);
  });

  it('aggregates readings across the 8 slots accurately', () => {
    // Check stats for Library Reading Hall in slot 0 (07:00-09:00)
    const stats = store.getSpotStats('spot-lib-reading', 0);
    expect(stats).toBeDefined();
    expect(stats.totalCount).toBeGreaterThan(0);
    expect(stats.energyAvgDb).toBeGreaterThan(30);
    expect(stats.energyAvgDb).toBeLessThan(50);
  });

  it('allows students to add new phone meter readings', () => {
    const initialCount = store.getReadings().length;

    const newReading = store.addReading({
      spot_id: 'spot-lib-reading',
      method: 'phone_meter',
      db_level: 38.5,
      duration_seconds: 30,
      observation_time: '2026-10-24T08:15:00+05:30',
      note: 'Extremely peaceful morning study',
    });

    expect(newReading.id).toBeDefined();
    expect(newReading.db_level).toBe(38.5);
    expect(newReading.is_demo).toBe(false);
    expect(newReading.time_slot).toBe(0); // 08:15 falls in slot 0 (07:00-09:00)

    const updatedCount = store.getReadings().length;
    expect(updatedCount).toBe(initialCount + 1);
  });

  it('allows students to submit manual subjective estimates without contaminating dB', () => {
    const estimateReading = store.addReading({
      spot_id: 'spot-food-court',
      method: 'manual_estimate',
      estimate_level: 'loud',
      duration_seconds: 20,
      observation_time: '2026-10-24T13:30:00+05:30',
      note: 'Lunch rush bustling crowd',
    });

    expect(estimateReading.method).toBe('manual_estimate');
    expect(estimateReading.db_level).toBeNull();
    expect(estimateReading.estimate_level).toBe('loud');
    expect(estimateReading.time_slot).toBe(3); // 13:30 falls in slot 3 (13:00-15:00)

    // Verify stats in slot 3
    const stats = store.getSpotStats('spot-food-court', 3);
    expect(stats.estimateCount).toBeGreaterThan(0);
    expect(stats.estimateDistribution.loud).toBeGreaterThan(0);
  });

  it('supports saving and unsaving favourite study spaces', () => {
    const testUserId = 'test-student-99';
    const spotId = 'spot-ab1-lounge';

    expect(store.isSpotSaved(spotId, testUserId)).toBe(false);

    // Save
    const saved = store.toggleSaveSpot(spotId, testUserId);
    expect(saved).toBe(true);
    expect(store.isSpotSaved(spotId, testUserId)).toBe(true);

    // Unsave
    const unsaved = store.toggleSaveSpot(spotId, testUserId);
    expect(unsaved).toBe(false);
    expect(store.isSpotSaved(spotId, testUserId)).toBe(false);
  });

  it('handles flagging suspicious readings and admin resolution', () => {
    const reading = store.getReadings()[0];
    expect(reading).toBeDefined();

    // Flag reading
    const flag = store.flagReading(reading.id, 'Unrealistic 15 dB reading in active hallway');
    expect(flag.status).toBe('pending');

    const flags = store.getFlags();
    expect(flags.some((f) => f.id === flag.id)).toBe(true);

    // Admin resolves and excludes reading
    store.resolveFlag(flag.id, 'resolve_exclude');
    const updatedReading = store.getReadings({ includeDemo: true, status: 'excluded' });
    expect(updatedReading.some((r) => r.id === reading.id)).toBe(true);
  });

  it('allows administrators to update GPS coordinates and verify status', () => {
    const spot = store.getSpotById('spot-auditorium-steps');
    expect(spot).toBeDefined();

    const updated = store.updateSpot('spot-auditorium-steps', {
      latitude: 12.8396,
      longitude: 80.1552,
      is_verified: true,
    });

    expect(updated?.latitude).toBe(12.8396);
    expect(updated?.is_verified).toBe(true);
  });

  it('isolates simulated demo records and supports clean purging', () => {
    // Add genuine reading
    store.addReading({
      spot_id: 'spot-lib-reading',
      method: 'phone_meter',
      db_level: 41.0,
      duration_seconds: 25,
      observation_time: '2026-10-24T10:00:00.000Z',
    });

    // Purge demo records
    store.purgeDemoData();
    const remaining = store.getReadings({ includeDemo: true });
    expect(remaining.every((r) => !r.is_demo)).toBe(true);
    expect(remaining.length).toBeGreaterThanOrEqual(1);

    // Reload demo data
    store.resetDemoData();
    const withDemo = store.getReadings({ includeDemo: true });
    expect(withDemo.some((r) => r.is_demo)).toBe(true);
  });
});
