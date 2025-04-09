
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Category } from '@/data/categories';

interface DesktopNavigationProps {
  categories: Category[];
  onNewMovies: () => void;
}

const DesktopNavigation: React.FC<DesktopNavigationProps> = ({ categories, onNewMovies }) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleToggleDropdown = (categoryName: string) => {
    setOpenDropdown(openDropdown === categoryName ? null : categoryName);
  };

  return (
    <nav className="hidden md:flex items-center space-x-1">
      {categories.map((category) => (
        <div key={category.name} className="relative group">
          {category.id === 'new' ? (
            <button 
              className="nav-link group flex items-center"
              onClick={onNewMovies}
            >
              {category.name}
            </button>
          ) : (
            <>
              <button 
                className="nav-link group flex items-center"
                onClick={() => handleToggleDropdown(category.name)}
                aria-expanded={openDropdown === category.name}
              >
                {category.name}
                {category.subcategories.length > 0 && <ChevronDown className="ml-1 h-4 w-4" />}
              </button>
              
              {category.subcategories.length > 0 && (
                <div 
                  className={`absolute left-0 top-full z-10 mt-2 w-48 origin-top-left rounded-md bg-card border border-border shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none 
                  ${openDropdown === category.name ? 'block' : 'hidden group-hover:block'}`}
                >
                  <div className="py-1">
                    {category.subcategories.map((sub) => (
                      <Link
                        key={sub.name}
                        to={`/?category=${category.id}&genre=${sub.id}`}
                        className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
                        onClick={() => setOpenDropdown(null)}
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
  );
};

export default DesktopNavigation;
