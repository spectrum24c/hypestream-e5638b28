import React, { useState, useEffect } from 'react';
import { Search, Bell, User, Menu, X, ChevronDown, LogOut, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { imgPath } from '@/services/tmdbApi';

interface Notification {
  id: number;
  title: string;
  message: string;
  poster_path?: string;
  movie?: {
    id: string;
  };
}

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [session, setSession] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, title: "New movies available!", message: "Check out the latest releases this week!", poster_path: "/example-poster.jpg" }
  ]);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const categories = [
    { name: 'Movies', id: 'movie', subcategories: [
      { name: 'Action', id: 28 },
      { name: 'Comedy', id: 35 },
      { name: 'Drama', id: 18 },
      { name: 'Horror', id: 27 }
    ]},
    { name: 'TV Shows', id: 'tv', subcategories: [
      { name: 'Drama', id: 18 },
      { name: 'Comedy', id: 35 },
      { name: 'Crime', id: 80 },
      { name: 'Fantasy', id: 14 }
    ]},
    { name: 'Anime', id: 'anime', subcategories: [
      { name: 'Shonen', id: 'shonen' },
      { name: 'Seinen', id: 'seinen' },
      { name: 'Romance', id: 'romance' },
      { name: 'Fantasy', id: 'fantasy' }
    ]},
    { name: 'New', id: 'new', subcategories: [] },
  ];

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

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/', { state: { searchQuery: searchQuery.trim() } });
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const handleNewMovies = () => {
    navigate('/?category=new');
  };

  const handleViewAll = (categoryId: string, genreId: number | string | null = null) => {
    if (genreId) {
      navigate(`/?category=${categoryId}&genre=${genreId}`);
    } else {
      navigate(`/?category=${categoryId}`);
    }
  };
  
  const handleMarkAllAsRead = () => {
    setHasUnreadNotifications(false);
    setNotifications([]);
  };
  
  const handleNotificationClick = (notification: Notification) => {
    if (notification.movie) {
      setShowNotifications(false);
      navigate('/', { state: { selectedMovieId: notification.movie.id } });
    }
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

          <nav className="hidden md:flex items-center space-x-1">
            {categories.map((category) => (
              <div key={category.name} className="relative group">
                {category.id === 'new' ? (
                  <button 
                    className="nav-link group flex items-center"
                    onClick={handleNewMovies}
                  >
                    {category.name}
                  </button>
                ) : (
                  <>
                    <button 
                      className="nav-link group flex items-center"
                    >
                      {category.name}
                      {category.subcategories.length > 0 && <ChevronDown className="ml-1 h-4 w-4" />}
                    </button>
                    
                    {category.subcategories.length > 0 && (
                      <div className="absolute left-0 top-full z-10 mt-2 w-48 origin-top-left rounded-md bg-card border border-border shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none hidden group-hover:block">
                        <div className="py-1">
                          {category.subcategories.map((sub) => (
                            <Link
                              key={sub.name}
                              to={`/?category=${category.id}&genre=${sub.id}`}
                              className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className={`${searchOpen ? 'flex absolute left-0 right-0 mx-auto top-16 w-[90%] md:static md:w-auto md:mx-0' : 'hidden'} md:flex items-center relative z-20`}>
              <input
                type="text"
                placeholder="Search titles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-muted rounded-full py-2 px-4 pr-10 text-sm border border-border w-full min-w-[300px] focus:border-hype-purple focus:outline-none"
              />
              <button type="submit" className="absolute right-3">
                <Search className="h-4 w-4 text-muted-foreground" />
              </button>
            </form>

            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            >
              <Search className="h-5 w-5" />
            </button>

            <Popover open={showNotifications} onOpenChange={setShowNotifications}>
              <PopoverTrigger asChild>
                <button className="p-2 text-muted-foreground hover:text-foreground relative">
                  <Bell className="h-5 w-5" />
                  {hasUnreadNotifications && notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-2 h-2"></span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div className="font-medium flex justify-between items-center">
                    <span>Notifications</span>
                    {notifications.length > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs"
                        onClick={handleMarkAllAsRead}
                      >
                        Mark all as read
                      </Button>
                    )}
                  </div>
                  
                  {notifications.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No notifications
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className="py-3 cursor-pointer hover:bg-muted/50 rounded-md px-2"
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-center gap-3">
                            {notification.poster_path && (
                              <img 
                                src={`${imgPath}${notification.poster_path}`} 
                                alt="" 
                                className="w-10 h-10 rounded object-cover"
                              />
                            )}
                            <div>
                              <h4 className="text-sm font-medium">{notification.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {session ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="rounded-full p-2 flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span className="hidden md:inline-block">Account</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56">
                  <div className="grid gap-4">
                    <div className="font-medium">
                      {session.user.email}
                    </div>
                    <Link to="/profile" className="text-sm hover:underline">
                      View Profile
                    </Link>
                    <Link to="/favorites" className="text-sm hover:underline">
                      My Favorites
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center" 
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="flex items-center" 
                      onClick={handleDeleteAccount}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="rounded-full p-2 flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span className="hidden md:inline-block">Account</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56">
                  <div className="grid gap-4">
                    <Link to="/auth">
                      <Button className="w-full bg-hype-purple hover:bg-hype-purple/90">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/auth">
                      <Button variant="outline" className="w-full">
                        Create Account
                      </Button>
                    </Link>
                  </div>
                </PopoverContent>
              </Popover>
            )}

            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="md:hidden p-2 text-white hover:text-gray-200"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-hype-dark border-border overflow-y-auto max-h-screen">
                <div className="py-4">
                  <nav className="flex flex-col space-y-4">
                    {categories.map((category) => (
                      <div key={category.name} className="space-y-2">
                        <div className="text-foreground text-lg font-medium">
                          {category.id === 'new' ? (
                            <button 
                              className="text-foreground hover:text-hype-purple"
                              onClick={handleNewMovies}
                            >
                              {category.name}
                            </button>
                          ) : (
                            <button 
                              className="text-foreground hover:text-hype-purple"
                            >
                              {category.name}
                            </button>
                          )}
                        </div>
                        {category.subcategories.length > 0 && (
                          <div className="ml-4 space-y-2 border-l border-border pl-4">
                            {category.subcategories.map((sub) => (
                              <Link
                                key={sub.name}
                                to={`/?category=${category.id}&genre=${sub.id}`}
                                className="block text-muted-foreground hover:text-foreground"
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {session ? (
                      <div className="pt-4 border-t border-border mt-4">
                        <div className="text-sm text-muted-foreground mb-2">
                          Signed in as {session.user.email}
                        </div>
                        <div className="space-y-2">
                          <Link to="/profile" className="block text-foreground">
                            Profile
                          </Link>
                          <Link to="/favorites" className="block text-foreground">
                            My Favorites
                          </Link>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center mt-2" 
                            onClick={handleSignOut}
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="flex items-center mt-2 w-full" 
                            onClick={handleDeleteAccount}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Account
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-4 border-t border-border mt-4 space-y-2">
                        <Link to="/auth">
                          <Button className="w-full bg-hype-purple hover:bg-hype-purple/90">
                            Sign In
                          </Button>
                        </Link>
                        <Link to="/auth">
                          <Button variant="outline" className="w-full">
                            Create Account
                          </Button>
                        </Link>
                      </div>
                    )}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
