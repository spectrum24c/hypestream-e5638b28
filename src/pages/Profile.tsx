
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';
import { FileEdit, Image, ArrowLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProfile } from '@/contexts/ProfileContext';

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
  const [localProfile, setLocalProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const { currentProfile } = useProfile();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (!currentSession) {
        navigate('/auth');
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

  useEffect(() => {
    if (currentProfile) {
      fetchProfile(currentProfile.id);
    }
  }, [currentProfile]);

  const fetchProfile = async (profileId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        setLocalProfile(data);
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
    if (!currentProfile?.id) return;
    
    setUpdating(true);
    try {
      // Prepare update data with current form values
      const updateData: any = {
        username: username.trim() || null, // Save whatever is in the input field
        avatar_url: avatarUrl || null, // Save current avatar URL
      };

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', currentProfile.id)
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      
      // Update local state with the saved profile
      setLocalProfile(data);
      setUsername(data.username || '');
      setAvatarUrl(data.avatar_url);
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
    if (!e.target.files || e.target.files.length === 0 || !currentProfile?.id) {
      return;
    }

    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${currentProfile.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
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
        .eq('id', currentProfile.id);
      
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
    if (!currentProfile?.id) return;
    
    setUpdating(true);
    try {
      // Update profile with selected avatar URL
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', currentProfile.id);
      
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
    <div className="min-h-screen bg-gradient-to-b from-black via-hype-dark to-black text-foreground">
      <Navbar />
      <main className="pb-12 pt-24 md:pt-28">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center justify-between gap-4 mb-6">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </Button>
            <p className="text-xs text-muted-foreground">
              Signed in as{' '}
              <span className="font-medium text-foreground">
                {session?.user?.email || 'Guest'}
              </span>
            </p>
          </div>

          <div className="bg-card/60 border border-border/70 rounded-2xl p-6 md:p-8 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6 md:mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                  Profile
                </h1>
                <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                  Manage your basic account information and profile picture.
                </p>
              </div>
              <div className="text-xs text-muted-foreground text-left md:text-right">
                <p className="font-medium text-foreground">
                  {username || currentProfile?.username || session?.user?.email || 'Unnamed profile'}
                </p>
                <p>
                  Member since{' '}
                  {session?.user?.created_at
                    ? new Date(session.user.created_at).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border border-border/80 border-t-2 border-t-primary" />
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-[minmax(0,1.3fr)_minmax(0,2fr)]">
                <div className="flex flex-col items-center text-center rounded-2xl border border-border bg-card/70 px-6 py-7">
                  <div className="mb-4 text-xs font-medium text-muted-foreground">
                    Profile photo
                  </div>
                  <div className="relative">
                    <Avatar className="w-28 h-28 border border-border/80 bg-background">
                      {avatarUrl ? (
                        <AvatarImage
                          src={avatarUrl}
                          alt="Profile"
                          className="object-cover"
                        />
                      ) : (
                        <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
                          {username.charAt(0) ||
                            (session?.user?.email?.charAt(0).toUpperCase() || '?')}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="absolute -bottom-2 right-0 flex gap-1">
                      <button
                        onClick={() => setIsAvatarDialogOpen(true)}
                        className="bg-primary text-primary-foreground rounded-full p-2 cursor-pointer shadow-md hover:shadow-lg hover:bg-primary/90 transition-colors"
                        title="Choose from gallery"
                      >
                        <Image className="h-4 w-4" />
                      </button>
                      <label
                        htmlFor="avatar-upload"
                        className="bg-primary text-primary-foreground rounded-full p-2 cursor-pointer shadow-md hover:shadow-lg hover:bg-primary/90 transition-colors"
                      >
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
                  <div className="mt-4 space-y-1">
                    <p className="text-lg font-semibold">
                      {username || currentProfile?.username || 'Unnamed Profile'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      This is how your name appears across Hypestream.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card/70 px-6 py-6 md:px-7 md:py-7">
                  <h2 className="text-sm font-semibold text-foreground mb-5">
                    Profile details
                  </h2>
                  <form onSubmit={updateProfile} className="space-y-6">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="email"
                        className="block text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={session?.user?.email || ''}
                        disabled
                        className="w-full px-3 py-2.5 rounded-md border border-border bg-muted/40 text-sm text-muted-foreground/90 outline-none ring-0 focus:border-primary focus:ring-1 focus:ring-primary/60"
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        Managed via Supabase authentication. To change this email, update it in
                        your account settings.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="username"
                        className="block text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground"
                      >
                        Username
                      </label>
                      <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-md border border-border bg-background/60 text-sm outline-none ring-0 focus:border-primary focus:ring-1 focus:ring-primary/60"
                        placeholder="Choose a display name"
                      />
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                      <p className="text-xs text-muted-foreground">
                        Changes apply across your entire Hypestream experience.
                      </p>
                      <Button
                        type="submit"
                        className="w-full sm:w-auto"
                        disabled={updating}
                      >
                        {updating ? 'Updating…' : 'Save changes'}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

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
                  avatarUrl === avatar ? 'border-primary' : 'border-transparent'
                } hover:border-primary transition-all`}
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
            <label htmlFor="avatar-dialog-upload" className="bg-primary text-primary-foreground px-4 py-2 rounded-md cursor-pointer flex items-center gap-2">
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
