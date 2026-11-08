import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import MovieCard from './MovieCard';
import MoviePlayer from './MoviePlayer';
import { useNavigate } from 'react-router-dom';
import { Movie } from '@/types/movie';

interface ContentSliderProps {
  title: string;
  items: Movie[];
  onViewAll?: () => void;
}

const ContentSlider: React.FC<ContentSliderProps> = ({
  title,
  items,
  onViewAll
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const navigate = useNavigate();

  const scroll = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    const { current } = sliderRef;
    const isMobile = window.innerWidth < 640;
    const scrollAmount = isMobile ? current.clientWidth : current.clientWidth * 0.75;
    if (direction === 'left') {
      current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
    setTimeout(() => {
      if (current.scrollLeft > 20) {
        setShowLeftArrow(true);
      } else {
        setShowLeftArrow(false);
      }
    }, 400);
  };

  const handleMovieClick = (movie: Movie) => setSelectedMovie(movie);
  
  const checkIfNewSeason = (movie: Movie): boolean => {
    if (movie.media_type !== 'tv' && !movie.first_air_date) return false;
    const releaseDate = movie.first_air_date || movie.release_date;
    if (!releaseDate) return false;
    const releaseYear = new Date(releaseDate).getFullYear();
    const currentYear = new Date().getFullYear();
    return currentYear - releaseYear <= 1;
  };
  
  const getLatestSeasonYear = (movie: Movie): string | undefined => {
    if (movie.media_type !== 'tv' && !movie.first_air_date) return undefined;
    const releaseDate = movie.first_air_date || movie.release_date;
    if (!releaseDate) return undefined;
    return new Date(releaseDate).getFullYear().toString();
  };
  
  // A rail that fits entirely should not offer a dead right arrow
  useEffect(() => {
    const update = () => {
      const el = sliderRef.current;
      if (!el) return;
      setShowRightArrow(el.scrollWidth > el.clientWidth + 20);
      setShowLeftArrow(el.scrollLeft > 20);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [items.length]);

  const closeMoviePlayer = () => setSelectedMovie(null);

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      const category = title.toLowerCase().includes('movie') ? 'movie' : title.toLowerCase().includes('show') || title.toLowerCase().includes('tv') ? 'tv' : title.toLowerCase().includes('horror') ? 'horror' : title.toLowerCase().includes('comedy') ? 'comedy' : title.toLowerCase().includes('new') ? 'new' : 'trending';
      navigate(`/?category=${category}`);
    }
  };

  return (
    <div className="py-3">
      <div className="container mx-auto flex items-end justify-between gap-4 mb-3">
        <h2 className="rail-title">{title}</h2>
        <button type="button" onClick={handleViewAll} className="rail-more">
          View all
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="container mx-auto relative group rail">
        {showLeftArrow && (
          <button onClick={() => scroll('left')} className="rail-arrow rail-arrow--left" aria-label="Scroll left">
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>
        )}

        <div ref={sliderRef} className={`netflix-row flex space-x-2 overflow-x-auto pb-4 hide-scrollbar md:snap-x md:snap-mandatory ${hoveredId ? 'has-hovered-card' : ''}`} onScroll={() => {
          const el = sliderRef.current;
          if (!el) return;
          setShowLeftArrow(el.scrollLeft > 20);
          setShowRightArrow(el.scrollLeft + el.clientWidth < el.scrollWidth - 20);
        }}>
          {items.map(item => (
            <div
              key={item.id}
              className={`md:snap-start shrink-0 basis-[calc(50%-0.25rem)] sm:basis-auto transition-opacity duration-300 ${hoveredId === item.id ? 'is-hovered-card' : ''}`}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(prev => (prev === item.id ? null : prev))}
            >
              <MovieCard
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
                isNewSeason={checkIfNewSeason(item)}
                latestSeasonYear={getLatestSeasonYear(item)}
              />
            </div>
          ))}
        </div>

        {showRightArrow && (
          <button onClick={() => scroll('right')} className="rail-arrow rail-arrow--right" aria-label="Scroll right">
            <ChevronRight className="h-5 w-5 text-foreground" />
          </button>
        )}
      </div>

      {selectedMovie && <MoviePlayer movie={selectedMovie} onClose={closeMoviePlayer} />}
    </div>
  );
};

export default ContentSlider;