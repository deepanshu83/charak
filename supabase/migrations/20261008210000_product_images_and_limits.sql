-- ============================================================================
-- Product Multiple Images & Storage Paths + Treatment Storage Path & Limit Constraints
-- ============================================================================

-- 1. Enhance products table with images array and storage_paths array (max 3 images)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}'::TEXT[];
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS storage_paths TEXT[] DEFAULT '{}'::TEXT[];

-- 2. Enhance treatments table with storage_path for image cleanup
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- 3. Populate existing products' images array with primary image if empty
UPDATE public.products
SET images = ARRAY[image]
WHERE (images IS NULL OR cardinality(images) = 0) AND image IS NOT NULL AND image != '';

-- 4. Enforce 3 images maximum per product at database level
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS check_product_images_max_3;
ALTER TABLE public.products
  ADD CONSTRAINT check_product_images_max_3
  CHECK (images IS NULL OR cardinality(images) <= 3);

-- 5. Enforce 20 active products maximum at database level
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

-- 6. Enforce 50 gallery images maximum at database level
CREATE OR REPLACE FUNCTION public.check_max_gallery_images()
RETURNS TRIGGER AS $$
DECLARE
  gallery_count INT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT count(*) INTO gallery_count FROM public.gallery;
    IF gallery_count >= 50 THEN
      RAISE EXCEPTION 'Limit reached: Maximum 50 gallery images allowed.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_check_max_gallery_images ON public.gallery;
CREATE TRIGGER tr_check_max_gallery_images
  BEFORE INSERT ON public.gallery
  FOR EACH ROW
  EXECUTE FUNCTION public.check_max_gallery_images();

-- 7. Enforce 10 video testimonials maximum at database level
CREATE OR REPLACE FUNCTION public.check_max_video_testimonials()
RETURNS TRIGGER AS $$
DECLARE
  video_count INT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT count(*) INTO video_count FROM public.video_testimonials;
    IF video_count >= 10 THEN
      RAISE EXCEPTION 'Limit reached: Maximum 10 video testimonials allowed.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_check_max_video_testimonials ON public.video_testimonials;
CREATE TRIGGER tr_check_max_video_testimonials
  BEFORE INSERT ON public.video_testimonials
  FOR EACH ROW
  EXECUTE FUNCTION public.check_max_video_testimonials();
