
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import MoviePlayer from '@/components/MoviePlayer';
import { ArrowLeft, X, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

interface Favorite {
  id: string;
  movie_id: string;
  title: string;
  poster_path: string | null;
  release_date: string | null;
  vote_average: number | null;
  is_tv_show: boolean;
  overview?: string | null;
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
  const isMobile = useIsMobile();

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
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pb-12 pt-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-8">
            <Button 
              onClick={() => navigate('/')} 
              variant="ghost" 
              className="mr-2 text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Button>
            <h1 className="text-3xl font-bold text-foreground">My Favorites</h1>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hype-purple"></div>
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-20 bg-card/20 rounded-lg border border-border">
              <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-semibold mb-3 text-foreground">No favorites yet</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Movies and shows you like will appear here. Start exploring content and add your favorites!
              </p>
              <Button 
                onClick={() => navigate('/')} 
                className="bg-hype-purple hover:bg-hype-purple/90"
              >
                Browse Content
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {favorites.map((favorite) => (
                <div 
                  key={favorite.id} 
                  className="relative group h-full"
                  onMouseEnter={() => setHoveredId(favorite.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <Card className="overflow-hidden h-full flex flex-col bg-card/50 backdrop-blur-sm border-border/50 hover:border-hype-purple/50 transition-colors duration-300">
                    <div className="relative">
                      <div className="aspect-[2/3] relative">
                        <img 
                          src={favorite.poster_path 
                            ? `https://image.tmdb.org/t/p/w500${favorite.poster_path}` 
                            : 'https://via.placeholder.com/300x450?text=No+Poster'
                          } 
                          alt={favorite.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute top-2 right-2">
                          <button 
                            className="bg-hype-purple text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFavorite(favorite.id);
                            }}
                            aria-label="Remove from favorites"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3 pt-8">
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center rounded bg-hype-purple/90 px-2 py-1 text-xs font-medium text-white">
                              {favorite.is_tv_show ? 'TV Show' : 'Movie'}
                            </span>
                            <span className="inline-flex items-center text-amber-400 text-sm">
                              ★ {favorite.vote_average !== null ? favorite.vote_average.toFixed(1) : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div 
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4"
                        onClick={() => handleMovieClick(favorite)}
                      >
                        <Button className="w-full bg-hype-purple hover:bg-hype-purple/90">View Details</Button>
                      </div>
                    </div>
                    <CardContent 
                      className="p-4 flex-grow flex flex-col cursor-pointer"
                      onClick={() => handleMovieClick(favorite)}
                    >
                      <h3 className="font-bold text-lg mb-1 line-clamp-1 text-foreground">{favorite.title}</h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        {favorite.release_date?.split('-')[0] || 'N/A'}
                      </p>
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
