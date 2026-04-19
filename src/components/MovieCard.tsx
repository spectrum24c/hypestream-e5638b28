import React, { useState, useEffect, useRef } from 'react';
import { getOptimizedImagePath, fetchTrailerKey } from '@/services/tmdbApi';

interface MovieCardProps {
  id: string;
  title: string;
  posterPath: string | null;
  releaseDate?: string | null;
  voteAverage?: number;
  isTVShow?: boolean;
  runtime?: number | null;
  numberOfSeasons?: number | null;
  genreIds?: number[];
  overview?: string | null;
  onClick: () => void;
  isNewSeason?: boolean;
  latestSeasonYear?: string;
}

// Module-level cache so we don't refetch trailers across cards/sessions
const trailerKeyCache = new Map<string, string | null>();

const MovieCard: React.FC<MovieCardProps> = ({
  id,
  title,
  posterPath,
  releaseDate,
  voteAverage,
  isTVShow = false,
  runtime,
  numberOfSeasons,
  genreIds = [],
  overview,
  onClick,
  isNewSeason = false,
  latestSeasonYear
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const prefetchedRef = useRef(false);

  const posterUrl = posterPath
    ? getOptimizedImagePath(posterPath, 'medium')
    : 'https://via.placeholder.com/300x450?text=No+Poster';

  const year = (isTVShow && latestSeasonYear) ? latestSeasonYear : (releaseDate?.split('-')[0] || 'N/A');
  const rating = voteAverage !== undefined ? voteAverage.toFixed(1) : 'N/A';

  let durationInfo = '';
  if (isTVShow) {
    durationInfo = numberOfSeasons ? `${numberOfSeasons} Season${numberOfSeasons !== 1 ? 's' : ''}` : '';
  } else {
    durationInfo = runtime ? `${runtime} min` : '';
  }

  // Detect desktop / non-touch + reduced motion preference
  const isDesktop = typeof window !== 'undefined'
    && window.matchMedia('(hover: hover) and (pointer: fine)').matches
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const cacheKey = `${isTVShow ? 'tv' : 'movie'}-${id}`;

  // Prefetch the trailer key as soon as the card is visible (so hover plays instantly)
  useEffect(() => {
    if (!isDesktop || prefetchedRef.current) return;
    if (trailerKeyCache.has(cacheKey)) {
      setTrailerKey(trailerKeyCache.get(cacheKey) ?? null);
      prefetchedRef.current = true;
      return;
    }
    if (!cardRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(async (entry) => {
          if (entry.isIntersecting && !prefetchedRef.current) {
            prefetchedRef.current = true;
            try {
              const key = await fetchTrailerKey(String(id), isTVShow);
              trailerKeyCache.set(cacheKey, key);
              setTrailerKey(key);
            } catch {
              trailerKeyCache.set(cacheKey, null);
            }
            observer.disconnect();
          }
        });
      },
      { rootMargin: '200px' }
    );
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [id, isTVShow, isDesktop, cacheKey]);

  const handleMouseEnter = () => {
    if (!isDesktop) return;
    if (trailerKey) {
      setShowTrailer(true);
      window.dispatchEvent(new CustomEvent('trailer-hover-start'));
    }
  };

  const handleMouseLeave = () => {
    if (!isDesktop) return;
    setShowTrailer(false);
    window.dispatchEvent(new CustomEvent('trailer-hover-end'));
  };

  const isExpanded = showTrailer && trailerKey;

  return (
    <div
      ref={cardRef}
      className={`group relative flex-shrink-0 w-[160px] sm:w-[176px] md:w-[198px] rounded-md cursor-pointer bg-card transition-all duration-300 ${
        isExpanded
          ? 'z-30 scale-[1.6] shadow-elevated origin-center'
          : 'hover:scale-105 hover:shadow-elevated hover:z-10 overflow-hidden'
      }`}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={`relative w-full bg-muted overflow-hidden transition-all duration-300 ${isExpanded ? 'aspect-video rounded-md' : 'aspect-[2/3]'}`}>
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-t-transparent border-primary rounded-full animate-spin"></div>
          </div>
        )}

        <img
          src={imageError ? '/placeholder.svg' : posterUrl}
          alt={title}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded && !isExpanded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          decoding="async"
        />

        {isExpanded && (
          <div className="absolute inset-0 z-20 overflow-hidden bg-background animate-fade-in pointer-events-none">
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=0&controls=0&modestbranding=1&playsinline=1&rel=0&loop=1&playlist=${trailerKey}&iv_load_policy=3&disablekb=1&fs=0&vq=hd1080&hd=1`}
              title={`${title} trailer preview`}
              allow="autoplay; encrypted-media"
              loading="lazy"
            />
          </div>
        )}

        {isNewSeason && !isExpanded && (
          <div className="absolute top-2 left-2 bg-primary px-2 py-1 rounded text-xs font-bold text-primary-foreground z-30">
            NEW SEASON
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
      </div>
      <div className={`p-2 md:p-3 transition-opacity duration-300 ${isExpanded ? 'opacity-0' : 'opacity-100'}`}>
        <h3 className="font-semibold text-xs md:text-sm mb-1 truncate text-foreground">{title}</h3>
        <div className="flex justify-between text-muted-foreground text-xs mb-1">
          <span>{year}</span>
          <span className="text-accent">★ {rating}</span>
        </div>
        <div className="text-muted-foreground text-xs mb-1">
          {durationInfo}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
