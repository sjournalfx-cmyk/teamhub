
-- Migration to support multiple assignees
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assignee_ids UUID[] DEFAULT '{}';

-- Migrate existing assignee_id to assignee_ids array if empty
UPDATE tasks 
SET assignee_ids = ARRAY[assignee_id] 
WHERE assignee_id IS NOT NULL 
AND (assignee_ids IS NULL OR cardinality(assignee_ids) = 0);

-- Update RLS if needed (already seems open enough based on update_schema.sql)
