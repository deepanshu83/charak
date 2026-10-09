-- ============================================================================
-- Content CMS & Media Management Migration
-- Tables: video_testimonials, schema enhancements for gallery, doctors, blogs, patient_stories
-- Storage: hospital-images, hospital-videos buckets & RLS
-- ============================================================================

-- 1. VIDEO TESTIMONIALS TABLE
CREATE TABLE IF NOT EXISTS public.video_testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  storage_path TEXT,
  thumbnail_url TEXT,
  thumbnail_storage_path TEXT,
  file_size INTEGER,
  duration INTEGER,
  published BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS tr_video_testimonials_updated_at ON public.video_testimonials;
CREATE TRIGGER tr_video_testimonials_updated_at
  BEFORE UPDATE ON public.video_testimonials
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 2. ENHANCE GALLERY TABLE
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS storage_path TEXT;
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS caption TEXT;
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS file_size INTEGER;
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS tr_gallery_updated_at ON public.gallery;
CREATE TRIGGER tr_gallery_updated_at
  BEFORE UPDATE ON public.gallery
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 3. ENHANCE BLOGS TABLE
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'Ayurvedic Care';
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS author TEXT NOT NULL DEFAULT 'Charak Medical Team';
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS read_time TEXT DEFAULT '4 min read';
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- 4. ENHANCE DOCTORS TABLE
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS designation TEXT;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS detailed_bio TEXT;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS storage_path TEXT;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS consultation_fee NUMERIC(10, 2) NOT NULL DEFAULT 1200;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;

-- 5. ENHANCE PATIENT STORIES TABLE
ALTER TABLE public.patient_stories ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Pilani';
ALTER TABLE public.patient_stories ADD COLUMN IF NOT EXISTS storage_path TEXT;
ALTER TABLE public.patient_stories ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.patient_stories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS tr_patient_stories_updated_at ON public.patient_stories;
CREATE TRIGGER tr_patient_stories_updated_at
  BEFORE UPDATE ON public.patient_stories
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 6. INDEXES
CREATE INDEX IF NOT EXISTS idx_video_testimonials_published ON public.video_testimonials(published, display_order);
CREATE INDEX IF NOT EXISTS idx_gallery_published_order ON public.gallery(published, display_order);
CREATE INDEX IF NOT EXISTS idx_doctors_active_order ON public.doctors(active, display_order);
CREATE INDEX IF NOT EXISTS idx_doctors_slug ON public.doctors(slug);
CREATE INDEX IF NOT EXISTS idx_patient_stories_published_order ON public.patient_stories(published, display_order);

-- 7. ROW LEVEL SECURITY (RLS) FOR VIDEO TESTIMONIALS
ALTER TABLE public.video_testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published video testimonials" ON public.video_testimonials;
CREATE POLICY "Public can view published video testimonials"
  ON public.video_testimonials FOR SELECT
  TO anon, authenticated
  USING (published = true);

DROP POLICY IF EXISTS "Admins have full access to video testimonials" ON public.video_testimonials;
CREATE POLICY "Admins have full access to video testimonials"
  ON public.video_testimonials FOR ALL
  TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 8. STORAGE BUCKETS (Executed safely if storage schema exists)
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
