-- ====================================================================
-- SPECIFIC STORAGE BUCKET & POLICIES SETUP FOR "media-assets", "cms-images", "product-images"
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)
-- ====================================================================

-- 1. ENABLE UUID EXTENSION
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE BUCKETS IN STORAGE.BUCKETS TABLE
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('media-assets', 'media-assets', true, 20971520, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif', 'image/svg+xml']),
    ('cms-images', 'cms-images', true, 20971520, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif', 'image/svg+xml']),
    ('product-images', 'product-images', true, 20971520, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif', 'image/svg+xml'])
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. ENABLE ROW LEVEL SECURITY ON STORAGE.OBJECTS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 4. POLICIES SPECIFICALLY FOR "media-assets"
DROP POLICY IF EXISTS "Media Assets Public Select" ON storage.objects;
CREATE POLICY "Media Assets Public Select" ON storage.objects
    FOR SELECT TO public USING (bucket_id = 'media-assets');

DROP POLICY IF EXISTS "Media Assets Public Insert" ON storage.objects;
CREATE POLICY "Media Assets Public Insert" ON storage.objects
    FOR INSERT TO public WITH CHECK (bucket_id = 'media-assets');

DROP POLICY IF EXISTS "Media Assets Public Update" ON storage.objects;
CREATE POLICY "Media Assets Public Update" ON storage.objects
    FOR UPDATE TO public USING (bucket_id = 'media-assets');

DROP POLICY IF EXISTS "Media Assets Public Delete" ON storage.objects;
CREATE POLICY "Media Assets Public Delete" ON storage.objects
    FOR DELETE TO public USING (bucket_id = 'media-assets');

-- 5. POLICIES SPECIFICALLY FOR "cms-images"
DROP POLICY IF EXISTS "CMS Images Public Select" ON storage.objects;
CREATE POLICY "CMS Images Public Select" ON storage.objects
    FOR SELECT TO public USING (bucket_id = 'cms-images');

DROP POLICY IF EXISTS "CMS Images Public Insert" ON storage.objects;
CREATE POLICY "CMS Images Public Insert" ON storage.objects
    FOR INSERT TO public WITH CHECK (bucket_id = 'cms-images');

DROP POLICY IF EXISTS "CMS Images Public Update" ON storage.objects;
CREATE POLICY "CMS Images Public Update" ON storage.objects
    FOR UPDATE TO public USING (bucket_id = 'cms-images');

DROP POLICY IF EXISTS "CMS Images Public Delete" ON storage.objects;
CREATE POLICY "CMS Images Public Delete" ON storage.objects
    FOR DELETE TO public USING (bucket_id = 'cms-images');

-- 6. POLICIES SPECIFICALLY FOR "product-images"
DROP POLICY IF EXISTS "Product Images Public Select" ON storage.objects;
CREATE POLICY "Product Images Public Select" ON storage.objects
    FOR SELECT TO public USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Product Images Public Insert" ON storage.objects;
CREATE POLICY "Product Images Public Insert" ON storage.objects
    FOR INSERT TO public WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Product Images Public Update" ON storage.objects;
CREATE POLICY "Product Images Public Update" ON storage.objects
    FOR UPDATE TO public USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Product Images Public Delete" ON storage.objects;
CREATE POLICY "Product Images Public Delete" ON storage.objects
    FOR DELETE TO public USING (bucket_id = 'product-images');
