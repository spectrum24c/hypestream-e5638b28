
import React from 'react';
import { User, LogOut, Trash2, Bookmark, Settings } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserMenuProps {
  session: any;
  onSignOut: () => Promise<void>;
  onDeleteAccount: () => Promise<void>;
}

const UserMenu: React.FC<UserMenuProps> = ({ session, onSignOut, onDeleteAccount }) => {
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        toast({
          title: "Error signing out",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Signed out successfully",
          description: "You have been signed out of your account",
        });
      }
    } catch (error) {
      console.error('Unexpected error during sign out:', error);
      toast({
        title: "Error signing out",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      // First, delete the user's profile data
      if (session?.user?.id) {
        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', session.user.id);
        
        if (profileError) {
          console.error('Error deleting profile:', profileError);
        }

        // Delete favorites
        const { error: favoritesError } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', session.user.id);
        
        if (favoritesError) {
          console.error('Error deleting favorites:', favoritesError);
        }
      }

      // Then sign out the user
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error during account deletion:', error);
        toast({
          title: "Error deleting account",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Account deleted",
          description: "Your account has been deleted successfully",
        });
      }
    } catch (error) {
      console.error('Unexpected error during account deletion:', error);
      toast({
        title: "Error deleting account",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

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
            <Link to="/settings" className="text-sm hover:underline flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
            <hr className="border-border" />
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center" 
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              className="flex items-center" 
              onClick={handleDeleteAccount}
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
