
import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import ContentSlider from '@/components/ContentSlider';
import Footer from '@/components/Footer';
import { apiPaths, fetchFromTMDB, searchContent, fetchContentByCategory } from '@/services/tmdbApi';
import { supabase } from '@/integrations/supabase/client';
import MovieCard from '@/components/MovieCard';
import MoviePlayer from '@/components/MoviePlayer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowDown } from 'lucide-react';
import { Movie } from '@/types/movie';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [trendingContent, setTrendingContent] = useState<Movie[]>([]);
  const [newReleases, setNewReleases] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [topRatedShows, setTopRatedShows] = useState<Movie[]>([]);
  const [horrorMovies, setHorrorMovies] = useState<Movie[]>([]);
  const [comedyMovies, setComedyMovies] = useState<Movie[]>([]);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [session, setSession] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [shouldPlayMovie, setShouldPlayMovie] = useState(false);
  const [viewAllContent, setViewAllContent] = useState<Movie[]>([]);
  const [viewingCategory, setViewingCategory] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const searchQueryFromState = location.state?.searchQuery || '';
  const selectedMovieIdFromState = location.state?.selectedMovieId;
  const categoryFromParams = searchParams.get('category');
  const genreFromParams = searchParams.get('genre');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedMovieIdFromState) {
      const fetchMovieDetails = async () => {
        try {
          let data = await fetchFromTMDB(apiPaths.fetchMovieDetails(selectedMovieIdFromState));
          
          if (!data.title) {
            data = await fetchFromTMDB(apiPaths.fetchTVDetails(selectedMovieIdFromState));
          }
          
          if (data) {
            setSelectedMovie(data as Movie);
          }
        } catch (error) {
          console.error("Error fetching movie details:", error);
        }
      };
      
      fetchMovieDetails();
    }
  }, [selectedMovieIdFromState]);

  useEffect(() => {
    const fetchMovieData = async () => {
      setLoading(true);
      setCurrentPage(1);
      setHasMore(true);
      try {
        if (searchQueryFromState) {
          const data = await searchContent(searchQueryFromState);
          if (data && typeof data === 'object' && 'results' in data) {
            // Fix type error by explicitly casting to Movie[]
            setSearchResults((data.results || []) as Movie[]);
            setIsSearching(true);
            setViewingCategory(null);
          }
        } 
        else if (categoryFromParams) {
          setIsSearching(true);
          setViewingCategory(categoryFromParams);
          
          if (categoryFromParams === 'new') {
            const data = await fetchFromTMDB(apiPaths.fetchPopularMovies);
            if (data && typeof data === 'object' && 'results' in data) {
              setViewAllContent((data.results || []) as Movie[]);
            }
          }
          else if (genreFromParams) {
            const data = await fetchContentByCategory(
              categoryFromParams, 
              parseInt(genreFromParams)
            );
            setViewAllContent(data as Movie[]);
          } 
          else {
            let data;
            if (categoryFromParams === 'movie') {
              data = await fetchFromTMDB(apiPaths.fetchPopularMovies);
            } else if (categoryFromParams === 'tv') {
              data = await fetchFromTMDB(apiPaths.fetchPopularTV);
            } else if (categoryFromParams === 'horror') {
              data = await fetchFromTMDB(apiPaths.fetchMoviesList(27));
            } else if (categoryFromParams === 'comedy') {
              data = await fetchFromTMDB(apiPaths.fetchMoviesList(35));
            } else {
              data = await fetchFromTMDB(apiPaths.fetchTrending);
            }
            if (data && typeof data === 'object' && 'results' in data) {
              setViewAllContent((data.results || []) as Movie[]);
            }
          }
        }
        else {
          setIsSearching(false);
          setViewingCategory(null);
          const [trendingData, newReleasesData, popularMoviesData, topRatedShowsData, horrorMoviesData, comedyMoviesData] = await Promise.all([
            fetchFromTMDB(apiPaths.fetchTrending),
            fetchFromTMDB(apiPaths.fetchPopularMovies),
            fetchFromTMDB(apiPaths.fetchMoviesList(28)),
            fetchFromTMDB(apiPaths.fetchTVList(18)),
            fetchFromTMDB(apiPaths.fetchMoviesList(27)),
            fetchFromTMDB(apiPaths.fetchMoviesList(35)),
          ]);
          
          if (trendingData && typeof trendingData === 'object' && 'results' in trendingData) {
            setTrendingContent((trendingData.results || []) as Movie[]);
          }
          if (newReleasesData && typeof newReleasesData === 'object' && 'results' in newReleasesData) {
            setNewReleases((newReleasesData.results || []) as Movie[]);
          }
          if (popularMoviesData && typeof popularMoviesData === 'object' && 'results' in popularMoviesData) {
            setPopularMovies((popularMoviesData.results || []) as Movie[]);
          }
          if (topRatedShowsData && typeof topRatedShowsData === 'object' && 'results' in topRatedShowsData) {
            setTopRatedShows((topRatedShowsData.results || []) as Movie[]);
          }
          if (horrorMoviesData && typeof horrorMoviesData === 'object' && 'results' in horrorMoviesData) {
            setHorrorMovies((horrorMoviesData.results || []) as Movie[]);
          }
          if (comedyMoviesData && typeof comedyMoviesData === 'object' && 'results' in comedyMoviesData) {
            setComedyMovies((comedyMoviesData.results || []) as Movie[]);
          }
        }
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [searchQueryFromState, categoryFromParams, genreFromParams]);

  const loadMoreContent = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    
    try {
      let url;
      
      if (categoryFromParams === 'new') {
        url = `${apiPaths.fetchPopularMovies}&page=${nextPage}`;
      } else if (categoryFromParams === 'movie') {
        url = `${apiPaths.fetchPopularMovies}&page=${nextPage}`;
      } else if (categoryFromParams === 'tv') {
        url = `${apiPaths.fetchPopularTV}&page=${nextPage}`;
      } else if (categoryFromParams === 'horror') {
        url = `${apiPaths.fetchMoviesList(27)}&page=${nextPage}`;
      } else if (categoryFromParams === 'comedy') {
        url = `${apiPaths.fetchMoviesList(35)}&page=${nextPage}`;
      } else if (genreFromParams) {
        url = `${categoryFromParams === 'movie' ? apiPaths.fetchMoviesList(parseInt(genreFromParams)) : apiPaths.fetchTVList(parseInt(genreFromParams))}&page=${nextPage}`;
      } else {
        url = `${apiPaths.fetchTrending}&page=${nextPage}`;
      }
      
      const data = await fetchFromTMDB(url);
      
      if (data && typeof data === 'object' && 'results' in data) {
        const newResults = data.results || [];
        
        if (newResults.length === 0) {
          setHasMore(false);
          toast({
            title: "No more results",
            description: "You've reached the end of the list",
          });
        } else {
          setViewAllContent(prevContent => [...prevContent, ...newResults as Movie[]]);
          setCurrentPage(nextPage);
        }
      } else {
        setHasMore(false);
        toast({
          title: "No more results",
          description: "You've reached the end of the list",
        });
      }
    } catch (error) {
      console.error("Error loading more content:", error);
      toast({
        title: "Error loading content",
        description: "There was a problem loading more content",
        variant: "destructive"
      });
    } finally {
      setLoadingMore(false);
    }
  };

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setShouldPlayMovie(false);
  };

  const handleHeroWatchNow = (movie: any) => {
    // When "Play Trailer" is clicked in hero section, show movie and auto-play trailer
    setSelectedMovie(movie as Movie);
    setShouldPlayMovie(true);
  };

  const handleHeroMoreInfo = (movie: any) => {
    // When "More Info" is clicked in hero section, show movie details
    setSelectedMovie(movie as Movie);
    setShouldPlayMovie(false);
  };

  const clearSearchAndFilters = () => {
    navigate('/', { replace: true });
    setIsSearching(false);
    setViewingCategory(null);
  };

  const handleViewAll = (categoryId: string) => {
    navigate(`/?category=${categoryId}`);
  };

  const getCategoryDisplayName = () => {
    if (searchQueryFromState) {
      return `Search Results for "${searchQueryFromState}"`;
    }
    
    if (categoryFromParams === 'new') {
      return 'New Releases';
    }
    
    if (categoryFromParams === 'horror') {
      return 'Horror Movies';
    }
    
    if (categoryFromParams === 'comedy') {
      return 'Comedy Movies';
    }
    
    if (categoryFromParams && genreFromParams) {
      const genreName = genreFromParams;
      return `${categoryFromParams === 'movie' ? 'Movies' : 'TV Shows'} - ${genreName}`;
    }
    
    if (categoryFromParams) {
      return categoryFromParams === 'movie' ? 'Movies' : 
             categoryFromParams === 'tv' ? 'TV Shows' : 
             'Trending Content';
    }
    
    return '';
  };

  const handleMoviePlayerClose = () => {
    setSelectedMovie(null);
    setShouldPlayMovie(false);
  };

  return (
    <div className="min-h-screen bg-hype-dark text-foreground overflow-x-hidden w-full">
      <Navbar />
      <main className="pb-8 pt-16 w-full">
        {!isSearching && (
          <HeroSection 
            onWatchNow={handleHeroWatchNow}
            onMoreInfo={handleHeroMoreInfo}
          />
        )}
        
        <div className="container mx-auto px-4 mt-4">
          {isSearching ? (
            <div className="my-8">
              <div className="flex items-center mb-6">
                <Button
                  variant="ghost"
                  onClick={clearSearchAndFilters}
                  className="mr-2"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                </Button>
                <h2 className="text-2xl font-bold">
                  {getCategoryDisplayName()}
                </h2>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hype-purple"></div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 px-1">
                    {(searchQueryFromState ? searchResults : viewAllContent).map((item) => (
                      <MovieCard
                        key={item.id}
                        id={item.id}
                        title={item.title || item.name || 'Unknown Title'}
                        posterPath={item.poster_path}
                        releaseDate={item.release_date || item.first_air_date}
                        voteAverage={item.vote_average}
                        isTVShow={item.media_type === 'tv' || !!item.first_air_date}
                        runtime={item.runtime}
                        numberOfSeasons={item.number_of_seasons}
                        onClick={() => handleMovieClick(item)}
                      />
                    ))}
                  </div>
                  
                  {hasMore && (
                    <div className="mt-8 text-center">
                      <Button 
                        onClick={loadMoreContent} 
                        disabled={loadingMore}
                        className="bg-hype-purple hover:bg-hype-purple/90"
                      >
                        {loadingMore ? (
                          <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white rounded-full mr-2"></div>
                        ) : (
                          <ArrowDown className="mr-2 h-4 w-4" />
                        )}
                        Load More
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <>
              {!loading && (
                <div className="space-y-6 px-0 sm:px-0">
                  <ContentSlider title="Trending Now" items={trendingContent} onViewAll={() => handleViewAll('trending')} />
                  <ContentSlider title="New Releases" items={newReleases} onViewAll={() => handleViewAll('new')} />
                  <ContentSlider title="Popular Movies" items={popularMovies} onViewAll={() => handleViewAll('movie')} />
                  <ContentSlider title="Top Rated Shows" items={topRatedShows} onViewAll={() => handleViewAll('tv')} />
                  <ContentSlider title="Horror Movies" items={horrorMovies} onViewAll={() => handleViewAll('horror')} />
                  <ContentSlider title="Comedy Movies" items={comedyMovies} onViewAll={() => handleViewAll('comedy')} />
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />

      {selectedMovie && (
        <MoviePlayer 
          movie={selectedMovie} 
          onClose={handleMoviePlayerClose} 
          autoPlayTrailer={shouldPlayMovie}
        />
      )}
    </div>
  );
};

export default Index;
