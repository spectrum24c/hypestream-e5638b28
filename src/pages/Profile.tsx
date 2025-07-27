
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';
import { FileEdit, Home, Image } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Profile = Database['public']['Tables']['profiles']['Row'];

// Array of predefined avatars
const predefinedAvatars = [
  "/lovable-uploads/7ea3104a-6d4d-4bbd-b3c1-0aac01fc7026.png",
  "/lovable-uploads/8eee155a-5511-42f0-83bb-7ef906513992.png", 
  "/lovable-uploads/d10d9e46-e814-4d99-b2a6-4b6df0b8e6a1.png",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Mia",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane"
];

const Profile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (!currentSession) {
        navigate('/auth');
      } else {
        fetchProfile(currentSession.user.id);
      }
    });

    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        if (!newSession && event === 'SIGNED_OUT') {
          navigate('/auth');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setProfile(data);
        setUsername(data.username || '');
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error loading profile",
        description: "There was a problem loading your profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) return;
    
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: username.trim() || null,
          avatar_url: avatarUrl
        })
        .eq('user_id', session.user.id);
      
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      
      if (profile) {
        setProfile({
          ...profile,
          username: username.trim() || null,
          avatar_url: avatarUrl
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error updating profile",
        description: "There was a problem updating your profile",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !session?.user?.id) {
      return;
    }

    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${session.user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      setUpdating(true);
      
      // Upload the file to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(urlData.publicUrl);
      
      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('user_id', session.user.id);
      
      if (updateError) throw updateError;
      
      toast({
        title: "Avatar uploaded",
        description: "Your avatar has been uploaded successfully",
      });
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error uploading avatar",
        description: error.message || "There was a problem uploading your avatar",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const selectPredefinedAvatar = async (avatarUrl: string) => {
    if (!session?.user?.id) return;
    
    setUpdating(true);
    try {
      // Update profile with selected avatar URL
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('user_id', session.user.id);
      
      if (error) throw error;
      
      setAvatarUrl(avatarUrl);
      setIsAvatarDialogOpen(false);
      
      toast({
        title: "Avatar selected",
        description: "Your profile avatar has been updated",
      });
    } catch (error) {
      console.error('Error selecting avatar:', error);
      toast({
        title: "Error selecting avatar",
        description: "There was a problem updating your avatar",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-hype-dark text-foreground">
      <Navbar />
      <main className="pb-8 pt-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-center mb-8">
            <Button 
              onClick={() => navigate('/')} 
              variant="ghost" 
              className="flex items-center gap-1 text-hype-purple mr-2"
            >
              <Home size={16} />
              <span>Back to Home</span>
            </Button>
            <h1 className="text-3xl font-bold">My Profile</h1>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hype-purple"></div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/3">
                  <div className="relative mx-auto">
                    <Avatar className="w-32 h-32 mx-auto">
                      {avatarUrl ? (
                        <AvatarImage 
                          src={avatarUrl} 
                          alt="Profile"
                          className="object-cover" 
                        />
                      ) : (
                        <AvatarFallback className="text-4xl bg-hype-purple text-white">
                          {username.charAt(0) || (session?.user?.email?.charAt(0).toUpperCase() || '?')}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="absolute bottom-0 right-0 flex">
                      <button
                        onClick={() => setIsAvatarDialogOpen(true)}
                        className="bg-hype-purple text-white rounded-full p-2 cursor-pointer mr-1"
                        title="Choose from gallery"
                      >
                        <Image className="h-4 w-4" />
                      </button>
                      <label htmlFor="avatar-upload" className="bg-hype-purple text-white rounded-full p-2 cursor-pointer">
                        <FileEdit className="h-4 w-4" />
                        <input 
                          id="avatar-upload" 
                          type="file" 
                          accept="image/*" 
                          onChange={handleAvatarChange} 
                          className="hidden" 
                        />
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="md:w-2/3">
                  <form onSubmit={updateProfile} className="space-y-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={session?.user?.email || ''}
                        disabled
                        className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-muted-foreground"
                      />
                      <p className="mt-1 text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>
                    
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-foreground mb-1">
                        Username
                      </label>
                      <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-3 py-2 bg-muted border border-border rounded-md focus:outline-none focus:ring-hype-purple focus:border-hype-purple"
                        placeholder="Choose a username"
                      />
                    </div>
                    
                    <div className="pt-4">
                      <Button
                        type="submit"
                        className="w-full md:w-auto bg-hype-purple hover:bg-hype-purple/90"
                        disabled={updating}
                      >
                        {updating ? 'Updating...' : 'Update Profile'}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Avatar Selection Dialog */}
      <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose an Avatar</DialogTitle>
            <DialogDescription>
              Select an avatar from our collection or upload your own.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4 py-4">
            {predefinedAvatars.map((avatar, index) => (
              <div 
                key={index}
                onClick={() => selectPredefinedAvatar(avatar)}
                className={`cursor-pointer rounded-full overflow-hidden border-2 ${
                  avatarUrl === avatar ? 'border-hype-purple' : 'border-transparent'
                } hover:border-hype-purple transition-all`}
              >
                <img 
                  src={avatar} 
                  alt={`Avatar option ${index + 1}`}
                  className="w-full h-auto aspect-square object-cover"
                />
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between">
            <Button variant="outline" onClick={() => setIsAvatarDialogOpen(false)}>
              Cancel
            </Button>
            <label htmlFor="avatar-dialog-upload" className="bg-hype-purple text-white px-4 py-2 rounded-md cursor-pointer flex items-center gap-2">
              <FileEdit className="h-4 w-4" />
              <span>Upload Custom</span>
              <input 
                id="avatar-dialog-upload" 
                type="file" 
                accept="image/*" 
                onChange={(e) => {
                  handleAvatarChange(e);
                  setIsAvatarDialogOpen(false);
                }} 
                className="hidden" 
              />
            </label>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
