
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WatchlistView from '@/components/WatchlistView';
import { WatchlistItem } from '@/types/movie';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import MoviePlayer from '@/components/MoviePlayer';

// Mock data - in a real app, this would come from the Supabase database
const mockWatchlist: WatchlistItem[] = [
  {
    id: '1',
    movieId: '299534',
    title: 'Avengers: Endgame',
    poster_path: '/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
    added_date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    media_type: 'movie'
  },
  {
    id: '2',
    movieId: '299536',
    title: 'Avengers: Infinity War',
    poster_path: '/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
    added_date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    media_type: 'movie'
  },
  {
    id: '3',
    movieId: '566525',
    title: 'Shang-Chi and the Legend of the Ten Rings',
    poster_path: '/1BIoJGKbXjdFDAqUEiA2VHqkK1Z.jpg',
    added_date: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    media_type: 'movie'
  },
  {
    id: '4',
    movieId: '634649',
    title: 'Spider-Man: No Way Home',
    poster_path: '/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    added_date: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
    media_type: 'movie'
  },
  {
    id: '5',
    movieId: '85271',
    title: 'The Queen\'s Gambit',
    poster_path: '/zU0htwkhNvBQdVSIKB9s6hgVeFK.jpg',
    added_date: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
    media_type: 'tv'
  }
];

const WatchlistPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<any>(null);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(mockWatchlist);
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
        // In a real app, fetch watchlist from Supabase
        // const { data, error } = await supabase
        //   .from('watchlist')
        //   .select('*')
        //   .eq('user_id', session.user.id)
        //   .order('added_date', { ascending: false });
        
        // if (error) {
        //   console.error('Error fetching watchlist:', error);
        //   toast({
        //     title: "Error loading watchlist",
        //     description: "There was a problem loading your watchlist",
        //     variant: "destructive"
        //   });
        // } else {
        //   setWatchlist(data);
        // }
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  const handlePlay = (item: WatchlistItem) => {
    setSelectedMovie({ id: item.movieId });
  };

  const handleRemove = (id: string) => {
    // In a real app, delete from Supabase
    // await supabase
    //   .from('watchlist')
    //   .delete()
    //   .eq('id', id);
    
    setWatchlist(watchlist.filter(item => item.id !== id));
  };

  const handleClearAll = () => {
    // In a real app, delete all from Supabase
    // await supabase
    //   .from('watchlist')
    //   .delete()
    //   .eq('user_id', session.user.id);
    
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
