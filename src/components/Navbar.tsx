import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Search } from 'lucide-react';
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

    const storedPreferences = localStorage.getItem('userPreferences');
    if (storedPreferences) {
      try {
        const preferences = JSON.parse(storedPreferences);
        setNotificationsEnabled(preferences.enableNotifications);
      } catch (error) {
        console.error('Error parsing stored preferences:', error);
      }
    }

    const storedNotifications = localStorage.getItem('notifications');
    if (storedNotifications) {
      try {
        const parsedNotifications = JSON.parse(storedNotifications);
        if (Array.isArray(parsedNotifications) && parsedNotifications.length > 0) {
          if (storedPreferences) {
            const preferences = JSON.parse(storedPreferences);
            const preferredGenres = preferences.preferredGenres || [];
            const preferredLanguages = preferences.preferredLanguages || [];
            
            const filteredNotifications = parsedNotifications.filter((notification: Notification) => {
              if (notification.movie && notification.movie.id) {
                const movieCache = localStorage.getItem(`movie_${notification.movie.id}`);
                if (movieCache) {
                  try {
                    const movieData = JSON.parse(movieCache);
                    if (movieData.genre_ids && preferredGenres.length > 0) {
                      const hasMatchingGenre = movieData.genre_ids.some((genreId: number) => 
                        preferredGenres.includes(genreId)
                      );
                      if (!hasMatchingGenre) return false;
                    }
                    
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

    if (notificationsEnabled) {
      const initialNotifications: Notification[] = [
        {
          id: `movie-init-1`,
          title: 'New on HypeStream',
          message: `"The Dark Knight" is now available to watch!`,
          poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
          movie: { id: '155' },
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
          movie: { id: '27205' },
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

  useEffect(() => {
    const handler = () => setIsMenuOpen(true);
    window.addEventListener('open-mobile-menu', handler as unknown as EventListener);
    return () => window.removeEventListener('open-mobile-menu', handler as unknown as EventListener);
  }, []);

  const toggleSearch = () => {
    if (isMobile) {
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
    console.log('Sign out handled by UserMenu');
  };

  const handleDeleteAccount = async () => {
    console.log('Delete account handled by UserMenu');
  };

  const markNotificationsAsRead = async () => {
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updatedNotifications);
    setUnreadCount(0);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  return (
    <>
      <header 
        className={cn(
          "fixed top-0 left-0 w-full z-40 transition-all duration-500",
          isScrolled 
            ? "bg-background/95 backdrop-blur-lg shadow-lg border-b border-border/50 py-2" 
            : "bg-gradient-to-b from-background/80 via-background/40 to-transparent py-4"
        )}
      >
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 group">
              <h1 className="font-display text-3xl md:text-4xl tracking-wider text-foreground transition-colors">
                HYPE<span className="text-primary group-hover:text-primary/80 transition-colors">STREAM</span>
              </h1>
            </Link>

            <DesktopNavigation />

            <div className="flex items-center gap-2 md:gap-4">
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
                  className="ml-1 text-foreground hover:bg-secondary"
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

      <BottomNav />
    </>
  );
};

export default Navbar;
