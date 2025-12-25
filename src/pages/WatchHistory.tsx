
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WatchHistoryList from '@/components/WatchHistoryList';
import { WatchHistory } from '@/types/movie';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import MoviePlayer from '@/components/MoviePlayer';
import type { Session } from '@supabase/supabase-js';

type MinimalSelectedMovie = {
  id: string;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  media_type?: string;
  runtime?: number;
  number_of_seasons?: number;
  genre_ids?: number[];
};

type WatchHistoryRow = {
  id: string;
  movie_id: string;
  title: string;
  poster_path: string | null;
  progress: number;
  timestamp: number;
  media_type: string;
  last_watched: string;
};

const WatchHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [watchHistory, setWatchHistory] = useState<WatchHistory[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<MinimalSelectedMovie | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to view your watch history",
          variant: "destructive"
        });
        navigate('/auth');
      } else {
        try {
          const { data, error } = await supabase
            .from('watch_history' as never)
            .select('*')
            .eq('user_id', session.user.id)
            .order('last_watched', { ascending: false });

          if (error) {
            console.error('Error loading watch history from Supabase:', error);
            toast({
              title: "Error loading history",
              description: "There was a problem loading your watch history",
              variant: "destructive"
            });
            setWatchHistory([]);
            return;
          }

          if (!data) {
            setWatchHistory([]);
            return;
          }

          const rows = data as WatchHistoryRow[];
          const mapped: WatchHistory[] = rows.map((item) => ({
            id: item.id,
            movieId: item.movie_id,
            title: item.title,
            poster_path: item.poster_path,
            progress: item.progress,
            timestamp: item.timestamp,
            media_type: item.media_type,
            last_watched: item.last_watched
          }));

          setWatchHistory(mapped);
        } catch (error: unknown) {
          console.error('Error loading watch history from Supabase:', error);
          toast({
            title: "Error loading history",
            description: "There was a problem loading your watch history",
            variant: "destructive"
          });
        }
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  const handleItemClick = (movie: { id: string; media_type?: string }) => {
    setSelectedMovie({ id: movie.id, media_type: movie.media_type });
  };

  const handleRemoveItem = async (id: string) => {
    if (!session || !session.user) {
      return;
    }

    setWatchHistory(prev => prev.filter(item => item.id !== id));

    try {
      const { error } = await supabase
        .from('watch_history' as never)
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error removing watch history item:', error);
      }
    } catch (error: unknown) {
      console.error('Error removing watch history item:', error);
    }
  };

  const handleClearHistory = async () => {
    if (!session || !session.user) {
      return;
    }

    setWatchHistory([]);

    try {
      const { error } = await supabase
        .from('watch_history' as never)
        .delete()
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error clearing watch history:', error);
      }
    } catch (error: unknown) {
      console.error('Error clearing watch history:', error);
    }
  };

  const handleMoviePlayerClose = () => {
    setSelectedMovie(null);
  };

  return (
    <div className="min-h-screen bg-hype-dark text-foreground">
      <Navbar />
      <main className="pt-24 pb-16 mx-auto container px-4">
        <WatchHistoryList />
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

export default WatchHistoryPage;
