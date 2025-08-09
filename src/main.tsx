
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initPerformanceOptimizations } from './utils/performanceOptimizer';
import App from "./App";
import "./index.css";
import "./utils/movie-buttons-responsive.css";
import SplashScreen from "./components/SplashScreen";

// Simple performance initialization without DOM manipulation
const initBasicOptimizations = () => {
  try {
    // Only do basic optimizations that don't conflict with React
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(registration => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
          })
          .catch(error => {
            console.log('ServiceWorker registration failed: ', error);
          });
      });
    }
  } catch (error) {
    console.warn('Basic optimizations failed:', error);
  }
};

// Initialize basic optimizations
initBasicOptimizations();

try {
  initPerformanceOptimizations();
} catch (e) {
  console.warn('Advanced optimizations failed:', e);
}

// Main App component that handles splash screen logic
const AppWithSplash = () => {
  const [showSplash, setShowSplash] = React.useState(!import.meta.env.DEV);
  
  const handleSplashComplete = React.useCallback(() => {
    setShowSplash(false);
  }, []);
  
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }
  
  return <App />;
};

// Ensure the root element exists before rendering
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 1 } }
});
const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppWithSplash />
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
  );
} else {
  console.error("Root element not found");
}
