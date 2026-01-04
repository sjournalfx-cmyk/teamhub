-- ================================================
-- Fix Table RLS Policies (Skipping Storage)
-- Run this in your Supabase SQL Editor
-- ================================================

-- 1. Fix Activity Log Table
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS target_id UUID;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert and select from activity_log
DROP POLICY IF EXISTS "activity_log_all_authenticated" ON activity_log;
CREATE POLICY "activity_log_all_authenticated" ON activity_log
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. Ensure other tables have correct authenticated policies
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
