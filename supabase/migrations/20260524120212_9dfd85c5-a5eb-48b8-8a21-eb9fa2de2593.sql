
-- ============================================
-- 1. push_subscriptions
-- ============================================
CREATE TABLE public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('web','android','ios')),
  endpoint TEXT,
  p256dh TEXT,
  auth TEXT,
  device_token TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX push_subscriptions_web_unique
  ON public.push_subscriptions (user_id, endpoint)
  WHERE endpoint IS NOT NULL;

CREATE UNIQUE INDEX push_subscriptions_native_unique
  ON public.push_subscriptions (user_id, device_token)
  WHERE device_token IS NOT NULL;

CREATE INDEX push_subscriptions_user_idx ON public.push_subscriptions(user_id);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own push subscriptions"
  ON public.push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own push subscriptions"
  ON public.push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own push subscriptions"
  ON public.push_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own push subscriptions"
  ON public.push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 2. notification_preferences
-- ============================================
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  new_releases_enabled BOOLEAN NOT NULL DEFAULT true,
  new_releases_per_day INTEGER NOT NULL DEFAULT 1 CHECK (new_releases_per_day BETWEEN 0 AND 5),
  recommendations_enabled BOOLEAN NOT NULL DEFAULT true,
  recommendations_per_week INTEGER NOT NULL DEFAULT 1 CHECK (recommendations_per_week BETWEEN 0 AND 7),
  preferred_day_of_week INTEGER NOT NULL DEFAULT 0 CHECK (preferred_day_of_week BETWEEN 0 AND 6),
  quiet_hours_start INTEGER NOT NULL DEFAULT 22 CHECK (quiet_hours_start BETWEEN 0 AND 23),
  quiet_hours_end INTEGER NOT NULL DEFAULT 8 CHECK (quiet_hours_end BETWEEN 0 AND 23),
  preferred_genres INTEGER[] NOT NULL DEFAULT '{}',
  min_match_score INTEGER NOT NULL DEFAULT 2 CHECK (min_match_score BETWEEN 1 AND 5),
  timezone TEXT NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notification preferences"
  ON public.notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences"
  ON public.notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences"
  ON public.notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 3. notifications_log
-- ============================================
CREATE TABLE public.notifications_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('new_release','recommendation','system')),
  movie_id TEXT,
  title TEXT NOT NULL,
  body TEXT,
  poster_path TEXT,
  payload JSONB,
  delivered_via TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  clicked_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX notifications_log_dedupe
  ON public.notifications_log (user_id, kind, movie_id)
  WHERE movie_id IS NOT NULL;

CREATE INDEX notifications_log_user_sent_idx
  ON public.notifications_log (user_id, sent_at DESC);

ALTER TABLE public.notifications_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications log"
  ON public.notifications_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications log"
  ON public.notifications_log FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications log"
  ON public.notifications_log FOR DELETE
  USING (auth.uid() = user_id);
-- INSERT is intentionally restricted to service role (edge functions)
