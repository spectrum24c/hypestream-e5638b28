import React, { useState, useEffect } from 'react';
import { User, Plus, Edit, Mail, Calendar, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { useProfile } from '@/contexts/ProfileContext';

interface Profile {
  id: string;
  username: string | null;
  created_at: string;
  avatar_url: string | null;
  user_id: string;
}

const ProfileManagement = () => {
  const { currentProfile, profiles, switchProfile, refreshProfiles, loading: profileLoading } = useProfile();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newUsername, setNewUsername] = useState('');
  const [isAddingProfile, setIsAddingProfile] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      }
      setLoading(false);
    };

    getUser();
  }, []);


  const addProfile = async () => {
    if (!user || !newUsername.trim()) {
      toast({
        title: "Error",
        description: "Please enter a username",
        variant: "destructive"
      });
      return;
    }

    setIsAddingProfile(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            user_id: user.id,
            username: newUsername.trim()
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error adding profile:', error);
        toast({
          title: "Error",
          description: "Failed to add profile",
          variant: "destructive"
        });
      } else {
        await refreshProfiles();
        setNewUsername('');
        setDialogOpen(false);
        toast({
          title: "Success",
          description: "Profile added successfully",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsAddingProfile(false);
    }
  };

  if (loading || profileLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>Please log in to access your profile</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <User className="h-8 w-8 text-primary" />
                <h1 className="text-4xl font-bold text-foreground">Profile Management</h1>
              </div>
              <p className="text-muted-foreground text-lg">
                Manage your account and create multiple profiles
              </p>
            </div>

            {/* User Account Info */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                    <p className="text-lg font-medium">{user.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Member Since</Label>
                    <p className="text-lg font-medium">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profiles Section */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Your Profiles</h2>
              
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Profile
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Profile</DialogTitle>
                    <DialogDescription>
                      Create a new profile with a different username for the same account.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="Enter username"
                        className="mt-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={addProfile} 
                        disabled={isAddingProfile || !newUsername.trim()}
                        className="flex-1"
                      >
                        {isAddingProfile ? 'Adding...' : 'Add Profile'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setDialogOpen(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Profiles List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profiles.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No Profiles Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first profile to get started
                  </p>
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Profile
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              ) : (
                profiles.map((profile, index) => (
                  <Card key={profile.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              {profile.username || `Profile ${index + 1}`}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Created {new Date(profile.created_at).toLocaleDateString()}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                     <CardContent>
                       <div className="flex gap-2">
                         <Button 
                           variant={currentProfile?.id === profile.id ? "default" : "outline"} 
                           size="sm" 
                           className="flex-1"
                           onClick={() => switchProfile(profile)}
                         >
                           {currentProfile?.id === profile.id ? (
                             <>
                               <Check className="h-3 w-3 mr-1" />
                               Active
                             </>
                           ) : (
                             'Switch To'
                           )}
                         </Button>
                       </div>
                     </CardContent>
                  </Card>
                ))
              )}
            </div>

            <div className="text-center mt-8">
              <p className="text-muted-foreground">
                All profiles are linked to your account: {user.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileManagement;