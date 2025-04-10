
-- Create a function to conditionally create the newsletter_subscribers table if it doesn't exist
CREATE OR REPLACE FUNCTION create_newsletter_subscribers_if_not_exists()
RETURNS void AS $$
BEGIN
  -- Check if the table already exists
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'newsletter_subscribers'
  ) THEN
    -- Create the table
    CREATE TABLE public.newsletter_subscribers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT NOT NULL UNIQUE,
      admin_email TEXT,
      user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Add RLS policies
    ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
    
    -- Allow admins to see all subscribers
    CREATE POLICY "Admins can see all newsletter subscribers" 
      ON public.newsletter_subscribers FOR SELECT 
      USING (auth.role() = 'service_role' OR auth.role() = 'supabase_admin');
    
    -- Allow users to see their own subscriptions
    CREATE POLICY "Users can see their own newsletter subscriptions" 
      ON public.newsletter_subscribers FOR SELECT 
      USING (auth.uid() = user_id);
    
    -- Allow the service to insert new subscribers
    CREATE POLICY "Service can insert newsletter subscribers" 
      ON public.newsletter_subscribers FOR INSERT 
      WITH CHECK (true);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_newsletter_subscribers_if_not_exists() TO authenticated;
GRANT EXECUTE ON FUNCTION create_newsletter_subscribers_if_not_exists() TO anon;
GRANT EXECUTE ON FUNCTION create_newsletter_subscribers_if_not_exists() TO service_role;

-- Execute the function to ensure the table exists
SELECT create_newsletter_subscribers_if_not_exists();
