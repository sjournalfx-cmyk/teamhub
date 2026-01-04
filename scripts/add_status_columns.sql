
-- Add status columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status_emoji TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status_text TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS custom_statuses JSONB DEFAULT '[]'::jsonb;

-- Update existing profiles to have empty custom_statuses if null
UPDATE profiles SET custom_statuses = '[]'::jsonb WHERE custom_statuses IS NULL;
