
import React, { useState } from 'react';
import { imgPath } from '@/services/tmdbApi';
import { Heart, Play, Film } from 'lucide-react';
import { Button } from './ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MoviePlayerProps {
  movie: {
    id: string;
    title?: string;
    name?: string;
    overview?: string;
    poster_path?: string | null;
    backdrop_path?: string | null;
    release_date?: string;
    first_air_date?: string;
    vote_average?: number;
    media_type?: string;
    runtime?: number;
    number_of_seasons?: number;
  } | null;
  onClose: () => void;
}

const MoviePlayer: React.FC<MoviePlayerProps> = ({ movie, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const { toast } = useToast();

  if (!movie) return null;

  const title = movie.title || movie.name || 'Unknown Title';
  const posterPath = movie.poster_path 
    ? `${imgPath}${movie.poster_path}` 
    : 'https://via.placeholder.com/300x450?text=No+Poster';
  const releaseDate = movie.release_date || movie.first_air_date;
  const year = releaseDate?.split('-')[0] || 'N/A';
  const rating = movie.vote_average?.toFixed(1) || 'N/A';
  const isTVShow = movie.media_type === 'tv' || !!movie.first_air_date;
  const runtime = isTVShow 
    ? `${movie.number_of_seasons || 'Unknown'} Season(s)` 
    : movie.runtime ? `${movie.runtime} min` : 'N/A';

  const handleAddToFavorites = async () => {
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      toast({
        title: "Authentication required",
        description: "Please login to add to favorites",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: session.data.session.user.id,
          movie_id: movie.id,
          title: title,
          poster_path: movie.poster_path,
          release_date: releaseDate,
          vote_average: movie.vote_average,
          is_tv_show: isTVShow
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already in favorites",
            description: "This title is already in your favorites"
          });
        } else {
          throw error;
        }
      } else {
        setIsFavorite(true);
        toast({
          title: "Added to favorites",
          description: `"${title}" has been added to your favorites!`
        });
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
      toast({
        title: "Error",
        description: "Failed to add to favorites",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const playTrailer = () => {
    // This would typically open a video player with the trailer
    toast({
      title: "Playing trailer",
      description: `Trailer for "${title}" would play here`
    });
  };

  const watchNow = () => {
    // This would typically start playing the movie/show
    toast({
      title: "Watch now",
      description: `Now playing "${title}"`
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 player-cont">
      <div className="relative bg-card w-full max-w-4xl rounded-xl overflow-hidden">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/50 rounded-full p-2 text-white hover:bg-black/70 transition"
          aria-label="Close"
        >
          ✕
        </button>
        
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <img 
              src={posterPath} 
              alt={title} 
              className="w-full md:w-1/3 rounded-lg object-cover h-[350px]"
            />
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{title}</h2>
              <div className="flex gap-4 mb-4 text-gray-300">
                <span>{year}</span>
                <span>★ {rating}</span>
                <span>{runtime}</span>
              </div>
              <p className="text-gray-300 mb-6">{movie.overview || 'No description available'}</p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={watchNow} className="bg-hype-purple hover:bg-hype-purple/90">
                  <Play className="mr-2 h-4 w-4" /> Watch Now
                </Button>
                <Button onClick={playTrailer} variant="secondary">
                  <Film className="mr-2 h-4 w-4" /> Watch Trailer
                </Button>
                <Button onClick={handleAddToFavorites} variant="outline" disabled={isLoading}>
                  <Heart className="mr-2 h-4 w-4" /> {isLoading ? 'Adding...' : 'Add to Favorites'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoviePlayer;
