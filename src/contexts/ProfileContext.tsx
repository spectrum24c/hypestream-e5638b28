import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  created_at: string;
  avatar_url: string | null;
}

interface ProfileContextType {
  currentProfile: Profile | null;
  profiles: Profile[];
  switchProfile: (profile: Profile) => void;
  refreshProfiles: () => Promise<void>;
  createProfile: (username: string) => Promise<void>;
  deleteProfile: (profileId: string) => Promise<void>;
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Use setTimeout to defer the profile loading to avoid React DOM issues
        setTimeout(() => {
          loadProfiles(session.user.id);
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        setCurrentProfile(null);
        setProfiles([]);
        setLoading(false);
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
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
      setLoading(false);
    }
  };

  const switchProfile = (profile: Profile) => {
    setCurrentProfile(profile);
    localStorage.setItem('currentProfileId', profile.id);
    // Note: Toast notifications should be handled in the component that calls this
  };

  const refreshProfiles = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await loadProfiles(user.id);
    }
  };

  const createProfile = async (username: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('profiles')
      .insert({ user_id: user.id, username })
      .select()
      .single();

    if (error) throw error;
    
    await refreshProfiles();
  };

  const deleteProfile = async (profileId: string) => {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', profileId);

    if (error) throw error;
    
    // If deleted profile was current, switch to first available
    if (currentProfile?.id === profileId) {
      const remaining = profiles.filter(p => p.id !== profileId);
      if (remaining.length > 0) {
        switchProfile(remaining[0]);
      } else {
        setCurrentProfile(null);
      }
    }
    
    await refreshProfiles();
  };

  return (
    <ProfileContext.Provider value={{
      currentProfile,
      profiles,
      switchProfile,
      refreshProfiles,
      createProfile,
      deleteProfile,
      loading
    }}>
      {children}
    </ProfileContext.Provider>
  );
};