
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Clock, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { imgPath, fetchFromTMDB, apiPaths } from '@/services/tmdbApi';

type LocalHistoryItem = {
  id: string;
  movieId: string;
  title: string;
  poster_path: string | null;
  overview?: string;
  progress: number;
  timestamp: number;
  media_type: string;
  last_watched: string;
};

const WatchHistoryList: React.FC = () => {
  const { toast } = useToast();
  const [filter, setFilter] = useState<'all' | 'movies' | 'shows'>('all');
  const [items, setItems] = useState<LocalHistoryItem[]>([]);
  const [runtimeMap, setRuntimeMap] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      const local = JSON.parse(localStorage.getItem('KENNY123.,') || '[]');
      setItems(local);
    } catch (e) {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    const hydrateOverviews = async () => {
      const toHydrate = items.filter(i => !i.overview);
      for (const i of toHydrate) {
        try {
          const endpoint = i.media_type === 'tv' ? apiPaths.fetchTVDetails(i.movieId) : apiPaths.fetchMovieDetails(i.movieId);
          const details = await fetchFromTMDB(endpoint);
          setItems(prev => prev.map(p => p.movieId === i.movieId ? { ...p, overview: details?.overview || p.overview } : p));
        } catch {
          // ignore
        }
      }
    };
    if (items.length) hydrateOverviews();
  }, [items]);

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'movies') return item.media_type === 'movie';
    if (filter === 'shows') return item.media_type === 'tv';
    return true;
  });

  const handlePlay = (item: LocalHistoryItem) => {
    toast({ title: 'Playing', description: `Opening ${item.title}` });
    // The actual player is opened elsewhere; this component focuses on history UI.
  };

  const handleRemove = (movieId: string) => {
    setItems(prev => prev.filter(i => i.movieId !== movieId));
    try {
      const local = JSON.parse(localStorage.getItem('KENNY123.,') || '[]');
      const next = local.filter((i: any) => i.movieId !== movieId);
      localStorage.setItem('KENNY123.,', JSON.stringify(next));
    } catch {}
    toast({ title: 'Removed', description: 'Item removed from your watch history' });
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear your entire watch history?')) {
      setItems([]);
      localStorage.setItem('KENNY123.,', JSON.stringify([]));
      toast({ title: 'History cleared', description: 'Your watch history has been cleared' });
    }
  };

  const byDate = (rows: LocalHistoryItem[]) => {
    const grouped: Record<string, LocalHistoryItem[]> = {};
    const today = new Date().toDateString();
    rows.forEach(item => {
      const date = new Date(parseInt(item.last_watched));
      const isToday = date.toDateString() === today;
      const dateStr = isToday ? 'Today' : date.toDateString();
      grouped[dateStr] ||= [];
      grouped[dateStr].push(item);
    });
    return grouped;
  };

  useEffect(() => {
    const fetchRuntimes = async () => {
      const idsToFetch = filteredItems
        .filter(item => runtimeMap[item.movieId] == null)
        .map(item => ({ id: item.movieId, type: item.media_type }));
      for (const { id, type } of idsToFetch) {
        try {
          const endpoint = type === 'tv' ? apiPaths.fetchTVDetails(id) : apiPaths.fetchMovieDetails(id);
          const details = await fetchFromTMDB(endpoint);
          let runtime = 0;
          if (type === 'tv') {
            runtime = Array.isArray(details?.episode_run_time) && details.episode_run_time.length > 0 ? details.episode_run_time[0] : 45;
          } else {
            runtime = details?.runtime || 120;
          }
          setRuntimeMap(prev => ({ ...prev, [id]: runtime }));
        } catch (e) {
          setRuntimeMap(prev => ({ ...prev, [id]: type === 'tv' ? 45 : 120 }));
        }
      }
    };
    if (filteredItems.length) fetchRuntimes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredItems.map(i => i.movieId).join(','), filteredItems.map(i => i.media_type).join(',')]);

  const getStoppedMinutes = (item: LocalHistoryItem) => {
    const runtime = runtimeMap[item.movieId] ?? (item.media_type === 'tv' ? 45 : 120);
    return Math.round((runtime * item.progress) / 100);
  };

  const groupedItems = byDate(filteredItems);
  const dateGroups = Object.keys(groupedItems);

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
              className={cn('text-xs px-3', filter === 'all' ? 'bg-hype-purple hover:bg-hype-purple/90' : '')}
            >
              All
            </Button>
            <Button 
              size="sm" 
              variant={filter === 'movies' ? 'default' : 'ghost'}
              onClick={() => setFilter('movies')}
              className={cn('text-xs px-3', filter === 'movies' ? 'bg-hype-purple hover:bg-hype-purple/90' : '')}
            >
              Movies
            </Button>
            <Button 
              size="sm" 
              variant={filter === 'shows' ? 'default' : 'ghost'}
              onClick={() => setFilter('shows')}
              className={cn('text-xs px-3', filter === 'shows' ? 'bg-hype-purple hover:bg-hype-purple/90' : '')}
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
                <div key={`${item.movieId}-${item.timestamp}`} className="flex items-start bg-card border border-border rounded-lg overflow-hidden p-3">
                  <img 
                    src={item.poster_path ? `${imgPath}${item.poster_path}` : '/placeholder.svg'}
                    alt={item.title}
                    className="w-16 h-24 object-cover rounded-md mr-4"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-base">{item.title}</h4>
                    {item.overview && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{item.overview}</p>
                    )}
                    <div className="flex items-center mt-2 text-xs text-muted-foreground">
                      <div className="bg-muted-foreground/30 rounded px-2 py-0.5 mr-2">
                        {item.media_type === 'movie' ? 'Movie' : 'TV Show'}
                      </div>
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDistanceToNow(new Date(parseInt(item.last_watched)), { addSuffix: true })}
                      {item.progress > 0 && (
                        <div className="ml-3 flex items-center">
                          <div className="w-16 h-1 bg-muted-foreground/30 rounded-full mr-1">
                            <div className="h-1 bg-hype-purple rounded-full" style={{ width: `${item.progress}%` }} />
                          </div>
                          <span>{getStoppedMinutes(item)}m</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-3">
                    <Button size="sm" variant="ghost" className="bg-hype-purple hover:bg-hype-purple/90" onClick={() => handlePlay(item)}>
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleRemove(item.movieId)}>
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
