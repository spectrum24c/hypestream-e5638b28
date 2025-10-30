import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Layers, List, User } from 'lucide-react';
import '@/utils/bottom-nav.css';
const BottomNav: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const search = location.search;
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [itemWidth, setItemWidth] = useState(90);

  // Update item width based on screen size
  useEffect(() => {
    const updateWidth = () => {
      setItemWidth(window.innerWidth <= 400 ? 80 : 90);
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Determine active index based on route
  const getActiveIndex = () => {
    if (pathname === '/') return 0;
    if (search.includes('category=')) return 1;
    if (pathname === '/favorites') return 2;
    if (pathname === '/profile') return 3;
    return 0;
  };
  const activeIndex = getActiveIndex();

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
    window.dispatchEvent(new Event('open-mobile-menu'));
  };
  return <nav aria-label="Bottom navigation" className="bottom-navigation md:hidden">
      <ul>
        <li className={activeIndex === 0 ? 'list active' : 'list'}>
          <Link to="/" aria-current={pathname === '/' ? 'page' : undefined}>
            <span className="icon">
              <Home className="h-6 w-6" />
            </span>
            <span className="text text-[#000a00]/0">Home</span>
          </Link>
        </li>

        <li className={activeIndex === 1 ? 'list active' : 'list'}>
          <button onClick={openMobileMenu} aria-label="Categories">
            <span className="icon">
              <Layers className="h-6 w-6" />
            </span>
            <span className="text">Categories</span>
          </button>
        </li>

        <li className={activeIndex === 2 ? 'list active' : 'list'}>
          <Link to="/favorites" aria-current={pathname === '/favorites' ? 'page' : undefined}>
            <span className="icon">
              <List className="h-6 w-6" />
            </span>
            <span className="text">My List</span>
          </Link>
        </li>

        <li className={activeIndex === 3 ? 'list active' : 'list'}>
          <Link to="/profile" aria-current={pathname === '/profile' ? 'page' : undefined}>
            <span className="icon">
              <User className="h-6 w-6" />
            </span>
            <span className="text">Profile</span>
          </Link>
        </li>

        <div className="indicator" style={{
        transform: `translateX(${activeIndex * itemWidth}px)`
      }} />
      </ul>
    </nav>;
};
export default BottomNav;