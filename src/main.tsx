
import React, { useState } from "react";
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
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
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

// Initialize basic optimizations only in production
if (process.env.NODE_ENV === 'production') {
  initBasicOptimizations();
}

// Properly structured React component
const Root = () => {
  const [showSplash, setShowSplash] = useState(false); // Changed to false for development
  
  const handleSplashComplete = () => {
    setShowSplash(false);
  };
  
  return (
    <React.StrictMode>
      <BrowserRouter>
        {showSplash ? (
          <SplashScreen onComplete={handleSplashComplete} />
        ) : (
          <App />
        )}
      </BrowserRouter>
    </React.StrictMode>
  );
};

// Ensure the root element exists before rendering
const rootElement = document.getElementById("root");
if (rootElement) {
  console.log("Initializing React app...");
  const root = ReactDOM.createRoot(rootElement);
  root.render(<Root />);
} else {
  console.error("Root element not found - cannot initialize React app");
}
