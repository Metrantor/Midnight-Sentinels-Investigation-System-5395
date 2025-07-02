-- 🔥 COMPLETE DATABASE SETUP INCLUDING HEARINGS SYSTEM
-- Run this SQL in your Supabase SQL Editor

-- 1. CREATE WITNESS STATEMENTS TABLE
CREATE TABLE IF NOT EXISTS witness_statements_ms2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id TEXT NOT NULL,
  witness_user_id TEXT NOT NULL,
  witness_name TEXT NOT NULL,
  statement TEXT,
  statement_status TEXT DEFAULT 'pending',
  submitted_at TIMESTAMPTZ,
  judge_comment TEXT,
  judge_request TEXT,
  judge_id TEXT,
  judge_name TEXT,
  judge_commented_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 🔥 CREATE HEARINGS TABLE (MISSING!)
CREATE TABLE IF NOT EXISTS hearings_ms2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id TEXT NOT NULL,
  title TEXT NOT NULL,
  question TEXT NOT NULL,
  witness_ids TEXT[] DEFAULT '{}',
  crime_types TEXT[] DEFAULT '{}',
  entry_description TEXT,
  status TEXT DEFAULT 'active',
  responses JSONB DEFAULT '[]',
  created_by_id TEXT NOT NULL,
  created_by_name TEXT NOT NULL,
  created_by_role TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ENABLE ROW LEVEL SECURITY
ALTER TABLE witness_statements_ms2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE hearings_ms2024 ENABLE ROW LEVEL SECURITY;

-- 4. CREATE POLICIES (Allow all access for now)
CREATE POLICY IF NOT EXISTS "Allow all access" ON witness_statements_ms2024 FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow all access" ON hearings_ms2024 FOR ALL USING (true);

-- 5. ADD MISSING COLUMNS TO PERSON ENTRIES (if they don't exist)
ALTER TABLE person_entries_ms2024 
ADD COLUMN IF NOT EXISTS reported_by_id TEXT,
ADD COLUMN IF NOT EXISTS reported_by_name TEXT,
ADD COLUMN IF NOT EXISTS reported_by_role TEXT,
ADD COLUMN IF NOT EXISTS witness_names TEXT;

-- 6. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_witness_statements_incident ON witness_statements_ms2024(incident_id);
CREATE INDEX IF NOT EXISTS idx_witness_statements_witness ON witness_statements_ms2024(witness_user_id);
CREATE INDEX IF NOT EXISTS idx_witness_statements_status ON witness_statements_ms2024(statement_status);
CREATE INDEX IF NOT EXISTS idx_person_entries_reporter ON person_entries_ms2024(reported_by_id);

-- 🔥 NEW: HEARINGS INDEXES
CREATE INDEX IF NOT EXISTS idx_hearings_entry ON hearings_ms2024(entry_id);
CREATE INDEX IF NOT EXISTS idx_hearings_creator ON hearings_ms2024(created_by_id);
CREATE INDEX IF NOT EXISTS idx_hearings_status ON hearings_ms2024(status);
CREATE INDEX IF NOT EXISTS idx_hearings_witnesses ON hearings_ms2024 USING GIN(witness_ids);

-- 7. CREATE ROLE IMAGES TABLE (if it doesn't exist)
CREATE TABLE IF NOT EXISTS role_images_ms2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id TEXT UNIQUE NOT NULL,
  image_url TEXT NOT NULL,
  uploaded_by_id TEXT,
  uploaded_by_name TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ENABLE RLS FOR ROLE IMAGES
ALTER TABLE role_images_ms2024 ENABLE ROW LEVEL SECURITY;

-- 9. CREATE POLICY FOR ROLE IMAGES
CREATE POLICY IF NOT EXISTS "Allow all access" ON role_images_ms2024 FOR ALL USING (true);

-- 10. CREATE STORAGE BUCKET FOR ROLE IMAGES (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('role-images', 'role-images', true) 
ON CONFLICT (id) DO NOTHING;

-- 11. CREATE STORAGE POLICY FOR ROLE IMAGES
CREATE POLICY IF NOT EXISTS "Allow all operations on role images" 
ON storage.objects FOR ALL USING (bucket_id = 'role-images');

-- ✅ VERIFICATION QUERIES
-- Run these to verify everything was created correctly:

-- Check if hearings table exists and has correct structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'hearings_ms2024' 
ORDER BY ordinal_position;

-- Check if witness_statements table exists and has correct structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'witness_statements_ms2024' 
ORDER BY ordinal_position;

-- Check if person_entries has new columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'person_entries_ms2024' 
AND column_name IN ('reported_by_id', 'reported_by_name', 'reported_by_role', 'witness_names');

-- Check if role_images table exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'role_images_ms2024' 
ORDER BY ordinal_position;

-- Check storage bucket
SELECT * FROM storage.buckets WHERE id = 'role-images';

-- ✅ SUCCESS MESSAGE
SELECT 'All tables including HEARINGS created successfully! 🎉' as status;