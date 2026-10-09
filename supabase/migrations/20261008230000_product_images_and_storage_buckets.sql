-- ============================================================================
-- Migration: 20261008230000_product_images_and_storage_buckets.sql
-- Description: Creates product_images table, ensures product image columns,
--              enforces limits (max 20 active products, max 3 images),
--              and sets up hospital-images and hospital-videos storage buckets & policies.
-- ============================================================================

-- 1. Ensure products columns exist
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image TEXT DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}'::TEXT[];
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS storage_paths TEXT[] DEFAULT '{}'::TEXT[];

-- 2. Create product_images table
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  image_url TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  mime_type TEXT DEFAULT 'image/webp',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_order ON public.product_images(product_id, display_order);

-- 3. Trigger for max 3 images per product
CREATE OR REPLACE FUNCTION public.check_max_product_images()
RETURNS TRIGGER AS $$
DECLARE
  img_count INT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT count(*) INTO img_count
    FROM public.product_images
    WHERE product_id = NEW.product_id;

    IF img_count >= 3 THEN
      RAISE EXCEPTION 'Limit reached: Maximum 3 images allowed per product.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_check_max_product_images ON public.product_images;
CREATE TRIGGER tr_check_max_product_images
  BEFORE INSERT ON public.product_images
  FOR EACH ROW
  EXECUTE FUNCTION public.check_max_product_images();

-- 4. Constraint on products images array
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS check_product_images_max_3;
ALTER TABLE public.products
  ADD CONSTRAINT check_product_images_max_3
  CHECK (images IS NULL OR cardinality(images) <= 3);

-- 5. Trigger for max 20 active products
CREATE OR REPLACE FUNCTION public.check_max_active_products()
RETURNS TRIGGER AS $$
DECLARE
  active_count INT;
BEGIN
  IF NEW.active = true AND (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND (OLD.active IS NULL OR OLD.active = false))) THEN
    SELECT count(*) INTO active_count FROM public.products WHERE active = true;
    IF active_count >= 20 THEN
      RAISE EXCEPTION 'Limit reached: Maximum 20 active products allowed.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_check_max_active_products ON public.products;
CREATE TRIGGER tr_check_max_active_products
  BEFORE INSERT OR UPDATE OF active ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.check_max_active_products();

-- 6. Enable RLS on product_images
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view images of active products" ON public.product_images;
CREATE POLICY "Public can view images of active products"
  ON public.product_images FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_images.product_id AND p.active = true
    )
  );

DROP POLICY IF EXISTS "Admins have full access to product_images" ON public.product_images;
CREATE POLICY "Admins have full access to product_images"
  ON public.product_images FOR ALL
  TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 7. Configure storage buckets
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES 
      ('hospital-images', 'hospital-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']),
      ('hospital-videos', 'hospital-videos', true, 10485760, ARRAY['video/mp4', 'video/webm'])
    ON CONFLICT (id) DO UPDATE SET
      public = true,
      file_size_limit = 10485760;
  END IF;
END $$;

-- 8. Storage RLS Policies
DROP POLICY IF EXISTS "Public can view hospital media" ON storage.objects;
CREATE POLICY "Public can view hospital media"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id IN ('hospital-images', 'hospital-videos'));

DROP POLICY IF EXISTS "Admins can upload hospital media" ON storage.objects;
CREATE POLICY "Admins can upload hospital media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id IN ('hospital-images', 'hospital-videos')
    AND public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can update hospital media" ON storage.objects;
CREATE POLICY "Admins can update hospital media"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id IN ('hospital-images', 'hospital-videos')
    AND public.is_admin()
  )
  WITH CHECK (
    bucket_id IN ('hospital-images', 'hospital-videos')
    AND public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can delete hospital media" ON storage.objects;
CREATE POLICY "Admins can delete hospital media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id IN ('hospital-images', 'hospital-videos')
    AND public.is_admin()
  );

-- 9. Permissions
GRANT SELECT ON public.product_images TO anon, authenticated;
GRANT ALL ON public.product_images TO authenticated, service_role;
