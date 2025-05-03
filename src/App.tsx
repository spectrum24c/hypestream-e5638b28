
import { Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/NotFound';
import Favorites from '@/pages/Favorites';
import FAQs from '@/pages/FAQs';
import Devices from '@/pages/Devices';
import TermsOfUse from '@/pages/TermsOfUse';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import CookiePolicy from '@/pages/CookiePolicy';
import UserSettings from '@/pages/UserSettings';
import './App.css';
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/faqs" element={<FAQs />} />
        <Route path="/devices" element={<Devices />} />
        <Route path="/settings" element={<UserSettings />} />
        <Route path="/terms-of-use" element={<TermsOfUse />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
