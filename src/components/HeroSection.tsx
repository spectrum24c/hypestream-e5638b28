
import React, { useEffect, useState, memo, useCallback } from 'react';
import { Play, Info, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiPaths, fetchFromTMDB, imgPath } from '@/services/tmdbApi';
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
      
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }, 300);
  }, [featuredContent.length, isTransitioning]);
  
  useEffect(() => {
    if (featuredContent.length <= 1) return;
    
    const interval = setInterval(goToNextSlide, 10000);
    return () => clearInterval(interval);
  }, [goToNextSlide, featuredContent.length]);

  const handlePlayTrailer = () => {
    if (!featuredContent[currentIndex]) return;
    
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please login to watch content",
        variant: "destructive"
      });
      return;
    }
    
    if (onWatchNow) {
      onWatchNow(featuredContent[currentIndex]);
    }
  };

  const handleMoreInfo = () => {
    if (!featuredContent[currentIndex]) return;
    
    if (onMoreInfo) {
      onMoreInfo(featuredContent[currentIndex]);
    }
  };

  if (loading || featuredContent.length === 0) {
    return (
      <div className="h-[80vh] flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
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
    <div className="relative h-[85vh] min-h-[600px] w-full overflow-hidden">
      {/* Background Image with fade transition */}
      <div className={`absolute inset-0 transition-opacity duration-700 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <img
          src={backdropUrl}
          alt={title}
          className="h-full w-full object-cover object-center"
          loading="eager"
        />
      </div>

      {/* Gradient Overlays - Netflix style */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      
      {/* Vignette effect */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent to-background/50" />

      {/* Content */}
      <div className="container mx-auto px-4 md:px-8 relative h-full flex items-center z-20">
        <div className={`max-w-2xl transition-all duration-700 ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
          {/* Category & Rating */}
          <div className="flex items-center gap-4 mb-4">
            <span className="inline-flex items-center px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold tracking-wider rounded">
              {category.toUpperCase()}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-primary font-semibold">{rating}</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg 
                    key={star} 
                    className={`h-4 w-4 ${star <= Math.floor(parseFloat(rating) / 2) 
                      ? 'text-primary' 
                      : 'text-muted-foreground/30'}`}
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            <span className="text-muted-foreground">{year}</span>
          </div>

          {/* Title */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl tracking-wide text-foreground mb-6 leading-none">
            {title}
          </h1>

          {/* Description */}
          <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-xl line-clamp-3 leading-relaxed">
            {currentMovie.overview || 'No description available.'}
          </p>

          {/* Buttons */}
          <div className="flex items-center gap-4">
            <Button 
              onClick={handlePlayTrailer}
              className="bg-foreground hover:bg-foreground/90 text-background px-8 py-6 text-lg font-semibold rounded-md transition-all duration-200 hover:scale-105"
              size="lg"
            >
              <Play className="mr-2 h-6 w-6 fill-current" /> Play
            </Button>
            <Button 
              variant="secondary"
              size="lg" 
              className="bg-secondary/80 hover:bg-secondary text-foreground px-8 py-6 text-lg font-semibold rounded-md transition-all duration-200"
              onClick={handleMoreInfo}
            >
              <Info className="mr-2 h-6 w-6" /> More Info
            </Button>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 right-8 z-30 flex items-center gap-3">
        {featuredContent.map((_, i) => (
          <button
            key={i}
            className={`h-1 transition-all duration-300 rounded-full ${
              i === currentIndex 
                ? 'bg-primary w-8' 
                : 'bg-foreground/30 w-4 hover:bg-foreground/50'
            }`}
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
