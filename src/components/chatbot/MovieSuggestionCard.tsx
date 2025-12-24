import React, { useState, useEffect } from 'react';
import { Play, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Movie } from '@/types/movie';
import { fetchFromTMDB, apiPaths, imgPath } from '@/services/tmdbApi';
import { useToast } from '@/hooks/use-toast';
import { addToWatchlist } from '@/utils/movieDownloader';

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
  const { toast } = useToast();

  useEffect(() => {
    const searchMovie = async () => {
      try {
        const data = await fetchFromTMDB(apiPaths.searchMulti(title));
        type SearchResult = {
          id: number;
          title?: string;
          name?: string;
          poster_path: string | null;
          backdrop_path?: string | null;
          release_date?: string;
          first_air_date?: string;
          vote_average?: number;
          media_type?: string;
          overview?: string;
          genre_ids?: number[];
        };
        const results = (data.results || []) as SearchResult[];
        if (results.length === 0) {
          return;
        }
        let result = results[0];
        if (year) {
          const matched = results.find(item => {
            const releaseDate = item.release_date || item.first_air_date;
            return releaseDate && releaseDate.startsWith(year);
          });
          if (matched) {
            result = matched;
          }
        }
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
              onClick={async (e) => {
                e.stopPropagation();
                if (!movieData) return;
                try {
                  const result = await addToWatchlist(movieData);
                  if (result === 'exists') {
                    toast({
                      title: "Already in watchlist",
                      description: "This title is already in your watchlist."
                    });
                  } else if (result === 'added') {
                    toast({
                      title: "Added to watchlist",
                      description: "You can find it on your watchlist page."
                    });
                  } else {
                    toast({
                      title: "Error",
                      description: "Could not add to watchlist. Please try again.",
                      variant: "destructive"
                    });
                  }
                } catch (error) {
                  console.error('Error adding to watchlist:', error);
                  toast({
                    title: "Error",
                    description: "Could not add to watchlist. Please try again.",
                    variant: "destructive"
                  });
                }
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
