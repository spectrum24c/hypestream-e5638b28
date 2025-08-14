import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Layers, List, User } from 'lucide-react';
const BottomNav: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const search = location.search;
  const isActive = (matcher: (path: string, search: string) => boolean) => matcher(pathname, search);
  const openMobileMenu = () => {
    // Notify Navbar to open MobileNavigation (categories, etc.)
    window.dispatchEvent(new Event('open-mobile-menu'));
  };
  const itemCls = (active: boolean) => `flex flex-col items-center justify-center gap-1 text-xs ${active ? 'text-hype-purple' : 'text-muted-foreground'} hover:text-foreground transition-colors`;
  return <nav aria-label="Bottom navigation" className="md:hidden fixed bottom-0 inset-x-0 z-40 backdrop-blur px-0 bg-[#000a0e]/0" style={{
    position: 'fixed',
    bottom: '0',
    left: '0',
    right: '0',
    zIndex: 40
  }}>
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