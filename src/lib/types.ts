export type SpotCategory =
  | 'library'
  | 'academic'
  | 'food'
  | 'hostel'
  | 'sports'
  | 'outdoor'
  | 'other';

export type MeasurementMethod = 'phone_meter' | 'manual_estimate';

export type ManualEstimateLevel = 'silent' | 'quiet' | 'chatty' | 'loud';

export type UserRole = 'student' | 'admin' | 'moderator';

export type ReviewStatus = 'approved' | 'pending' | 'flagged' | 'excluded';

export interface CampusSpot {
  id: string;
  name: string;
  description: string;
  category: SpotCategory;
  latitude: number | null;
  longitude: number | null;
  is_verified: boolean;
  is_active: boolean;
  building_name?: string;
  floor?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface NoiseReading {
  id: string;
  spot_id: string;
  author_id?: string;
  author_name?: string;
  method: MeasurementMethod;
  db_level: number | null; // LAeq reading in dB(A), null for subjective estimate
  estimate_level: ManualEstimateLevel | null; // null for phone readings
  duration_seconds: number;
  observation_time: string; // ISO 8601 string
  time_slot: number; // 0 to 7
  note?: string;
  is_demo: boolean;
  review_status: ReviewStatus;
  created_at: string;
}

export interface SpotStats {
  spotId: string;
  timeSlot: number;
  measuredCount: number;
  estimateCount: number;
  totalCount: number;
  energyAvgDb: number | null;
  arithmeticAvgDb: number | null;
  minDb: number | null;
  maxDb: number | null;
  estimateDistribution: Record<ManualEstimateLevel, number>;
  dominantEstimate: ManualEstimateLevel | null;
  mostRecentReadingTime: string | null;
  isSufficientData: boolean; // based on minimum threshold, e.g. >= 3
}

export interface TimeSlotDef {
  index: number;
  label: string; // e.g. "07:00–09:00"
  startHour: number;
  endHour: number;
}

export interface ReadingFlag {
  id: string;
  reading_id: string;
  reporting_user_id: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  notes?: string;
  created_at: string;
}

export interface SavedSpot {
  id: string;
  user_id: string;
  spot_id: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  vit_reg_no?: string;
  created_at: string;
  updated_at: string;
}

export interface AppSettings {
  minSamplesThreshold: number;
  visualScaleMinDb: number;
  visualScaleMaxDb: number;
  allowedEmailDomain: string;
  allowPublicDemoMode: boolean;
  defaultTimezone: string;
}
