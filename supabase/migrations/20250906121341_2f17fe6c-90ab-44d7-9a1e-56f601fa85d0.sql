-- Remove the unique constraint on user_id to allow multiple profiles per user
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_key;

-- Add a check constraint to limit profiles to maximum 6 per user
-- We'll use a trigger instead of a check constraint for better flexibility
CREATE OR REPLACE FUNCTION check_profile_limit()
RETURNS TRIGGER AS $$
DECLARE
    profile_count INTEGER;
BEGIN
    -- Count existing profiles for this user
    SELECT COUNT(*) INTO profile_count 
    FROM public.profiles 
    WHERE user_id = NEW.user_id;
    
    -- Check if adding this profile would exceed the limit
    IF profile_count >= 6 THEN
        RAISE EXCEPTION 'Maximum of 6 profiles allowed per user';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to enforce profile limit on insert
DROP TRIGGER IF EXISTS enforce_profile_limit ON public.profiles;
CREATE TRIGGER enforce_profile_limit
    BEFORE INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION check_profile_limit();