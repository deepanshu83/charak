-- ============================================================================
-- Migration: Admin Roles and Row Level Security Protection
-- ============================================================================

-- 1. Create Admins Table
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

-- Index for fast lookup by user_id, role and active state
CREATE INDEX IF NOT EXISTS idx_admins_lookup ON public.admins(user_id, role, active);

-- Updated at trigger
DROP TRIGGER IF EXISTS tr_admins_updated_at ON public.admins;
CREATE TRIGGER tr_admins_updated_at
  BEFORE UPDATE ON public.admins
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 2. Security Function to verify if caller is an active admin
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

-- 3. Row Level Security on public.admins
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view their own record" ON public.admins;
CREATE POLICY "Admins can view their own record"
  ON public.admins FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. Admin Management Policies on All Tables
-- Products
DROP POLICY IF EXISTS "Admins have full access to products" ON public.products;
CREATE POLICY "Admins have full access to products"
  ON public.products FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Doctors
DROP POLICY IF EXISTS "Admins have full access to doctors" ON public.doctors;
CREATE POLICY "Admins have full access to doctors"
  ON public.doctors FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Doctor Availability
DROP POLICY IF EXISTS "Admins have full access to doctor availability" ON public.doctor_availability;
CREATE POLICY "Admins have full access to doctor availability"
  ON public.doctor_availability FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Treatments
DROP POLICY IF EXISTS "Admins have full access to treatments" ON public.treatments;
CREATE POLICY "Admins have full access to treatments"
  ON public.treatments FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Blogs
DROP POLICY IF EXISTS "Admins have full access to blogs" ON public.blogs;
CREATE POLICY "Admins have full access to blogs"
  ON public.blogs FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Patient Stories
DROP POLICY IF EXISTS "Admins have full access to patient stories" ON public.patient_stories;
CREATE POLICY "Admins have full access to patient stories"
  ON public.patient_stories FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Gallery
DROP POLICY IF EXISTS "Admins have full access to gallery" ON public.gallery;
CREATE POLICY "Admins have full access to gallery"
  ON public.gallery FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Orders (Sensitive: Only admins can view, update or delete orders directly)
DROP POLICY IF EXISTS "Admins have full access to orders" ON public.orders;
CREATE POLICY "Admins have full access to orders"
  ON public.orders FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Order Items (Sensitive)
DROP POLICY IF EXISTS "Admins have full access to order items" ON public.order_items;
CREATE POLICY "Admins have full access to order items"
  ON public.order_items FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Appointments (Sensitive: Only admins can view, update or delete appointments)
DROP POLICY IF EXISTS "Admins have full access to appointments" ON public.appointments;
CREATE POLICY "Admins have full access to appointments"
  ON public.appointments FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
