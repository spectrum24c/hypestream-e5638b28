-- Create watchlist table for user-specific watchlist items
CREATE TABLE IF NOT EXISTS public.watchlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id TEXT NOT NULL,
  title TEXT NOT NULL,
  poster_path TEXT,
  added_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  media_type TEXT NOT NULL DEFAULT 'movie'
);

ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their watchlist"
ON public.watchlist
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their watchlist"
ON public.watchlist
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their watchlist"
ON public.watchlist
FOR DELETE
USING (auth.uid() = user_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_watchlist_user_movie
ON public.watchlist(user_id, movie_id);

-- Create watch history table for tracking viewing progress
CREATE TABLE IF NOT EXISTS public.watch_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id TEXT NOT NULL,
  title TEXT NOT NULL,
  poster_path TEXT,
  progress INTEGER NOT NULL DEFAULT 0,
  timestamp BIGINT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'movie',
  last_watched TEXT NOT NULL
);

ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their watch history"
ON public.watch_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their watch history"
ON public.watch_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their watch history"
ON public.watch_history
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can clear their watch history"
ON public.watch_history
FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_watch_history_user_last_watched
ON public.watch_history(user_id, last_watched DESC);

