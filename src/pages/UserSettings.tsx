
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import UserPreferences from '@/components/UserPreferences';
import PinManagement from '@/components/PinManagement';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserPreference } from '@/types/movie';
import { Home } from 'lucide-react';

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
    enableNotifications: true // Default to true
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
        // Try to load preferences from localStorage
        const storedPreferences = localStorage.getItem('userPreferences');
        if (storedPreferences) {
          try {
            const parsedPrefs = JSON.parse(storedPreferences);
            setUserPreferences(parsedPrefs);
          } catch (error) {
            console.error('Error parsing stored preferences:', error);
          }
        }
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  const handleSavePreferences = async (preferences: UserPreference): Promise<void> => {
    // Save preferences to localStorage
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    
    // Update notification enabled state in localStorage
    localStorage.setItem('notificationsEnabled', preferences.enableNotifications ? 'true' : 'false');
    
    setUserPreferences(preferences);
    console.log('Preferences saved:', preferences);
  };

  return (
    <div className="min-h-screen bg-hype-dark text-foreground">
      <Navbar />
      <main className="pt-24 pb-16 mx-auto container px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost" 
              className="flex items-center gap-1 text-hype-purple" 
              onClick={() => navigate('/')}
            >
              <Home size={16} />
              <span>Back to Home</span>
            </Button>
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>
          
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-end mb-6">
              <TabsList>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
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
            
            <TabsContent value="security" className="mt-0">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">Security Settings</h2>
                <div className="bg-card border border-border rounded-xl p-6">
                  {session ? (
                    <PinManagement userId={session.user.id} />
                  ) : (
                    <p className="text-muted-foreground">Please sign in to manage your PIN settings.</p>
                  )}
                </div>
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
