# Fix RLS Policies for Public Post Access

The error you're seeing is likely due to Row Level Security (RLS) policies blocking anonymous access to the `posts` table.

## Quick Fix

Run this SQL in your Supabase SQL Editor to allow public read access to published posts:

```sql
-- Enable RLS if not already enabled
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists (optional, to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can view published posts" ON public.posts;

-- Create policy to allow anyone to read published posts
CREATE POLICY "Anyone can view published posts"
    ON public.posts
    FOR SELECT
    USING (status = 'published' AND is_draft = false);
```

## Verify RLS is the Issue

To check if RLS is enabled and what policies exist:

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'posts';

-- List all policies on posts table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'posts';
```

## Alternative: Disable RLS (Not Recommended for Production)

If you want to disable RLS entirely (not recommended for security):

```sql
ALTER TABLE public.posts DISABLE ROW LEVEL SECURITY;
```

## Recommended Setup

For a blog with public posts, you should have:

1. **RLS Enabled** - For security
2. **Public Read Policy** - Allow anyone to read published posts
3. **Authenticated Write Policy** - Only allow authenticated users to create/update/delete their own posts

Here's a complete policy setup:

```sql
-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone can view published posts
CREATE POLICY "Anyone can view published posts"
    ON public.posts
    FOR SELECT
    USING (status = 'published' AND is_draft = false);

-- Policy 2: Authenticated users can view their own posts (including drafts)
CREATE POLICY "Users can view own posts"
    ON public.posts
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy 3: Authenticated users can insert their own posts
CREATE POLICY "Users can insert own posts"
    ON public.posts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy 4: Authenticated users can update their own posts
CREATE POLICY "Users can update own posts"
    ON public.posts
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy 5: Authenticated users can delete their own posts
CREATE POLICY "Users can delete own posts"
    ON public.posts
    FOR DELETE
    USING (auth.uid() = user_id);
```

## Testing

After applying the policies, test by:

1. Opening `/posts/{post-id}` in an incognito/private browser window (no auth)
2. The post should load if it's published
3. Draft posts should not be accessible to anonymous users

