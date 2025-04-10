
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
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/', { state: { searchQuery: searchQuery.trim() } });
      setSearchQuery('');
      if (onToggle) onToggle();
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      <form 
        onSubmit={handleSearch} 
        className={`${isOpen ? 'flex' : 'hidden md:flex'} items-center relative`}
      >
        <input
          type="text"
          placeholder="Search movies & TV shows..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-hype-dark-light/950 rounded-full py-1.5 px-4 pr-10 text-sm border border-border w-full md:w-[200px] focus:w-[280px] transition-all duration-300 focus:border-hype-purple focus:outline-none"
          autoComplete="off"
        />
        <button type="submit" className="absolute right-3">
          <Search className="h-4 w-4 text-muted-foreground" />
        </button>
      </form>

      {onToggle && (
        <button
          onClick={onToggle}
          className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          aria-label="Toggle search"
        >
          <Search className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
