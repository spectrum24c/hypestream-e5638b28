
import React, { useEffect, useState, memo, useCallback } from 'react';
import { Play, Info } from 'lucide-react';
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

// Use memo to prevent unnecessary re-renders
const HeroSection: React.FC<HeroSectionProps> = memo(({ onWatchNow, onMoreInfo, useFixedImage = false }) => {
  const [featuredContent, setFeaturedContent] = useState<FeaturedMovie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    // Get auth session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
    });
    
    const fetchFeaturedContent = async () => {
      try {
        const data = await fetchFromTMDB(apiPaths.fetchTrending);
        
        if (data.results && data.results.length > 0) {
          // Find trending items with backdrop images
          const featuredItems = data.results
            .filter((item: any) => item.backdrop_path && item.overview)
            .slice(0, 5); // Limit to 5 items for the slider
          
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
      
      // Reset transition state after a short delay to ensure smooth animation
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }, 300);
  }, [featuredContent.length, isTransitioning]);
  
  // Auto-rotate slides every 10 seconds (increased from 6)
  useEffect(() => {
    if (featuredContent.length <= 1) return;
    
    const interval = setInterval(goToNextSlide, 10000);
    return () => clearInterval(interval);
  }, [goToNextSlide, featuredContent.length]);

  const handlePlayTrailer = () => {
    if (!featuredContent[currentIndex]) return;
    
    // Check if user is signed in
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
      <div className="h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hype-purple"></div>
      </div>
    );
  }

  const currentMovie = featuredContent[currentIndex];
  const title = currentMovie.title || currentMovie.name || 'Featured Content';
  const year = (currentMovie.release_date || currentMovie.first_air_date || '').split('-')[0] || 'N/A';
  const rating = currentMovie.vote_average.toFixed(1);
  const category = currentMovie.media_type === 'tv' ? 'TV Show' : 'Movie';
  
  // Use the backdrop image for consistent experience across all device sizes
  const backdropUrl = currentMovie.backdrop_path 
    ? `${imgPath}${currentMovie.backdrop_path}`
    : 'https://images.unsplash.com/photo-1578632767115-351597cf2477?ixlib=rb-4.0.3&auto=format&fit=crop';

  return (
    <div className="relative h-[70vh] min-h-[500px] w-full overflow-hidden mt-10">
      {/* Background Image with fade transition */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <img
          src={backdropUrl}
          alt={title}
          className="h-full w-full object-cover object-center"
          loading="lazy"
        />
      </div>

      {/* Gradient Overlay */}
      <div className="banner-overlay z-20"></div>

      {/* Dots Indicator */}
      <div className="absolute z-30 bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {featuredContent.map((_, i) => (
          <button
            key={i}
            className={`h-2 w-2 rounded-full transition-all ${
              i === currentIndex ? 'bg-white w-4' : 'bg-white/50'
            }`}
            onClick={() => setCurrentIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Content with fade transition */}
      <div className="container mx-auto px-4 relative h-full flex items-end pb-16 z-20">
        <div className={`max-w-2xl transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'animate-fade-in'}`}>
          <div className="flex items-center space-x-3 mb-3">
            <span className="bg-hype-orange px-2 py-1 text-xs font-medium text-white rounded">
              FEATURED
            </span>
            <div className="flex items-center text-hype-teal">
              <span className="text-sm font-medium mr-2">{rating}</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg 
                    key={star} 
                    className={`h-4 w-4 ${star <= Math.floor(parseFloat(rating)) / 2 
                      ? 'text-hype-teal' 
                      : 'text-gray-500'}`}
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            {title}
          </h1>

          <div className="flex items-center space-x-4 mb-5 text-sm text-muted-foreground">
            <span>{year}</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground"></span>
            <span>{category}</span>
          </div>

          <p className="text-lg text-gray-300 mb-8 max-w-xl">
            {currentMovie.overview || 'No description available.'}
          </p>

          <div className="flex items-center space-x-4">
            <Button 
              className="bg-hype-orange hover:bg-hype-orange/90 text-white px-8 py-6" 
              size="lg"
              onClick={handlePlayTrailer}
            >
              <Play className="mr-2 h-5 w-5" /> Play Trailer
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white/20 text-white hover:bg-white/10"
              onClick={handleMoreInfo}
            >
              <Info className="mr-2 h-5 w-5" /> More Info
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

HeroSection.displayName = "HeroSection";

export default HeroSection;
