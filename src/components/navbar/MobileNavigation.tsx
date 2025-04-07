
import React from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { LogOut, Menu, Trash2 } from 'lucide-react';
import { Category } from '@/data/categories';

interface MobileNavigationProps {
  categories: Category[];
  session: any;
  onNewMovies: () => void;
  onSignOut: () => Promise<void>;
  onDeleteAccount: () => Promise<void>;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  categories,
  session,
  onNewMovies,
  onSignOut,
  onDeleteAccount
}) => {
  return (
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
                      onClick={onNewMovies}
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
                    onClick={onSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="flex items-center mt-2 w-full" 
                    onClick={onDeleteAccount}
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
  );
};

export default MobileNavigation;
