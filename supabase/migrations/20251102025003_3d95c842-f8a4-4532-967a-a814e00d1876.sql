-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create chatbot settings table
CREATE TABLE public.chatbot_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  personality_level INTEGER NOT NULL DEFAULT 3 CHECK (personality_level >= 1 AND personality_level <= 5),
  theme TEXT NOT NULL DEFAULT 'default',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.chatbot_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own chatbot settings"
ON public.chatbot_settings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chatbot settings"
ON public.chatbot_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chatbot settings"
ON public.chatbot_settings
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_chatbot_settings_updated_at
BEFORE UPDATE ON public.chatbot_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();