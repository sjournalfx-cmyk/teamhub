
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Ensure tasks table exists with correct schema and policies
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'Medium',
    status TEXT DEFAULT 'Not Started',
    day TEXT DEFAULT 'Backlog',
    estimate_hours NUMERIC DEFAULT 1,
    assignee_id UUID REFERENCES profiles(id),
    goal_id UUID REFERENCES goals(id),
    user_id UUID REFERENCES profiles(id),
    tags TEXT[] DEFAULT '{}',
    is_blocked BOOLEAN DEFAULT false,
    blocker_message TEXT,
    blocker_suggestion TEXT,
    is_draft BOOLEAN DEFAULT false,
    is_accepted BOOLEAN DEFAULT false,
    scheduled_at BIGINT,
    breakdown TEXT[] DEFAULT '{}',
    completed_steps INTEGER[] DEFAULT '{}',
    ai_suggestions TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to perform all actions on tasks
DROP POLICY IF EXISTS "Enable all for authenticated users" ON tasks;
CREATE POLICY "Enable all for authenticated users" ON tasks
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 2. Ensure goals table exists with correct schema and policies
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    progress NUMERIC DEFAULT 0,
    color TEXT,
    user_id UUID REFERENCES profiles(id),
    milestones JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for goals
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all for authenticated users" ON goals;
CREATE POLICY "Enable all for authenticated users" ON goals
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 3. Ensure activity_log table exists with correct schema and policies
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    user_name TEXT,
    action TEXT,
    target_name TEXT,
    timestamp BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for activity_log
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all for authenticated users" ON activity_log;
CREATE POLICY "Enable all for authenticated users" ON activity_log
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
