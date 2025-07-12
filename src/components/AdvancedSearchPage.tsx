import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import AdvancedFilters from '@/components/AdvancedFilters';
import MovieCard from '@/components/MovieCard';
import { searchWithFilters, fetchGenres, DiscoverFilters, Genre } from '@/services/tmdbApi';
import { Movie } from '@/types/movie';

interface FilterOptions {
  years: [number, number];
  ratings: [number, number];
  genres: number[];
}

const AdvancedSearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaType, setMediaType] = useState<'both' | 'movie' | 'tv'>('both');
  const [results, setResults] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    years: [1990, new Date().getFullYear()],
    ratings: [0, 10],
    genres: []
  });

  useEffect(() => {
    const loadGenres = async () => {
      try {
        const [movieGenres, tvGenres] = await Promise.all([
          fetchGenres('movie'),
          fetchGenres('tv')
        ]);
        
        // Combine and deduplicate genres
        const allGenres = [...movieGenres, ...tvGenres];
        const uniqueGenres = allGenres.filter((genre, index, self) => 
          self.findIndex(g => g.id === genre.id) === index
        );
        
        setGenres(uniqueGenres);
      } catch (error) {
        console.error('Error loading genres:', error);
      }
    };

    loadGenres();
  }, []);

  const performSearch = async () => {
    try {
      setLoading(true);
      
      const filters: DiscoverFilters & { mediaType?: 'movie' | 'tv' | 'both' } = {
        mediaType,
        genres: activeFilters.genres.length > 0 ? activeFilters.genres : undefined,
        vote_average_gte: activeFilters.ratings[0],
        vote_average_lte: activeFilters.ratings[1],
        release_date_gte: `${activeFilters.years[0]}-01-01`,
        release_date_lte: `${activeFilters.years[1]}-12-31`,
        first_air_date_gte: `${activeFilters.years[0]}-01-01`,
        first_air_date_lte: `${activeFilters.years[1]}-12-31`,
      };

      const searchResults = await searchWithFilters(searchQuery, filters);
      setResults(searchResults);
    } catch (error) {
      console.error('Error performing search:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (filters: FilterOptions) => {
    setActiveFilters(filters);
    performSearch();
  };

  const handleClearFilters = () => {
    const defaultFilters: FilterOptions = {
      years: [1990, new Date().getFullYear()],
      ratings: [0, 10],
      genres: []
    };
    setActiveFilters(defaultFilters);
    performSearch();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  // Auto-search when filters change
  useEffect(() => {
    if (searchQuery || activeFilters.genres.length > 0) {
      const timeoutId = setTimeout(() => {
        performSearch();
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, mediaType, activeFilters]);

  const hasActiveFilters = () => {
    const currentYear = new Date().getFullYear();
    return (
      activeFilters.years[0] !== 1990 ||
      activeFilters.years[1] !== currentYear ||
      activeFilters.ratings[0] !== 0 ||
      activeFilters.ratings[1] !== 10 ||
      activeFilters.genres.length > 0
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-border/20">
        <h1 className="text-2xl font-bold mb-6">Advanced Search</h1>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search for movies, TV shows, or people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={mediaType} onValueChange={(value: 'both' | 'movie' | 'tv') => setMediaType(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="both">All</SelectItem>
                <SelectItem value="movie">Movies</SelectItem>
                <SelectItem value="tv">TV Shows</SelectItem>
              </SelectContent>
            </Select>
            
            <Button type="submit" disabled={loading}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>

        {/* Advanced Filters */}
        <div className="mt-6">
          <AdvancedFilters
            genres={genres}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            activeFilters={activeFilters}
          />
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {loading ? 'Searching...' : `Search Results (${results.length})`}
          </h2>
          
          {hasActiveFilters() && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear all filters
            </Button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[2/3] bg-muted rounded-lg mb-2"></div>
                <div className="h-4 bg-muted rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {results.map((movie) => (
              <MovieCard
                key={`${movie.id}-${movie.media_type}`}
                id={movie.id}
                title={movie.title || movie.name || 'Untitled'}
                posterPath={movie.poster_path}
                releaseDate={movie.release_date || movie.first_air_date}
                voteAverage={movie.vote_average}
                isTVShow={movie.media_type === 'tv'}
                runtime={movie.runtime}
                numberOfSeasons={movie.number_of_seasons}
                genreIds={movie.genre_ids}
                overview={movie.overview}
                onClick={() => {}}
              />
            ))}
          </div>
        ) : searchQuery || hasActiveFilters() ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground text-center">
                Try adjusting your search query or filters to find what you're looking for.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Filter className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Start your search</h3>
              <p className="text-muted-foreground text-center">
                Enter a search term or apply filters to discover movies and TV shows.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdvancedSearchPage;