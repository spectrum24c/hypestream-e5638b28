
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Clock, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { imgPath } from '@/services/tmdbApi';
import { getWatchHistory, removeFromWatchHistory, clearWatchHistory } from '@/utils/movieDownloader';
import { supabase } from '@/integrations/supabase/client';

type WatchHistoryItem = {
  id: string;
  movie_id: string;
  title: string;
  poster_path: string | null;
  overview: string | null;
  media_type: string;
  season_number: number | null;
  episode_number: number | null;
  episode_title: string | null;
  watch_duration: number | null;
  total_duration: number | null;
  progress: number;
  last_watched_at: string;
  created_at: string;
};

const WatchHistoryList: React.FC = () => {
  const { toast } = useToast();
  const [filter, setFilter] = useState<'all' | 'movies' | 'shows'>('all');
  const [items, setItems] = useState<WatchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const loadHistory = async () => {
      if (!session) {
        setItems([]);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const data = await getWatchHistory();
        setItems(data as WatchHistoryItem[]);
      } catch (error) {
        console.error('Error loading watch history:', error);
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, [session]);

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'movies') return item.media_type === 'movie';
    if (filter === 'shows') return item.media_type === 'tv';
    return true;
  });

  const handleContinueWatching = (item: WatchHistoryItem) => {
    const movieData = {
      id: item.movie_id,
      title: item.title.split(' • ')[0],
      poster_path: item.poster_path,
      overview: item.overview,
      media_type: item.media_type,
      episodeInfo: item.season_number && item.episode_number 
        ? { season: item.season_number, episode: item.episode_number }
        : undefined
    };
    
    window.dispatchEvent(new CustomEvent('openMoviePlayer', { detail: movieData }));
    toast({ title: 'Resuming', description: `Opening ${item.title}` });
  };

  const handleRemove = async (id: string) => {
    await removeFromWatchHistory(id);
    setItems(prev => prev.filter(i => i.id !== id));
    toast({ title: 'Removed', description: 'Item removed from your watch history' });
  };

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to clear your entire watch history?')) {
      await clearWatchHistory();
      setItems([]);
      toast({ title: 'History cleared', description: 'Your watch history has been cleared' });
    }
  };

  const byDate = (rows: WatchHistoryItem[]) => {
    const grouped: Record<string, WatchHistoryItem[]> = {};
    const today = new Date().toDateString();
    rows.forEach(item => {
      const date = new Date(item.last_watched_at);
      const isToday = date.toDateString() === today;
      const dateStr = isToday ? 'Today' : date.toDateString();
      grouped[dateStr] ||= [];
      grouped[dateStr].push(item);
    });
    return grouped;
  };

  const formatWatchDuration = (item: WatchHistoryItem) => {
    if (item.progress > 0) {
      return `${Math.round(item.progress)}% watched`;
    }
    return 'Just started';
  };

  const groupedItems = byDate(filteredItems);
  const dateGroups = Object.keys(groupedItems);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading watch history...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium mb-2">Sign in to see watch history</h3>
        <p className="text-muted-foreground">Your watch history will be saved when you're logged in</p>
      </div>
    );
  }

  if (!filteredItems || filteredItems.length === 0) {
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
              className={cn('text-xs px-3', filter === 'all' ? 'bg-primary hover:bg-primary/90' : '')}
            >
              All
            </Button>
            <Button 
              size="sm" 
              variant={filter === 'movies' ? 'default' : 'ghost'}
              onClick={() => setFilter('movies')}
              className={cn('text-xs px-3', filter === 'movies' ? 'bg-primary hover:bg-primary/90' : '')}
            >
              Movies
            </Button>
            <Button 
              size="sm" 
              variant={filter === 'shows' ? 'default' : 'ghost'}
              onClick={() => setFilter('shows')}
              className={cn('text-xs px-3', filter === 'shows' ? 'bg-primary hover:bg-primary/90' : '')}
            >
              TV Shows
            </Button>
          </div>
          <Button variant="destructive" size="sm" onClick={handleClearAll}>
            <Trash2 className="h-4 w-4 mr-1" /> Clear All
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[600px] pr-4">
        {dateGroups.map(date => (
          <div key={date} className="mb-6">
            <h3 className="font-medium text-lg mb-3">{date}</h3>
            <div className="space-y-3">
              {groupedItems[date].map((item) => (
                <div key={item.id} className="flex items-start bg-card border border-border rounded-lg overflow-hidden p-3">
                  <img 
                    src={item.poster_path ? `${imgPath}${item.poster_path}` : '/placeholder.svg'}
                    alt={item.title}
                    className="w-16 h-24 object-cover rounded-md mr-4"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-base">{item.title}</h4>
                    {item.overview && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.overview}</p>
                    )}
                    <div className="flex items-center mt-2 text-xs text-muted-foreground flex-wrap gap-2">
                      <div className="bg-muted-foreground/30 rounded px-2 py-0.5">
                        {item.media_type === 'movie' ? 'Movie' : 'TV Show'}
                      </div>
                      {item.episode_title && (
                        <div className="bg-muted-foreground/30 rounded px-2 py-0.5">
                          {item.episode_title}
                        </div>
                      )}
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDistanceToNow(new Date(item.last_watched_at), { addSuffix: true })}
                      </div>
                      {item.progress > 0 && (
                        <div className="flex items-center">
                          <div className="w-16 h-1 bg-muted-foreground/30 rounded-full mr-1">
                            <div className="h-1 bg-primary rounded-full" style={{ width: `${item.progress}%` }} />
                          </div>
                          <span>{formatWatchDuration(item)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-3">
                    <Button 
                      size="sm" 
                      className="bg-primary hover:bg-primary/90"
                      onClick={() => handleContinueWatching(item)}
                    >
                      <Play className="h-4 w-4 mr-1" /> 
                      {item.progress > 0 ? 'Continue' : 'Play'}
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
