
import React, { useEffect, useState, memo, useCallback, useRef } from 'react';
import { Play, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiPaths, fetchFromTMDB, imgPath, fetchTrailerKey } from '@/services/tmdbApi';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FeaturedMovie {
  id: string;
  title?: string;
  name?: string;
  overview?: string;
  backdrop_path: string | null;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  media_type?: string;
}

interface HeroSectionProps {
  onWatchNow?: (movie: FeaturedMovie) => void;
  onMoreInfo?: (movie: FeaturedMovie) => void;
  useFixedImage?: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = memo(({ onWatchNow, onMoreInfo, useFixedImage = false }) => {
  const [featuredContent, setFeaturedContent] = useState<FeaturedMovie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const trailerCacheRef = useRef<Map<string, string | null>>(new Map());
  const hoverTimerRef = useRef<number | null>(null);
  
  const { toast } = useToast();
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
    });
    
    const fetchFeaturedContent = async () => {
      try {
        const data = await fetchFromTMDB(apiPaths.fetchTrending);
        if (data.results && data.results.length > 0) {
          const featuredItems = data.results
            .filter((item: any) => item.backdrop_path && item.overview)
            .slice(0, 5);
          setFeaturedContent(featuredItems);
        }
      } catch (error) {
        console.error("Error fetching featured content:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedContent();
  }, []);
  
  const goToNextSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === featuredContent.length - 1 ? 0 : prevIndex + 1
      );
      setTimeout(() => { setIsTransitioning(false); }, 300);
    }, 300);
  }, [featuredContent.length, isTransitioning]);
  
  useEffect(() => {
    if (featuredContent.length <= 1 || isHovering) return;
    const interval = setInterval(goToNextSlide, 10000);
    return () => clearInterval(interval);
  }, [goToNextSlide, featuredContent.length, isHovering]);

  // Prefetch trailer for the current slide
  useEffect(() => {
    const movie = featuredContent[currentIndex];
    if (!movie) return;
    setShowTrailer(false);
    setTrailerKey(null);
    const isTV = movie.media_type === 'tv' || !!movie.first_air_date;
    const cacheKey = `${isTV ? 'tv' : 'movie'}-${movie.id}`;
    if (trailerCacheRef.current.has(cacheKey)) {
      setTrailerKey(trailerCacheRef.current.get(cacheKey) ?? null);
      return;
    }
    let cancelled = false;
    fetchTrailerKey(String(movie.id), isTV)
      .then((key) => {
        if (cancelled) return;
        trailerCacheRef.current.set(cacheKey, key);
        setTrailerKey(key);
      })
      .catch(() => {
        trailerCacheRef.current.set(cacheKey, null);
      });
    return () => { cancelled = true; };
  }, [currentIndex, featuredContent]);

  const handleHeroMouseEnter = () => {
    setIsHovering(true);
    if (hoverTimerRef.current) window.clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = window.setTimeout(() => {
      if (trailerKey) setShowTrailer(true);
    }, 600);
  };

  const handleHeroMouseLeave = () => {
    setIsHovering(false);
    if (hoverTimerRef.current) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setShowTrailer(false);
  };

  const handlePlayTrailer = () => {
    if (!featuredContent[currentIndex]) return;
    if (!session) {
      toast({ title: "Authentication required", description: "Please login to watch content", variant: "destructive" });
      return;
    }
    if (onWatchNow) onWatchNow(featuredContent[currentIndex]);
  };

  const handleMoreInfo = () => {
    if (!featuredContent[currentIndex]) return;
    if (onMoreInfo) onMoreInfo(featuredContent[currentIndex]);
  };

  if (loading || featuredContent.length === 0) {
    return (
      <div className="relative h-[85vh] min-h-[600px] w-full overflow-hidden hero-skeleton" aria-busy="true" aria-label="Loading featured titles">
        <div className="container mx-auto px-4 md:px-8 relative h-full flex items-center">
          <div className="max-w-2xl w-full space-y-4">
            <div className="flex items-center gap-3">
              <div className="sk-bar h-6 w-20" />
              <div className="sk-bar h-4 w-10" />
              <div className="sk-bar h-4 w-12" />
            </div>
            <div className="sk-bar h-[clamp(2.5rem,6.4vw,5rem)] w-[85%]" />
            <div className="sk-bar h-4 w-full max-w-xl" />
            <div className="sk-bar h-4 w-[70%] max-w-md" />
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4">
              <div className="sk-bar h-14 w-full sm:w-40" />
              <div className="sk-bar h-14 w-full sm:w-44" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentMovie = featuredContent[currentIndex];
  const title = currentMovie.title || currentMovie.name || 'Featured Content';
  const year = (currentMovie.release_date || currentMovie.first_air_date || '').split('-')[0] || 'N/A';
  const rating = currentMovie.vote_average.toFixed(1);
  const category = currentMovie.media_type === 'tv' ? 'TV Show' : 'Movie';
  
  const backdropUrl = currentMovie.backdrop_path 
    ? `${imgPath}${currentMovie.backdrop_path}`
    : 'https://images.unsplash.com/photo-1578632767115-351597cf2477?ixlib=rb-4.0.3&auto=format&fit=crop';

  return (
    <div
      className="relative h-[85vh] min-h-[600px] w-full overflow-hidden"
      onMouseEnter={handleHeroMouseEnter}
      onMouseLeave={handleHeroMouseLeave}
    >
      {/* Background — slow cinematic push, no layout cost */}
      <div className={`hero-backdrop absolute inset-0 transition-[opacity,transform] duration-700 ease-[var(--ease-ios)] ${isTransitioning ? 'opacity-0 scale-[1.03]' : 'opacity-100 scale-100'}`}>
        <img
          src={backdropUrl}
          alt={title}
          className="h-full w-full object-cover object-[62%_center] sm:object-center"
          loading="eager"
        />
      </div>

      {/* Trailer overlay on hover */}
      {showTrailer && trailerKey && (
        <div className="absolute inset-0 z-[1] overflow-hidden bg-background animate-fade-in pointer-events-none">
          <iframe
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full min-w-[177.78vh] min-h-[56.25vw]"
            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=0&controls=0&modestbranding=1&playsinline=1&rel=0&loop=1&playlist=${trailerKey}&iv_load_policy=3&disablekb=1&fs=0&vq=hd1080&hd=1`}
            title={`${title} trailer preview`}
            allow="autoplay; encrypted-media"
          />
        </div>
      )}

      {/* The veil: masked blur does the legibility work, so the artwork keeps its colour */}
      <div className={`hero-veil transition-opacity duration-500 ${showTrailer && trailerKey ? 'opacity-0' : 'opacity-100'}`} aria-hidden="true" />
      <div className={`hero-veil-blur transition-opacity duration-500 ${showTrailer && trailerKey ? 'opacity-0' : 'opacity-100'}`} aria-hidden="true" />
      <div className={`hero-foot transition-opacity duration-500 ${showTrailer && trailerKey ? 'opacity-0' : 'opacity-100'}`} aria-hidden="true" />

      {/* Content */}
      <div className="container mx-auto px-4 md:px-8 relative h-full flex items-center z-20 pointer-events-none">
        <div className={`max-w-2xl transition-all duration-500 pointer-events-auto ${
          showTrailer && trailerKey ? 'opacity-0 translate-y-4 pointer-events-none' : isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
        }`}>
          <div className="hero-stagger" key={isTransitioning ? 'out' : `slide-${currentIndex}`}>
          {/* Category & Rating */}
          <div className="flex items-center gap-4 mb-4">
            <span className="inline-flex items-center px-3 py-1 bg-primary/90 text-primary-foreground text-xs font-bold tracking-wider rounded">
              {category.toUpperCase()}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-rating font-semibold tabular-nums">{rating}</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg 
                    key={star} 
                    className={`h-4 w-4 ${star <= Math.floor(parseFloat(rating) / 2) ? 'text-rating' : 'text-muted-foreground/30'}`}
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            <span className="text-muted-foreground text-sm">{year}</span>
          </div>

          {/* Title */}
          <h1 className="text-[clamp(2.5rem,6.4vw,5rem)] font-extrabold tracking-[-0.03em] text-foreground mb-6 leading-[0.95]">
            {title}
          </h1>

          {/* Description */}
          <p className="text-base md:text-lg text-foreground/75 mb-8 max-w-xl line-clamp-2 sm:line-clamp-3 leading-relaxed">
            {currentMovie.overview || 'No description available.'}
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button 
              onClick={handlePlayTrailer}
              className="bg-primary hover:brightness-110 text-primary-foreground px-8 py-6 text-lg font-semibold rounded shadow-[0_10px_40px_-12px_hsl(var(--primary)/0.8)] w-full sm:w-auto"
              size="lg"
            >
              <Play className="mr-2 h-6 w-6 fill-current" /> Play
            </Button>
            <Button 
              variant="secondary"
              size="lg" 
              className="liquid-glass hover:brightness-125 px-8 py-6 text-lg font-semibold rounded text-foreground w-full sm:w-auto"
              onClick={handleMoreInfo}
            >
              <Info className="mr-2 h-6 w-6" /> More Info
            </Button>
          </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 right-8 z-30 flex items-center gap-3">
        {featuredContent.map((_, i) => (
          <button
            key={i}
            aria-current={i === currentIndex}
            className={`hero-dot ${i === currentIndex ? 'w-14' : 'w-4 hover:bg-foreground/40'}`}
            onClick={() => !isTransitioning && setCurrentIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
});

HeroSection.displayName = "HeroSection";

export default HeroSection;