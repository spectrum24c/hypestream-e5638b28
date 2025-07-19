
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiPaths, fetchFromTMDB, searchWithFilters, fetchGenres, DiscoverFilters, Genre } from '@/services/tmdbApi';
import { Movie } from '@/types/movie';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
}

interface SearchFilters {
  genres: number[];
  yearRange: [number, number];
  ratingRange: [number, number];
  mediaType: 'all' | 'movie' | 'tv';
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  isOpen = true, 
  onToggle,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    genres: [],
    yearRange: [1990, new Date().getFullYear()],
    ratingRange: [0, 10],
    mediaType: 'all'
  });
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current && 
        !searchRef.current.contains(event.target as Node) && 
        resultsRef.current && 
        !resultsRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
        if (isMobileSearchOpen && searchQuery === '') {
          setIsMobileSearchOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileSearchOpen, searchQuery]);

  useEffect(() => {
    if (isMobileSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isMobileSearchOpen]);

  // Load genres on component mount
  useEffect(() => {
    const loadGenres = async () => {
      try {
        const [movieGenres, tvGenres] = await Promise.all([
          fetchGenres('movie'),
          fetchGenres('tv')
        ]);
        
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

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        // Check if we have active filters
        const hasFilters = filters.genres.length > 0 || 
                          filters.yearRange[0] !== 1990 || 
                          filters.yearRange[1] !== new Date().getFullYear() ||
                          filters.ratingRange[0] !== 0 || 
                          filters.ratingRange[1] !== 10 ||
                          filters.mediaType !== 'all';

        if (hasFilters) {
          // Use advanced search with filters
          const searchFilters: DiscoverFilters & { mediaType?: 'movie' | 'tv' | 'both' } = {
            mediaType: filters.mediaType === 'all' ? 'both' : filters.mediaType,
            genres: filters.genres.length > 0 ? filters.genres : undefined,
            vote_average_gte: filters.ratingRange[0],
            vote_average_lte: filters.ratingRange[1],
            release_date_gte: `${filters.yearRange[0]}-01-01`,
            release_date_lte: `${filters.yearRange[1]}-12-31`,
            first_air_date_gte: `${filters.yearRange[0]}-01-01`,
            first_air_date_lte: `${filters.yearRange[1]}-12-31`,
          };
          
          const results = await searchWithFilters(searchQuery, searchFilters);
          setSearchResults(results.slice(0, 5));
        } else {
          // Use regular search
          const data = await fetchFromTMDB(apiPaths.searchMulti(searchQuery));
          if (data && typeof data === 'object' && 'results' in data) {
            const results = (data.results || []) as Movie[];
            setSearchResults(results.slice(0, 5));
          }
        }
      } catch (error) {
        console.error("Error searching:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchSearchResults();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, filters]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/', { state: { searchQuery: searchQuery.trim(), filters } });
      setSearchQuery('');
      if (onToggle) onToggle();
      setIsMobileSearchOpen(false);
      setShowResults(false);
      setShowFilters(false);
    }
  };

  const handleResultClick = (query: string) => {
    navigate('/', { state: { searchQuery: query, filters } });
    setSearchQuery('');
    setShowResults(false);
    setShowFilters(false);
    if (onToggle) onToggle();
    setIsMobileSearchOpen(false);
  };

  const clearFilters = () => {
    setFilters({
      genres: [],
      yearRange: [1990, new Date().getFullYear()],
      ratingRange: [0, 10],
      mediaType: 'all'
    });
  };

  const hasActiveFilters = () => {
    return filters.genres.length > 0 || 
           filters.yearRange[0] !== 1990 || 
           filters.yearRange[1] !== new Date().getFullYear() ||
           filters.ratingRange[0] !== 0 || 
           filters.ratingRange[1] !== 10 ||
           filters.mediaType !== 'all';
  };

  const toggleMobileSearch = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
    setSearchQuery('');
  };

  const closeMobileSearch = () => {
    setIsMobileSearchOpen(false);
    setSearchQuery('');
    setShowResults(false);
  };

  return (
    <div className={`flex items-center ${className}`} ref={searchRef}>
      {/* Mobile search overlay */}
      {isMobileSearchOpen && (
        <div className="md:hidden fixed inset-0 bg-black/80 z-50 pt-16 px-4 flex flex-col">
          <div className="relative w-full">
            <form 
              onSubmit={handleSearch} 
              className="flex items-center w-full"
            >
              <div className="relative w-full">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  <Search size={18} />
                </div>
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Search movies & TV shows..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowResults(true);
                  }}
                  className="bg-card/90 backdrop-blur-sm text-white pl-10 pr-10 py-6 rounded-full border-hype-purple/40 w-full focus:border-hype-purple"
                  autoComplete="off"
                />
                {searchQuery && (
                  <button 
                    type="button" 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                    onClick={() => setSearchQuery('')}
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
              <button type="submit" className="hidden">Search</button>
            </form>
            
            <button 
              className="absolute top-[-48px] right-0 text-white"
              onClick={closeMobileSearch}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Mobile search results */}
          {showResults && (
            <div className="mt-4 overflow-y-auto flex-1" ref={resultsRef}>
              {isSearching ? (
                <div className="py-6 text-center text-sm text-muted-foreground animate-pulse">
                  Searching...
                </div>
              ) : searchResults.length > 0 ? (
                <div className="bg-card/80 backdrop-blur-sm rounded-lg border border-border/40 overflow-hidden">
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="flex items-center p-3 hover:bg-muted/20 border-b border-border/20 last:border-b-0 cursor-pointer"
                      onClick={() => handleResultClick(result.title || result.name || '')}
                    >
                      <div className="w-12 h-16 overflow-hidden rounded-md mr-3 flex-shrink-0">
                        {result.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w92${result.poster_path}`}
                            alt={result.title || result.name || 'Movie poster'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted/30 flex items-center justify-center">
                            <span className="text-xs">No image</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-base truncate text-left">
                          {result.title || result.name || 'Untitled'}
                        </p>
                        <p className="text-xs text-muted-foreground text-left">
                          {result.media_type === 'tv' ? 'TV Show' : 'Movie'} • {' '}
                          {result.release_date?.split('-')[0] || 
                          result.first_air_date?.split('-')[0] || 'N/A'}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-border/30 p-3">
                    <Button 
                      variant="ghost"
                      className="w-full text-center py-2 text-sm text-hype-purple hover:text-hype-purple/70 hover:bg-white/10"
                      onClick={() => handleResultClick(searchQuery)}
                    >
                      See all results for "{searchQuery}"
                    </Button>
                  </div>
                </div>
              ) : searchQuery.length >= 2 ? (
                <div className="py-6 text-center bg-card/80 backdrop-blur-sm rounded-lg">
                  <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}

      {/* Desktop and default view */}
      <form 
        onSubmit={handleSearch} 
        className={`${isOpen ? 'hidden md:flex' : 'hidden'} items-center relative`}
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Search movies & TV shows..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              className={cn(
                "bg-card/80 text-white rounded-full py-1.5 pl-9 pr-4 text-sm",
                "border border-border/40 hover:border-hype-purple/30",
                "w-full md:w-[200px] focus:w-[280px] transition-all duration-300",
                "focus:outline-none focus:border-hype-purple"
              )}
              autoComplete="off"
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          
          {/* Filter Button */}
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "rounded-full p-2 h-8 w-8",
                  hasActiveFilters() && "bg-hype-purple/20 text-hype-purple"
                )}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Search Filters</h4>
                  {hasActiveFilters() && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear all
                    </Button>
                  )}
                </div>
                
                {/* Media Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Select value={filters.mediaType} onValueChange={(value: 'all' | 'movie' | 'tv') => 
                    setFilters(prev => ({ ...prev, mediaType: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="movie">Movies</SelectItem>
                      <SelectItem value="tv">TV Shows</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Genres */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Genres</label>
                  <div className="flex flex-wrap gap-1">
                    {genres.slice(0, 8).map((genre) => (
                      <Badge
                        key={genre.id}
                        variant={filters.genres.includes(genre.id) ? "default" : "outline"}
                        className="cursor-pointer text-xs"
                        onClick={() => {
                          setFilters(prev => ({
                            ...prev,
                            genres: prev.genres.includes(genre.id)
                              ? prev.genres.filter(g => g !== genre.id)
                              : [...prev.genres, genre.id]
                          }));
                        }}
                      >
                        {genre.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Year Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Year: {filters.yearRange[0]} - {filters.yearRange[1]}
                  </label>
                  <Slider
                    value={filters.yearRange}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, yearRange: value as [number, number] }))}
                    min={1900}
                    max={new Date().getFullYear()}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Rating Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Rating: {filters.ratingRange[0]} - {filters.ratingRange[1]}
                  </label>
                  <Slider
                    value={filters.ratingRange}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, ratingRange: value as [number, number] }))}
                    min={0}
                    max={10}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        {showResults && searchResults.length > 0 && (
          <div 
            className="absolute top-full left-0 right-0 mt-2 bg-card/90 backdrop-blur-sm border border-border/50 rounded-md shadow-lg overflow-hidden z-50 w-[300px]"
            ref={resultsRef}
          >
            <div className="p-2">
              {isSearching ? (
                <div className="py-3 text-center text-sm text-muted-foreground">
                  Searching...
                </div>
              ) : (
                searchResults.map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center p-2 hover:bg-muted/20 rounded cursor-pointer"
                    onClick={() => handleResultClick(result.title || result.name || '')}
                  >
                    <div className="w-8 h-12 overflow-hidden rounded mr-2 flex-shrink-0">
                      {result.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${result.poster_path}`}
                          alt={result.title || result.name || 'Movie poster'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <span className="text-xs">No image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {result.title || result.name || 'Untitled'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {result.media_type === 'tv' ? 'TV Show' : 'Movie'} • 
                        {result.release_date?.split('-')[0] || 
                         result.first_air_date?.split('-')[0] || 'N/A'}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div className="border-t border-border mt-1 pt-2">
                 <button 
                   className="w-full text-center py-2 text-sm text-hype-purple hover:underline"
                   onClick={() => handleResultClick(searchQuery)}
                 >
                   See all results for "{searchQuery}"
                 </button>
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Mobile search button with enhanced styling */}
      <button
        onClick={toggleMobileSearch}
        className="md:hidden p-2 rounded-full hover:bg-card/50 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Search movies and shows"
      >
        <Search className="h-5 w-5" />
      </button>
    </div>
  );
};

export default SearchBar;
