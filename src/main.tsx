
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { BrowserRouter } from 'react-router-dom';
import App from "./App";
import "./index.css";
import "./utils/movie-buttons-responsive.css";

// Ensure proper React setup and error boundaries
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("Root element not found");
  throw new Error("Root element not found");
}

// Clear any existing content first
rootElement.innerHTML = '';

// Create root with proper error handling
const root = ReactDOM.createRoot(rootElement);

// Render app with error boundary
const AppWithProviders = () => {
  return (
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
};

// Render the app
try {
  root.render(<AppWithProviders />);
} catch (error) {
  console.error('Failed to render app:', error);
  rootElement.innerHTML = '<div style="color: white; text-align: center; padding: 20px;">Failed to load application</div>';
}
