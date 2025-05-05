
import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';
import MoviePlayer from './MoviePlayer';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { Movie } from '@/types/movie';
import { useIsMobile } from '@/hooks/use-mobile';

interface ContentSliderProps {
  title: string;
  items: Movie[];
  onViewAll?: () => void;
}

const ContentSlider: React.FC<ContentSliderProps> = ({ title, items, onViewAll }) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const scroll = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    
    const { current } = sliderRef;
    const scrollAmount = current.clientWidth * (isMobile ? 0.9 : 0.75);
    
    if (direction === 'left') {
      current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }

    // Check if we need to show the left arrow after scrolling
    setTimeout(() => {
      if (current.scrollLeft > 20) {
        setShowLeftArrow(true);
      } else {
        setShowLeftArrow(false);
      }
    }, 400);
  };

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
  };

  const closeMoviePlayer = () => {
    setSelectedMovie(null);
  };

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      const category = title.toLowerCase().includes('movie') ? 'movie' : 
                      title.toLowerCase().includes('show') || title.toLowerCase().includes('tv') ? 'tv' : 
                      title.toLowerCase().includes('horror') ? 'horror' :
                      title.toLowerCase().includes('comedy') ? 'comedy' :
                      title.toLowerCase().includes('new') ? 'new' : 'trending';
      navigate(`/?category=${category}`);
    }
  };

  return (
    <div className={`py-1 ${isMobile ? 'mb-2' : 'mb-1'}`}>
      {/* Section Title */}
      <div className="flex items-center justify-between mb-1 px-2">
        <h2 className={`${isMobile ? 'text-lg' : 'text-xl md:text-2xl'} font-bold text-white`}>{title}</h2>
        <Button 
          variant="ghost" 
          onClick={handleViewAll} 
          className="text-sm text-hype-purple hover:text-hype-purple/80"
        >
          View All
        </Button>
      </div>

      {/* Carousel Container */}
      <div className="relative group">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className={`absolute left-0 top-1/2 z-10 -translate-y-1/2 bg-black/50 ${isMobile ? 'p-1' : 'p-2'} rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity`}
            aria-label="Scroll left"
          >
            <ChevronLeft className={`${isMobile ? 'h-4 w-4' : 'h-6 w-6'} text-white`} />
          </button>
        )}

        {/* Slider */}
        <div
          ref={sliderRef}
          className="flex space-x-2 overflow-x-auto pb-2 px-2 hide-scrollbar"
          onScroll={() => {
            if (sliderRef.current && sliderRef.current.scrollLeft > 20) {
              setShowLeftArrow(true);
            } else {
              setShowLeftArrow(false);
            }
          }}
        >
          {items.map((item) => (
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
              genreIds={item.genre_ids}
              onClick={() => handleMovieClick(item)}
              overview={item.overview}
            />
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className={`absolute right-0 top-1/2 z-10 -translate-y-1/2 bg-black/50 ${isMobile ? 'p-1' : 'p-2'} rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity`}
          aria-label="Scroll right"
        >
          <ChevronRight className={`${isMobile ? 'h-4 w-4' : 'h-6 w-6'} text-white`} />
        </button>
      </div>

      {/* Movie Player Modal */}
      {selectedMovie && (
        <MoviePlayer movie={selectedMovie} onClose={closeMoviePlayer} />
      )}
    </div>
  );
};

export default ContentSlider;
