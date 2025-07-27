-- Fix search path for security
ALTER FUNCTION public.handle_new_user() SET search_path = 'public';