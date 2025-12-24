
import { Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/NotFound';
import Favorites from '@/pages/Favorites';
import FAQs from '@/pages/FAQs';
import TermsOfUse from '@/pages/TermsOfUse';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import CookiePolicy from '@/pages/CookiePolicy';
import UserSettings from '@/pages/UserSettings';
import ChangePassword from '@/pages/ChangePassword';
import Support from '@/pages/Support';
import Themes from '@/pages/Themes';
import ProfileManagement from '@/pages/ProfileManagement';
import CastCrew from '@/pages/CastCrew';
import PersonDetails from '@/pages/PersonDetails';
import AdminSettings from '@/pages/AdminSettings';
import ErrorBoundary from '@/components/ErrorBoundary';
import WelcomeScreen from '@/components/WelcomeScreen';

import './App.css';
import { Toaster } from "@/components/ui/toaster";
import { useHardwareBackButton, useStatusBarCustomization } from '@/utils/mobileUtils';
import { useToast } from "@/hooks/use-toast";

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isCheckingWelcome, setIsCheckingWelcome] = useState(true);
  
  // Use mobile-specific hooks with error handling
  try {
    useHardwareBackButton();
    useStatusBarCustomization(true);
  } catch (error) {
    console.warn('Mobile utils failed:', error);
  }
  
  const { toast } = useToast();

  // Check if user has completed welcome screen
  useEffect(() => {
    const hasCompletedWelcome = localStorage.getItem('hypestream_welcome_completed');
    setShowWelcome(!hasCompletedWelcome);
    setIsCheckingWelcome(false);
  }, []);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "You're back online",
        description: "Connected to the internet",
      });
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "You're offline",
        description: "Some features may be limited",
        variant: "destructive"
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  const handleWelcomeComplete = (preferences: { movies: boolean; series: boolean }) => {
    setShowWelcome(false);
    // You can use the preferences to customize the user's experience
    console.log('User preferences:', preferences);
  };

  // Don't render anything while checking welcome status
  if (isCheckingWelcome) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="app dark">
        <AnimatePresence mode="wait">
          {showWelcome && (
            <WelcomeScreen onComplete={handleWelcomeComplete} />
          )}
        </AnimatePresence>
        
        {!showWelcome && (
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/settings" element={<UserSettings />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/themes" element={<Themes />} />
            <Route path="/profile-management" element={<ProfileManagement />} />
            <Route path="/terms-of-use" element={<TermsOfUse />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route path="/support" element={<Support />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            
            <Route path="/cast-crew/:id" element={<CastCrew />} />
            <Route path="/person/:id" element={<PersonDetails />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        )}
        <Toaster />
      </div>
    </ErrorBoundary>
  );
}

export default App;
