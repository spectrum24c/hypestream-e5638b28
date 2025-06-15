
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { categories } from '@/data/categories';
import { cn } from '@/lib/utils';

const DesktopNavigation: React.FC = () => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleMouseEnter = (categoryId: string) => {
    setOpenDropdown(categoryId);
  };

  const handleMouseLeave = () => {
    setOpenDropdown(null);
  };

  return (
    <nav className="hidden md:flex items-center space-x-4">
      <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors px-3 py-2">
        Home
      </Link>
      
      {categories.map((category) => (
        <div 
          key={category.id} 
          className="relative"
          onMouseEnter={() => handleMouseEnter(category.id)}
          onMouseLeave={handleMouseLeave}
        >
          {category.subcategories.length > 0 ? (
            <>
              <button className="text-muted-foreground hover:text-foreground transition-colors flex items-center px-3 py-2">
                {category.name}
                <ChevronDown className="ml-1 h-3 w-3" />
              </button>
              
              {openDropdown === category.id && (
                <div className="absolute top-full left-0 mt-1 bg-hype-dark border border-border rounded-lg p-2 min-w-[200px] z-50 shadow-lg">
                  <div className="grid gap-1 p-2">
                    <Link 
                      to={`/?category=${category.id}`}
                      className="block w-full rounded-md p-2 hover:bg-hype-dark-light text-foreground"
                    >
                      All {category.name}
                    </Link>
                    {category.subcategories.map((subcategory) => (
                      <Link 
                        key={subcategory.id}
                        to={`/?category=${category.id}&genre=${subcategory.id}`}
                        className="block w-full rounded-md p-2 hover:bg-hype-dark-light text-foreground"
                      >
                        {subcategory.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <Link to={`/?category=${category.id}`} className="text-muted-foreground hover:text-foreground transition-colors flex items-center px-3 py-2">
              {category.name}
            </Link>
          )}
        </div>
      ))}
      
      <Link to="/favorites" className="text-muted-foreground hover:text-foreground transition-colors px-3 py-2">
        My List
      </Link>
    </nav>
  );
};

export default DesktopNavigation;
