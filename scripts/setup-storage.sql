-- Supabase Storage Setup for NDAVault
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/yhnudmekuviaaydoxztn/sql

-- 1. Create the nda-files bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'nda-files',
  'nda-files',
  false,
  10485760, -- 10MB in bytes
  ARRAY['application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- 2. Create policies for the nda-files bucket

-- Users can upload files to their own folder
CREATE POLICY "Users can upload files to their own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'nda-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can read their own files
CREATE POLICY "Users can read their own files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'nda-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own files
CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'nda-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'nda-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Grant necessary permissions
GRANT ALL ON SCHEMA storage TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA storage TO authenticated, anon;

-- 4. Set up storage function helpers (optional but useful)
CREATE OR REPLACE FUNCTION get_user_file_path(user_id uuid, file_name text)
RETURNS text AS $$
BEGIN
  RETURN user_id::text || '/' || file_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create a view for user files (useful for debugging)
CREATE OR REPLACE VIEW user_files AS
SELECT
  o.name,
  o.created_at,
  o.updated_at,
  o.id,
  o.bucket_id,
  o.user_id,
  (storage.foldername(o.name))[1] as folder_user_id,
  (storage.filename(o.name))[1] as filename,
  o.metadata
FROM storage.objects o
WHERE o.bucket_id = 'nda-files';

GRANT SELECT ON user_files TO authenticated;