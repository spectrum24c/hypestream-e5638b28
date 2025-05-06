
import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiPaths, fetchFromTMDB } from '@/services/tmdbApi';
import { Movie } from '@/types/movie';

interface SearchBarProps {
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
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
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current && 
        !searchRef.current.contains(event.target as Node) && 
        resultsRef.current && 
        !resultsRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const data = await fetchFromTMDB(apiPaths.searchMulti(searchQuery));
        if (data && typeof data === 'object' && 'results' in data) {
          const results = (data.results || []) as Movie[];
          setSearchResults(results.slice(0, 5)); // Limit to 5 results for dropdown
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
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/', { state: { searchQuery: searchQuery.trim() } });
      setSearchQuery('');
      if (onToggle) onToggle();
      setIsMobileSearchOpen(false);
      setShowResults(false);
    }
  };

  const handleResultClick = (query: string) => {
    navigate('/', { state: { searchQuery: query } });
    setSearchQuery('');
    setShowResults(false);
    if (onToggle) onToggle();
    setIsMobileSearchOpen(false);
  };

  const toggleMobileSearch = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
  };

  return (
    <div className={`flex items-center ${className}`} ref={searchRef}>
      {/* Mobile-specific styling */}
      {isMobileSearchOpen && (
        <div className="md:hidden fixed left-1/2 transform -translate-x-1/2 top-16 w-[90%] max-w-[300px] bg-card rounded-md p-3 z-50 mt-2 border border-border">
          <form 
            onSubmit={handleSearch} 
            className="flex items-center relative"
          >
            <input
              type="text"
              placeholder="Search movies & TV shows..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              className="bg-background/20 text-white rounded-md py-2 px-4 pr-10 text-sm border border-border w-full focus:outline-none focus:border-hype-purple"
              autoComplete="off"
            />
            <button type="submit" className="absolute right-3">
              <Search className="h-4 w-4 text-muted-foreground" />
            </button>
          </form>
          
          {showResults && searchResults.length > 0 && (
            <div 
              className="absolute left-0 right-0 bg-card mt-1 border border-border rounded-md shadow-lg overflow-hidden z-50 max-h-[60vh] overflow-y-auto"
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
        </div>
      )}

      {/* Desktop and default view */}
      <form 
        onSubmit={handleSearch} 
        className={`${isOpen ? 'hidden md:flex' : 'hidden'} items-center relative`}
      >
        <input
          type="text"
          placeholder="Search movies & TV shows..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          className="bg-card text-white rounded-full py-1.5 px-4 pr-10 text-sm border border-border w-full md:w-[200px] focus:w-[280px] transition-all duration-300 focus:outline-none focus:border-hype-purple"
          autoComplete="off"
        />
        <button type="submit" className="absolute right-3">
          <Search className="h-4 w-4 text-muted-foreground" />
        </button>
        
        {showResults && searchResults.length > 0 && (
          <div 
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-md shadow-lg overflow-hidden z-50 w-[300px]"
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

      <button
        onClick={toggleMobileSearch}
        className="md:hidden p-2 text-muted-foreground hover:text-foreground"
        aria-label="Toggle search"
      >
        <Search className="h-5 w-5" />
      </button>
    </div>
  );
};

export default SearchBar;
