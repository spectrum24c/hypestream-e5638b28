
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { categories } from '@/data/categories';
import { Notification } from '@/types/notification';
import { fetchFromTMDB, apiPaths } from '@/services/tmdbApi';
import SearchBar from './navbar/SearchBar';
import DesktopNavigation from './navbar/DesktopNavigation';
import MobileNavigation from './navbar/MobileNavigation';
import UserMenu from './navbar/UserMenu';
import NotificationsMenu from './navbar/NotificationsMenu';

const Navbar = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [processedMovieIds, setProcessedMovieIds] = useState<Set<number>>(new Set());
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchLatestMovies();
    
    // Run immediately and then set interval to run every 2 minutes
    const interval = setInterval(() => {
      fetchLatestMovies();
    }, 2 * 60 * 1000); // 2 minutes
    
    return () => clearInterval(interval);
  }, [processedMovieIds]);

  const fetchLatestMovies = async () => {
    try {
      // Get the last page number to fetch different movies
      const page = Math.floor(Math.random() * 5) + 1; // Random page between 1-5
      
      const data = await fetchFromTMDB(`${apiPaths.fetchLatestMovies}&page=${page}`);
      if (data.results && data.results.length > 0) {
        const latestMovies = data.results
          .filter((movie: any) => !processedMovieIds.has(movie.id))
          .slice(0, 3);
        
        if (latestMovies.length === 0) return; // No new movies to show
        
        const newMovieIds = new Set(processedMovieIds);
        const newNotifications: Notification[] = [];
        
        latestMovies.forEach((movie: any) => {
          newMovieIds.add(movie.id);
          newNotifications.push({
            id: `${movie.id}-${Date.now()}`,
            title: "New Release!",
            message: `${movie.title || 'A new movie'} is now available to stream!`,
            poster_path: movie.poster_path,
            movie: {
              id: movie.id
            },
            read: false,
            createdAt: new Date().toISOString()
          });
        });
        
        setProcessedMovieIds(newMovieIds);
        
        if (newNotifications.length > 0) {
          setNotifications(prevNotifications => {
            const combined = [...newNotifications, ...prevNotifications].slice(0, 10);
            setHasUnreadNotifications(true);
            
            // Show toast for new movies
            toast({
              title: "New movies available!",
              description: `${newNotifications.length} new movie(s) just added`,
            });
            
            return combined;
          });
        }
      }
    } catch (error) {
      console.error("Error fetching latest movies for notifications:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      setSession(null);
      toast({
        title: "Signed out successfully",
      });
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error signing out",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!session) return;
    
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
    
    if (confirmDelete) {
      try {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', session.user.id);
        
        await supabase
          .from('profiles')
          .delete()
          .eq('id', session.user.id);
        
        await supabase.auth.signOut();
        
        const { error } = await supabase.rpc('delete_user');
        
        if (error) {
          console.error('Error deleting user account:', error);
        }
        
        toast({
          title: "Account deleted",
          description: "Your account has been permanently deleted",
        });
        
        navigate('/auth');
      } catch (error) {
        console.error('Error deleting account:', error);
        toast({
          title: "Error deleting account",
          description: "There was a problem deleting your account",
          variant: "destructive"
        });
      }
    }
  };

  const handleNewMovies = () => {
    navigate('/?category=new');
  };

  const handleViewAll = (categoryId: string) => {
    navigate(`/?category=${categoryId}`);
  };

  const handleMarkAllAsRead = () => {
    setHasUnreadNotifications(false);
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => ({
        ...notification,
        read: true
      }))
    );
  };
  
  const handleNotificationClick = (notification: Notification) => {
    if (notification.movie) {
      setShowNotifications(false);
      navigate('/', { state: { selectedMovieId: notification.movie.id } });
      
      setNotifications(prevNotifications => 
        prevNotifications.map(n => 
          n.id === notification.id ? { ...n, read: true } : n
        )
      );
      
      const stillHasUnread = notifications.some(n => n.id !== notification.id && !n.read);
      setHasUnreadNotifications(stillHasUnread);
    }
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
  };

  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-hype-dark/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-white">HYPE<span className="text-hype-orange">STREAM</span></span>
            </Link>
          </div>

          <DesktopNavigation 
            categories={categories}
            onNewMovies={handleNewMovies}
          />

          <div className="flex items-center space-x-4">
            <SearchBar 
              isOpen={searchOpen}
              onToggle={toggleSearch}
            />

            <NotificationsMenu 
              notifications={notifications}
              hasUnreadNotifications={hasUnreadNotifications}
              showNotifications={showNotifications}
              onToggleNotifications={setShowNotifications}
              onMarkAllAsRead={handleMarkAllAsRead}
              onNotificationClick={handleNotificationClick}
            />

            <UserMenu 
              session={session}
              onSignOut={handleSignOut}
              onDeleteAccount={handleDeleteAccount}
            />

            <MobileNavigation 
              categories={categories}
              session={session}
              onNewMovies={handleNewMovies}
              onSignOut={handleSignOut}
              onDeleteAccount={handleDeleteAccount}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
