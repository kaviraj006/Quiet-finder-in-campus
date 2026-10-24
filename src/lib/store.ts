'use client';

import {
  DEFAULT_APP_SETTINGS,
  INITIAL_CAMPUS_SPOTS,
} from './constants';
import {
  aggregateSpotReadings,
  generateDemoReadings,
  getTimeSlotIndexForHour,
} from './noise';
import {
  AppSettings,
  CampusSpot,
  ManualEstimateLevel,
  MeasurementMethod,
  NoiseReading,
  ReadingFlag,
  SavedSpot,
  SpotStats,
  UserProfile,
} from './types';

const STORAGE_KEYS = {
  SPOTS: 'quiet_finder_spots',
  READINGS: 'quiet_finder_readings',
  SAVED: 'quiet_finder_saved',
  FLAGS: 'quiet_finder_flags',
  USER: 'quiet_finder_user',
  SETTINGS: 'quiet_finder_settings',
  AUDIT: 'quiet_finder_audit',
  DEMO_VISIBLE: 'quiet_finder_show_demo',
};

// Initial default user for local testing/demo if unauthenticated
export const DEFAULT_DEMO_USER: UserProfile = {
  id: 'usr-student-01',
  email: 'yuvaraj.s2026@vitstudent.ac.in',
  display_name: 'Yuvaraj S. (Student)',
  role: 'student',
  vit_reg_no: '26BCE1042',
  created_at: '2026-01-15T10:00:00Z',
  updated_at: '2026-01-15T10:00:00Z',
};

export const DEFAULT_ADMIN_USER: UserProfile = {
  id: 'usr-admin-01',
  email: 'admin.campus@vitstudent.ac.in',
  display_name: 'VIT Campus Admin',
  role: 'admin',
  vit_reg_no: 'FAC-7412',
  created_at: '2026-01-01T08:00:00Z',
  updated_at: '2026-01-01T08:00:00Z',
};

class QuietFinderStore {
  private spots: CampusSpot[] = [];
  private readings: NoiseReading[] = [];
  private savedSpots: SavedSpot[] = [];
  private flags: ReadingFlag[] = [];
  private currentUser: UserProfile | null = null;
  private settings: AppSettings = DEFAULT_APP_SETTINGS;
  private showDemoData: boolean = true;
  private listeners: Set<() => void> = new Set();
  private initialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    if (this.initialized) return;

    // Load spots
    try {
      const storedSpots = localStorage.getItem(STORAGE_KEYS.SPOTS);
      if (storedSpots) {
        this.spots = JSON.parse(storedSpots);
      } else {
        this.spots = [...INITIAL_CAMPUS_SPOTS];
        localStorage.setItem(STORAGE_KEYS.SPOTS, JSON.stringify(this.spots));
      }
    } catch {
      this.spots = [...INITIAL_CAMPUS_SPOTS];
    }

    // Load readings (including 216 paper seed demo readings if first run)
    try {
      const storedReadings = localStorage.getItem(STORAGE_KEYS.READINGS);
      if (storedReadings) {
        this.readings = JSON.parse(storedReadings);
      } else {
        this.readings = generateDemoReadings();
        localStorage.setItem(STORAGE_KEYS.READINGS, JSON.stringify(this.readings));
      }
    } catch {
      this.readings = generateDemoReadings();
    }

    // Load saved spots
    try {
      const storedSaved = localStorage.getItem(STORAGE_KEYS.SAVED);
      this.savedSpots = storedSaved ? JSON.parse(storedSaved) : [];
    } catch {
      this.savedSpots = [];
    }

    // Load flags
    try {
      const storedFlags = localStorage.getItem(STORAGE_KEYS.FLAGS);
      this.flags = storedFlags ? JSON.parse(storedFlags) : [];
    } catch {
      this.flags = [];
    }

    // Load user (defaults to demo student for frictionless exploration)
    try {
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      this.currentUser = storedUser ? JSON.parse(storedUser) : DEFAULT_DEMO_USER;
    } catch {
      this.currentUser = DEFAULT_DEMO_USER;
    }

    // Load demo visibility preference
    try {
      const storedDemoPref = localStorage.getItem(STORAGE_KEYS.DEMO_VISIBLE);
      this.showDemoData = storedDemoPref !== null ? JSON.parse(storedDemoPref) : true;
    } catch {
      this.showDemoData = true;
    }

    // Load settings
    try {
      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      this.settings = storedSettings
        ? { ...DEFAULT_APP_SETTINGS, ...JSON.parse(storedSettings) }
        : DEFAULT_APP_SETTINGS;
    } catch {
      this.settings = DEFAULT_APP_SETTINGS;
    }

