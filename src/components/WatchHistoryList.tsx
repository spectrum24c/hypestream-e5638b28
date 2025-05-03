
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WatchHistory } from '@/types/movie';
import { imgPath } from '@/services/tmdbApi';
import { Button } from '@/components/ui/button';
import { Trash2, Clock, Play, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

interface WatchHistoryListProps {
  items: WatchHistory[];
  onItemClick: (movie: { id: string; media_type?: string }) => void;
  onClearHistory: () => void;
  onRemoveItem: (id: string) => void;
}

const WatchHistoryList: React.FC<WatchHistoryListProps> = ({ 
  items,
  onItemClick,
  onClearHistory,
  onRemoveItem
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [filter, setFilter] = useState<'all' | 'movies' | 'shows'>('all');

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'movies') return item.media_type === 'movie';
    if (filter === 'shows') return item.media_type === 'tv';
    return true;
  });

  const handlePlay = (item: WatchHistory) => {
    onItemClick({ 
      id: item.movieId,
      media_type: item.media_type
    });
  };

  const handleRemove = (id: string) => {
    onRemoveItem(id);
    toast({
      title: "Removed",
      description: "Item removed from your watch history",
    });
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear your entire watch history?')) {
      onClearHistory();
      toast({
        title: "History cleared",
        description: "Your watch history has been cleared",
      });
    }
  };

  const byDate = (items: WatchHistory[]) => {
    const grouped: Record<string, WatchHistory[]> = {};
    const today = new Date().toDateString();
    
    items.forEach(item => {
      const date = new Date(parseInt(item.last_watched));
      const isToday = date.toDateString() === today;
      const dateStr = isToday ? 'Today' : date.toDateString();
      
      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }
      
      grouped[dateStr].push(item);
    });
    
    return grouped;
  };
  
  const groupedItems = byDate(filteredItems);
  const dateGroups = Object.keys(groupedItems);

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium mb-2">No watch history</h3>
        <p className="text-muted-foreground">Movies and shows you watch will appear here</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Watch History</h2>
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
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleClearAll}
          >
            <Trash2 className="h-4 w-4 mr-1" /> 
            Clear All
          </Button>
        </div>
      </div>
      
      <ScrollArea className="h-[600px] pr-4">
        {dateGroups.map(date => (
          <div key={date} className="mb-6">
            <h3 className="font-medium text-lg mb-3">{date}</h3>
            <div className="space-y-3">
              {groupedItems[date].map((item) => (
                <div 
                  key={`${item.movieId}-${item.timestamp}`}
                  className="flex items-center bg-card border border-border rounded-lg overflow-hidden p-2"
                >
                  <img 
                    src={item.poster_path ? `${imgPath}${item.poster_path}` : '/placeholder.svg'}
                    alt={item.title}
                    className="w-16 h-24 object-cover rounded-md mr-4"
                    onClick={() => handlePlay(item)}
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-base cursor-pointer" onClick={() => handlePlay(item)}>
                      {item.title}
                    </h4>
                    <div className="flex items-center mt-1 text-xs text-muted-foreground">
                      <div className="bg-muted-foreground/30 rounded px-2 py-0.5 mr-2">
                        {item.media_type === 'movie' ? 'Movie' : 'TV Show'}
                      </div>
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDistanceToNow(new Date(parseInt(item.last_watched)), { addSuffix: true })}
                      
                      {item.progress > 0 && (
                        <div className="ml-3 flex items-center">
                          <div className="w-16 h-1 bg-muted-foreground/30 rounded-full mr-1">
                            <div 
                              className="h-1 bg-hype-purple rounded-full" 
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                          <span>{item.progress}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      variant="ghost" 
                      className="bg-hype-purple hover:bg-hype-purple/90"
                      onClick={() => handlePlay(item)}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm"
                      variant="ghost" 
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleRemove(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};

export default WatchHistoryList;
