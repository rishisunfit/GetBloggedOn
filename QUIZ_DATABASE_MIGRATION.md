# Quiz Database Migration

## SQL to Create Tables

Run this SQL in your Supabase SQL Editor:

```sql
-- Create quizzes table
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  cover_page JSONB NOT NULL,
  questions JSONB NOT NULL,
  conclusion_page JSONB NOT NULL,
  contact_settings JSONB NOT NULL,
  styles JSONB NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create quiz_submissions table
CREATE TABLE IF NOT EXISTS public.quiz_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  contact_info JSONB,
  completed_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_quizzes_user_id ON public.quizzes(user_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_slug ON public.quizzes(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_quizzes_status ON public.quizzes(status);
CREATE INDEX IF NOT EXISTS idx_quiz_submissions_quiz_id ON public.quiz_submissions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_submissions_completed_at ON public.quiz_submissions(completed_at DESC);

-- Enable RLS
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quizzes
-- Users can view their own quizzes
CREATE POLICY "Users can view own quizzes"
  ON public.quizzes
  FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Users can insert their own quizzes
CREATE POLICY "Users can insert own quizzes"
  ON public.quizzes
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- Users can update their own quizzes
CREATE POLICY "Users can update own quizzes"
  ON public.quizzes
  FOR UPDATE
  USING (auth.uid()::text = user_id::text);

-- Users can delete their own quizzes
CREATE POLICY "Users can delete own quizzes"
  ON public.quizzes
  FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- Public can view published quizzes (for taking quizzes)
CREATE POLICY "Public can view published quizzes"
  ON public.quizzes
  FOR SELECT
  USING (status = 'published');

-- RLS Policies for quiz_submissions
-- Users can view submissions for their own quizzes
CREATE POLICY "Users can view submissions for own quizzes"
  ON public.quiz_submissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes
      WHERE quizzes.id = quiz_submissions.quiz_id
      AND quizzes.user_id::text = auth.uid()::text
    )
  );

-- Anyone can insert quiz submissions (for taking quizzes)
CREATE POLICY "Anyone can insert quiz submissions"
  ON public.quiz_submissions
  FOR INSERT
  WITH CHECK (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_quizzes_updated_at
  BEFORE UPDATE ON public.quizzes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

