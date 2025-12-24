import React, { useState, useEffect } from 'react';
import { imgPath, apiPaths, fetchFromTMDB, fetchGenres } from '@/services/tmdbApi';
import { Heart, Play, Film, X, ArrowLeft, Monitor, Download } from 'lucide-react';
import { Button } from './ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/contexts/ProfileContext';
import { trackWatchProgress } from '@/utils/movieDownloader';
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
const MoviePlayer: React.FC<MoviePlayerProps> = ({
  movie,
  onClose,
  autoPlayTrailer = false
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showStream, setShowStream] = useState(false);
  const [showAltStream, setShowAltStream] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [session, setSession] = useState(null);
  const [movieDetails, setMovieDetails] = useState<any>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [seasonEpisodes, setSeasonEpisodes] = useState<any[]>([]);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);
  const [genres, setGenres] = useState<string[]>([]);
  const [activeEpisode, setActiveEpisode] = useState<{ season: number; episode: number } | null>(null);
  const {
    toast
  } = useToast();
  const {
    currentProfile
  } = useProfile();
  useEffect(() => {
    // Get auth session
    supabase.auth.getSession().then(({
      data: {
        session: currentSession
      }
    }) => {
      setSession(currentSession);
    });

    // Check if movie is in favorites
    const checkFavorite = async () => {
      if (!movie || !session) return;
      const {
        data
      } = await supabase.from('favorites').select('*').eq('user_id', session.user.id).eq('movie_id', movie.id).maybeSingle();
      setIsFavorite(!!data);
    };

    // Load trailer
    const loadTrailer = async () => {
      if (!movie) return;
      try {
        const isTVShow = movie.media_type === 'tv' || !!movie.first_air_date;
        const trailerEndpoint = isTVShow ? apiPaths.fetchTVTrailer(movie.id) : apiPaths.fetchMovieTrailer(movie.id);
        const data = await fetchFromTMDB(trailerEndpoint);
        if (data.results && data.results.length > 0) {
          // Find official trailer or use first video
          const officialTrailer = data.results.find((video: any) => video.type === 'Trailer' && video.official) || data.results[0];
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
        const matchedGenres = genreList.filter(genre => movie.genre_ids?.includes(genre.id)).map(genre => genre.name);
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
        const detailsEndpoint = isTVShow ? apiPaths.fetchTVDetails(movie.id) : apiPaths.fetchMovieDetails(movie.id);
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
          setGenres(details.genres.map((g: {
            name: string;
          }) => g.name));
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
  const posterPath = movie.poster_path ? `${imgPath}${movie.poster_path}` : 'https://via.placeholder.com/300x450?text=No+Poster';
  const backdropPath = movie.backdrop_path ? `${imgPath}${movie.backdrop_path}` : null;
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
  const handleDownload = (seasonNumber?: number, episodeNumber?: number) => {
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please login to download content",
        variant: "destructive"
      });
      return;
    }

    if (!movie || !movie.id) return;

    const isTV = movie.media_type === 'tv' || (!movie.media_type && movie.name && !movie.title);
    if (isTV) {
      const season = seasonNumber || 1;
      const episode = episodeNumber || 1;
      const baseUrl = `https://dl.vidsrc.vip/tv/${movie.id}/${season}/${episode}`;
      window.open(baseUrl, '_blank');
    } else {
      const baseUrl = `https://dl.vidsrc.vip/movie/${movie.id}`;
      window.open(baseUrl, '_blank');
    }
  };
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
      const {
        error
      } = await supabase.from('favorites').insert({
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
    trackWatchProgress({ ...movie, media_type: isTVShow ? 'tv' : 'movie' }, 50);
  };
  const watchNowAlt = () => {
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
    trackWatchProgress({ ...movie, media_type: isTVShow ? 'tv' : 'movie' }, 50);
  };
  const handleSimilarContentClick = (similarMovie: any) => {
    trackWatchProgress({ ...movie, media_type: isTVShow ? 'tv' : 'movie' }, 100);
    const movieData = {
      ...similarMovie,
      media_type: similarMovie.media_type || (similarMovie.first_air_date ? 'tv' : 'movie')
    };

    onClose();

    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('openMoviePlayer', {
        detail: movieData
      }));
    }, 100);
  };
  const handleClose = () => {
    trackWatchProgress({ ...movie, media_type: isTVShow ? 'tv' : 'movie' }, 100);
    onClose();
  };
  return <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-0 player-cont">
      <div className={`relative ${!showStream && !showTrailer && !showAltStream ? 'bg-card w-full max-w-4xl rounded-xl overflow-hidden max-h-[95vh] md:max-h-[90vh]' : 'w-full h-full'} flex flex-col`}>
        <button onClick={handleClose} className="absolute top-4 right-4 z-10 bg-black/50 rounded-full p-2 text-white hover:bg-black/70 transition" aria-label="Close">
          <X className="h-5 w-5" />
        </button>
        
        {showStream && <div className="stream w-full h-screen bg-black flex items-center justify-center flex-1 relative">
            <Button
              onClick={() => setShowStream(false)}
              className="absolute top-4 right-14 z-50 font-bold"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Details
            </Button>
            <iframe className="w-full h-full" src={isTVShow ? `https://vidsrc.xyz/embed/tv?tmdb=${movie.id}` : `https://vidsrc.in/embed/${movie.id}`} title={`${title} Stream`} frameBorder="0" referrerPolicy="origin" allowFullScreen style={{
          height: '70vh',
          width: '40%'
        }} loading="lazy"></iframe>
          </div>}

        {showAltStream && <div className="stream w-full h-screen bg-black flex items-center justify-center flex-1 relative">
            <Button
              onClick={() => setShowAltStream(false)}
              className="absolute top-4 right-14 z-50 font-bold"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Details
            </Button>
            <iframe className="w-full h-full" src={isTVShow ? `https://vidsrc.vip/embed/tv/${movie.id}/${activeEpisode ? activeEpisode.season : 1}/${activeEpisode ? activeEpisode.episode : 1}` : `https://vidsrc.vip/embed/movie/${movie.id}`} title={`${title} Stream (Alternate)`} frameBorder="0" referrerPolicy="origin" allowFullScreen style={{
          height: '70vh',
          width: '40%'
        }} loading="lazy"></iframe>
          </div>}
        
        {showTrailer && trailerKey && <div className="trailer-cont w-full h-screen bg-black flex-1 fixed inset-0 z-60 flex items-center justify-center">
            <Button
              onClick={() => setShowTrailer(false)}
              className="absolute top-4 right-14 z-50 font-bold"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Details
            </Button>
            <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&hd=1`} title={`${title} Trailer`} frameBorder="0" referrerPolicy="origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen style={{
          height: '100vh',
          width: '100%'
        }} loading="lazy"></iframe>
          </div>}
        
        {!showStream && !showTrailer && !showAltStream && <div className="relative flex-1 overflow-y-auto bg-black">
            {backdropPath && (
              <div className="absolute inset-0">
                <img
                  src={backdropPath}
                  alt={title}
                  className="w-full h-full object-cover opacity-40"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
              </div>
            )}
            <div className="relative p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <img src={posterPath} alt={title} className="w-full md:w-1/3 rounded-lg object-cover h-auto md:h-[350px] shadow-2xl" loading="lazy" />
                <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{title}</h2>
                <div className="flex gap-4 mb-4 text-gray-300 flex-wrap">
                  <span>{year}</span>
                  <span>★ {rating}</span>
                  {durationInfo && <span>{durationInfo}</span>}
                </div>
                {genresText && <div className="bg-gray-800/60 px-3 py-1.5 rounded-md mb-4 inline-block">
                    <span className="text-gray-300 text-sm">{genresText}</span>
                  </div>}
                <p className="text-gray-300 mb-6 text-sm md:text-base">{movie.overview || 'No description available'}</p>
                <div className="flex flex-wrap gap-3 mb-6">
                  <Button onClick={watchNow}>
                    <Play className="mr-2 h-4 w-4" /> Watch Now
                  </Button>
                  <Button
                    onClick={() => handleDownload()}
                  >
                    <Download className="mr-2 h-4 w-4" /> Download
                  </Button>
                  <Button onClick={watchNowAlt}>
                    <Monitor className="mr-2 h-4 w-4" /> Watch (Alt Source)
                  </Button>
                  <Button onClick={playTrailer} variant="secondary">
                    <Film className="mr-2 h-4 w-4" /> Watch Trailer
                  </Button>
                  {!isFavorite ? <Button onClick={handleAddToFavorites} variant="outline" disabled={isLoading}>
                      <Heart className="mr-2 h-4 w-4" /> {isLoading ? 'Adding...' : 'Add to Favorites'}
                    </Button> : <Button variant="outline" disabled>
                      <Heart className="mr-2 h-4 w-4 text-red-500" fill="currentColor" /> In Favorites
                    </Button>}
                </div>
              </div>
            </div>
            {isTVShow && movieDetails?.seasons && movieDetails.seasons.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Episodes</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {movieDetails.seasons
                    .filter((s: any) => s.season_number > 0)
                    .map((season: any) => (
                      <Button
                        key={season.id}
                        size="sm"
                        variant={selectedSeason === season.season_number ? 'default' : 'outline'}
                        onClick={async () => {
                          if (selectedSeason === season.season_number && seasonEpisodes.length > 0) return;
                          setSelectedSeason(season.season_number);
                          setIsLoadingEpisodes(true);
                          try {
                            const data = await fetchFromTMDB(
                              apiPaths.fetchTVSeason(movie.id, season.season_number)
                            );
                            const episodes = Array.isArray(data.episodes) ? data.episodes : [];
                            setSeasonEpisodes(episodes);
                          } catch (error) {
                            console.error('Error loading episodes:', error);
                            setSeasonEpisodes([]);
                          } finally {
                            setIsLoadingEpisodes(false);
                          }
                        }}
                      >
                        Season {season.season_number}
                      </Button>
                    ))}
                </div>
                <div className="border border-border rounded-lg bg-background/80 max-h-64 overflow-y-auto backdrop-blur">
                  {isLoadingEpisodes && (
                    <div className="p-4 text-sm text-muted-foreground">
                      Loading episodes...
                    </div>
                  )}
                  {!isLoadingEpisodes && seasonEpisodes.length === 0 && (
                    <div className="p-4 text-sm text-muted-foreground">
                      Select a season to view episodes.
                    </div>
                  )}
                  {!isLoadingEpisodes &&
                    seasonEpisodes.length > 0 &&
                    seasonEpisodes.map(episode => (
                      <div
                        key={episode.id}
                        className="flex items-start gap-3 px-4 py-3 border-t border-border/60 first:border-t-0"
                      >
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                S{selectedSeason} • E{episode.episode_number}
                              </span>
                              <span className="text-sm font-medium">
                                {episode.name || `Episode ${episode.episode_number}`}
                              </span>
                            </div>
                            {episode.runtime && (
                              <span className="text-xs text-muted-foreground">
                                {episode.runtime} min
                              </span>
                            )}
                          </div>
                          {episode.overview && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {episode.overview}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setActiveEpisode({
                                season: selectedSeason,
                                episode: episode.episode_number
                              });
                              watchNowAlt();
                            }}
                          >
                            <Play className="h-3 w-3 mr-1" /> Play
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(selectedSeason, episode.episode_number)}
                          >
                            <Download className="h-3 w-3 mr-1" /> Download
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>}
    </div>
  </div>;
};
export default MoviePlayer;
