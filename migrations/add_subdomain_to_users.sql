-- Add subdomain column to users table for tenant routing
-- Run this in Supabase SQL Editor

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS subdomain text UNIQUE;

-- Create index for fast subdomain lookups
CREATE INDEX IF NOT EXISTS users_subdomain_idx ON public.users (subdomain) 
WHERE subdomain IS NOT NULL;

-- Add constraint to ensure subdomain is lowercase and URL-safe
ALTER TABLE public.users 
ADD CONSTRAINT users_subdomain_format CHECK (
  subdomain IS NULL OR subdomain ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
);

-- Update your user with a subdomain for testing
-- Replace the UUID with your actual user ID if different
UPDATE public.users 
SET subdomain = 'rishfits' 
WHERE id = 'dbe9bcb3-1aa7-47d6-97c2-8edce98491b2';

