import React, { useState, useEffect } from 'react';
import { Play, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Movie } from '@/types/movie';
import { fetchFromTMDB, apiPaths, imgPath } from '@/services/tmdbApi';

interface MovieSuggestionCardProps {
  title: string;
  year: string;
  onMovieClick?: (movie: Movie) => void;
}

const MovieSuggestionCard: React.FC<MovieSuggestionCardProps> = ({ 
  title, 
  year,
  onMovieClick 
}) => {
  const [movieData, setMovieData] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const searchMovie = async () => {
      try {
        const searchUrl = `https://api.themoviedb.org/3/search/multi?api_key=62c59007d93c96aa3cca9f3422d51af5&query=${encodeURIComponent(title)}&year=${year}`;
        const data = await fetchFromTMDB(searchUrl);
        
        if (data.results && data.results.length > 0) {
          const result = data.results[0];
          setMovieData({
            id: result.id.toString(),
            title: result.title || result.name,
            poster_path: result.poster_path,
            backdrop_path: result.backdrop_path,
            release_date: result.release_date || result.first_air_date,
            vote_average: result.vote_average,
            media_type: result.media_type,
            overview: result.overview,
            genre_ids: result.genre_ids
          });
        }
      } catch (error) {
        console.error('Error fetching movie data:', error);
      } finally {
        setLoading(false);
      }
    };

    searchMovie();
  }, [title, year]);

  if (loading) {
    return (
      <div className="bg-background/50 rounded-md p-2 animate-pulse">
        <div className="h-12 bg-muted rounded"></div>
      </div>
    );
  }

  if (!movieData) return null;

  const posterUrl = movieData.poster_path 
    ? `${imgPath}${movieData.poster_path}`
    : null;

  return (
    <div className="bg-background/50 rounded-md p-2 hover:bg-background/70 transition-colors cursor-pointer border border-border/50">
      <div className="flex gap-3">
        {posterUrl && (
          <img
            src={posterUrl}
            alt={title}
            className="w-16 h-24 object-cover rounded"
            loading="lazy"
          />
        )}
        
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <h4 className="font-semibold text-sm text-foreground truncate">
              {title}
            </h4>
            <p className="text-xs text-muted-foreground">
              {year} {movieData.vote_average && `• ⭐ ${movieData.vote_average.toFixed(1)}`}
            </p>
          </div>
          
          <div className="flex gap-1 mt-2">
            <Button
              size="sm"
              variant="default"
              className="h-7 text-xs px-2 flex-1"
              onClick={() => onMovieClick?.(movieData)}
            >
              <Play className="h-3 w-3 mr-1" />
              Watch
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2"
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Add to watchlist
              }}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieSuggestionCard;
