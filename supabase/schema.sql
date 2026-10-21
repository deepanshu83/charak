-- ============================================================================
-- Charak Ayurveda Hospital - Complete PostgreSQL Database Schema & Storage
-- Reproducible Supabase SQL Schema (Source of Truth)
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 1. DOCTORS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  designation TEXT,
  specialization TEXT NOT NULL,
  qualification TEXT NOT NULL DEFAULT 'BAMS',
  experience TEXT NOT NULL DEFAULT '10 years',
  bio TEXT,
  detailed_bio TEXT,
  image TEXT NOT NULL DEFAULT '',
  storage_path TEXT,
  consultation_fee NUMERIC(10, 2) NOT NULL DEFAULT 1200,
  display_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure all columns exist if table was previously created
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS designation TEXT;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS detailed_bio TEXT;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS consultation_fee NUMERIC(10, 2) NOT NULL DEFAULT 500;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS treatment_ids TEXT[] DEFAULT '{}';

DROP TRIGGER IF EXISTS tr_doctors_updated_at ON public.doctors;
CREATE TRIGGER tr_doctors_updated_at
  BEFORE UPDATE ON public.doctors
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 2. DOCTOR AVAILABILITY TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.doctor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration INTEGER NOT NULL DEFAULT 30 CHECK (slot_duration > 0),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 3. TREATMENTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  description TEXT NOT NULL,
  duration TEXT NOT NULL DEFAULT '45 min',
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  image TEXT,
  storage_path TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure storage_path exists
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS storage_path TEXT;

DROP TRIGGER IF EXISTS tr_treatments_updated_at ON public.treatments;
CREATE TRIGGER tr_treatments_updated_at
  BEFORE UPDATE ON public.treatments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 4. PRODUCTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  category TEXT NOT NULL CHECK (category IN ('Herbal Formulation', 'Therapeutic Oil', 'Wellness', 'Care')),
  image TEXT DEFAULT '',
  images TEXT[] DEFAULT '{}'::TEXT[],
  storage_paths TEXT[] DEFAULT '{}'::TEXT[],
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure image columns exist if products table was created in an earlier migration
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image TEXT DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}'::TEXT[];
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS storage_paths TEXT[] DEFAULT '{}'::TEXT[];

