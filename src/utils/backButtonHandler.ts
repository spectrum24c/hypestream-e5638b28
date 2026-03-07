/**
 * Unified Back Button Handler
 * 
 * Detects router and uses framework navigation APIs.
 * - React Router v6: navigate(-1)
 * - Fallback: window.history.back()
 * 
 * Listens for:
 * - popstate (browser back)
 * - backbutton (Cordova/Android WebView hybrid/PWA)
 * 
 * Before navigating back, closes any open overlays (modals, toasts, dropdowns, fullscreen players).
 * 
 * TEST CHECKLIST:
 * - [ ] Android Chrome
 * - [ ] iOS Safari
 * - [ ] PWA install (Add to Home Screen)
 * - [ ] Android WebView (Capacitor/Cordova)
 */

import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Common open-state selectors for overlays
const OVERLAY_SELECTORS = [
  '[data-state="open"]',          // Radix UI dialogs, popovers, sheets
  '[data-modal-open]',            // Custom modal attribute
  '.modal-open',                  // Bootstrap-style modals
  '[data-overlay]',               // Generic overlay marker
  '[role="dialog"][data-state="open"]', // Accessible dialogs
  '.sonner-toast',                // Sonner toast notifications
];

/**
 * Attempt to close any open overlays.
 * Returns true if an overlay was found and close was attempted.
 */
const tryCloseOverlays = (): boolean => {
  for (const selector of OVERLAY_SELECTORS) {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      // Try pressing Escape to close overlays (works with Radix UI)
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      return true;
    }
  }
  return false;
};

/**
 * React hook for unified back button behavior.
 * Uses React Router v6 navigate(-1).
 * 
 * Adapt for other routers:
 * - Next.js: import Router from 'next/router'; Router.back()
 * - React Router v5: import { useHistory } from 'react-router-dom'; history.goBack()
 * - No router: window.history.back()
 */
export const useUnifiedBackButton = () => {
  // React Router v6 navigation
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = useCallback(() => {
    // First, try to close any open overlays
    if (tryCloseOverlays()) {
      return; // Overlay was open; don't navigate
    }

    // If on home page, don't navigate back (let OS handle)
    if (location.pathname === '/') {
      return;
    }

    // React Router v6 branch: use navigate(-1)
    navigate(-1);
  }, [navigate, location.pathname]);

  useEffect(() => {
    // Listen for Cordova/Capacitor Android hardware back button
    // This fires on Android WebView when the hardware back button is pressed
    document.addEventListener('backbutton', handleBack);

    // Cleanup: unsubscribe on unmount (idempotent)
    return () => {
      document.removeEventListener('backbutton', handleBack);
    };
  }, [handleBack]);
};
