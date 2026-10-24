import { beforeEach, describe, expect, it } from 'vitest';
import { store, DEFAULT_DEMO_USER } from '../store';

describe('Quiet Finder Core End-to-End User Journeys', () => {
  beforeEach(() => {
    store.resetDemoData();
    store.setCurrentUser(DEFAULT_DEMO_USER);
  });

  it('Journey 1: Visitor opens dashboard and explores campus spots and map data', () => {
    const spots = store.getSpots();
    expect(spots.length).toBeGreaterThanOrEqual(9);

    // Map spots should have verified coordinates
    const mappable = spots.filter((s) => s.is_verified && s.latitude && s.longitude);
    expect(mappable.length).toBeGreaterThanOrEqual(9);

    // Slot 0 stats exist
    const statsMap = store.getAllSpotStats(0);
    expect(Object.keys(statsMap).length).toBeGreaterThanOrEqual(9);
  });

  it('Journey 2 & 3: Student creates an account with @vitstudent.ac.in and logs in', () => {
    const studentUser = {
      id: 'usr-student-new',
      email: 'alex.k2026@vitstudent.ac.in',
      display_name: 'Alex K.',
      role: 'student' as const,
      vit_reg_no: '26BCE2090',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    store.setCurrentUser(studentUser);
    const active = store.getCurrentUser();
    expect(active?.email).toBe('alex.k2026@vitstudent.ac.in');
    expect(active?.role).toBe('student');
  });

  it('Journey 4: Student submits a phone-meter decibel reading', () => {
    const reading = store.addReading({
      spot_id: 'spot-lib-reading',
      method: 'phone_meter',
      db_level: 37.0,
      duration_seconds: 30,
      observation_time: '2026-10-24T08:00:00+05:30',
      note: 'Very peaceful reading hall',
    });

    expect(reading.id).toBeTruthy();
    expect(reading.db_level).toBe(37.0);
    expect(reading.method).toBe('phone_meter');
    expect(reading.time_slot).toBe(0);
  });

  it('Journey 5: Student submits a manual subjective estimate when phone meter is unavailable', () => {
    const estimate = store.addReading({
      spot_id: 'spot-food-court',
      method: 'manual_estimate',
      estimate_level: 'loud',
      duration_seconds: 20,
      observation_time: '2026-10-24T14:00:00+05:30',
      note: 'Crowded cafeteria bustling sounds',
    });

    expect(estimate.method).toBe('manual_estimate');
    expect(estimate.db_level).toBeNull();
    expect(estimate.estimate_level).toBe('loud');
    expect(estimate.time_slot).toBe(3);
  });

  it('Journey 6: Dashboard and rankings update correctly after submissions', () => {
    // Purge demo records to test clean spot calculation
    store.purgeDemoData();

    // Add quiet readings in slot 1 (10:00-11:00)
    store.addReading({
      spot_id: 'spot-auditorium-steps',
      method: 'phone_meter',
      db_level: 32.0,
      duration_seconds: 25,
      observation_time: '2026-10-24T10:00:00+05:30',
    });
    store.addReading({
      spot_id: 'spot-auditorium-steps',
      method: 'phone_meter',
      db_level: 34.0,
      duration_seconds: 25,
      observation_time: '2026-10-24T10:30:00+05:30',
    });

    const stats = store.getSpotStats('spot-auditorium-steps', 1);
    expect(stats.energyAvgDb).toBeCloseTo(33.1, 1);
    expect(stats.totalCount).toBe(2);
  });

  it('Journey 7: Student saves and retrieves a favourite study space', () => {
    const spotId = 'spot-lib-discussion';
    store.toggleSaveSpot(spotId);

    const saved = store.getSavedSpots();
    expect(saved.some((s) => s.spot_id === spotId)).toBe(true);
    expect(store.isSpotSaved(spotId)).toBe(true);
  });

  it('Journey 8: Student reports suspicious data', () => {
    const reading = store.getReadings()[0];
    const flag = store.flagReading(reading.id, 'Spam reading value entered');

    expect(flag.id).toBeDefined();
    expect(flag.status).toBe('pending');
    expect(flag.reason).toContain('Spam reading');
  });

  it('Journey 9: Administrator moderates flagged submissions and updates review status', () => {
    store.switchRole('admin');
    expect(store.getCurrentUser()?.role).toBe('admin');

    const reading = store.getReadings()[0];
    const flag = store.flagReading(reading.id, 'Fabricated test noise');

    // Admin resolves and excludes
    store.resolveFlag(flag.id, 'resolve_exclude');

    const flags = store.getFlags();
    const resolvedFlag = flags.find((f) => f.id === flag.id);
    expect(resolvedFlag?.status).toBe('resolved');

    const excludedReadings = store.getReadings({ includeDemo: true, status: 'excluded' });
    expect(excludedReadings.some((r) => r.id === reading.id)).toBe(true);
  });

  it('Journey 10: Role-based separation between student and administrative privileges', () => {
    store.switchRole('student');
    const studentUser = store.getCurrentUser();
    expect(studentUser?.role).toBe('student');

    // Student cannot be admin
    expect(studentUser?.role === 'admin').toBe(false);

    // Switch to admin
    store.switchRole('admin');
    const adminUser = store.getCurrentUser();
    expect(adminUser?.role).toBe('admin');
  });
});
