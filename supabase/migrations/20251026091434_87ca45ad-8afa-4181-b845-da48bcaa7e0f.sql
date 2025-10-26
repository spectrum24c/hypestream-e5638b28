-- Migrate profiles table to support multiple profiles per user
-- 1. Create a new profiles table with proper structure
CREATE TABLE IF NOT EXISTS public.profiles_new (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username text,
  avatar_url text,
  pin_enabled boolean DEFAULT false,
  pin_hash text,
  selected_theme text DEFAULT 'default',
  language text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 2. Migrate existing data
INSERT INTO public.profiles_new (id, user_id, username, avatar_url, pin_enabled, pin_hash, selected_theme, language, created_at)
SELECT id, id as user_id, username, avatar_url, pin_enabled, pin_hash, selected_theme, language, created_at
FROM public.profiles;

-- 3. Drop old table and rename new one
DROP TABLE public.profiles;
ALTER TABLE public.profiles_new RENAME TO profiles;

-- 4. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- 5. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 6. Update RLS policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profiles"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profiles"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profiles"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profiles"
ON public.profiles
FOR DELETE
USING (auth.uid() = user_id);

-- 7. Update the trigger function to create a default profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', 'Profile 1'));
  RETURN NEW;
END;
$$;