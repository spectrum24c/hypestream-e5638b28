
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import MovieCard from '@/components/MovieCard';
import MoviePlayer from '@/components/MoviePlayer';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface Favorite {
  id: string;
  movie_id: string;
  title: string;
  poster_path: string | null;
  release_date: string | null;
  vote_average: number | null;
  is_tv_show: boolean;
}

interface MovieDetails {
  id: string;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  media_type?: string;
  overview?: string;
}

const Favorites = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<MovieDetails | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      
      fetchFavorites();

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
        if (event === 'SIGNED_OUT') {
          navigate('/auth');
        }
      });

      return () => subscription.unsubscribe();
    };

    checkSession();
  }, [navigate]);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
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

  const removeFavorite = async (id: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setFavorites(favorites.filter(fav => fav.id !== id));
      toast({
        title: "Removed from favorites",
        description: "The item has been removed from your favorites"
      });
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast({
        title: "Error",
        description: "There was a problem removing the item from favorites",
        variant: "destructive"
      });
    }
  };

  const handleMovieClick = (favorite: Favorite) => {
    const movie: MovieDetails = {
      id: favorite.movie_id,
      title: favorite.title,
      poster_path: favorite.poster_path,
      release_date: favorite.release_date || undefined,
      vote_average: favorite.vote_average || undefined,
      media_type: favorite.is_tv_show ? 'tv' : 'movie'
    };
    setSelectedMovie(movie);
  };

  return (
    <div className="min-h-screen bg-hype-dark text-foreground">
      <Navbar />
      <main className="pb-8 pt-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-8">
            <Button 
              onClick={() => navigate('/')} 
              variant="ghost" 
              className="mr-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Button>
            <h1 className="text-3xl font-bold">My Favorites</h1>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hype-purple"></div>
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-4">No favorites yet</h2>
              <p className="text-muted-foreground">Movies and shows you favorite will appear here</p>
              <Button 
                onClick={() => navigate('/')} 
                className="mt-6 bg-hype-purple hover:bg-hype-purple/90"
              >
                Browse Content
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
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
                  <div 
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center cursor-pointer transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFavorite(favorite.id);
                    }}
                  >
                    ✕
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />

      {selectedMovie && (
        <MoviePlayer movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}
    </div>
  );
};

export default Favorites;
