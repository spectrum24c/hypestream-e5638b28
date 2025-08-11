
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Movie, WatchHistory } from '@/types/movie';
import { imgPath } from '@/services/tmdbApi';
import { Button } from '@/components/ui/button';
import { Play, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ContinueWatchingProps {
  items: WatchHistory[];
  onItemClick: (movie: { id: string; media_type?: string }) => void;
}

const ContinueWatching: React.FC<ContinueWatchingProps> = ({ 
  items,
  onItemClick
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!items || items.length === 0) {
    return null;
  }

  const handleContinue = (item: WatchHistory) => {
    onItemClick({ 
      id: item.movieId,
      media_type: item.media_type
    });
    
    toast({
      title: "Resuming",
      description: `Continuing ${item.title} where you left off`,
    });
  };

  const formatTimeLeft = (progress: number) => {
    // Assume average movie is 120 minutes, this is just an estimate
    const minutesLeft = Math.round(120 * (1 - progress / 100));
    if (minutesLeft > 60) {
      return `${Math.floor(minutesLeft / 60)}h ${minutesLeft % 60}m left`;
    }
    return `${minutesLeft}m left`;
  };

  return (
    <div className="mt-8 px-0 md:px-0">
      <h2 className="text-2xl font-bold mb-4">Continue Watching</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((item) => (
          <div 
            key={`${item.movieId}-${item.timestamp}`} 
            className="relative bg-card border border-border rounded-lg overflow-hidden group cursor-pointer"
            onClick={() => handleContinue(item)}
          >
            <div className="relative aspect-video">
              <img 
                src={item.poster_path ? `${imgPath}${item.poster_path}` : '/placeholder.svg'} 
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Button
                  className="bg-hype-purple hover:bg-hype-purple/90"
                  size="sm"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Continue
                </Button>
              </div>
              
              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
                <div 
                  className="h-full bg-hype-purple" 
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
            
            <div className="p-3">
              <h3 className="font-medium text-sm truncate">{item.title}</h3>
              <div className="flex items-center mt-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                {formatTimeLeft(item.progress)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContinueWatching;
