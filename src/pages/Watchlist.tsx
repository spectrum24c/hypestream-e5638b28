
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WatchlistView from '@/components/WatchlistView';
import { WatchlistItem } from '@/types/movie';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import MoviePlayer from '@/components/MoviePlayer';
import { getWatchlistItems, removeFromWatchlistById, clearWatchlist } from '@/utils/movieDownloader';

const WatchlistPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<any>(null);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to access your watchlist",
          variant: "destructive"
        });
        navigate('/auth');
      } else {
        try {
          const items = await getWatchlistItems();
          setWatchlist(items);
        } catch (error) {
          console.error('Error loading watchlist from storage:', error);
          toast({
            title: "Error loading watchlist",
            description: "There was a problem loading your watchlist",
            variant: "destructive"
          });
        }
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  const handlePlay = (item: WatchlistItem) => {
    setSelectedMovie({ id: item.movieId });
  };

  const handleRemove = async (id: string) => {
    await removeFromWatchlistById(id);
    setWatchlist(prev => prev.filter(item => item.id !== id));
  };

  const handleClearAll = async () => {
    await clearWatchlist();
    setWatchlist([]);
  };

  const handleMoviePlayerClose = () => {
    setSelectedMovie(null);
  };

  return (
    <div className="min-h-screen bg-hype-dark text-foreground">
      <Navbar />
      <main className="pt-24 pb-16 mx-auto container px-4">
        <WatchlistView 
          items={watchlist}
          onPlay={handlePlay}
          onRemove={handleRemove}
          onClearAll={handleClearAll}
        />
      </main>
      <Footer />
      
      {selectedMovie && (
        <MoviePlayer 
          movie={selectedMovie} 
          onClose={handleMoviePlayerClose} 
          autoPlayTrailer={false}
        />
      )}
    </div>
  );
};

export default WatchlistPage;
