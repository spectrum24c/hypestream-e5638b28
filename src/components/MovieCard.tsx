import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Plus, Volume2, VolumeX, Info } from 'lucide-react';
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

const HOVER_INTENT_DELAY = 350; // ms — Netflix-style hover intent

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
  const [trailerLoaded, setTrailerLoaded] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [muted, setMuted] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);
  const prefetchedRef = useRef(false);
  const hoverTimerRef = useRef<number | null>(null);

  const posterUrl = posterPath
    ? getOptimizedImagePath(posterPath, 'medium')
    : 'https://via.placeholder.com/300x450?text=No+Poster';

  const year = (isTVShow && latestSeasonYear) ? latestSeasonYear : (releaseDate?.split('-')[0] || 'N/A');
  const rating = voteAverage !== undefined ? voteAverage.toFixed(1) : 'N/A';
  const matchPct = voteAverage !== undefined ? Math.round(voteAverage * 10) : null;

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

  // Prefetch trailer key when card enters viewport (lazy load video source)
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

  const clearHoverTimer = useCallback(() => {
    if (hoverTimerRef.current !== null) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  }, []);

  const triggerExpand = useCallback(() => {
    if (!isDesktop) return;
    clearHoverTimer();
    hoverTimerRef.current = window.setTimeout(() => {
      setShowTrailer(true);
      window.dispatchEvent(new CustomEvent('trailer-hover-start'));
    }, HOVER_INTENT_DELAY);
  }, [isDesktop, clearHoverTimer]);

  const collapse = useCallback(() => {
    if (!isDesktop) return;
    clearHoverTimer();
    setShowTrailer(false);
    setTrailerLoaded(false);
    setMuted(true);
    window.dispatchEvent(new CustomEvent('trailer-hover-end'));
  }, [isDesktop, clearHoverTimer]);

  // Cleanup timer on unmount
  useEffect(() => () => clearHoverTimer(), [clearHoverTimer]);

  const isExpanded = showTrailer && !!trailerKey;

  return (
    <div
      ref={cardRef}
      role="button"
      tabIndex={0}
      aria-label={`${title}${year !== 'N/A' ? `, ${year}` : ''}. Press Enter to view details.`}
      style={{
        transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }}
      className={`group relative flex-shrink-0 w-[160px] sm:w-[176px] md:w-[198px] cursor-pointer bg-card outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all duration-[400ms] ${
        isExpanded
          ? 'z-[999] origin-top rounded-lg'
          : 'rounded-md hover:z-10 overflow-hidden'
      }`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      onMouseEnter={triggerExpand}
      onMouseLeave={collapse}
      onFocus={triggerExpand}
      onBlur={collapse}
    >
      <div
        className={`relative w-full bg-muted overflow-hidden transition-all duration-[400ms] ${
          isExpanded ? 'aspect-video rounded-t-lg' : 'aspect-[2/3] rounded-md'
        }`}
        style={{
          boxShadow: isExpanded ? '0 20px 40px hsl(0 0% 0% / 0.6)' : undefined,
          transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      >
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-t-transparent border-primary rounded-full animate-spin"></div>
          </div>
        )}

        {/* Poster — fades out (crossfade) when trailer is ready, brightens slightly on hover */}
        <img
          src={imageError ? '/placeholder.svg' : posterUrl}
          alt={title}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
            imageLoaded && !(isExpanded && trailerLoaded) ? 'opacity-100' : 'opacity-0'
          } ${isExpanded ? 'brightness-110' : ''}`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          decoding="async"
        />

        {/* Trailer iframe — only mounted when expanded (lazy), unmounted on leave to truly pause */}
        {isExpanded && (
          <div className="absolute inset-0 z-20 overflow-hidden bg-background animate-fade-in">
            <iframe
              className={`absolute inset-0 w-full h-full transition-opacity duration-500 pointer-events-none ${trailerLoaded ? 'opacity-100' : 'opacity-0'}`}
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=${muted ? 1 : 0}&controls=0&modestbranding=1&playsinline=1&rel=0&loop=1&playlist=${trailerKey}&iv_load_policy=3&disablekb=1&fs=0&vq=hd1080&hd=1`}
              title={`${title} trailer preview`}
              allow="autoplay; encrypted-media"
              loading="lazy"
              onLoad={() => setTrailerLoaded(true)}
            />
          </div>
        )}

        {isNewSeason && !isExpanded && (
          <div className="absolute top-2 left-2 bg-primary px-2 py-1 rounded text-xs font-bold text-primary-foreground z-30">
            NEW SEASON
          </div>
        )}

        {/* Mute toggle — only when trailer is playing */}
        {isExpanded && trailerLoaded && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMuted((m) => !m);
            }}
            className="absolute top-2 right-2 z-30 w-8 h-8 rounded-full bg-background/70 backdrop-blur-sm border border-border flex items-center justify-center text-foreground hover:bg-background transition-colors"
            aria-label={muted ? 'Unmute trailer' : 'Mute trailer'}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
      </div>

      {/* Default metadata — hidden when expanded */}
      <div className={`p-2 md:p-3 transition-opacity duration-300 ${isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <h3 className="font-semibold text-xs md:text-sm mb-1 truncate text-foreground">{title}</h3>
        <div className="flex justify-between text-muted-foreground text-xs mb-1">
          <span>{year}</span>
          <span className="text-accent">★ {rating}</span>
        </div>
        <div className="text-muted-foreground text-xs mb-1">
          {durationInfo}
        </div>
      </div>

      {/* Expanded metadata + actions panel — slides up from bottom */}
      {isExpanded && (
        <div
          className="absolute left-0 right-0 top-[calc(56.25%)] bg-card rounded-b-lg p-3 z-20 animate-fade-in"
          style={{ boxShadow: '0 20px 40px hsl(0 0% 0% / 0.6)' }}
        >
          {/* Action buttons */}
          <div className="flex items-center gap-2 mb-2">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClick(); }}
              className="w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center hover:bg-foreground/90 transition-colors"
              aria-label="Play"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
            </button>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="w-7 h-7 rounded-full border border-muted-foreground/60 text-foreground flex items-center justify-center hover:border-foreground transition-colors"
              aria-label="Add to My List"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClick(); }}
              className="ml-auto w-7 h-7 rounded-full border border-muted-foreground/60 text-foreground flex items-center justify-center hover:border-foreground transition-colors"
              aria-label="More info"
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          </div>

          <h3 className="font-semibold text-[11px] mb-1 truncate text-foreground">{title}</h3>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-1">
            {matchPct !== null && (
              <span className="text-accent font-semibold">{matchPct}% Match</span>
            )}
            <span>{year}</span>
            {durationInfo && <span>• {durationInfo}</span>}
          </div>
          {overview && (
            <p className="text-[10px] text-muted-foreground line-clamp-2 leading-snug">
              {overview}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default MovieCard;
