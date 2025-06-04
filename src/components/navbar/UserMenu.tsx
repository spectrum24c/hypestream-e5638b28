
import React from 'react';
import { User, LogOut, Trash2, Bookmark, Settings, Lock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface UserMenuProps {
  session: any;
  onSignOut: () => Promise<void>;
  onDeleteAccount: () => Promise<void>;
}

const UserMenu: React.FC<UserMenuProps> = ({ session, onSignOut, onDeleteAccount }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="rounded-full p-2 flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span className="hidden md:inline-block">Account</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        {session ? (
          <div className="grid gap-4">
            <div className="font-medium">
              {session.user.email}
            </div>
            <Link to="/profile" className="text-sm hover:underline flex items-center">
              <User className="mr-2 h-4 w-4" />
              View Profile
            </Link>
            <Link to="/favorites" className="text-sm hover:underline flex items-center">
              <Bookmark className="mr-2 h-4 w-4" />
              My Favorites
            </Link>
            <Link to="/pin-settings" className="text-sm hover:underline flex items-center">
              <Lock className="mr-2 h-4 w-4" />
              PIN
            </Link>
            <Link to="/settings" className="text-sm hover:underline flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
            <hr className="border-border" />
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center" 
              onClick={onSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              className="flex items-center" 
              onClick={onDeleteAccount}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Account
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
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
      </PopoverContent>
    </Popover>
  );
};

export default UserMenu;
