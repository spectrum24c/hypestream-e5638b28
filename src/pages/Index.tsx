import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import ContentSlider from '@/components/ContentSlider';
import CategorySection from '@/components/CategorySection';
import Footer from '@/components/Footer';
import { apiPaths, fetchFromTMDB, searchContent, fetchContentByCategory } from '@/services/tmdbApi';
import { supabase } from '@/integrations/supabase/client';
import MovieCard from '@/components/MovieCard';

interface Movie {
  id: string;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  media_type?: string;
}

const Index = () => {
  const [trendingContent, setTrendingContent] = useState<Movie[]>([]);
  const [newReleases, setNewReleases] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [topRatedShows, setTopRatedShows] = useState<Movie[]>([]);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const searchQueryFromState = location.state?.searchQuery || '';
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
    const fetchMovieData = async () => {
      setLoading(true);
      try {
        if (searchQueryFromState) {
          const data = await searchContent(searchQueryFromState);
          setSearchResults(data.results || []);
          setIsSearching(true);
        } 
        else if (categoryFromParams && genreFromParams) {
          const data = await fetchContentByCategory(
            categoryFromParams, 
            parseInt(genreFromParams)
          );
          setSearchResults(data);
          setIsSearching(true);
        }
        else {
          setIsSearching(false);
          const [trendingData, newReleasesData, popularMoviesData, topRatedShowsData] = await Promise.all([
            fetchFromTMDB(apiPaths.fetchTrending),
            fetchFromTMDB(apiPaths.fetchPopularMovies),
            fetchFromTMDB(apiPaths.fetchMoviesList(28)),
            fetchFromTMDB(apiPaths.fetchTVList(18)),
          ]);
          
          setTrendingContent(trendingData.results || []);
          setNewReleases(newReleasesData.results || []);
          setPopularMovies(popularMoviesData.results || []);
          setTopRatedShows(topRatedShowsData.results || []);
        }
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [searchQueryFromState, categoryFromParams, genreFromParams]);

  const handleMovieClick = (movie: Movie) => {
    console.log("Movie clicked:", movie);
  };

  return (
    <div className="min-h-screen bg-hype-dark text-foreground">
      <Navbar />
      <main className="pb-8 pt-16">
        {!isSearching && <HeroSection />}
        
        <div className="container mx-auto px-4 mt-8">
          {isSearching ? (
            <div className="my-8">
              <h2 className="text-2xl font-bold mb-6">
                {categoryFromParams && genreFromParams 
                  ? `${categoryFromParams === 'movie' ? 'Movies' : 'TV Shows'} - ${genreFromParams}` 
                  : `Search Results for "${searchQueryFromState}"`}
              </h2>
              
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hype-purple"></div>
                </div>
              ) : searchResults.length === 0 ? (
                <p className="text-center text-muted-foreground py-10">No results found</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {searchResults.map((item) => (
                    <MovieCard
                      key={item.id}
                      id={item.id}
                      title={item.title || item.name || 'Unknown Title'}
                      posterPath={item.poster_path}
                      releaseDate={item.release_date || item.first_air_date}
                      voteAverage={item.vote_average}
                      isTVShow={item.media_type === 'tv' || !!item.first_air_date}
                      onClick={() => handleMovieClick(item)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              <CategorySection />
              
              {!loading && (
                <>
                  <ContentSlider title="Trending Now" items={trendingContent} />
                  <ContentSlider title="New Releases" items={newReleases} />
                  <ContentSlider title="Popular Movies" items={popularMovies} />
                  <ContentSlider title="Top Rated Shows" items={topRatedShows} />
                </>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
