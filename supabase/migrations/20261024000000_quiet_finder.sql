-- Quiet Finder: Supabase PostgreSQL Schema & RLS Policies
-- VIT Chennai Crowdsourced Noise-Level Mapping System

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin', 'moderator')),
  vit_reg_no TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. CAMPUS SPOTS
CREATE TABLE IF NOT EXISTS public.campus_spots (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'academic' CHECK (category IN ('library', 'academic', 'food', 'hostel', 'sports', 'outdoor', 'other')),
  building_name TEXT,
  floor TEXT,
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_campus_spots_active ON public.campus_spots(is_active);
CREATE INDEX IF NOT EXISTS idx_campus_spots_category ON public.campus_spots(category);

-- 3. NOISE READINGS
CREATE TABLE IF NOT EXISTS public.noise_readings (
  id TEXT PRIMARY KEY,
  spot_id TEXT NOT NULL REFERENCES public.campus_spots(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT,
  method TEXT NOT NULL CHECK (method IN ('phone_meter', 'manual_estimate')),
  db_level NUMERIC(4,1) CHECK (db_level IS NULL OR (db_level >= 20.0 AND db_level <= 120.0)),
  estimate_level TEXT CHECK (estimate_level IS NULL OR estimate_level IN ('silent', 'quiet', 'chatty', 'loud')),
  duration_seconds INTEGER NOT NULL DEFAULT 20 CHECK (duration_seconds >= 0),
  observation_time TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  time_slot INTEGER NOT NULL CHECK (time_slot >= 0 AND time_slot <= 7),
  note TEXT,
  is_demo BOOLEAN NOT NULL DEFAULT false,
  review_status TEXT NOT NULL DEFAULT 'approved' CHECK (review_status IN ('approved', 'pending', 'flagged', 'excluded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT valid_measurement_data CHECK (
    (method = 'phone_meter' AND db_level IS NOT NULL) OR
    (method = 'manual_estimate' AND estimate_level IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_noise_readings_spot_slot ON public.noise_readings(spot_id, time_slot, review_status);
CREATE INDEX IF NOT EXISTS idx_noise_readings_author ON public.noise_readings(author_id);
CREATE INDEX IF NOT EXISTS idx_noise_readings_demo ON public.noise_readings(is_demo);
CREATE INDEX IF NOT EXISTS idx_noise_readings_obs_time ON public.noise_readings(observation_time DESC);

-- 4. SAVED SPOTS
CREATE TABLE IF NOT EXISTS public.saved_spots (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  spot_id TEXT NOT NULL REFERENCES public.campus_spots(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_user_spot UNIQUE(user_id, spot_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_spots_user ON public.saved_spots(user_id);

-- 5. READING FLAGS (Suspicious/Inaccurate moderation)
CREATE TABLE IF NOT EXISTS public.reading_flags (
  id TEXT PRIMARY KEY,
  reading_id TEXT NOT NULL REFERENCES public.noise_readings(id) ON DELETE CASCADE,
  reporting_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_reading_flags_status ON public.reading_flags(status);

-- 6. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. APP SETTINGS
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.noise_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Helper function: is current user an administrator
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Public can view basic display names; users can edit own profile; admins can edit all
CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Campus Spots: Viewable by anyone; modifiable only by admins
CREATE POLICY "Spots viewable by all"
  ON public.campus_spots FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage spots"
  ON public.campus_spots FOR ALL
  USING (public.is_admin());

-- Noise Readings: Approved viewable by all; authors can view their own; authors can insert their own
CREATE POLICY "Approved readings viewable by all"
  ON public.noise_readings FOR SELECT
  USING (review_status = 'approved' OR author_id = auth.uid() OR public.is_admin());

CREATE POLICY "Authenticated users can submit noise readings"
  ON public.noise_readings FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND (author_id = auth.uid() OR author_id IS NULL));

CREATE POLICY "Users can delete own readings"
  ON public.noise_readings FOR DELETE
  USING (author_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can update reading review status"
  ON public.noise_readings FOR UPDATE
  USING (public.is_admin());

-- Saved Spots: Users can view and manage their own
CREATE POLICY "Users manage own saved spots"
  ON public.saved_spots FOR ALL
  USING (auth.uid() = user_id);

-- Reading Flags: Authenticated users can insert; admins can view & resolve
CREATE POLICY "Authenticated users can flag readings"
  ON public.reading_flags FOR INSERT
  WITH CHECK (auth.uid() = reporting_user_id);

CREATE POLICY "Flags viewable and manageable by admins"
  ON public.reading_flags FOR ALL
  USING (public.is_admin() OR auth.uid() = reporting_user_id);

-- Audit Logs: Admin only
CREATE POLICY "Audit logs admin access only"
  ON public.audit_logs FOR ALL
  USING (public.is_admin());

-- App Settings: Read by all, write by admin
CREATE POLICY "Settings viewable by all"
  ON public.app_settings FOR SELECT
  USING (true);

CREATE POLICY "Settings editable by admin only"
  ON public.app_settings FOR ALL
  USING (public.is_admin());
