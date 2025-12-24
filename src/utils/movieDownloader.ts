
import { Movie, WatchlistItem, WatchHistory } from '@/types/movie';
import { supabase } from '@/integrations/supabase/client';

export const getAlternativeStreamUrl = (movie: { id: string, imdb_id?: string, media_type?: string }) => {
  const { id, imdb_id, media_type } = movie;
  
  if (!id) {
    return null;
  }
  
  // If it's a TV show, we need season and episode info
  // For simplicity, default to season 1, episode 1
  const season = 1;
  const episode = 1;
  
  if (media_type === 'tv') {
    if (imdb_id) {
      return `https://vidsrc.vip/embed/tv/${imdb_id}/${season}/${episode}?autonext=1`;
    }
    return `https://vidsrc.vip/embed/tv/${id}/${season}/${episode}?autonext=1`;
  }
  
  // It's a movie
  if (imdb_id) {
    return `https://vidsrc.vip/embed/movie/${imdb_id}`;
  }
  return `https://vidsrc.vip/embed/movie/${id}`;
};

export const trackWatchProgress = async (
  movie: Partial<Movie> & { id: string },
  progress: number,
  mediaType?: string,
  episodeInfo?: { season: number; episode: number }
) => {
  try {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user || !movie.id) {
      return;
    }

    const now = Date.now();
    const resolvedMediaType = mediaType || movie.media_type || 'movie';
    let title = movie.title || movie.name || 'Untitled';
    if (resolvedMediaType === 'tv' && episodeInfo) {
      title = `${title} • S${episodeInfo.season}E${episodeInfo.episode}`;
    }

    const {
      data: rows,
      error: selectError
    } = await supabase
      .from('watch_history' as any)
      .select('id')
      .eq('user_id', user.id)
      .eq('movie_id', movie.id)
      .limit(1);

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Error checking existing watch history:', selectError);
      return;
    }

    const payload: Partial<WatchHistory> & {
      user_id?: string;
      movie_id?: string;
    } = {
      movieId: movie.id,
      title,
      poster_path: movie.poster_path || null,
      progress,
      timestamp: now,
      media_type: resolvedMediaType,
      last_watched: now.toString()
    };

    const existingId = Array.isArray(rows) && rows.length > 0 ? (rows as any)[0]?.id : undefined;
    if (existingId) {
      const { error: updateError } = await supabase
        .from('watch_history' as any)
        .update({
          title: payload.title,
          poster_path: payload.poster_path,
          progress: payload.progress,
          timestamp: payload.timestamp,
          media_type: payload.media_type,
          last_watched: payload.last_watched
        })
        .eq('id', existingId)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating watch history:', updateError);
      }
    } else {
      const { error: insertError } = await supabase
        .from('watch_history' as any)
        .insert({
          user_id: user.id,
          movie_id: movie.id,
          title: payload.title,
          poster_path: payload.poster_path,
          progress: payload.progress,
          timestamp: payload.timestamp,
          media_type: payload.media_type,
          last_watched: payload.last_watched
        });

      if (insertError) {
        console.error('Error inserting watch history:', insertError);
      }
    }
  } catch (error) {
    console.error('Error tracking watch progress:', error);
  }

  // Local storage fallback (non-auth and resiliency)
  try {
    const localKey = 'KENNY123.,';
    const list: any[] = JSON.parse(localStorage.getItem(localKey) || '[]');
    const idx = list.findIndex((i) => i.movieId === movie.id);
    const nowLocal = Date.now();
    const mediaTypeLocal = mediaType || movie.media_type || 'movie';
    let titleLocal = movie.title || movie.name || 'Untitled';
    if (mediaTypeLocal === 'tv' && episodeInfo) {
      titleLocal = `${titleLocal} • S${episodeInfo.season}E${episodeInfo.episode}`;
    }
    const entry = {
      id: movie.id,
      movieId: movie.id,
      title: titleLocal,
      poster_path: movie.poster_path || null,
      overview: movie.overview || '',
      progress,
      timestamp: nowLocal,
      media_type: mediaTypeLocal,
      last_watched: nowLocal.toString(),
    };
    if (idx >= 0) {
      list[idx] = entry;
    } else {
      list.unshift(entry);
    }
    localStorage.setItem(localKey, JSON.stringify(list));
  } catch (e) {
  }
};

export const getWatchlistItems = async (): Promise<WatchlistItem[]> => {
  try {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('watchlist' as any)
      .select('*')
      .eq('user_id', user.id)
      .order('added_date', { ascending: false });

    if (error) {
      console.error('Error loading watchlist from Supabase:', error);
      return [];
    }

    if (!data) {
      return [];
    }

    return data.map((item: any) => ({
      id: item.id,
      movieId: item.movie_id,
      title: item.title,
      poster_path: item.poster_path,
      added_date: item.added_date,
      media_type: item.media_type
    }));
  } catch (error) {
    console.error('Error getting watchlist items:', error);
    return [];
  }
};

export const addToWatchlist = async (movie: Movie): Promise<'added' | 'exists' | 'error'> => {
  try {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return 'error';
    }

    const { data: existing, error: selectError } = await supabase
      .from('watchlist' as any)
      .select('id')
      .eq('user_id', user.id)
      .eq('movie_id', movie.id)
      .maybeSingle();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Error checking existing watchlist item:', selectError);
      return 'error';
    }

    if (existing) {
      return 'exists';
    }

    const title = movie.title || movie.name || 'Untitled';
    const mediaType = movie.media_type || 'movie';

    const { error: insertError } = await supabase
      .from('watchlist' as any)
      .insert({
        user_id: user.id,
        movie_id: movie.id,
        title,
        poster_path: movie.poster_path || null,
        added_date: new Date().toISOString(),
        media_type: mediaType
      });

    if (insertError) {
      console.error('Error adding to watchlist:', insertError);
      return 'error';
    }

    return 'added';
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return 'error';
  }
};

export const removeFromWatchlistById = async (id: string): Promise<void> => {
  try {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    const { error } = await supabase
      .from('watchlist' as any)
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error removing from watchlist:', error);
    }
  } catch (error) {
    console.error('Error removing from watchlist:', error);
  }
};

export const clearWatchlist = async (): Promise<void> => {
  try {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    const { error } = await supabase
      .from('watchlist' as any)
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Error clearing watchlist:', error);
    }
  } catch (error) {
    console.error('Error clearing watchlist:', error);
  }
};
