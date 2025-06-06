
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
  const [showPinEntry, setShowPinEntry] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    
    const initializeApp = async () => {
      try {
        // Simplified initialization - don't block on auth checks
        const timer = setTimeout(() => {
          if (isMounted) {
            setIsVisible(false);
            // Quick transition to main app
            setTimeout(() => {
              if (isMounted) {
                setIsInitializing(false);
                onAnimationComplete();
              }
            }, 300);
          }
        }, 1500); // Reduced from 2000ms to 1500ms

        // Check auth in background without blocking
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user && isMounted) {
            setUserEmail(session.user.email || '');
            
            // Check PIN setting without blocking the main flow
            const { data: profile } = await supabase
              .from('profiles')
              .select('pin_enabled')
              .eq('id', session.user.id)
              .single();
            
            if (profile?.pin_enabled && isMounted && !isInitializing) {
              // Only show PIN if we haven't already completed initialization
              clearTimeout(timer);
              setIsVisible(false);
              setTimeout(() => {
                if (isMounted) {
                  setShowPinEntry(true);
                }
              }, 300);
            }
          }
        } catch (error) {
          console.error('Error checking auth during splash:', error);
          // Don't block app loading on auth errors
        }

        return () => {
          clearTimeout(timer);
        };
      } catch (error) {
        console.error('Error during app initialization:', error);
        // Ensure app loads even if there are errors
        if (isMounted) {
          setIsVisible(false);
          setTimeout(() => {
            if (isMounted) {
              onAnimationComplete();
            }
          }, 300);
        }
      }
    };

    initializeApp();

    return () => {
      isMounted = false;
    };
  }, [onAnimationComplete]);

  const handlePinSuccess = () => {
    setShowPinEntry(false);
    onAnimationComplete();
  };

  const handlePinBack = () => {
    setShowPinEntry(false);
    // Sign out user to force regular login
    supabase.auth.signOut().catch(console.error);
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
      "fixed inset-0 flex items-center justify-center z-50 bg-hype-dark transition-opacity duration-300",
      isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
    )}>
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hype-purple"></div>
        <p className="text-lg text-white">Loading HypeStream...</p>
      </div>
    </div>
  );
};

export default SplashScreen;
