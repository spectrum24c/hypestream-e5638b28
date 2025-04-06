
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MovieCard from '@/components/MovieCard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type Favorite = Database['public']['Tables']['favorites']['Row'];

const Favorites = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (!currentSession) {
        navigate('/auth');
      } else {
        fetchFavorites(currentSession.user.id);
      }
    });

    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        if (!newSession && event === 'SIGNED_OUT') {
          navigate('/auth');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchFavorites = async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast({
        title: "Error loading favorites",
        description: "There was a problem loading your favorites",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);
      
      if (error) throw error;
      
      setFavorites(favorites.filter(fav => fav.id !== favoriteId));
      toast({
        title: "Removed from favorites",
      });
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast({
        title: "Error removing favorite",
        variant: "destructive"
      });
    }
  };

  const handleMovieClick = (favorite: Favorite) => {
    // For future implementation: show movie details or play movie
    console.log("Favorite clicked:", favorite);
  };

  return (
    <div className="min-h-screen bg-hype-dark text-foreground">
      <Navbar />
      <main className="pb-8 pt-24">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">My Favorites</h1>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hype-purple"></div>
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">You haven't added any favorites yet</p>
              <button 
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-hype-purple hover:bg-hype-purple/90 rounded-md"
              >
                Discover Content
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {favorites.map((favorite) => (
                <div key={favorite.id} className="relative group">
                  <MovieCard
                    id={favorite.movie_id}
                    title={favorite.title}
                    posterPath={favorite.poster_path}
                    releaseDate={favorite.release_date}
                    voteAverage={favorite.vote_average}
                    isTVShow={favorite.is_tv_show}
                    onClick={() => handleMovieClick(favorite)}
                  />
                  <button
                    className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFavorite(favorite.id);
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Favorites;
