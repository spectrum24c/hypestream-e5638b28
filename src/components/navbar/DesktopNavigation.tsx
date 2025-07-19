
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { categories } from '@/data/categories';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from '@/lib/utils';

const DesktopNavigation: React.FC = () => {
  return (
    <nav className="hidden md:flex items-center space-x-4">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors px-3 py-2">
              Home
            </Link>
          </NavigationMenuItem>
          
          {categories.map((category) => (
            <NavigationMenuItem key={category.id}>
              {category.subcategories.length > 0 ? (
                <>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-hype-dark-light text-muted-foreground hover:text-white">
                    {category.name}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-hype-dark border border-border rounded-lg p-2 min-w-[200px]">
                    <ul className="grid gap-1 p-2">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link 
                            to={`/?category=${category.id}`}
                            className="block w-full rounded-md p-2 hover:bg-hype-dark-light text-foreground"
                          >
                            All {category.name}
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      {category.subcategories.map((subcategory) => (
                        <li key={subcategory.id}>
                          <NavigationMenuLink asChild>
                            <Link 
                              to={`/?category=${category.id}&genre=${subcategory.id}`}
                              className="block w-full rounded-md p-2 hover:bg-hype-dark-light text-foreground"
                            >
                              {subcategory.name}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </>
              ) : (
                <Link to={`/?category=${category.id}`} className="text-muted-foreground hover:text-foreground transition-colors flex items-center px-3 py-2">
                  {category.name}
                </Link>
              )}
            </NavigationMenuItem>
          ))}
          
          
          <NavigationMenuItem>
            <Link to="/favorites" className="text-muted-foreground hover:text-foreground transition-colors px-3 py-2">
              My List
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </nav>
  );
};

export default DesktopNavigation;
