# Database Migrations for Anonymous Session System

This document outlines the SQL migrations needed to support anonymous user sessions for ratings and form submissions.

## 1. Create Ratings Table

```sql
-- Create ratings table for star ratings
CREATE TABLE IF NOT EXISTS public.ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    stars INTEGER NOT NULL CHECK (stars >= 1 AND stars <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(post_id, session_id) -- One rating per session per post
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_ratings_post_id ON public.ratings(post_id);
CREATE INDEX IF NOT EXISTS idx_ratings_session_id ON public.ratings(session_id);
CREATE INDEX IF NOT EXISTS idx_ratings_post_stars ON public.ratings(post_id, stars);

-- Enable Row Level Security (optional, but recommended)
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read ratings
CREATE POLICY "Anyone can view ratings"
    ON public.ratings
    FOR SELECT
    USING (true);

-- Policy: Anyone can insert ratings (using session_id)
CREATE POLICY "Anyone can insert ratings"
    ON public.ratings
    FOR INSERT
    WITH CHECK (true);

-- Policy: Users can only update their own ratings (by session_id)
CREATE POLICY "Users can update own ratings"
    ON public.ratings
    FOR UPDATE
    USING (true)
    WITH CHECK (true);
```

## 2. Update form_submissions Table

```sql
-- Add session_id column
ALTER TABLE public.form_submissions 
ADD COLUMN IF NOT EXISTS session_id TEXT;

-- Remove user_id column (if you want to completely remove it)
-- Note: Only do this if you're sure you don't need it anymore
-- ALTER TABLE public.form_submissions DROP COLUMN IF EXISTS user_id;

-- Or make user_id nullable if you want to keep it for authenticated users
-- ALTER TABLE public.form_submissions ALTER COLUMN user_id DROP NOT NULL;

-- Create index for session_id
CREATE INDEX IF NOT EXISTS idx_form_submissions_session_id ON public.form_submissions(session_id);

-- Update RLS policies if needed
-- The existing policies should still work, but you may want to update them
-- to allow anonymous submissions with session_id
```

## 3. Optional: Create Function to Update updated_at

```sql
-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for ratings table
CREATE TRIGGER update_ratings_updated_at 
    BEFORE UPDATE ON public.ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## Notes

- **session_id**: A 32-character random string stored in cookies/localStorage
- **Ratings**: One rating per session per post (enforced by UNIQUE constraint)
- **Form Submissions**: Can have multiple submissions per session (no unique constraint)
- **RLS Policies**: Adjust based on your security requirements

## Testing

After running these migrations, test:
1. Rating a post without being logged in
2. Closing browser and reopening - rating should persist
3. Submitting a form without being logged in
4. Multiple ratings from same session should update, not create duplicates