DROP TRIGGER IF EXISTS tr_products_updated_at ON public.products;
CREATE TRIGGER tr_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 4B. PRODUCT IMAGES TABLE (3 images maximum per product)
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 5. ORDERS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
  payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'MOCK_PAID', 'PAID', 'CANCELLED', 'FAILED', 'REFUNDED')),
  order_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (order_status IN ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS tr_orders_updated_at ON public.orders;
CREATE TRIGGER tr_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 6. ORDER ITEMS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_at_purchase NUMERIC(10, 2) NOT NULL CHECK (price_at_purchase >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 7. APPOINTMENTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE RESTRICT,
  treatment_id UUID NOT NULL REFERENCES public.treatments(id) ON DELETE RESTRICT,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
  payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'MOCK_PAID', 'PAID', 'CANCELLED')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS tr_appointments_updated_at ON public.appointments;
CREATE TRIGGER tr_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 8. PATIENT STORIES TABLE (Text/Image Testimonials)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.patient_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT NOT NULL,
  location TEXT DEFAULT 'Pilani',
  treatment TEXT NOT NULL,
  story TEXT NOT NULL,
  image TEXT,
  storage_path TEXT,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  published BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.patient_stories ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Pilani';
ALTER TABLE public.patient_stories ADD COLUMN IF NOT EXISTS storage_path TEXT;
ALTER TABLE public.patient_stories ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.patient_stories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS tr_patient_stories_updated_at ON public.patient_stories;
CREATE TRIGGER tr_patient_stories_updated_at
  BEFORE UPDATE ON public.patient_stories
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 9. GALLERY TABLE (Hospital Imagery - Max 50 Images)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  caption TEXT,
  image TEXT NOT NULL,
  storage_path TEXT,
  file_size INTEGER,
  category TEXT NOT NULL CHECK (category IN ('therapy', 'clinic', 'herbs')),
  published BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS caption TEXT;
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS storage_path TEXT;
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS file_size INTEGER;
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS tr_gallery_updated_at ON public.gallery;
CREATE TRIGGER tr_gallery_updated_at
  BEFORE UPDATE ON public.gallery
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 10. VIDEO TESTIMONIALS TABLE (Max 10 Videos)
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 11. ADMIN ROLES & AUTHORIZATION
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin')),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_admins_user_id UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_admins_lookup ON public.admins(user_id, role, active);

DROP TRIGGER IF EXISTS tr_admins_updated_at ON public.admins;
CREATE TRIGGER tr_admins_updated_at
  BEFORE UPDATE ON public.admins
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Helper function to verify admin privileges
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins
    WHERE user_id = auth.uid()
      AND role = 'admin'
      AND active = true
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 12. PERFORMANCE INDEXES
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_doctors_active ON public.doctors(active);
CREATE INDEX IF NOT EXISTS idx_doctors_active_order ON public.doctors(active, display_order);
CREATE INDEX IF NOT EXISTS idx_doctors_slug ON public.doctors(slug);

CREATE INDEX IF NOT EXISTS idx_doctor_availability_lookup
  ON public.doctor_availability(doctor_id, day_of_week, active);

CREATE INDEX IF NOT EXISTS idx_treatments_active ON public.treatments(active);

CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(active);
CREATE INDEX IF NOT EXISTS idx_products_active_category ON public.products(active, category);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(email, phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date
  ON public.appointments(doctor_id, appointment_date, start_time);

CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_no_double_booking
  ON public.appointments (doctor_id, appointment_date, start_time)
  WHERE status IN ('PENDING', 'CONFIRMED');

CREATE INDEX IF NOT EXISTS idx_gallery_published_order ON public.gallery(published, display_order);
CREATE INDEX IF NOT EXISTS idx_patient_stories_published_order ON public.patient_stories(published, display_order);
CREATE INDEX IF NOT EXISTS idx_video_testimonials_published ON public.video_testimonials(published, display_order);

-- ----------------------------------------------------------------------------
-- 13. CONSTRAINTS & LIMIT TRIGGERS
-- ----------------------------------------------------------------------------
-- Maximum 3 images per product (enforced on product_images table)
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

-- Maximum 3 images constraint on products images array
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS check_product_images_max_3;
ALTER TABLE public.products
  ADD CONSTRAINT check_product_images_max_3
  CHECK (images IS NULL OR cardinality(images) <= 3);

-- Maximum 20 active products
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

-- Maximum 50 gallery images
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

-- Maximum 10 video testimonials
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

-- ----------------------------------------------------------------------------
-- 14. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Public READ policies
DROP POLICY IF EXISTS "Public can view active doctors" ON public.doctors;
CREATE POLICY "Public can view active doctors"
  ON public.doctors FOR SELECT
  TO anon, authenticated
  USING (active = true);

DROP POLICY IF EXISTS "Public can view active doctor availability" ON public.doctor_availability;
CREATE POLICY "Public can view active doctor availability"
  ON public.doctor_availability FOR SELECT
  TO anon, authenticated
  USING (active = true);

DROP POLICY IF EXISTS "Public can view active treatments" ON public.treatments;
CREATE POLICY "Public can view active treatments"
  ON public.treatments FOR SELECT
  TO anon, authenticated
  USING (active = true);

DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products"
  ON public.products FOR SELECT
  TO anon, authenticated
  USING (active = true);

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

DROP POLICY IF EXISTS "Public can view published patient stories" ON public.patient_stories;
CREATE POLICY "Public can view published patient stories"
  ON public.patient_stories FOR SELECT
  TO anon, authenticated
  USING (published = true);

DROP POLICY IF EXISTS "Public can view published gallery items" ON public.gallery;
CREATE POLICY "Public can view published gallery items"
  ON public.gallery FOR SELECT
  TO anon, authenticated
  USING (published = true);

DROP POLICY IF EXISTS "Public can view published video testimonials" ON public.video_testimonials;
CREATE POLICY "Public can view published video testimonials"
  ON public.video_testimonials FOR SELECT
  TO anon, authenticated
  USING (published = true);

-- Admin CRUD Policies
DROP POLICY IF EXISTS "Admins can view their own record" ON public.admins;
CREATE POLICY "Admins can view their own record"
  ON public.admins FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins have full access to doctors" ON public.doctors;
CREATE POLICY "Admins have full access to doctors"
  ON public.doctors FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to doctor availability" ON public.doctor_availability;
CREATE POLICY "Admins have full access to doctor availability"
  ON public.doctor_availability FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to treatments" ON public.treatments;
CREATE POLICY "Admins have full access to treatments"
  ON public.treatments FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to products" ON public.products;
CREATE POLICY "Admins have full access to products"
  ON public.products FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to product_images" ON public.product_images;
CREATE POLICY "Admins have full access to product_images"
  ON public.product_images FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to orders" ON public.orders;
CREATE POLICY "Admins have full access to orders"
  ON public.orders FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to order items" ON public.order_items;
CREATE POLICY "Admins have full access to order items"
  ON public.order_items FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to appointments" ON public.appointments;
CREATE POLICY "Admins have full access to appointments"
  ON public.appointments FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to patient stories" ON public.patient_stories;
CREATE POLICY "Admins have full access to patient stories"
  ON public.patient_stories FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to gallery" ON public.gallery;
CREATE POLICY "Admins have full access to gallery"
  ON public.gallery FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to video testimonials" ON public.video_testimonials;
CREATE POLICY "Admins have full access to video testimonials"
  ON public.video_testimonials FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 15. STORAGE BUCKETS & STORAGE POLICIES
-- ----------------------------------------------------------------------------
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

-- Storage RLS Policies
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

-- ----------------------------------------------------------------------------
-- 16. DATA API ACCESS GRANTS
-- ----------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
