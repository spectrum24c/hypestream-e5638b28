
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
    <>
      <form onSubmit={handleSearch} className={`${isOpen ? 'flex absolute left-0 right-0 mx-auto top-16 w-[90%] md:static md:w-auto md:mx-0' : 'hidden'} md:flex items-center relative z-20 ${className}`}>
        <input
          type="text"
          placeholder="Search titles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-muted rounded-full py-2 px-4 pr-10 text-sm border border-border w-full min-w-[300px] focus:border-hype-purple focus:outline-none"
        />
        <button type="submit" className="absolute right-3">
          <Search className="h-4 w-4 text-muted-foreground" />
        </button>
      </form>

      {onToggle && (
        <button
          onClick={onToggle}
          className="md:hidden p-2 text-muted-foreground hover:text-foreground"
        >
          <Search className="h-5 w-5" />
        </button>
      )}
    </>
  );
};

export default SearchBar;
