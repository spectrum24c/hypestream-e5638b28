
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { useEffect, useState } from 'react';
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
import Support from '@/pages/Support';
import './App.css';
import { Toaster } from "@/components/ui/toaster";
import { useHardwareBackButton, useStatusBarCustomization } from '@/utils/mobileUtils';
import { useToast } from "@/hooks/use-toast";

// Create a wrapper component that uses the mobile hooks inside Router context
function AppContent() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast } = useToast();
  
  // Use mobile-specific hooks (now inside Router context)
  useHardwareBackButton();
  useStatusBarCustomization(true);

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

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/faqs" element={<FAQs />} />
        <Route path="/settings" element={<UserSettings />} />
        <Route path="/terms-of-use" element={<TermsOfUse />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/support" element={<Support />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
