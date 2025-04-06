
import React, { useEffect, useState } from 'react';
import { Play, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiPaths, fetchFromTMDB, imgPath } from '@/services/tmdbApi';

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

const HeroSection = () => {
  const [featuredContent, setFeaturedContent] = useState<FeaturedMovie | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedContent = async () => {
      try {
        const data = await fetchFromTMDB(apiPaths.fetchTrending);
        
        if (data.results && data.results.length > 0) {
          // Find a trending item with a backdrop image
          const featuredItem = data.results.find(item => item.backdrop_path) || data.results[0];
          setFeaturedContent(featuredItem);
        }
      } catch (error) {
        console.error("Error fetching featured content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedContent();
  }, []);

  if (loading || !featuredContent) {
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hype-purple"></div>
      </div>
    );
  }

  const title = featuredContent.title || featuredContent.name || 'Featured Content';
  const year = (featuredContent.release_date || featuredContent.first_air_date || '').split('-')[0] || 'N/A';
  const rating = featuredContent.vote_average.toFixed(1);
  const category = featuredContent.media_type === 'tv' ? 'TV Show' : 'Movie';
  const backdropUrl = featuredContent.backdrop_path 
    ? `${imgPath}${featuredContent.backdrop_path}`
    : 'https://images.unsplash.com/photo-1578632767115-351597cf2477?ixlib=rb-4.0.3&auto=format&fit=crop';

  return (
    <div className="relative h-[70vh] min-h-[500px] w-full overflow-hidden mt-0">
      {/* Background Image */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black/40"></div>
        <img
          src={backdropUrl}
          alt={title}
          className="h-full w-full object-cover object-center"
        />
      </div>

      {/* Gradient Overlay */}
      <div className="banner-overlay"></div>

      {/* Content */}
      <div className="container mx-auto px-4 relative h-full flex items-end pb-16">
        <div className="max-w-2xl animate-fade-in">
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
            {featuredContent.overview || 'No description available.'}
          </p>

          <div className="flex items-center space-x-4">
            <Button 
              className="bg-hype-orange hover:bg-hype-orange/90 text-white px-8 py-6" 
              size="lg"
            >
              <Play className="mr-2 h-5 w-5" /> Watch Now
            </Button>
            <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10">
              <Info className="mr-2 h-5 w-5" /> More Info
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
