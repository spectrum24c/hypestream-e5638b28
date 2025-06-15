/**
 * Mobile Utilities
 * 
 * This module handles mobile-specific features like hardware back button,
 * status bar customization, and other native capabilities.
 */
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Check if app is running in a Capacitor environment (native mobile)
 */
export const isCapacitorNative = (): boolean => {
  return (
    window.Capacitor !== undefined &&
    window.Capacitor.isNativePlatform !== undefined &&
    window.Capacitor.isNativePlatform()
  );
};

/**
 * Custom hook to handle the hardware back button on Android devices
 */
export const useHardwareBackButton = () => {
  // Only use navigation hooks if we're in a native environment
  const navigate = isCapacitorNative() ? useNavigate() : null;
  const location = isCapacitorNative() ? useLocation() : null;
  
  useEffect(() => {
    if (!isCapacitorNative() || !navigate || !location) return;
    
    // This would be imported from Capacitor plugins
    // We'll just set up the structure here
    const handleBackButton = () => {
      // If we're on the home screen, let the OS handle it
      if (location.pathname === '/') {
        // App.exitApp() would be called here from a Capacitor plugin
        return;
      }
      
      // Otherwise, navigate back in our app's history
      navigate(-1);
      return false; // Prevent default behavior
    };
    
    // This would register the listener with Capacitor
    // App.addListener('backButton', handleBackButton);
    
    return () => {
      // App.removeListener('backButton', handleBackButton);
    };
  }, [navigate, location]);
};

/**
 * Customize the status bar appearance based on the current screen
 */
export const useStatusBarCustomization = (
  isDarkBackground: boolean = true
) => {
  useEffect(() => {
    if (!isCapacitorNative()) return;
    
    // This would use the StatusBar plugin from Capacitor
    if (isDarkBackground) {
      // StatusBar.setStyle({ style: Style.Dark });
    } else {
      // StatusBar.setStyle({ style: Style.Light });
    }
  }, [isDarkBackground]);
};

/**
 * Enable fullscreen mode for video playback
 */
export const enableFullscreenMode = () => {
  if (!isCapacitorNative()) return;
  
  // This would use Capacitor plugins
  // StatusBar.hide();
  // Navigation.hide();
};

/**
 * Disable fullscreen mode after video playback
 */
export const disableFullscreenMode = () => {
  if (!isCapacitorNative()) return;
  
  // StatusBar.show();
  // Navigation.show();
};

/**
 * Check if device is online
 */
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
};
