import React, { useState, useEffect, useRef } from 'react';
import { imgPath, apiPaths, fetchFromTMDB, fetchGenres } from '@/services/tmdbApi';
import { Heart, Play, ArrowLeft, Monitor, Download } from 'lucide-react';
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
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [session, setSession] = useState(null);
  const [movieDetails, setMovieDetails] = useState<any>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [seasonEpisodes, setSeasonEpisodes] = useState<any[]>([]);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);
  const [genres, setGenres] = useState<string[]>([]);
  const [activeEpisode, setActiveEpisode] = useState<{ season: number; episode: number } | null>(null);
  const watchStartRef = useRef<number | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const {
    toast
  } = useToast();
  const {
    currentProfile
  } = useProfile();

  const loadEpisodesForSeason = async (seasonNumber: number) => {
    if (!movie) return;
    setIsLoadingEpisodes(true);
    try {
      const data = await fetchFromTMDB(
        apiPaths.fetchTVSeason(movie.id, seasonNumber)
      );
      const episodes = Array.isArray(data.episodes) ? data.episodes : [];
      setSeasonEpisodes(episodes);
    } catch (error) {
      console.error('Error loading episodes:', error);
      setSeasonEpisodes([]);
    } finally {
      setIsLoadingEpisodes(false);
    }
  };
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
          const officialTrailer = data.results.find((video: any) => video.type === 'Trailer' && video.official) || data.results[0];
          if (officialTrailer) {
            setTrailerKey(officialTrailer.key);
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
        const isTVShowDetails = movie.media_type === 'tv' || !!movie.first_air_date;
        const detailsEndpoint = isTVShowDetails ? apiPaths.fetchTVDetails(movie.id) : apiPaths.fetchMovieDetails(movie.id);
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

        if (details.genres && details.genres.length > 0) {
          setGenres(details.genres.map((g: {
            name: string;
          }) => g.name));
        } else {
          loadGenres();
        }

        if (isTVShowDetails) {
          setSelectedSeason(1);
          loadEpisodesForSeason(1);
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
  const posterPath = movie.poster_path ? `${imgPath}${movie.poster_path}` : null;
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

  const resolveEpisodeInfo = (override?: { season: number; episode: number }) => {
    if (!isTVShow) return undefined;
    if (override) return override;
    if (activeEpisode) return activeEpisode;
    return { season: 1, episode: 1 };
  };

  const getAltStreamSrc = (override?: { season: number; episode: number }) => {
    if (!movie) return '';
    if (!isTVShow) {
      return `https://vidsrc.vip/embed/movie/${movie.id}`;
    }
    const episodeInfo = resolveEpisodeInfo(override);
    const season = episodeInfo?.season ?? 1;
    const episode = episodeInfo?.episode ?? 1;
    return `https://vidsrc.vip/embed/tv/${movie.id}/${season}/${episode}`;
  };
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
    setShowAltStream(false);
    watchStartRef.current = Date.now();
    startProgressTracking();
    trackWatchProgress({ ...movie, media_type: isTVShow ? 'tv' : 'movie' }, 0, isTVShow ? 'tv' : 'movie');
  };
  const watchNowAlt = (episodeOverride?: { season: number; episode: number }) => {
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please login to watch content",
        variant: "destructive"
      });
      return;
    }
    setShowAltStream(true);
    setShowStream(false);
    watchStartRef.current = Date.now();
    const episodeInfo = resolveEpisodeInfo(episodeOverride);
    if (episodeInfo) {
      setActiveEpisode(episodeInfo);
    }
    startProgressTracking();
    trackWatchProgress({ ...movie, media_type: isTVShow ? 'tv' : 'movie' }, 0, isTVShow ? 'tv' : 'movie', episodeInfo);
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
    const finalProgress = computeProgressPercent();
    const episodeInfo = isTVShow ? (activeEpisode || { season: 1, episode: 1 }) : undefined;
    trackWatchProgress({ ...movie, media_type: isTVShow ? 'tv' : 'movie' }, finalProgress, isTVShow ? 'tv' : 'movie', episodeInfo);
    stopProgressTracking();
    onClose();
  };

  const getDurationMinutes = () => {
    if (isTVShow) {
      const epRun = movieDetails?.episode_run_time && Array.isArray(movieDetails.episode_run_time) ? movieDetails.episode_run_time[0] : null;
      return epRun && epRun > 0 ? epRun : 45;
    }
    const rt = movieDetails?.runtime || movie.runtime;
    return rt && rt > 0 ? rt : 120;
  };

  const computeProgressPercent = () => {
    const start = watchStartRef.current;
    if (!start) return 0;
    const elapsedMs = Date.now() - start;
    const elapsedMin = elapsedMs / 60000;
    const durationMin = getDurationMinutes();
    const pct = Math.min(100, Math.max(0, (elapsedMin / durationMin) * 100));
    return Math.round(pct);
  };

  const startProgressTracking = () => {
    stopProgressTracking();
    // Update progress every 30 seconds
    progressTimerRef.current = window.setInterval(() => {
      const pct = computeProgressPercent();
      const episodeInfo = isTVShow ? (activeEpisode || { season: 1, episode: 1 }) : undefined;
      trackWatchProgress({ ...movie, media_type: isTVShow ? 'tv' : 'movie' }, pct, isTVShow ? 'tv' : 'movie', episodeInfo);
    }, 30000);
  };

  const stopProgressTracking = () => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  };

  const backgroundStyle = posterPath ? {
    backgroundImage: `url(${posterPath})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  } : undefined;

  return <div className="fixed inset-0 z-50 player-cont overflow-y-auto" style={backgroundStyle}>
      <div className="relative w-full min-h-screen flex flex-col bg-black/80">
        <button
          onClick={handleClose}
          className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/60 rounded-full px-3 py-1.5 text-sm text-white hover:bg-black/80 transition"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
        
        {showStream && <div className="stream w-full h-screen bg-black/80 flex items-center justify-center flex-1 relative">
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

        {showAltStream && <div className="stream w-full h-screen bg-black/80 flex items-center justify-center flex-1 relative">
            <Button
              onClick={() => setShowAltStream(false)}
              className="absolute top-4 right-14 z-50 font-bold"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Details
            </Button>
            <iframe className="w-full h-full" src={getAltStreamSrc()} title={`${title} Stream (Alternate)`} frameBorder="0" referrerPolicy="origin" allowFullScreen style={{
          height: '70vh',
          width: '40%'
        }} loading="lazy"></iframe>
          </div>}
        
        {!showStream && !showAltStream && <div className="relative flex-1 overflow-y-auto bg-black/70">
            {trailerKey && <div className="pt-2.5 px-2.5">
                <div className="w-full aspect-video">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&hd=1&vq=hd1080`}
                    title={`${title} Trailer`}
                    frameBorder="0"
                    referrerPolicy="origin"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                    loading="lazy"
                  ></iframe>
                </div>
              </div>}
            <div className="relative px-4 py-8 md:py-10 max-w-6xl mx-auto">
              <div className="text-left mb-6">
                <h2 className="text-3xl md:text-4xl font-extrabold mb-3">{title}</h2>
                <div className="flex flex-wrap items-center gap-4 mb-3 text-gray-300 text-sm md:text-base">
                  <span className="font-semibold">{year}</span>
                  <span className="px-1.5 py-0.5 rounded bg-white/20 text-xs md:text-sm">★ {rating}</span>
                  {durationInfo && <span>{durationInfo}</span>}
                </div>
                {genresText && <div className="px-3 py-1.5 rounded-md mb-4 inline-block bg-black/40">
                    <span className="text-gray-300 text-sm">{genresText}</span>
                  </div>}
                <p className="text-gray-200 mb-6 text-sm md:text-base max-w-2xl">{movie.overview || 'No description available'}</p>
                <div className="flex flex-wrap gap-3 mb-2">
                  <Button onClick={watchNow} className="font-semibold">
                    <Play className="mr-2 h-4 w-4" /> Play
                  </Button>
                  <Button onClick={() => handleDownload()}>
                    <Download className="mr-2 h-4 w-4" /> Download
                  </Button>
                  <Button onClick={() => watchNowAlt()} variant="outline">
                    <Monitor className="mr-2 h-4 w-4" /> Watch (Alt)
                  </Button>
                  {!isFavorite ? <Button onClick={handleAddToFavorites} variant="outline" disabled={isLoading}>
                      <Heart className="mr-2 h-4 w-4" /> {isLoading ? 'Adding...' : 'Add to Favorites'}
                    </Button> : <Button variant="outline" disabled>
                      <Heart className="mr-2 h-4 w-4 text-red-500" fill="currentColor" /> In Favorites
                    </Button>}
                </div>
              </div>
            {isTVShow && movieDetails?.seasons && movieDetails.seasons.length > 0 && (
              <div className="mt-10">
                <div className="flex items-center justify-between mb-4 gap-4">
                  <h3 className="text-lg md:text-xl font-semibold">Episodes</h3>
                  <div className="flex flex-wrap gap-2">
                    {movieDetails.seasons
                      .filter((s: any) => s.season_number > 0)
                      .map((season: any) => (
                        <Button
                          key={season.id}
                          size="sm"
                          variant={selectedSeason === season.season_number ? 'default' : 'outline'}
                          onClick={() => {
                            if (selectedSeason === season.season_number) return;
                            setSelectedSeason(season.season_number);
                            loadEpisodesForSeason(season.season_number);
                          }}
                        >
                          Season {season.season_number}
                        </Button>
                      ))}
                  </div>
                </div>
                {isLoadingEpisodes && (
                  <div className="p-4 text-sm text-muted-foreground">
                    Loading episodes...
                  </div>
                )}
                {!isLoadingEpisodes && seasonEpisodes.length === 0 && (
                  <div className="p-4 text-sm text-muted-foreground">
                    No episodes found for this season.
                  </div>
                )}
                {!isLoadingEpisodes &&
                  seasonEpisodes.length > 0 &&
                  seasonEpisodes.map(episode => (
                    <div
                      key={episode.id}
                      className="flex items-center gap-4 py-3 border-t border-white/10 first:border-t-0"
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
                            watchNowAlt({
                              season: selectedSeason,
                              episode: episode.episode_number
                            });
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
            )}
          </div>
        </div>}
    </div>
  </div>;
};
export default MoviePlayer;
