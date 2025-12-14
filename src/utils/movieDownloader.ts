
/**
 * This file contains utility functions for movie streaming options.
 */

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

// Function to track watch progress
export const trackWatchProgress = (movieId: string, progress: number, mediaType: string = 'movie') => {
  // In a real app, this would save to a database
  console.log(`Tracking progress for movie ${movieId}: ${progress}%`);
  
  try {
    // Save to localStorage for now
    const watchHistoryStr = localStorage.getItem('watchHistory');
    let watchHistory = watchHistoryStr ? JSON.parse(watchHistoryStr) : [];
    
    // Find if movie exists in history
    const existingIndex = watchHistory.findIndex((item: any) => item.movieId === movieId);
    
    if (existingIndex >= 0) {
      // Update existing entry
      watchHistory[existingIndex].progress = progress;
      watchHistory[existingIndex].last_watched = Date.now().toString();
    } else {
      // Create new entry
      watchHistory.push({
        id: Date.now().toString(),
        movieId,
        progress,
        timestamp: Date.now(),
        last_watched: Date.now().toString(),
        media_type: mediaType
      });
    }
    
    // Limit history to 50 items
    if (watchHistory.length > 50) {
      watchHistory = watchHistory.slice(0, 50);
    }
    
    localStorage.setItem('watchHistory', JSON.stringify(watchHistory));
  } catch (error) {
    console.error('Error tracking watch progress:', error);
  }
};
