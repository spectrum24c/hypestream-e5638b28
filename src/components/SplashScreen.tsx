
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PinEntry from './PinEntry';

interface SplashScreenProps {
  onAnimationComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onAnimationComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showPinEntry, setShowPinEntry] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [pinEnabled, setPinEnabled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndPin = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUserEmail(session.user.email || '');
          
          // Check if user has PIN enabled
          const { data: profile } = await supabase
            .from('profiles')
            .select('pin_enabled')
            .eq('id', session.user.id)
            .single();
          
          if (profile?.pin_enabled) {
            setPinEnabled(true);
          }
        }
      } catch (error) {
        console.error('Error checking auth and PIN:', error);
      }
    };

    // Simulate loading and animation
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(async () => {
        await checkAuthAndPin();
        setIsLoading(false);
        
        // Show PIN entry if user has PIN enabled, otherwise complete animation
        if (pinEnabled && userEmail) {
          setShowPinEntry(true);
        } else {
          onAnimationComplete();
        }
      }, 500);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onAnimationComplete, pinEnabled, userEmail]);

  const handlePinSuccess = () => {
    setShowPinEntry(false);
    onAnimationComplete();
  };

  const handlePinBack = () => {
    setShowPinEntry(false);
    // Sign out user to force regular login
    supabase.auth.signOut();
    onAnimationComplete();
  };

  if (showPinEntry) {
    return (
      <PinEntry
        onSuccess={handlePinSuccess}
        onBack={handlePinBack}
        userEmail={userEmail}
      />
    );
  }

  return (
    <div className={cn(
      "fixed inset-0 flex items-center justify-center z-50 bg-hype-dark transition-opacity duration-500",
      isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
    )}>
      {isLoading ? (
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-hype-purple"></div>
      ) : (
        <p className="text-2xl text-white">Loading...</p>
      )}
    </div>
  );
};

export default SplashScreen;
