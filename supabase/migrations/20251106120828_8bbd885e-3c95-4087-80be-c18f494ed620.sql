-- Create admin_settings table to store Zapier webhook and other admin configurations
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  zapier_webhook_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view admin settings
CREATE POLICY "Admins can view admin settings"
  ON public.admin_settings
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert admin settings
CREATE POLICY "Admins can insert admin settings"
  ON public.admin_settings
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update admin settings
CREATE POLICY "Admins can update admin settings"
  ON public.admin_settings
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_admin_settings_updated_at
  BEFORE UPDATE ON public.admin_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();