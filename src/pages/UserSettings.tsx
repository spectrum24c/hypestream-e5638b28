
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserPreferences from '@/components/UserPreferences';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserPreference } from '@/types/movie';

// Mock data - in a real app, this would come from an API
const mockGenres = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Science Fiction" },
  { id: 10770, name: "TV Movie" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" }
];

const mockLanguages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
  { code: "hi", name: "Hindi" },
  { code: "ru", name: "Russian" },
  { code: "pt", name: "Portuguese" },
  { code: "ar", name: "Arabic" }
];

const UserSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("preferences");
  const [userPreferences, setUserPreferences] = useState<UserPreference>({
    id: '1',
    preferredGenres: [28, 12, 878],
    preferredLanguages: ['en'],
    enableNotifications: true
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to access your settings",
          variant: "destructive"
        });
        navigate('/auth');
      } else {
        // In a real app, fetch user preferences from Supabase
        // const { data, error } = await supabase
        //   .from('user_preferences')
        //   .select('*')
        //   .eq('user_id', session.user.id)
        //   .single();
        
        // if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
        //   console.error('Error fetching user preferences:', error);
        //   toast({
        //     title: "Error loading preferences",
        //     description: "There was a problem loading your preferences",
        //     variant: "destructive"
        //   });
        // } else if (data) {
        //   setUserPreferences(data);
        // }
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  const handleSavePreferences = async (preferences: UserPreference): Promise<void> => {
    // In a real app, save to Supabase
    // const { error } = await supabase
    //   .from('user_preferences')
    //   .upsert({
    //     user_id: session.user.id,
    //     ...preferences
    //   });
    
    // if (error) {
    //   console.error('Error saving preferences:', error);
    //   throw new Error('Failed to save preferences');
    // }
    
    setUserPreferences(preferences);
    console.log('Preferences saved:', preferences);
  };

  return (
    <div className="min-h-screen bg-hype-dark text-foreground">
      <Navbar />
      <main className="pt-24 pb-16 mx-auto container px-4">
        <div className="max-w-5xl mx-auto">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Settings</h1>
              <TabsList>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
                <TabsTrigger value="account">Account</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="preferences" className="mt-0">
              <UserPreferences 
                preferences={userPreferences}
                genres={mockGenres}
                languages={mockLanguages}
                onSave={handleSavePreferences}
              />
            </TabsContent>
            
            <TabsContent value="account" className="mt-0">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
                <p className="text-muted-foreground">
                  Account settings are managed on the Profile page.
                </p>
                <button
                  className="text-hype-purple hover:underline mt-2"
                  onClick={() => navigate('/profile')}
                >
                  Go to Profile
                </button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserSettingsPage;
