
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileNavigation from './navbar/MobileNavigation';
import DesktopNavigation from './navbar/DesktopNavigation';
import SearchBar from './navbar/SearchBar';
import NotificationsMenu from './navbar/NotificationsMenu';
import UserMenu from './navbar/UserMenu';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/types/notification';

export default function Navbar() {
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [session, setSession] = useState<any>(null);
  const [isSubscriber, setIsSubscriber] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is authenticated
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      
      if (currentSession) {
        // Fetch subscription status
        fetchSubscriptionStatus(currentSession.user.id);
        
        // Fetch notifications - commented out since notifications table doesn't exist yet
        // fetchNotifications(currentSession.user.id);
      }
    });
    
    // Setup auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        
        if (newSession) {
          fetchSubscriptionStatus(newSession.user.id);
          // Commented out since notifications table doesn't exist yet
          // fetchNotifications(newSession.user.id);
        } else {
          setNotifications([]);
          setUnreadCount(0);
          setIsSubscriber(false);
        }
      }
    );
    
    // Clean up subscription when component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchSubscriptionStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      // For now, we'll default all users to subscribers since we don't have that field
      setIsSubscriber(true);
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/', { state: { searchQuery } });
      setSearchQuery('');
    }
  };

  const markNotificationsAsRead = async () => {
    // Since we don't have notifications table yet, this is a placeholder
    setUnreadCount(0);
    setNotifications(prev => 
      prev.map(notification => ({
        ...notification,
        read: true
      }))
    );
  };

  // Fix the Promise<void> type issue by handling the return value correctly
  const handleSignOut = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    }
  };

  // Fix the Promise<void> type issue for deleteAccount as well
  const handleDeleteAccount = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error deleting account:", error);
    }
    // Note: Actual account deletion would require more logic
    console.log("Delete account functionality would go here");
  };

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 w-full z-40 transition-all duration-300",
        isScrolled ? "bg-hype-dark/90 backdrop-blur-sm shadow-lg py-2" : "bg-gradient-to-b from-hype-dark/90 to-transparent py-3"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-hype-orange to-hype-purple bg-clip-text text-transparent">
              HypeStream
            </h1>
          </Link>

          {/* Desktop Navigation */}
          {!isMobile && <DesktopNavigation />}

          {/* Right Side - Search, Notifications, Profile */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Search */}
            <SearchBar 
              isOpen={true}
              onToggle={() => {}}
              className=""
            />

            {/* Notifications */}
            {session && (
              <NotificationsMenu
                notifications={notifications}
                unreadCount={unreadCount}
                markAsRead={markNotificationsAsRead}
              />
            )}

            {/* User Menu or Login Button */}
            <UserMenu 
              session={session} 
              onSignOut={handleSignOut}
              onDeleteAccount={handleDeleteAccount}
            />
            
            {/* Mobile Menu Toggle */}
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="ml-1 text-foreground"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobile && isMenuOpen && (
        <MobileNavigation 
          session={session}
          onSignOut={handleSignOut}
          onDeleteAccount={handleDeleteAccount}
        />
      )}
    </header>
  );
}
