-- Update admin role to correct email address
DO $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Find the user ID for the correct email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = 'awokojorichmond@gmail.com'
  LIMIT 1;

  -- If user exists, grant admin role
  IF target_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;