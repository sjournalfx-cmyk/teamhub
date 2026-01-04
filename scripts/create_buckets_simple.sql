-- ============================================================
-- SIMPLE BUCKET CREATION SCRIPT
-- Run this in the Supabase SQL Editor to create the buckets.
-- ============================================================

-- 1. Create 'attachments' bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Create 'avatars' bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Grant permissions (just in case)
-- This part ensures that the 'authenticated' role can actually use these buckets
-- if RLS is enabled on storage.objects.

-- Attachments Policies
DROP POLICY IF EXISTS "Allow authenticated uploads to attachments" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'attachments');

DROP POLICY IF EXISTS "Allow authenticated updates to attachments" ON storage.objects;
CREATE POLICY "Allow authenticated updates to attachments"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'attachments');

DROP POLICY IF EXISTS "Allow public select from attachments" ON storage.objects;
CREATE POLICY "Allow public select from attachments"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'attachments');

-- Avatars Policies
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
