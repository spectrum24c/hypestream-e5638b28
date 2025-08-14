import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import DesktopNavigation from './navbar/DesktopNavigation';
import MobileNavigation from './navbar/MobileNavigation';
import SearchBar from './navbar/SearchBar';
import BottomNav from './navbar/BottomNav';
import UserMenu from './navbar/UserMenu';
import NotificationsMenu from './navbar/NotificationsMenu';
import useIsMobile from '@/hooks/useIsMobile';
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/types/movie';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    // Check notification settings from user preferences
    const storedPreferences = localStorage.getItem('userPreferences');
    if (storedPreferences) {
      try {
        const preferences = JSON.parse(storedPreferences);
        setNotificationsEnabled(preferences.enableNotifications);
      } catch (error) {
        console.error('Error parsing stored preferences:', error);
      }
    }

    // Get notifications from localStorage if available
    const storedNotifications = localStorage.getItem('notifications');
    if (storedNotifications) {
      try {
        const parsedNotifications = JSON.parse(storedNotifications);
        if (Array.isArray(parsedNotifications) && parsedNotifications.length > 0) {
          // Filter notifications based on user preferences if available
          if (storedPreferences) {
            const preferences = JSON.parse(storedPreferences);
            const preferredGenres = preferences.preferredGenres || [];
            const preferredLanguages = preferences.preferredLanguages || [];
            
            // Only keep notifications that match user preferences
            const filteredNotifications = parsedNotifications.filter((notification: Notification) => {
              // If it's a movie notification, check if it matches user preferences
              if (notification.movie && notification.movie.id) {
                // Get movie details from localStorage if available (simplified approach)
                const movieCache = localStorage.getItem(`movie_${notification.movie.id}`);
                if (movieCache) {
                  try {
                    const movieData = JSON.parse(movieCache);
                    // Check if movie genre matches preferred genres
                    if (movieData.genre_ids && preferredGenres.length > 0) {
                      const hasMatchingGenre = movieData.genre_ids.some((genreId: number) => 
                        preferredGenres.includes(genreId)
                      );
                      if (!hasMatchingGenre) return false;
                    }
                    
                    // Check if movie language matches preferred languages
                    if (movieData.original_language && preferredLanguages.length > 0) {
                      if (!preferredLanguages.includes(movieData.original_language)) {
                        return false;
                      }
                    }
                  } catch (error) {
                    console.error('Error parsing movie cache:', error);
                  }
                }
              }
              
              return true;
            });
            
            setNotifications(filteredNotifications);
            const unreadCount = filteredNotifications.filter(n => !n.read).length;
            setUnreadCount(unreadCount);
            return;
          } else {
            // No preferences, show all notifications
            setNotifications(parsedNotifications);
            const unreadCount = parsedNotifications.filter(n => !n.read).length;
            setUnreadCount(unreadCount);
            return;
          }
        }
      } catch (error) {
        console.error('Error parsing stored notifications:', error);
      }
    }

    // Generate initial notifications only if we don't have stored ones
    if (notificationsEnabled) {
      const initialNotifications: Notification[] = [
        {
          id: `movie-init-1`,
          title: 'New on HypeStream',
          message: `"The Dark Knight" is now available to watch!`,
          poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
          movie: {
            id: '155'
          },
          read: false,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          timestamp: Date.now() - 86400000,
          isNew: true,
          type: 'new',
          isPersistent: true
        },
        {
          id: `suggestion-init-1`,
          title: 'Recommended for You',
          message: 'Based on your interests, you might enjoy "Inception"!',
          poster_path: '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
          movie: {
            id: '27205'
          },
          read: false,
          createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
          timestamp: Date.now() - 2 * 86400000,
          isNew: false,
          type: 'suggestion',
          isPersistent: true
        }
      ];
      
      setNotifications(initialNotifications);
      setUnreadCount(initialNotifications.length);
      localStorage.setItem('notifications', JSON.stringify(initialNotifications));
    }

    return () => subscription.unsubscribe();
  }, []);

  // Listen for changes to user preferences
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userPreferences' || e.key === 'notificationsEnabled') {
        try {
          const storedPreferences = localStorage.getItem('userPreferences');
          if (storedPreferences) {
            const preferences = JSON.parse(storedPreferences);
            setNotificationsEnabled(preferences.enableNotifications);
          }
        } catch (error) {
          console.error('Error parsing preferences:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Allow opening the mobile menu from other components (e.g., BottomNav)
  useEffect(() => {
    const handler = () => setIsMenuOpen(true);
    window.addEventListener('open-mobile-menu', handler as unknown as EventListener);
    return () => window.removeEventListener('open-mobile-menu', handler as unknown as EventListener);
  }, []);
  const toggleSearch = () => {
    if (isMobile) {
      // For mobile, dispatch the event to open mobile search overlay
      window.dispatchEvent(new Event('open-mobile-search'));
    } else {
      setIsSearchOpen(!isSearchOpen);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleSignOut = async () => {
    // This function is no longer needed as UserMenu handles it directly
    console.log('Sign out handled by UserMenu');
  };

  const handleDeleteAccount = async () => {
    // This function is no longer needed as UserMenu handles it directly
    console.log('Delete account handled by UserMenu');
  };

  const markNotificationsAsRead = async () => {
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updatedNotifications);
    setUnreadCount(0);
    
    // Save read status to localStorage
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  return (
    <>
      <header 
        className={cn(
          "fixed top-0 left-0 w-full z-40 transition-all duration-300",
          isScrolled ? "bg-hype-dark/90 shadow-lg py-2" : "bg-gradient-to-b from-hype-dark/90 to-transparent py-3"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-hype-orange to-hype-purple bg-clip-text text-transparent">
                HypeStream
              </h1>
            </Link>

            <DesktopNavigation />

            <div className="flex items-center space-x-2 md:space-x-4">
              <SearchBar 
                isOpen={isMobile ? isSearchOpen : true}
                onToggle={toggleSearch}
                className="z-20"
              />

              {session && (
                <NotificationsMenu
                  notifications={notifications}
                  unreadCount={unreadCount}
                  markAsRead={markNotificationsAsRead}
                />
              )}

              <UserMenu 
                session={session} 
                onSignOut={handleSignOut}
                onDeleteAccount={handleDeleteAccount}
              />

              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMenu}
                  className="ml-1 text-foreground"
                  aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                >
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </Button>
              )}
            </div>
          </div>
        </div>

        {isMobile && isMenuOpen && (
          <MobileNavigation 
            session={session}
            onSignOut={handleSignOut}
            onDeleteAccount={handleDeleteAccount}
            onClose={closeMenu}
          />
        )}
      </header>

      {/* Mobile bottom navigation */}
      <BottomNav />
    </>
  );
};

export default Navbar;
