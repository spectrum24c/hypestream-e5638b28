
import React, { useState, useEffect } from 'react';
import { imgPath, apiPaths, fetchFromTMDB } from '@/services/tmdbApi';
import { Heart, Play, Film, X } from 'lucide-react';
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
  const [showStream, setShowStream] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [session, setSession] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    // Get auth session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
    });
    
    // Check if movie is in favorites
    const checkFavorite = async () => {
      if (!movie) return;
      
      const session = await supabase.auth.getSession();
      if (!session.data.session) return;
      
      const { data } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', session.data.session.user.id)
        .eq('movie_id', movie.id)
        .single();
      
      setIsFavorite(!!data);
    };
    
    // Load trailer
    const loadTrailer = async () => {
      if (!movie) return;
      
      try {
        const isTVShow = movie.media_type === 'tv' || !!movie.first_air_date;
        const trailerEndpoint = isTVShow 
          ? apiPaths.fetchTVTrailer(movie.id)
          : apiPaths.fetchMovieTrailer(movie.id);
        
        const data = await fetchFromTMDB(trailerEndpoint);
        
        if (data.results && data.results.length > 0) {
          // Find official trailer or use first video
          const officialTrailer = data.results.find(
            video => video.type === 'Trailer' && video.official
          ) || data.results[0];
          
          if (officialTrailer) {
            setTrailerKey(officialTrailer.key);
          }
        }
      } catch (error) {
        console.error('Error loading trailer:', error);
      }
    };
    
    checkFavorite();
    loadTrailer();
  }, [movie]);

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
    if (trailerKey) {
      setShowTrailer(true);
      setShowStream(false);
    } else {
      toast({
        title: "Trailer not available",
        description: `No trailer found for "${title}"`,
        variant: "destructive"
      });
    }
  };

  const watchNow = () => {
    // Check if user is signed in
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please login to watch content",
        variant: "destructive"
      });
      return;
    }
    
    setShowStream(true);
    setShowTrailer(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 player-cont">
      <div className="relative bg-card w-full max-w-4xl rounded-xl overflow-hidden max-h-[95vh] md:max-h-[90vh] flex flex-col">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/50 rounded-full p-2 text-white hover:bg-black/70 transition"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        
        {showStream && (
          <div className="stream aspect-video w-full bg-black flex items-center justify-center flex-1">
            <iframe
              className="w-full h-full"
              src={`https://vidsrc.to/embed/movie/${movie.id}`}
              title={`${title} Stream`}
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>
        )}
        
        {showTrailer && trailerKey && (
          <div className="trailer-cont aspect-video w-full bg-black flex-1 fixed inset-0 z-60">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&hd=1`}
              title={`${title} Trailer`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            ></iframe>
            <div className="absolute bottom-4 left-4">
              <Button onClick={() => setShowTrailer(false)} variant="outline" className="bg-black/50">
                Back to Details
              </Button>
            </div>
          </div>
        )}
        
        {!showStream && !showTrailer && (
          <div className="p-6 overflow-y-auto">
            <div className="flex flex-col md:flex-row gap-6">
              <img 
                src={posterPath} 
                alt={title} 
                className="w-full md:w-1/3 rounded-lg object-cover h-auto md:h-[350px]"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{title}</h2>
                <div className="flex gap-4 mb-4 text-gray-300 flex-wrap">
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
                  {!isFavorite ? (
                    <Button onClick={handleAddToFavorites} variant="outline" disabled={isLoading}>
                      <Heart className="mr-2 h-4 w-4" /> {isLoading ? 'Adding...' : 'Add to Favorites'}
                    </Button>
                  ) : (
                    <Button variant="outline" disabled>
                      <Heart className="mr-2 h-4 w-4 text-red-500" fill="currentColor" /> In Favorites
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoviePlayer;
