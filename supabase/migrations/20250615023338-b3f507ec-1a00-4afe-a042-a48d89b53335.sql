
-- Add a language field to the profiles table to store user language preference.
ALTER TABLE public.profiles 
ADD COLUMN language text;

-- Optionally set a default value (uncomment if you like)
-- ALTER TABLE public.profiles ALTER COLUMN language SET DEFAULT 'en';
