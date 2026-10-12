-- Migration 006: Exhibition Management, Visibility Toggling, and Cover Image Storage
-- Platform: BoothHub (بوث هب)

-- 1. Ensure cover_image_url exists
ALTER TABLE public.exhibitions 
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- 2. Update status constraint to permit 'hidden'
DO $$
BEGIN
  -- Drop constraint if exists
  ALTER TABLE public.exhibitions DROP CONSTRAINT IF EXISTS exhibitions_status_check;
  
  -- Add updated check constraint including 'hidden'
  ALTER TABLE public.exhibitions 
    ADD CONSTRAINT exhibitions_status_check 
    CHECK (status IN ('draft', 'published', 'hidden', 'cancelled', 'completed'));
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Constraint update handled or not applicable: %', SQLERRM;
END $$;

-- 3. Storage bucket configuration for exhibitions cover images
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
    -- Create bucket if not exists
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'exhibitions',
      'exhibitions',
      true,
      5242880, -- 5MB limit
      ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    )
    ON CONFLICT (id) DO UPDATE SET
      public = true,
      file_size_limit = 5242880,
      allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

    -- Public Read policy
    DROP POLICY IF EXISTS "Public can view exhibition covers" ON storage.objects;
    CREATE POLICY "Public can view exhibition covers"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'exhibitions');

    -- Authenticated Insert policy
    DROP POLICY IF EXISTS "Organizers can upload exhibition covers" ON storage.objects;
    CREATE POLICY "Organizers can upload exhibition covers"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'exhibitions');

    -- Authenticated Update policy
    DROP POLICY IF EXISTS "Organizers can update exhibition covers" ON storage.objects;
    CREATE POLICY "Organizers can update exhibition covers"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (bucket_id = 'exhibitions');
  END IF;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Storage bucket configuration notice: %', SQLERRM;
END $$;
