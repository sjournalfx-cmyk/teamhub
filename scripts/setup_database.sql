-- ================================================
-- Kinetic Application Database Setup
-- Run this in your Supabase SQL Editor
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- PROFILES TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'performer' CHECK (role IN ('admin', 'performer')),
    custom_id TEXT UNIQUE,
    avatar TEXT,
    bio TEXT,
    timezone TEXT DEFAULT 'UTC',
    status_emoji TEXT DEFAULT '🟢',
    status_text TEXT DEFAULT 'Available',
    is_online BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_admin" ON profiles;

-- Policies
CREATE POLICY "profiles_select_all" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "profiles_insert_own" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_delete_admin" ON profiles
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ================================================
-- GOALS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    progress NUMERIC DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    color TEXT,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    milestones JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "goals_select_authenticated" ON goals;
DROP POLICY IF EXISTS "goals_insert_authenticated" ON goals;
DROP POLICY IF EXISTS "goals_update_authenticated" ON goals;
DROP POLICY IF EXISTS "goals_delete_authenticated" ON goals;

-- Policies - all authenticated users can CRUD goals
CREATE POLICY "goals_select_authenticated" ON goals
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "goals_insert_authenticated" ON goals
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "goals_update_authenticated" ON goals
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "goals_delete_authenticated" ON goals
    FOR DELETE TO authenticated USING (true);

-- ================================================
-- TASKS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
    status TEXT DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'Working on it', 'Ready for Review', 'Done', 'Stuck')),
    day TEXT DEFAULT 'Backlog',
    estimate_hours NUMERIC DEFAULT 1,
    assignee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    assignee_ids UUID[] DEFAULT '{}',
    goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
    milestone_id TEXT,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT '{}',
    is_blocked BOOLEAN DEFAULT false,
    blocker_message TEXT,
    blocker_suggestion TEXT,
    is_draft BOOLEAN DEFAULT false,
    is_accepted BOOLEAN DEFAULT false,
    is_scheduled BOOLEAN DEFAULT false,
    scheduled_at BIGINT,
    video_url TEXT,
    dependency_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    breakdown TEXT[] DEFAULT '{}',
    completed_steps INTEGER[] DEFAULT '{}',
    ai_suggestions TEXT[] DEFAULT '{}',
    unblock_history JSONB DEFAULT '[]',
    resources JSONB DEFAULT '[]',
    deliverables JSONB DEFAULT '[]',
    evidence_required BOOLEAN DEFAULT true,
    completion_comment TEXT,
    review_comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "tasks_select_authenticated" ON tasks;
DROP POLICY IF EXISTS "tasks_insert_authenticated" ON tasks;
DROP POLICY IF EXISTS "tasks_update_authenticated" ON tasks;
DROP POLICY IF EXISTS "tasks_delete_authenticated" ON tasks;

-- Policies - all authenticated users can CRUD tasks
CREATE POLICY "tasks_select_authenticated" ON tasks
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "tasks_insert_authenticated" ON tasks
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "tasks_update_authenticated" ON tasks
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "tasks_delete_authenticated" ON tasks
    FOR DELETE TO authenticated USING (true);

-- ================================================
-- JOIN REQUESTS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS join_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'performer',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    access_code TEXT,
    invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(email)
);

-- Enable RLS
ALTER TABLE join_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "join_requests_select_all" ON join_requests;
DROP POLICY IF EXISTS "join_requests_insert_authenticated" ON join_requests;
DROP POLICY IF EXISTS "join_requests_update_authenticated" ON join_requests;
DROP POLICY IF EXISTS "join_requests_delete_authenticated" ON join_requests;

-- Policies
CREATE POLICY "join_requests_select_all" ON join_requests
    FOR SELECT USING (true); -- Anyone can check if they have a pending request

CREATE POLICY "join_requests_insert_authenticated" ON join_requests
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "join_requests_update_authenticated" ON join_requests
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "join_requests_delete_authenticated" ON join_requests
    FOR DELETE TO authenticated USING (true);

-- ================================================
-- ACTIVITY LOG TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    user_name TEXT,
    action TEXT NOT NULL,
    target_name TEXT,
    target_id UUID,
    timestamp BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "activity_log_select_authenticated" ON activity_log;
DROP POLICY IF EXISTS "activity_log_insert_authenticated" ON activity_log;
DROP POLICY IF EXISTS "activity_log_all_authenticated" ON activity_log;

-- Policies
CREATE POLICY "activity_log_all_authenticated" ON activity_log
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_goals_updated_at ON goals;
CREATE TRIGGER update_goals_updated_at
    BEFORE UPDATE ON goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_join_requests_updated_at ON join_requests;
CREATE TRIGGER update_join_requests_updated_at
    BEFORE UPDATE ON join_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- STORAGE SETUP
-- ================================================
-- Run these in the Supabase dashboard under Storage

-- 1. Create a bucket called 'avatars' for profile pictures
-- 2. Create a bucket called 'attachments' for task deliverables
-- 3. Set both buckets to public for read access

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_goal_id ON tasks(goal_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_day ON tasks(day);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_timestamp ON activity_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_join_requests_email ON join_requests(email);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_custom_id ON profiles(custom_id);