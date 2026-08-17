DELETE FROM public.favorites f
USING public.favorites g
WHERE f.user_id = g.user_id
  AND f.movie_id = g.movie_id
  AND f.created_at > g.created_at;

CREATE UNIQUE INDEX IF NOT EXISTS favorites_user_movie_unique
  ON public.favorites (user_id, movie_id);