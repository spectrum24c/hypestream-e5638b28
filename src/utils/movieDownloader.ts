
import { Movie, WatchlistItem } from '@/types/movie';
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

    const resolvedMediaType = mediaType || movie.media_type || 'movie';
    const title = movie.title || movie.name || 'Untitled';
    
    // Build unique key for upsert
    const seasonNum = resolvedMediaType === 'tv' && episodeInfo ? episodeInfo.season : null;
    const episodeNum = resolvedMediaType === 'tv' && episodeInfo ? episodeInfo.episode : null;

    // Check if entry exists
    let query = supabase
      .from('watch_history')
      .select('id, watch_duration')
      .eq('user_id', user.id)
      .eq('movie_id', movie.id)
      .eq('media_type', resolvedMediaType);
    
    if (seasonNum !== null) {
      query = query.eq('season_number', seasonNum);
    } else {
      query = query.is('season_number', null);
    }
    
    if (episodeNum !== null) {
      query = query.eq('episode_number', episodeNum);
    } else {
      query = query.is('episode_number', null);
    }

    const { data: existing, error: selectError } = await query.maybeSingle();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Error checking existing watch history:', selectError);
      return;
    }

    const payload = {
      user_id: user.id,
      movie_id: movie.id,
      title,
      poster_path: movie.poster_path || null,
      overview: movie.overview || null,
      media_type: resolvedMediaType,
      season_number: seasonNum,
      episode_number: episodeNum,
      episode_title: episodeInfo ? `S${episodeInfo.season}E${episodeInfo.episode}` : null,
      progress,
      last_watched_at: new Date().toISOString()
    };

    if (existing) {
      const { error: updateError } = await supabase
        .from('watch_history')
        .update({
          title: payload.title,
          poster_path: payload.poster_path,
          overview: payload.overview,
          progress: payload.progress,
          episode_title: payload.episode_title,
          last_watched_at: payload.last_watched_at
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error('Error updating watch history:', updateError);
      }
    } else {
      const { error: insertError } = await supabase
        .from('watch_history')
        .insert(payload);

      if (insertError) {
        console.error('Error inserting watch history:', insertError);
      }
    }
  } catch (error) {
    console.error('Error tracking watch progress:', error);
  }
};

export const getWatchHistory = async () => {
  try {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('watch_history')
      .select('*')
      .eq('user_id', user.id)
      .order('last_watched_at', { ascending: false });

    if (error) {
      console.error('Error loading watch history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting watch history:', error);
    return [];
  }
};

export const removeFromWatchHistory = async (id: string) => {
  try {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from('watch_history')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error removing from watch history:', error);
    }
  } catch (error) {
    console.error('Error removing from watch history:', error);
  }
};

export const clearWatchHistory = async () => {
  try {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from('watch_history')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Error clearing watch history:', error);
    }
  } catch (error) {
    console.error('Error clearing watch history:', error);
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
