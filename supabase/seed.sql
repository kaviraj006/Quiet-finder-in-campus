-- Quiet Finder Initial Database Seed Script
-- VIT Chennai Campus Spots and Core Configuration

-- 1. Insert Initial Campus Spots from paper
INSERT INTO public.campus_spots (id, name, description, category, building_name, floor, latitude, longitude, is_verified, is_active)
VALUES
  ('spot-lib-reading', 'Library – Reading Hall', 'Ground & 1st floor silent study areas in the Central Library.', 'library', 'Library Block', 'Ground & 1st Floor', 12.841022, 80.154029, true, true),
  ('spot-lib-discussion', 'Library – Discussion Area', 'Designated collaborative zone on the 2nd floor of the Central Library.', 'library', 'Library Block', '2nd Floor', 12.841150, 80.154180, true, true),
  ('spot-ab1-lounge', 'AB1 – Study Lounge', 'Enclosed study lounge situated in Academic Block 1 (AB1).', 'academic', 'Academic Block 1', '3rd Floor', 12.843677, 80.153513, true, true),
  ('spot-ab1-corridor', 'AB1 – Corridor', 'Main ground-level corridor and transition walkway in AB1.', 'academic', 'Academic Block 1', 'Ground Floor', 12.843450, 80.153350, true, true),
  ('spot-food-court', 'Food Court (Gazebo)', 'Central campus food court and Gazebo open dining pavilion.', 'food', 'Gazebo / Central Dining', 'Ground Level', 12.841576, 80.154837, true, true),
  ('spot-hostel-common', 'Hostel Common Room', 'Common study & recreation lounge in Men’s Hostel Block D.', 'hostel', 'Hostel Block D1/D2', '1st Floor', 12.843742, 80.152136, true, true),
  ('spot-sports-lobby', 'Sports Complex Lobby', 'Entrance atrium and waiting lobby of the indoor sports complex.', 'sports', 'Indoor Sports Arena', 'Ground Floor', 12.843585, 80.152583, true, true),
  ('spot-garden-lawn', 'Garden Lawn', 'Open green landscaped lawn between AB1 and the Central Library.', 'outdoor', 'Central Campus Gardens', 'Outdoors', 12.842350, 80.154100, true, true),
  ('spot-auditorium-steps', 'Auditorium Steps', 'Open amphitheater steps outside MG Auditorium.', 'outdoor', 'MG Auditorium', 'Exterior Steps', 12.839583, 80.155190, true, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  is_verified = EXCLUDED.is_verified;

-- 2. Insert App Settings
INSERT INTO public.app_settings (key, value)
VALUES
  ('general', '{"minSamplesThreshold": 3, "visualScaleMinDb": 35, "visualScaleMaxDb": 85, "allowedEmailDomain": "vitstudent.ac.in", "allowPublicDemoMode": true, "defaultTimezone": "Asia/Kolkata"}'::jsonb)
ON CONFLICT (key) DO NOTHING;
