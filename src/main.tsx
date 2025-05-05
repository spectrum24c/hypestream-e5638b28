
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from 'react-router-dom';
import App from "./App";
import "./index.css";
import "./utils/movie-buttons-responsive.css";
import SplashScreen from "./components/SplashScreen";
import { initPerformanceOptimizations } from "./utils/performanceOptimizer";

// Initialize performance optimizations
initPerformanceOptimizations();

const Root = () => {
  const [showSplash, setShowSplash] = React.useState(true);
  
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

ReactDOM.createRoot(document.getElementById("root")!).render(<Root />);
