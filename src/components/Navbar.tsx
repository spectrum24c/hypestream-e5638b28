
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
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

  // Since we don't have the notifications table yet, we'll comment out this function
  /*
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
  */

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
            <nav className="hidden md:flex items-center space-x-1">
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/favorites" className="nav-link">My List</Link>
              <Link to="/devices" className="nav-link">Devices</Link>
              <Link to="/faqs" className="nav-link">FAQs</Link>
            </nav>
          )}

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
              <Popover>
                <PopoverTrigger asChild>
                  <button className="p-2 text-muted-foreground hover:text-foreground relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-2 h-2"></span>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="p-4">
                    <h3 className="font-bold">Notifications</h3>
                    <p className="text-sm text-muted-foreground">No new notifications</p>
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {/* User Menu or Login Button */}
            <UserMenu 
              session={session} 
              onSignOut={() => supabase.auth.signOut()}
              onDeleteAccount={() => console.log("Delete account")}
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
        <div className="bg-hype-dark border-t border-border">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              <Link to="/" className="text-foreground hover:text-white">Home</Link>
              <Link to="/favorites" className="text-foreground hover:text-white">My List</Link>
              <Link to="/devices" className="text-foreground hover:text-white">Devices</Link>
              <Link to="/faqs" className="text-foreground hover:text-white">FAQs</Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
