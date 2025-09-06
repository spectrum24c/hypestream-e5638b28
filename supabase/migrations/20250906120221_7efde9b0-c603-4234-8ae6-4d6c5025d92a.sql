-- Add profile_id column to favorites table to link favorites to specific profiles
ALTER TABLE public.favorites ADD COLUMN profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX idx_favorites_profile_id ON public.favorites(profile_id);

-- Update RLS policies for favorites to use profile_id instead of user_id
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can add to their favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can remove from their favorites" ON public.favorites;

-- Create new RLS policies that check if the profile belongs to the authenticated user
CREATE POLICY "Users can view favorites from their profiles"
ON public.favorites
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = favorites.profile_id
    AND profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can add favorites to their profiles"
ON public.favorites
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = favorites.profile_id
    AND profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can remove favorites from their profiles"
ON public.favorites
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = favorites.profile_id
    AND profiles.user_id = auth.uid()
  )
);

-- Create a function to get the default profile for a user (oldest profile)
CREATE OR REPLACE FUNCTION public.get_default_profile_id(user_uuid UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles
  WHERE user_id = user_uuid
  ORDER BY created_at ASC
  LIMIT 1;
$$;