-- Drop existing storage policies for avatars bucket if they exist
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Create new storage policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars'::text);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING ((bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1]));

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING ((bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1]));

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK ((bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1]));