import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Layers, List, User } from 'lucide-react';
const BottomNav: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const search = location.search;
  const [isSearchActive, setIsSearchActive] = useState(false);
  const isActive = (matcher: (path: string, search: string) => boolean) => matcher(pathname, search);

  // Hide bottom nav on auth page
  const shouldHide = pathname === '/auth' || isSearchActive;

  // Listen for search overlay state changes
  useEffect(() => {
    const handleSearchOpen = () => setIsSearchActive(true);
    const handleSearchClose = () => setIsSearchActive(false);
    
    // Listen for mobile search overlay events
    const handleMobileSearchOpen = () => setIsSearchActive(true);
    
    // Listen for navigation events that should close search
    const handleNavigation = () => setIsSearchActive(false);
    
    window.addEventListener('open-mobile-search', handleMobileSearchOpen);
    window.addEventListener('close-mobile-search', handleSearchClose);
    window.addEventListener('search-overlay-open', handleSearchOpen);
    window.addEventListener('search-overlay-close', handleSearchClose);
    
    // Listen for location changes to close search overlay
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
    // Notify Navbar to open MobileNavigation (categories, etc.)
    window.dispatchEvent(new Event('open-mobile-menu'));
  };
  const itemCls = (active: boolean) => `flex flex-col items-center justify-center gap-1 text-xs ${active ? 'text-hype-purple' : 'text-muted-foreground'} hover:text-foreground transition-colors`;
  return <nav 
    aria-label="Bottom navigation" 
    className="md:hidden fixed bottom-0 inset-x-0 z-50 backdrop-blur px-0 bg-[#000a0e]/0" 
    style={{
      position: 'fixed',
      bottom: '0',
      left: '0',
      right: '0',
      zIndex: 50,
      transform: 'translateZ(0)', // Forces hardware acceleration
      WebkitTransform: 'translateZ(0)', // iOS Safari support
    }}
  >
      <ul className="grid grid-cols-4 h-12">
        <li className="flex items-center justify-center">
          <Link to="/" className={itemCls(isActive(p => p === '/'))} aria-current={pathname === '/' ? 'page' : undefined}>
            <Home className="h-5 w-5" />
            <span>Home</span>
          </Link>
        </li>
        <li className="flex items-center justify-center">
          <button onClick={openMobileMenu} className={itemCls(search.includes('category='))} aria-label="Categories">
            <Layers className="h-5 w-5" />
            <span>Categories</span>
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
    </nav>;
};
export default BottomNav;