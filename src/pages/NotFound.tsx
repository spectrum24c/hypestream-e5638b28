
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-hype-dark text-foreground flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="text-center max-w-lg">
          <h1 className="text-9xl font-bold text-hype-orange mb-6">404</h1>
          <div className="bg-hype-gray/30 backdrop-blur-sm p-8 rounded-xl">
            <h2 className="text-2xl font-bold mb-4">Oops! Page Not Found</h2>
            <p className="text-muted-foreground mb-8">
              The page you are looking for might have been removed, had its name changed,
              or is temporarily unavailable.
            </p>
            <Button className="bg-hype-purple hover:bg-hype-purple/90" size="lg">
              <Home className="mr-2 h-5 w-5" />
              <a href="/">Return to Home</a>
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
