import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import DesktopNavigation from './navbar/DesktopNavigation';
import MobileNavigation from './navbar/MobileNavigation';
import SearchBar from './navbar/SearchBar';
import UserMenu from './navbar/UserMenu';
import NotificationsMenu from './navbar/NotificationsMenu';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/types/notification';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
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

    return () => subscription.unsubscribe();
  }, []);

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleDeleteAccount = async () => {
    console.log('Delete account requested');
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const markNotificationsAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
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
  );
};

export default Navbar;
