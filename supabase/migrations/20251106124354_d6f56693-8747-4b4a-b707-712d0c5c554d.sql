-- Grant admin role to the specified email
DO $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Find the user ID for the specified email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = 'awokojorichmond@gmail.ccom'
  LIMIT 1;

  -- If user exists, grant admin role
  IF target_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;