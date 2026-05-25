
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove any previous schedule with this name
DO $$
BEGIN
  PERFORM cron.unschedule('hypestream-smart-notify-hourly');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'hypestream-smart-notify-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://csbytipwverpjxojulla.supabase.co/functions/v1/smart-notify',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzYnl0aXB3dmVycGp4b2p1bGxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5Njk0NDIsImV4cCI6MjA1OTU0NTQ0Mn0.s3Nv-guhUB4ZYjzhgx_rNwbJLbtjCurZmo67nUi9UTA"}'::jsonb,
    body := '{"source":"cron"}'::jsonb
  );
  $$
);
