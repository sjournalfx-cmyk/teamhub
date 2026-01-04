
-- Add missing columns to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assignee_ids UUID[] DEFAULT '{}';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS milestone_id UUID;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS dependency_id UUID;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS unblock_history JSONB DEFAULT '[]';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS resources JSONB DEFAULT '[]';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deliverables JSONB DEFAULT '[]';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completion_comment TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS review_comment TEXT;

-- Also ensure goals milestones are handled correctly if needed, 
-- but they seem to be there already.

-- Ensure RLS is enabled and policies are correct
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON tasks;
CREATE POLICY "Enable all for authenticated users" ON tasks
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON goals;
CREATE POLICY "Enable all for authenticated users" ON goals
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
