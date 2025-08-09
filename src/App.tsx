
import { Routes, Route } from 'react-router-dom';
import { useEffect, useState, Suspense, lazy } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';

const Index = lazy(() => import('@/pages/Index'));
const Auth = lazy(() => import('@/pages/Auth'));
const Profile = lazy(() => import('@/pages/Profile'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const Favorites = lazy(() => import('@/pages/Favorites'));
const FAQs = lazy(() => import('@/pages/FAQs'));
const TermsOfUse = lazy(() => import('@/pages/TermsOfUse'));
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'));
const CookiePolicy = lazy(() => import('@/pages/CookiePolicy'));
const UserSettings = lazy(() => import('@/pages/UserSettings'));
const Support = lazy(() => import('@/pages/Support'));
const CastCrew = lazy(() => import('@/pages/CastCrew'));
const PersonDetails = lazy(() => import('@/pages/PersonDetails'));

import './App.css';
import { Toaster } from "@/components/ui/toaster";
import { useHardwareBackButton, useStatusBarCustomization } from '@/utils/mobileUtils';
import { useToast } from "@/hooks/use-toast";

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast } = useToast();
  
  // Use mobile-specific hooks with error handling
  try {
    useHardwareBackButton();
    useStatusBarCustomization(true);
  } catch (error) {
    console.warn('Mobile utils failed:', error);
  }

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
    <ErrorBoundary>
      <div className="app">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[40vh]">
              <div className="w-8 h-8 border-2 border-t-transparent border-hype-purple rounded-full animate-spin" />
            </div>
          }
        >
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
            
            <Route path="/cast-crew/:id" element={<CastCrew />} />
            <Route path="/person/:id" element={<PersonDetails />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <Toaster />
      </div>
    </ErrorBoundary>
  );
}

export default App;
