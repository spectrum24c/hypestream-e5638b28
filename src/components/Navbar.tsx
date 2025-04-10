
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useMediaQuery } from '@/hooks/use-mobile';
import MobileNavigation from './navbar/MobileNavigation';
import DesktopNavigation from './navbar/DesktopNavigation';
import SearchBar from './navbar/SearchBar';
import NotificationsMenu from './navbar/NotificationsMenu';
import UserMenu from './navbar/UserMenu';
import { Bell, Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/types/notification';

export default function Navbar() {
  const isMobile = useMediaQuery('(max-width: 768px)');
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
        
        // Fetch notifications
        fetchNotifications(currentSession.user.id);
      }
    });
    
    // Setup auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        
        if (newSession) {
          fetchSubscriptionStatus(newSession.user.id);
          fetchNotifications(newSession.user.id);
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
        .select('subscription_status')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      setIsSubscriber(data?.subscription_status === 'active');
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    }
  };

  const fetchNotifications = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      if (data) {
        const notificationsWithFormatting: Notification[] = data.map((notification: any) => ({
          id: notification.id,
          title: notification.title,
          message: notification.message,
          image: notification.image,
          poster_path: notification.poster_path,
          createdAt: notification.created_at,
          read: notification.read,
          movie: notification.movie_id ? { id: notification.movie_id } : undefined
        }));
        
        setNotifications(notificationsWithFormatting);
        
        const unread = data.filter((notification: any) => !notification.read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
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
    if (!session) return;
    
    try {
      // Get unread notification IDs
      const unreadIds = notifications
        .filter(notification => !notification.read)
        .map(notification => notification.id);
      
      if (unreadIds.length === 0) return;
      
      // Update notifications to mark as read
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', unreadIds);
      
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          read: true
        }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
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
          {!isMobile && (
            <DesktopNavigation isSubscriber={isSubscriber} />
          )}

          {/* Right Side - Search, Notifications, Profile */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Search */}
            <SearchBar 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery} 
              handleSearch={handleSearch} 
              isMobile={isMobile}
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
            <UserMenu session={session} />
            
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
        <MobileNavigation isSubscriber={isSubscriber} />
      )}
    </header>
  );
}
