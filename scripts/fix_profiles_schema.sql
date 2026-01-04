-- Add custom_id column to profiles table if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS custom_id TEXT;

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_custom_id ON profiles(custom_id);

-- Verify the column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'custom_id';
