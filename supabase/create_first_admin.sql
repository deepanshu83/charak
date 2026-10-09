-- ============================================================================
-- CHARAK AYURVEDA — FIRST ADMIN INITIALIZATION SCRIPT
-- ============================================================================
-- NOTE: Never commit or hardcode passwords in this file or any source file.
--
-- INSTRUCTIONS TO SETUP THE FIRST ADMIN USER:
-- 1. Open the Supabase Dashboard: https://supabase.com/dashboard/project/wwofiwaoydmbglccegxf
-- 2. Navigate to: Authentication -> Users
-- 3. Click "Add user" -> "Create user"
--    - Email: (e.g. admin@charakayurvedapilani.com or your official hospital email)
--    - Password: (enter a strong password of at least 12 characters)
--    - Auto-confirm user: CHECKED (Yes)
-- 4. Copy the UUID generated for this newly created auth user.
-- 5. In the Supabase SQL Editor, run the script below replacing:
--    - '<ADMIN_USER_UUID>' with the copied UUID
--    - '<ADMIN_EMAIL>' with the email entered in step 3
-- ============================================================================

DO $$
DECLARE
  v_admin_uuid UUID := '00000000-0000-0000-0000-000000000000'::UUID; -- <-- REPLACE WITH AUTH USER UUID
  v_admin_email TEXT := 'admin@charakayurvedapilani.com';            -- <-- REPLACE WITH AUTH USER EMAIL
BEGIN
  -- Verify the auth user actually exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_admin_uuid) THEN
    RAISE EXCEPTION 'User UUID % does not exist in auth.users. Please create the user in Supabase Auth first.', v_admin_uuid;
  END IF;

  -- 1. Assign admin role in public.admins
  INSERT INTO public.admins (user_id, email, role, active)
  VALUES (v_admin_uuid, v_admin_email, 'admin', true)
  ON CONFLICT (user_id) DO UPDATE
  SET email = EXCLUDED.email,
      role = 'admin',
      active = true,
      updated_at = now();

  -- 2. Add app_metadata role for JWT claims
  UPDATE auth.users
  SET raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
  WHERE id = v_admin_uuid;

  RAISE NOTICE 'Admin user % (%) successfully configured as active administrator.', v_admin_email, v_admin_uuid;
END $$;
