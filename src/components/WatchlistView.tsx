
import React, { useState } from 'react';
import { WatchlistItem } from '@/types/movie';
import { imgPath } from '@/services/tmdbApi';
import { Button } from '@/components/ui/button';
import { Trash2, Play, Filter, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface WatchlistViewProps {
  items: WatchlistItem[];
  onPlay: (item: WatchlistItem) => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

const WatchlistView: React.FC<WatchlistViewProps> = ({ 
  items,
  onPlay,
  onRemove,
  onClearAll
}) => {
  const { toast } = useToast();
  const [filter, setFilter] = useState<'all' | 'movies' | 'shows'>('all');

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'movies') return item.media_type === 'movie';
    if (filter === 'shows') return item.media_type === 'tv';
    return true;
  });

  const handleRemove = (id: string) => {
    onRemove(id);
    toast({
      title: "Removed",
      description: "Item removed from your watchlist",
    });
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear your entire watchlist?')) {
      onClearAll();
      toast({
        title: "Watchlist cleared",
        description: "Your watchlist has been cleared",
      });
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium mb-2">Your watchlist is empty</h3>
        <p className="text-muted-foreground mb-4">Add movies and shows to watch later</p>
        <Button className="bg-hype-purple hover:bg-hype-purple/90">
          <Plus className="h-4 w-4 mr-2" />
          Browse Content
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">My Watchlist</h2>
        <div className="flex items-center gap-2">
          <div className="flex p-1 bg-muted rounded-md">
            <Button 
              size="sm" 
              variant={filter === 'all' ? 'default' : 'ghost'}
              onClick={() => setFilter('all')}
              className={cn(
                "text-xs px-3",
                filter === 'all' ? "bg-hype-purple hover:bg-hype-purple/90" : ""
              )}
            >
              All
            </Button>
            <Button 
              size="sm" 
              variant={filter === 'movies' ? 'default' : 'ghost'}
              onClick={() => setFilter('movies')}
              className={cn(
                "text-xs px-3",
                filter === 'movies' ? "bg-hype-purple hover:bg-hype-purple/90" : ""
              )}
            >
              Movies
            </Button>
            <Button 
              size="sm" 
              variant={filter === 'shows' ? 'default' : 'ghost'}
              onClick={() => setFilter('shows')}
              className={cn(
                "text-xs px-3",
                filter === 'shows' ? "bg-hype-purple hover:bg-hype-purple/90" : ""
              )}
            >
              TV Shows
            </Button>
          </div>
          {items.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleClearAll}
            >
              <Trash2 className="h-4 w-4 mr-1" /> 
              Clear All
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredItems.map((item) => (
          <div 
            key={item.id} 
            className="bg-card border border-border rounded-lg overflow-hidden group"
          >
            <div className="relative aspect-[2/3]">
              <img 
                src={item.poster_path ? `${imgPath}${item.poster_path}` : '/placeholder.svg'}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                <Button
                  className="bg-hype-purple hover:bg-hype-purple/90"
                  size="sm"
                  onClick={() => onPlay(item)}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Play
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemove(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute top-2 right-2 bg-hype-purple/90 text-white text-xs px-2 py-1 rounded">
                {item.media_type === 'movie' ? 'Movie' : 'TV Show'}
              </div>
            </div>
            <div className="p-3">
              <h3 className="font-medium text-sm truncate">{item.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Added {formatDistanceToNow(new Date(item.added_date), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WatchlistView;
