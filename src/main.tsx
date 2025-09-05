
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from 'react-router-dom';
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
const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <AppWithSplash />
      </BrowserRouter>
    </React.StrictMode>
  );
} else {
  console.error("Root element not found");
}
