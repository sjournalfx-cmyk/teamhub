
-- ================================================
-- Fix RLS and Storage Policies
-- Run this in your Supabase SQL Editor
-- ================================================

-- 1. Fix Activity Log Table
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS target_id UUID;

-- Ensure RLS is enabled for activity_log
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert and select from activity_log
DROP POLICY IF EXISTS "Enable all for authenticated users" ON activity_log;
DROP POLICY IF EXISTS "activity_log_insert_authenticated" ON activity_log;
DROP POLICY IF EXISTS "activity_log_select_authenticated" ON activity_log;
DROP POLICY IF EXISTS "activity_log_all_authenticated" ON activity_log;

CREATE POLICY "activity_log_all_authenticated" ON activity_log
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. Fix Storage Policies (storage.objects table)
-- Create buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Enable RLS on storage.objects if not already enabled

-- Enable RLS on storage.objects is usually default and we might not have permissions to change it.
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Attachments Bucket Policies
DROP POLICY IF EXISTS "Allow authenticated uploads to attachments" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'attachments');

DROP POLICY IF EXISTS "Allow authenticated updates to attachments" ON storage.objects;
CREATE POLICY "Allow authenticated updates to attachments"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'attachments');

DROP POLICY IF EXISTS "Allow authenticated deletes from attachments" ON storage.objects;
CREATE POLICY "Allow authenticated deletes from attachments"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'attachments');

DROP POLICY IF EXISTS "Allow public select from attachments" ON storage.objects;
CREATE POLICY "Allow public select from attachments"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'attachments');

-- Avatars Bucket Policies
DROP POLICY IF EXISTS "Allow authenticated uploads to avatars" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to avatars"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Allow authenticated updates to avatars" ON storage.objects;
CREATE POLICY "Allow authenticated updates to avatars"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Allow public select from avatars" ON storage.objects;
CREATE POLICY "Allow public select from avatars"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'avatars');

-- 3. Ensure other tables have correct authenticated policies
-- Sometimes "Enable all for authenticated users" is missing or restrictive

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON tasks;
CREATE POLICY "Enable all for authenticated users" ON tasks
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON goals;
CREATE POLICY "Enable all for authenticated users" ON goals
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE join_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON join_requests;
CREATE POLICY "Enable all for authenticated users" ON join_requests
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
