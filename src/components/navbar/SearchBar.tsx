import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/', { state: { searchQuery: searchQuery.trim() } });
      setSearchQuery('');
      if (onToggle) onToggle();
      setIsMobileSearchOpen(false); // Close mobile search after submitting
    }
  };

  const toggleMobileSearch = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
  };

  return (
    <div className={`flex items-center ${className}`}>
      {/* Mobile-specific styling */}
      {isMobileSearchOpen && (
        <div className="md:hidden absolute top-20 left-1/2 transform -translate-x-1/2 w-[300px] bg-[#1F2937] rounded-full p-3 z-50 mt-4">
          <form 
            onSubmit={handleSearch} 
            className="flex items-center relative"
          >
            <input
              type="text"
              placeholder="Search movies & TV shows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#1F2937] text-white rounded-full py-1.5 px-4 pr-10 text-sm border border-border w-full focus:outline-none"
              autoComplete="off"
            />
            <button type="submit" className="absolute right-3">
              <Search className="h-4 w-4 text-muted-foreground" />
            </button>
          </form>
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
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-[#1F2937] text-white rounded-full py-1.5 px-4 pr-10 text-sm border border-border w-full md:w-[200px] focus:w-[280px] transition-all duration-300 focus:outline-none"
          autoComplete="off"
        />
        <button type="submit" className="absolute right-3">
          <Search className="h-4 w-4 text-muted-foreground" />
        </button>
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
