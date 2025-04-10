
import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileNavigationProps {
  session: any;
  onSignOut: () => Promise<void>;
  onDeleteAccount: () => Promise<void>;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  session,
  onSignOut,
  onDeleteAccount
}) => {
  return (
    <div className="bg-hype-dark border-t border-border">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex flex-col space-y-4">
          <Link to="/" className="text-foreground hover:text-white">Home</Link>
          <Link to="/favorites" className="text-foreground hover:text-white">My List</Link>
          <Link to="/devices" className="text-foreground hover:text-white">Devices</Link>
          <Link to="/faqs" className="text-foreground hover:text-white">FAQs</Link>
          
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
    </div>
  );
};

export default MobileNavigation;
