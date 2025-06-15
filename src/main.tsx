
import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from 'react-router-dom';
import App from "./App";
import "./index.css";
import "./utils/movie-buttons-responsive.css";
import SplashScreen from "./components/SplashScreen";

// Simple performance initialization
const initBasicOptimizations = () => {
  try {
    // Basic DNS prefetch for critical domains
    const domains = ['https://image.tmdb.org', 'https://api.themoviedb.org'];
    domains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    });
  } catch (error) {
    console.warn('Basic optimizations failed:', error);
  }
};

// Initialize basic optimizations
initBasicOptimizations();

// PWA Service Worker Registration with better error handling
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(error => {
        console.log('ServiceWorker registration failed: ', error);
        // Don't block the app if service worker fails
      });
  });
}

const Root: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  
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
  ReactDOM.createRoot(rootElement).render(<Root />);
} else {
  console.error("Root element not found");
}
