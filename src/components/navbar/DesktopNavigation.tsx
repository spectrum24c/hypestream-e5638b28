
import React from 'react';
import { Link } from 'react-router-dom';

const DesktopNavigation: React.FC = () => {
  return (
    <nav className="hidden md:flex items-center space-x-6">
      <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
        Home
      </Link>
      <Link to="/favorites" className="text-muted-foreground hover:text-foreground transition-colors">
        My List
      </Link>
      <Link to="/devices" className="text-muted-foreground hover:text-foreground transition-colors">
        Devices
      </Link>
      <Link to="/faqs" className="text-muted-foreground hover:text-foreground transition-colors">
        FAQs
      </Link>
    </nav>
  );
};

export default DesktopNavigation;
