-- Migration: Add quiz settings columns to posts table
-- This adds post-level quiz settings for controlling quiz behavior

-- Add column to show responses preview before contact/conclusion
ALTER TABLE posts ADD COLUMN IF NOT EXISTS quiz_show_responses_preview BOOLEAN DEFAULT FALSE;

-- Add column to skip contact collection at post level
ALTER TABLE posts ADD COLUMN IF NOT EXISTS quiz_skip_contact_collection BOOLEAN DEFAULT FALSE;

-- Add comments for documentation
COMMENT ON COLUMN posts.quiz_show_responses_preview IS 'When true, shows a summary of user responses before the contact form/conclusion';
COMMENT ON COLUMN posts.quiz_skip_contact_collection IS 'When true, skips the contact info collection for this post even if quiz settings require it';
