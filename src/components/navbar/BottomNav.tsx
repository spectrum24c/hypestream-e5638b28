import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Layers, List, User, Bot } from 'lucide-react';

const BottomNav: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const search = location.search;
  const [isSearchActive, setIsSearchActive] = useState(false);
  const isActive = (matcher: (path: string, search: string) => boolean) => matcher(pathname, search);

  const shouldHide = pathname === '/auth' || isSearchActive;

  useEffect(() => {
    const handleSearchOpen = () => setIsSearchActive(true);
    const handleSearchClose = () => setIsSearchActive(false);
    const handleMobileSearchOpen = () => setIsSearchActive(true);
    
    window.addEventListener('open-mobile-search', handleMobileSearchOpen);
    window.addEventListener('close-mobile-search', handleSearchClose);
    window.addEventListener('search-overlay-open', handleSearchOpen);
    window.addEventListener('search-overlay-close', handleSearchClose);
    
    setIsSearchActive(false);
    
    return () => {
      window.removeEventListener('open-mobile-search', handleMobileSearchOpen);
      window.removeEventListener('close-mobile-search', handleSearchClose);
      window.removeEventListener('search-overlay-open', handleSearchOpen);
      window.removeEventListener('search-overlay-close', handleSearchClose);
    };
  }, [pathname]);

  if (shouldHide) {
    return null;
  }

  const openMobileMenu = () => {
    window.dispatchEvent(new Event('open-mobile-menu'));
  };

  const itemCls = (active: boolean) => 
    `flex flex-col items-center justify-center gap-1 text-xs font-medium transition-all duration-200 ${
      active 
        ? 'text-primary scale-105' 
        : 'text-muted-foreground hover:text-foreground'
    }`;

  return (
    <nav 
      aria-label="Bottom navigation" 
      className="md:hidden fixed bottom-5 left-5 right-5 z-50 rounded-[20px] bg-gradient-to-t from-background via-background/95 to-background/80 backdrop-blur-lg border-t border-border/50" 
      style={{
        position: 'fixed',
        bottom: 20,
        left: 20,
        right: 20,
        zIndex: 50,
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
      }}
    >
      <ul className="grid grid-cols-5 h-16 max-w-md mx-auto">
        <li className="flex items-center justify-center">
          <Link 
            to="/" 
            className={itemCls(isActive(p => p === '/'))} 
            aria-current={pathname === '/' ? 'page' : undefined}
          >
            <div className={`p-2 rounded-xl transition-colors ${isActive(p => p === '/') ? 'bg-primary/20' : ''}`}>
              <Home className="h-5 w-5" />
            </div>
            <span>Home</span>
          </Link>
        </li>
        <li className="flex items-center justify-center">
          <button 
            onClick={openMobileMenu} 
            className={itemCls(search.includes('category='))} 
            aria-label="Categories"
          >
            <div className={`p-2 rounded-xl transition-colors ${search.includes('category=') ? 'bg-primary/20' : ''}`}>
              <Layers className="h-5 w-5" />
            </div>
            <span>Browse</span>
          </button>
        </li>
        <li className="flex items-center justify-center">
          <button 
            onClick={() => window.dispatchEvent(new Event('open-hype-chat'))} 
            className={itemCls(false)} 
            aria-label="AI Chat"
          >
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/30">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <span className="text-primary">AI</span>
          </button>
        </li>
        <li className="flex items-center justify-center">
          <Link 
            to="/favorites" 
            className={itemCls(isActive(p => p === '/favorites'))} 
            aria-current={pathname === '/favorites' ? 'page' : undefined}
          >
            <div className={`p-2 rounded-xl transition-colors ${isActive(p => p === '/favorites') ? 'bg-primary/20' : ''}`}>
              <List className="h-5 w-5" />
            </div>
            <span>My List</span>
          </Link>
        </li>
        <li className="flex items-center justify-center">
          <Link 
            to="/profile" 
            className={itemCls(isActive(p => p === '/profile'))} 
            aria-current={pathname === '/profile' ? 'page' : undefined}
          >
            <div className={`p-2 rounded-xl transition-colors ${isActive(p => p === '/profile') ? 'bg-primary/20' : ''}`}>
              <User className="h-5 w-5" />
            </div>
            <span>Profile</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default BottomNav;
