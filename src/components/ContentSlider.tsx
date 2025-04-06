
import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';
import MoviePlayer from './MoviePlayer';
import { imgPath } from '@/services/tmdbApi';

// Movie item type
interface Movie {
  id: string;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  media_type?: string;
  overview?: string;
}

interface ContentSliderProps {
  title: string;
  items: Movie[];
}

const ContentSlider: React.FC<ContentSliderProps> = ({ title, items }) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    
    const { current } = sliderRef;
    const scrollAmount = current.clientWidth * 0.75;
    
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

  return (
    <div className="py-6 px-4 md:px-8">
      {/* Section Title */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
        <a href="#" className="text-sm text-hype-purple hover:text-hype-purple/80">
          View All
        </a>
      </div>

      {/* Carousel Container */}
      <div className="relative group">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 bg-black/50 p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
        )}

        {/* Slider */}
        <div
          ref={sliderRef}
          className="flex space-x-4 overflow-x-auto pb-4 hide-scrollbar"
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
              onClick={() => handleMovieClick(item)}
            />
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 bg-black/50 p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-6 w-6 text-white" />
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
