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

  if (shouldHide) return null;

  const openMobileMenu = () => {
    window.dispatchEvent(new Event('open-mobile-menu'));
  };

  const itemCls = (active: boolean) => 
    `flex flex-col items-center justify-center gap-1 text-xs font-medium transition-all duration-200 ${
      active ? 'text-primary scale-105' : 'text-muted-foreground hover:text-foreground'
    }`;

  return (
    <nav 
      aria-label="Bottom navigation" 
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border" 
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
      }}
    >
      <ul className="grid grid-cols-5 h-16 max-w-md mx-auto">
        <li className="flex items-center justify-center">
          <Link to="/" className={itemCls(isActive(p => p === '/'))} aria-current={pathname === '/' ? 'page' : undefined}>
            <Home className="h-5 w-5" />
            <span>Home</span>
          </Link>
        </li>
        <li className="flex items-center justify-center">
          <button onClick={openMobileMenu} className={itemCls(search.includes('category='))} aria-label="Categories">
            <Layers className="h-5 w-5" />
            <span>Browse</span>
          </button>
        </li>
        <li className="flex items-center justify-center">
          <button onClick={() => window.dispatchEvent(new Event('open-hype-chat'))} className={itemCls(false)} aria-label="AI Chat">
            <div className="p-2 rounded-full bg-primary text-primary-foreground">
              <Bot className="h-5 w-5" />
            </div>
            <span className="text-primary">AI</span>
          </button>
        </li>
        <li className="flex items-center justify-center">
          <Link to="/favorites" className={itemCls(isActive(p => p === '/favorites'))} aria-current={pathname === '/favorites' ? 'page' : undefined}>
            <List className="h-5 w-5" />
            <span>My List</span>
          </Link>
        </li>
        <li className="flex items-center justify-center">
          <Link to="/profile" className={itemCls(isActive(p => p === '/profile'))} aria-current={pathname === '/profile' ? 'page' : undefined}>
            <User className="h-5 w-5" />
            <span>Profile</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default BottomNav;