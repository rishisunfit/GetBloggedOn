-- Add quiz display options to posts table
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS quiz_show_description BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS quiz_show_responses_button BOOLEAN DEFAULT false;
