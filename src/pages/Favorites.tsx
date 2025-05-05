
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import MovieCard from '@/components/MovieCard';
import MoviePlayer from '@/components/MoviePlayer';
import { ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

interface Favorite {
  id: string;
  movie_id: string;
  title: string;
  poster_path: string | null;
  release_date: string | null;
  vote_average: number | null;
  is_tv_show: boolean;
  overview?: string | null; // Make overview optional since it might be missing from the database
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
  const [hoveredId, setHoveredId] = useState<string | null>(null);
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
      
      // Cast the data to Favorite[] type, ensuring it matches our interface
      setFavorites(data as Favorite[]);
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
      media_type: favorite.is_tv_show ? 'tv' : 'movie',
      overview: favorite.overview || undefined
    };
    setSelectedMovie(movie);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
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
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-4">No favorites yet</h2>
              <p className="text-muted-foreground">Movies and shows you favorite will appear here</p>
              <Button 
                onClick={() => navigate('/')} 
                className="mt-6"
              >
                Browse Content
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {favorites.map((favorite) => (
                <div 
                  key={favorite.id} 
                  className="relative group flex flex-col h-full"
                  onMouseEnter={() => setHoveredId(favorite.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <Card className="overflow-hidden h-full flex flex-col bg-card">
                    <div className="relative">
                      <div className="aspect-[2/3] relative">
                        <img 
                          src={favorite.poster_path 
                            ? `https://image.tmdb.org/t/p/w500${favorite.poster_path}` 
                            : 'https://via.placeholder.com/300x450?text=No+Poster'
                          } 
                          alt={favorite.title}
                          className="w-full h-full object-cover"
                        />
                        <button 
                          className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center cursor-pointer transition-opacity sm:opacity-0 sm:group-hover:opacity-100 opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFavorite(favorite.id);
                          }}
                          aria-label="Remove from favorites"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div 
                        className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4"
                        onClick={() => handleMovieClick(favorite)}
                      >
                        <Button className="w-full" size="sm">View Details</Button>
                      </div>
                    </div>
                    <CardContent 
                      className="p-4 flex-grow flex flex-col cursor-pointer"
                      onClick={() => handleMovieClick(favorite)}
                    >
                      <h3 className="font-bold text-lg mb-1 line-clamp-1">{favorite.title}</h3>
                      <div className="flex justify-between text-muted-foreground text-sm mb-2">
                        <span>{favorite.release_date?.split('-')[0] || 'N/A'}</span>
                        <span>★ {favorite.vote_average !== null ? favorite.vote_average.toFixed(1) : 'N/A'}</span>
                      </div>
                      {favorite.overview && (
                        <p className="text-sm text-muted-foreground line-clamp-3 mt-auto">
                          {favorite.overview}
                        </p>
                      )}
                    </CardContent>
                  </Card>
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
