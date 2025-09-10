-- Add unique constraint to prevent duplicate usernames for the same user
ALTER TABLE public.profiles 
ADD CONSTRAINT unique_user_username 
UNIQUE (user_id, username);