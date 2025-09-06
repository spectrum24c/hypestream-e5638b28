import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  username: string | null;
  created_at: string;
  avatar_url: string | null;
  user_id: string;
}

interface ProfileContextType {
  currentProfile: Profile | null;
  profiles: Profile[];
  switchProfile: (profile: Profile) => void;
  refreshProfiles: () => Promise<void>;
  loading: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initializeProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await loadProfiles(user.id);
      }
      setLoading(false);
    };

    initializeProfile();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadProfiles(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setCurrentProfile(null);
        setProfiles([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfiles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading profiles:', error);
        toast({
          title: "Error",
          description: "Failed to load profiles",
          variant: "destructive"
        });
        return;
      }

      setProfiles(data || []);
      
      // Set the first profile as current if none selected
      if (data && data.length > 0 && !currentProfile) {
        const savedProfileId = localStorage.getItem('currentProfileId');
        const profileToSelect = savedProfileId 
          ? data.find(p => p.id === savedProfileId) || data[0]
          : data[0];
        setCurrentProfile(profileToSelect);
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  };

  const switchProfile = (profile: Profile) => {
    setCurrentProfile(profile);
    localStorage.setItem('currentProfileId', profile.id);
    toast({
      title: "Profile Switched",
      description: `Now using ${profile.username || 'Unnamed Profile'}`,
    });
  };

  const refreshProfiles = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await loadProfiles(user.id);
    }
  };

  return (
    <ProfileContext.Provider value={{
      currentProfile,
      profiles,
      switchProfile,
      refreshProfiles,
      loading
    }}>
      {children}
    </ProfileContext.Provider>
  );
};