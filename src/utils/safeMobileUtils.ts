
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Safe version of useHardwareBackButton that handles Router context issues
export const useSafeHardwareBackButton = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Only run on mobile devices with hardware back button support
    if (typeof window === 'undefined' || !('Capacitor' in window)) {
      return;
    }

    const handleBackButton = () => {
      try {
        if (window.history.length > 1) {
          navigate(-1);
        } else {
          navigate('/');
        }
      } catch (error) {
        console.warn('Hardware back button navigation failed:', error);
      }
    };

    // Listen for hardware back button (Capacitor)
    document.addEventListener('backbutton', handleBackButton);
    
    return () => {
      document.removeEventListener('backbutton', handleBackButton);
    };
  }, [navigate]);
};

// Safe version of status bar customization
export const useSafeStatusBarCustomization = (darkMode = true) => {
  useEffect(() => {
    // Only run on mobile devices with Capacitor
    if (typeof window === 'undefined' || !('Capacitor' in window)) {
      return;
    }

    try {
      // Set status bar style for mobile apps
      if ('StatusBar' in (window as any).Capacitor.Plugins) {
        const { StatusBar } = (window as any).Capacitor.Plugins;
        
        StatusBar.setStyle({
          style: darkMode ? 'DARK' : 'LIGHT'
        });
        
        StatusBar.setBackgroundColor({
          color: darkMode ? '#121212' : '#ffffff'
        });
      }
    } catch (error) {
      console.warn('Status bar customization failed:', error);
    }
  }, [darkMode]);
};
