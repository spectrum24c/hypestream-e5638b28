
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/toaster"
import Index from './pages/Index';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import UserSettings from './pages/UserSettings';
import Favorites from './pages/Favorites';
import Watchlist from './pages/Watchlist';
import WatchHistory from './pages/WatchHistory';
import Devices from './pages/Devices';
import Support from './pages/Support';
import FAQs from './pages/FAQs';
import TermsOfUse from './pages/TermsOfUse';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CookiePolicy from './pages/CookiePolicy';
import NotFound from './pages/NotFound';
import SplashScreen from './components/SplashScreen';
import PinSettings from './pages/PinSettings';

const queryClient = new QueryClient();

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for 3 seconds
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={isLoading ? <SplashScreen onAnimationComplete={() => setIsLoading(false)} /> : <Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/pin-settings" element={<PinSettings />} />
            <Route path="/settings" element={<UserSettings />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/watch-history" element={<WatchHistory />} />
            <Route path="/devices" element={<Devices />} />
            <Route path="/support" element={<Support />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/terms" element={<TermsOfUse />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/cookies" element={<CookiePolicy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
