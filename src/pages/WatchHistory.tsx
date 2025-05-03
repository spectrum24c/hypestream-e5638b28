
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WatchHistoryList from '@/components/WatchHistoryList';
import { WatchHistory } from '@/types/movie';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import MoviePlayer from '@/components/MoviePlayer';

// Mock data - in a real app, this would come from the Supabase database
const mockWatchHistory: WatchHistory[] = [
  {
    id: '1',
    movieId: '299534',
    title: 'Avengers: Endgame',
    poster_path: '/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
    progress: 75,
    timestamp: Date.now() - 86400000, // 1 day ago
    media_type: 'movie',
    last_watched: Date.now() - 86400000 + ''
  },
  {
    id: '2',
    movieId: '299536',
    title: 'Avengers: Infinity War',
    poster_path: '/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
    progress: 100,
    timestamp: Date.now() - 172800000, // 2 days ago
    media_type: 'movie',
    last_watched: Date.now() - 172800000 + ''
  },
  {
    id: '3',
    movieId: '566525',
    title: 'Shang-Chi and the Legend of the Ten Rings',
    poster_path: '/1BIoJGKbXjdFDAqUEiA2VHqkK1Z.jpg',
    progress: 45,
    timestamp: Date.now() - 259200000, // 3 days ago
    media_type: 'movie',
    last_watched: Date.now() - 259200000 + ''
  },
  {
    id: '4',
    movieId: '634649',
    title: 'Spider-Man: No Way Home',
    poster_path: '/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    progress: 30,
    timestamp: Date.now() - 345600000, // 4 days ago
    media_type: 'movie',
    last_watched: Date.now() - 345600000 + ''
  },
  {
    id: '5',
    movieId: '85271',
    title: 'The Queen\'s Gambit',
    poster_path: '/zU0htwkhNvBQdVSIKB9s6hgVeFK.jpg',
    progress: 85,
    timestamp: Date.now() - 432000000, // 5 days ago
    media_type: 'tv',
    last_watched: Date.now() - 432000000 + ''
  }
];

const WatchHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<any>(null);
  const [watchHistory, setWatchHistory] = useState<WatchHistory[]>(mockWatchHistory);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);

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
        // In a real app, fetch watch history from Supabase
        // const { data, error } = await supabase
        //   .from('watch_history')
        //   .select('*')
        //   .eq('user_id', session.user.id)
        //   .order('last_watched', { ascending: false });
        
        // if (error) {
        //   console.error('Error fetching watch history:', error);
        //   toast({
        //     title: "Error loading history",
        //     description: "There was a problem loading your watch history",
        //     variant: "destructive"
        //   });
        // } else {
        //   setWatchHistory(data);
        // }
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  const handleItemClick = (movie: { id: string; media_type?: string }) => {
    setSelectedMovie({ id: movie.id });
  };

  const handleRemoveItem = (id: string) => {
    // In a real app, delete from Supabase
    // await supabase
    //   .from('watch_history')
    //   .delete()
    //   .eq('id', id);
    
    setWatchHistory(watchHistory.filter(item => item.id !== id));
  };

  const handleClearHistory = () => {
    // In a real app, delete all from Supabase
    // await supabase
    //   .from('watch_history')
    //   .delete()
    //   .eq('user_id', session.user.id);
    
    setWatchHistory([]);
  };

  const handleMoviePlayerClose = () => {
    setSelectedMovie(null);
  };

  return (
    <div className="min-h-screen bg-hype-dark text-foreground">
      <Navbar />
      <main className="pt-24 pb-16 mx-auto container px-4">
        <WatchHistoryList 
          items={watchHistory}
          onItemClick={handleItemClick}
          onRemoveItem={handleRemoveItem}
          onClearHistory={handleClearHistory}
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

export default WatchHistoryPage;
