-- Migration: Add folders table and canonical URL support to posts
-- This migration creates the folders table and adds folder_id, post_slug, and folder_slug columns to posts

-- Create folders table
CREATE TABLE IF NOT EXISTS folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT folders_user_slug_unique UNIQUE (user_id, slug),
    CONSTRAINT folders_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

-- Add columns to posts table
ALTER TABLE posts 
    ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS post_slug TEXT,
    ADD COLUMN IF NOT EXISTS folder_slug TEXT;

-- Add constraint for post_slug format
ALTER TABLE posts
    ADD CONSTRAINT posts_post_slug_format CHECK (post_slug IS NULL OR post_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$');

-- Create partial unique index for (folder_id, post_slug) where both are not null
CREATE UNIQUE INDEX IF NOT EXISTS posts_folder_slug_unique 
    ON posts (folder_id, post_slug) 
    WHERE folder_id IS NOT NULL AND post_slug IS NOT NULL;

-- Create index for public canonical lookups
CREATE INDEX IF NOT EXISTS posts_canonical_lookup 
    ON posts (folder_slug, post_slug) 
    WHERE folder_slug IS NOT NULL AND post_slug IS NOT NULL AND status = 'published' AND is_draft = false;

-- Create index for folder_id lookups
CREATE INDEX IF NOT EXISTS posts_folder_id_idx ON posts (folder_id) WHERE folder_id IS NOT NULL;

-- Function to update folder_slug when folder_id changes
CREATE OR REPLACE FUNCTION update_post_folder_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.folder_id IS NOT NULL THEN
        SELECT slug INTO NEW.folder_slug FROM folders WHERE id = NEW.folder_id;
    ELSE
        NEW.folder_slug := NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update folder_slug when folder_id changes
DROP TRIGGER IF EXISTS trigger_update_post_folder_slug ON posts;
CREATE TRIGGER trigger_update_post_folder_slug
    BEFORE INSERT OR UPDATE OF folder_id ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_post_folder_slug();

-- Function to update all posts' folder_slug when a folder's slug changes
CREATE OR REPLACE FUNCTION update_posts_folder_slug_on_folder_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.slug IS DISTINCT FROM NEW.slug THEN
        UPDATE posts 
        SET folder_slug = NEW.slug 
        WHERE folder_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update posts when folder slug changes
DROP TRIGGER IF EXISTS trigger_update_posts_on_folder_slug_change ON folders;
CREATE TRIGGER trigger_update_posts_on_folder_slug_change
    AFTER UPDATE OF slug ON folders
    FOR EACH ROW
    EXECUTE FUNCTION update_posts_folder_slug_on_folder_change();

-- Function to update updated_at timestamp for folders
CREATE OR REPLACE FUNCTION update_folders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at for folders
DROP TRIGGER IF EXISTS trigger_update_folders_updated_at ON folders;
CREATE TRIGGER trigger_update_folders_updated_at
    BEFORE UPDATE ON folders
    FOR EACH ROW
    EXECUTE FUNCTION update_folders_updated_at();

-- Row Level Security (RLS) policies for folders
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own folders
DROP POLICY IF EXISTS folders_select_own ON folders;
CREATE POLICY folders_select_own ON folders
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can only insert their own folders
DROP POLICY IF EXISTS folders_insert_own ON folders;
CREATE POLICY folders_insert_own ON folders
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own folders
DROP POLICY IF EXISTS folders_update_own ON folders;
CREATE POLICY folders_update_own ON folders
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only delete their own folders
DROP POLICY IF EXISTS folders_delete_own ON folders;
CREATE POLICY folders_delete_own ON folders
    FOR DELETE
    USING (auth.uid() = user_id);

-- Note: Posts RLS policies should already exist for public read access to published posts
-- The canonical route will use the existing public read policy