    this.initialized = true;
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  private persist(key: string, data: unknown) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Storage persist error:', e);
    }
  }

  // --- Spots Management ---
  public getSpots(includeInactive = false): CampusSpot[] {
    this.init();
    if (includeInactive) return [...this.spots];
    return this.spots.filter((s) => s.is_active);
  }

  public getSpotById(id: string): CampusSpot | undefined {
    this.init();
    return this.spots.find((s) => s.id === id);
  }

  public addSpot(spot: Omit<CampusSpot, 'id' | 'created_at' | 'updated_at'>): CampusSpot {
    this.init();
    const newSpot: CampusSpot = {
      ...spot,
      id: `spot-custom-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.spots = [newSpot, ...this.spots];
    this.persist(STORAGE_KEYS.SPOTS, this.spots);
    this.notify();
    return newSpot;
  }

  public updateSpot(id: string, updates: Partial<CampusSpot>): CampusSpot | null {
    this.init();
    const idx = this.spots.findIndex((s) => s.id === id);
    if (idx === -1) return null;

    this.spots[idx] = {
      ...this.spots[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.persist(STORAGE_KEYS.SPOTS, this.spots);
    this.notify();
    return this.spots[idx];
  }

  public deleteSpot(id: string): boolean {
    this.init();
    this.spots = this.spots.filter((s) => s.id !== id);
    this.persist(STORAGE_KEYS.SPOTS, this.spots);
    this.notify();
    return true;
  }

  // --- Noise Readings & Aggregations ---
  public getReadings(options?: {
    spotId?: string;
    timeSlot?: number;
    method?: MeasurementMethod;
    includeDemo?: boolean;
    status?: string;
  }): NoiseReading[] {
    this.init();
    let result = [...this.readings];

    const includeDemo = options?.includeDemo ?? this.showDemoData;
    if (!includeDemo) {
      result = result.filter((r) => !r.is_demo);
    }

    if (options?.spotId) {
      result = result.filter((r) => r.spot_id === options.spotId);
    }

    if (options?.timeSlot !== undefined) {
      result = result.filter((r) => r.time_slot === options.timeSlot);
    }

    if (options?.method) {
      result = result.filter((r) => r.method === options.method);
    }

    if (options?.status) {
      result = result.filter((r) => r.review_status === options.status);
    } else {
      result = result.filter((r) => r.review_status !== 'excluded');
    }

    return result.sort(
      (a, b) => new Date(b.observation_time).getTime() - new Date(a.observation_time).getTime()
    );
  }

  public addReading(
    data: {
      spot_id: string;
      method: MeasurementMethod;
      db_level?: number | null;
      estimate_level?: ManualEstimateLevel | null;
      duration_seconds?: number;
      observation_time?: string;
      note?: string;
    },
    user?: UserProfile | null
  ): NoiseReading {
    this.init();
    const author = user || this.currentUser;
    const obsTime = data.observation_time || new Date().toISOString();
    const obsDate = new Date(obsTime);
    
    // Extract campus local hour in Asia/Kolkata (UTC+05:30)
    let hours = 12;
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: this.settings.defaultTimezone || 'Asia/Kolkata',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
      });
      const parts = formatter.formatToParts(obsDate);
      const h = parseInt(parts.find((p) => p.type === 'hour')?.value || '12', 10);
      const m = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);
      hours = h + m / 60;
    } catch {
      hours = obsDate.getHours() + obsDate.getMinutes() / 60;
    }
    const timeSlot = getTimeSlotIndexForHour(hours);

    const newReading: NoiseReading = {
      id: `read-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      spot_id: data.spot_id,
      author_id: author?.id,
      author_name: author?.display_name || 'Anonymous Student',
      method: data.method,
      db_level: data.method === 'phone_meter' && data.db_level != null ? data.db_level : null,
      estimate_level:
        data.method === 'manual_estimate' && data.estimate_level ? data.estimate_level : null,
      duration_seconds: data.duration_seconds || 20,
      observation_time: obsTime,
      time_slot: timeSlot,
      note: data.note?.trim(),
      is_demo: false,
      review_status: 'approved',
      created_at: new Date().toISOString(),
    };

    this.readings = [newReading, ...this.readings];
    this.persist(STORAGE_KEYS.READINGS, this.readings);
    this.notify();
    return newReading;
  }

  public updateReadingStatus(id: string, status: NoiseReading['review_status']): boolean {
    this.init();
    const idx = this.readings.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    this.readings[idx].review_status = status;
    this.persist(STORAGE_KEYS.READINGS, this.readings);
    this.notify();
    return true;
  }

  public deleteReading(id: string): boolean {
    this.init();
    this.readings = this.readings.filter((r) => r.id !== id);
    this.persist(STORAGE_KEYS.READINGS, this.readings);
    this.notify();
    return true;
  }

  public getSpotStats(spotId: string, timeSlot: number): SpotStats {
    this.init();
    const eligibleReadings = this.getReadings({
      spotId,
      timeSlot,
      includeDemo: this.showDemoData,
    });
    return aggregateSpotReadings(
      eligibleReadings,
      spotId,
      timeSlot,
      this.settings.minSamplesThreshold
    );
  }

  public getAllSpotStats(timeSlot: number): Record<string, SpotStats> {
    this.init();
    const statsMap: Record<string, SpotStats> = {};
    const activeSpots = this.getSpots();
    activeSpots.forEach((s) => {
      statsMap[s.id] = this.getSpotStats(s.id, timeSlot);
    });
    return statsMap;
  }

  // --- Saved Spots (Favourites) ---
  public getSavedSpots(userId?: string): SavedSpot[] {
    this.init();
    const uid = userId || this.currentUser?.id;
    if (!uid) return [];
    return this.savedSpots.filter((s) => s.user_id === uid);
  }

  public isSpotSaved(spotId: string, userId?: string): boolean {
    this.init();
    const uid = userId || this.currentUser?.id;
    if (!uid) return false;
    return this.savedSpots.some((s) => s.user_id === uid && s.spot_id === spotId);
  }

  public toggleSaveSpot(spotId: string, userId?: string): boolean {
    this.init();
    const uid = userId || this.currentUser?.id;
    if (!uid) return false;

    const existingIndex = this.savedSpots.findIndex(
      (s) => s.user_id === uid && s.spot_id === spotId
    );
    if (existingIndex >= 0) {
      this.savedSpots.splice(existingIndex, 1);
      this.persist(STORAGE_KEYS.SAVED, this.savedSpots);
      this.notify();
      return false; // now unsaved
    } else {
      const newSaved: SavedSpot = {
        id: `saved-${Date.now()}`,
        user_id: uid,
        spot_id: spotId,
        created_at: new Date().toISOString(),
      };
      this.savedSpots.push(newSaved);
      this.persist(STORAGE_KEYS.SAVED, this.savedSpots);
      this.notify();
      return true; // now saved
    }
  }

  // --- Moderation Flags ---
  public flagReading(readingId: string, reason: string): ReadingFlag {
    this.init();
    const newFlag: ReadingFlag = {
      id: `flag-${Date.now()}`,
      reading_id: readingId,
      reporting_user_id: this.currentUser?.id || 'anonymous-reporter',
      reason,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    this.flags.push(newFlag);
    this.persist(STORAGE_KEYS.FLAGS, this.flags);

    // mark reading as flagged
    const reading = this.readings.find((r) => r.id === readingId);
    if (reading && reading.review_status !== 'excluded') {
      reading.review_status = 'flagged';
      this.persist(STORAGE_KEYS.READINGS, this.readings);
    }

    this.notify();
    return newFlag;
  }

  public getFlags(): ReadingFlag[] {
    this.init();
    return [...this.flags].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public resolveFlag(flagId: string, action: 'resolve_exclude' | 'dismiss'): void {
    this.init();
    const flag = this.flags.find((f) => f.id === flagId);
    if (!flag) return;

    if (action === 'resolve_exclude') {
      flag.status = 'resolved';
      this.updateReadingStatus(flag.reading_id, 'excluded');
    } else {
      flag.status = 'dismissed';
      const reading = this.readings.find((r) => r.id === flag.reading_id);
      if (reading && reading.review_status === 'flagged') {
        reading.review_status = 'approved';
        this.persist(STORAGE_KEYS.READINGS, this.readings);
      }
    }
    this.persist(STORAGE_KEYS.FLAGS, this.flags);
    this.notify();
  }

  // --- Auth & Profile ---
  public getCurrentUser(): UserProfile | null {
    this.init();
    return this.currentUser;
  }

  public setCurrentUser(user: UserProfile | null) {
    this.init();
    this.currentUser = user;
    if (user) {
      this.persist(STORAGE_KEYS.USER, user);
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
    this.notify();
  }

  public switchRole(role: 'student' | 'admin') {
    if (role === 'admin') {
      this.setCurrentUser(DEFAULT_ADMIN_USER);
    } else {
      this.setCurrentUser(DEFAULT_DEMO_USER);
    }
  }

  // --- Demo Mode & Clean Environment ---
  public isShowDemoData(): boolean {
    this.init();
    return this.showDemoData;
  }

  public setShowDemoData(show: boolean) {
    this.init();
    this.showDemoData = show;
    this.persist(STORAGE_KEYS.DEMO_VISIBLE, show);
    this.notify();
  }

  public resetDemoData(): void {
    this.init();
    // Keep user-created genuine readings, reload paper demo readings
    const userReadings = this.readings.filter((r) => !r.is_demo);
    const demoReadings = generateDemoReadings();
    this.readings = [...userReadings, ...demoReadings];
    this.persist(STORAGE_KEYS.READINGS, this.readings);
    this.notify();
  }

  public purgeDemoData(): void {
    this.init();
    this.readings = this.readings.filter((r) => !r.is_demo);
    this.persist(STORAGE_KEYS.READINGS, this.readings);
    this.notify();
  }

  // --- Settings ---
  public getSettings(): AppSettings {
    this.init();
    return this.settings;
  }

  public updateSettings(newSettings: Partial<AppSettings>): AppSettings {
    this.init();
    this.settings = { ...this.settings, ...newSettings };
    this.persist(STORAGE_KEYS.SETTINGS, this.settings);
    this.notify();
    return this.settings;
  }
}

// Singleton store instance
export const store = new QuietFinderStore();
