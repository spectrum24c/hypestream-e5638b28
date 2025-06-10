import React, { useState, useEffect } from 'react';
import { imgPath, apiPaths, fetchFromTMDB, fetchGenres } from '@/services/tmdbApi';
import { Heart, Play, Film, X, ArrowLeft, Monitor } from 'lucide-react';
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
    genre_ids?: number[];
  } | null;
  onClose: () => void;
  autoPlayTrailer?: boolean;
}

const MoviePlayer: React.FC<MoviePlayerProps> = ({ movie, onClose, autoPlayTrailer = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showStream, setShowStream] = useState(false);
  const [showAltStream, setShowAltStream] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [session, setSession] = useState(null);
  const [movieDetails, setMovieDetails] = useState<any>(null);
  const [genres, setGenres] = useState<string[]>([]);
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
            (video: any) => video.type === 'Trailer' && video.official
          ) || data.results[0];
          
          if (officialTrailer) {
            setTrailerKey(officialTrailer.key);
            
            // Auto-play trailer if requested
            if (autoPlayTrailer) {
              setShowTrailer(true);
            }
          }
        }
      } catch (error) {
        console.error('Error loading trailer:', error);
      }
    };
    
    // Load genres
    const loadGenres = async () => {
      if (!movie || !movie.genre_ids || movie.genre_ids.length === 0) return;
      
      try {
        const isTVShow = movie.media_type === 'tv' || !!movie.first_air_date;
        const genreList = await fetchGenres(isTVShow ? 'tv' : 'movie');
        const matchedGenres = genreList
          .filter(genre => movie.genre_ids?.includes(genre.id))
          .map(genre => genre.name);
        
        setGenres(matchedGenres);
      } catch (error) {
        console.error('Error loading genres:', error);
      }
    };
    
    // Fetch complete movie/TV details
    const fetchDetails = async () => {
      if (!movie) return;
      
      try {
        const isTVShow = movie.media_type === 'tv' || !!movie.first_air_date;
        const detailsEndpoint = isTVShow 
          ? apiPaths.fetchTVDetails(movie.id)
          : apiPaths.fetchMovieDetails(movie.id);
        
        const details = await fetchFromTMDB(detailsEndpoint);
        setMovieDetails(details);
        
        // Record this movie to watched list
        const watchedMovies = JSON.parse(localStorage.getItem('watchedMovies') || '[]');
        const existingIndex = watchedMovies.findIndex((m: any) => m.id === movie.id);
        
        if (existingIndex === -1) {
          watchedMovies.push({
            id: movie.id,
            title: details.title || details.name,
            genre_ids: details.genres?.map((g: any) => g.id) || [],
            timestamp: Date.now()
          });
          localStorage.setItem('watchedMovies', JSON.stringify(watchedMovies));
        }
        
        // If we have genres in the details, use those instead of loading separately
        if (details.genres && details.genres.length > 0) {
          setGenres(details.genres.map((g: { name: string }) => g.name));
        } else {
          // Otherwise load genres from IDs if available
          loadGenres();
        }
      } catch (error) {
        console.error('Error fetching details:', error);
      }
    };
    
    checkFavorite();
    loadTrailer();
    fetchDetails();
  }, [movie, autoPlayTrailer]);

  if (!movie) return null;

  const title = movie.title || movie.name || 'Unknown Title';
  const posterPath = movie.poster_path 
    ? `${imgPath}${movie.poster_path}` 
    : 'https://via.placeholder.com/300x450?text=No+Poster';
  const releaseDate = movie.release_date || movie.first_air_date;
  const year = releaseDate?.split('-')[0] || 'N/A';
  const rating = movie.vote_average?.toFixed(1) || 'N/A';
  const isTVShow = movie.media_type === 'tv' || !!movie.first_air_date;
  
  // Use detailed information if available, otherwise use basic info
  const runtime = movieDetails?.runtime || movie.runtime;
  const numberOfSeasons = movieDetails?.number_of_seasons || movie.number_of_seasons;
  const status = movieDetails?.status;
  
  let durationInfo = '';
  if (isTVShow) {
    durationInfo = numberOfSeasons ? `${numberOfSeasons} Season${numberOfSeasons !== 1 ? 's' : ''}` : '';
  } else {
    if (runtime) {
      durationInfo = `${runtime} min`;
    } else if (releaseDate) {
      const releaseYear = new Date(releaseDate).getFullYear();
      const currentYear = new Date().getFullYear();
      
      if (releaseYear > currentYear || status === 'Upcoming' || status === 'In Production') {
        durationInfo = `Release date: ${releaseDate}`;
      }
    }
  }

  // Format genres for display
  const genresText = genres.length > 0 ? genres.join(' • ') : '';

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
      setShowAltStream(false);
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
    setShowAltStream(false);
  };

  const watchNowAlt = () => {
    // Check if user is signed in
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please login to watch content",
        variant: "destructive"
      });
      return;
    }
    
    setShowAltStream(true);
    setShowTrailer(false);
    setShowStream(false);
  };

  const handleSimilarContentClick = (similarMovie: any) => {
    // Close current movie and open the similar one
    const movieData = {
      ...similarMovie,
      media_type: similarMovie.media_type || (similarMovie.first_air_date ? 'tv' : 'movie')
    };
    
    // Update the current movie
    onClose();
    
    // Slight delay to ensure smooth transition
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('openMoviePlayer', { 
        detail: movieData 
      }));
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-0 player-cont">
      <div className={`relative ${!showStream && !showTrailer && !showAltStream ? 'bg-card w-full max-w-4xl rounded-xl overflow-hidden max-h-[95vh] md:max-h-[90vh]' : 'w-full h-full'} flex flex-col`}>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/50 rounded-full p-2 text-white hover:bg-black/70 transition"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        
        {showStream && (
          <div className="stream w-full h-screen bg-black flex items-center justify-center flex-1 relative">
            <Button 
              onClick={() => setShowStream(false)} 
              className="absolute top-4 right-14 z-50 bg-hype-purple hover:bg-hype-purple/90 text-white font-bold"
              style={{ backgroundColor: '#8941ff' }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Details
            </Button>
            <iframe
              className="w-full h-full"
              src={isTVShow 
                ? `https://vidsrc.xyz/embed/tv?tmdb=${movie.id}` 
                : `https://vidsrc.in/embed/${movie.id}`}
              title={`${title} Stream`}
              frameBorder="0"
              referrerPolicy="origin"
              allowFullScreen
              style={{ height: '70vh', width: '40%' }}
              loading="lazy"
            ></iframe>
          </div>
        )}

        {showAltStream && (
          <div className="stream w-full h-screen bg-black flex items-center justify-center flex-1 relative">
            <Button 
              onClick={() => setShowAltStream(false)} 
              className="absolute top-4 right-14 z-50 bg-hype-purple hover:bg-hype-purple/90 text-white font-bold"
              style={{ backgroundColor: '#8941ff' }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Details
            </Button>
            <iframe
              className="w-full h-full"
              src={isTVShow 
                ? `https://vidsrc.vip/embed/tv/${movie.id}/1/1`
                : `https://vidsrc.vip/embed/movie/${movie.id}`}
              title={`${title} Stream (Alternate)`}
              frameBorder="0"
              referrerPolicy="origin"
              allowFullScreen
              style={{ height: '70vh', width: '40%' }}
              loading="lazy"
            ></iframe>
          </div>
        )}
        
        {showTrailer && trailerKey && (
          <div className="trailer-cont w-full h-screen bg-black flex-1 fixed inset-0 z-60 flex items-center justify-center">
            <Button 
              onClick={() => setShowTrailer(false)} 
              className="absolute top-4 right-14 z-50 text-white font-bold"
              style={{ backgroundColor: '#8941ff' }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Details
            </Button>
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&hd=1`}
              title={`${title} Trailer`}
              frameBorder="0"
              referrerPolicy="origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              style={{ height: '100vh', width: '100%' }}
              loading="lazy"
            ></iframe>
          </div>
        )}
        
        {!showStream && !showTrailer && !showAltStream && (
          <div className="p-6 overflow-y-auto">
            <div className="flex flex-col md:flex-row gap-6">
              <img 
                src={posterPath} 
                alt={title} 
                className="w-full md:w-1/3 rounded-lg object-cover h-auto md:h-[350px]"
                loading="lazy"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{title}</h2>
                <div className="flex gap-4 mb-4 text-gray-300 flex-wrap">
                  <span>{year}</span>
                  <span>★ {rating}</span>
                  {durationInfo && <span>{durationInfo}</span>}
                </div>
                {genresText && (
                  <div className="bg-gray-800/60 px-3 py-1.5 rounded-md mb-4 inline-block">
                    <span className="text-gray-300 text-sm">{genresText}</span>
                  </div>
                )}
                <p className="text-gray-300 mb-6">{movie.overview || 'No description available'}</p>
                <div className="flex flex-wrap gap-3 mb-6">
                  <Button onClick={watchNow} className="bg-hype-purple hover:bg-hype-purple/90">
                    <Play className="mr-2 h-4 w-4" /> Watch Now
                  </Button>
                  <Button onClick={watchNowAlt} className="bg-hype-orange hover:bg-hype-orange/90">
                    <Monitor className="mr-2 h-4 w-4" /> Watch (Alt Source)
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
