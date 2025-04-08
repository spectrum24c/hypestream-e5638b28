
import React, { useState } from 'react';
import { Facebook, Twitter, Instagram, Youtube, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleNavigation = (category: string) => {
    navigate(`/?category=${category}`);
    window.scrollTo(0, 0);
  };

  const handleDisabledLink = (e: React.MouseEvent) => {
    e.preventDefault();
    // Do nothing for disabled links
  };

  const handleSocialClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Do nothing for social links
  };

  const handleAccountClick = () => {
    const token = localStorage.getItem('sb-auth-token');
    if (token) {
      navigate('/profile');
    } else {
      navigate('/auth');
    }
    window.scrollTo(0, 0);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Send email data using a simple mailto link for now
      const subject = encodeURIComponent("Newsletter Subscription");
      const body = encodeURIComponent(`New subscriber email: ${email}`);
      window.open(`mailto:awokojorichmond@gmail.com?subject=${subject}&body=${body}`);
      
      setEmail('');
      toast({
        title: "Subscription successful!",
        description: "Thank you for subscribing to our newsletter"
      });
    } catch (error) {
      console.error("Error subscribing to newsletter:", error);
      toast({
        title: "Subscription failed",
        description: "There was a problem processing your request",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-hype-dark border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">HYPE<span className="text-hype-orange">STREAM</span></h3>
            <p className="text-sm text-muted-foreground">
              Your ultimate streaming destination for movies, TV shows, and anime.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-white transition-colors" onClick={handleSocialClick}>
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-white transition-colors" onClick={handleSocialClick}>
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-white transition-colors" onClick={handleSocialClick}>
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-white transition-colors" onClick={handleSocialClick}>
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Browse</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button 
                  onClick={() => handleNavigation('movie')} 
                  className="text-muted-foreground hover:text-white transition-colors"
                >
                  Movies
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('tv')} 
                  className="text-muted-foreground hover:text-white transition-colors"
                >
                  TV Shows
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('tv')} 
                  className="text-muted-foreground hover:text-white transition-colors"
                >
                  Anime
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('new')} 
                  className="text-muted-foreground hover:text-white transition-colors"
                >
                  New Releases
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('trending')} 
                  className="text-muted-foreground hover:text-white transition-colors"
                >
                  Popular
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Help</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button 
                  onClick={handleAccountClick} 
                  className="text-muted-foreground hover:text-white transition-colors"
                >
                  Account
                </button>
              </li>
              <li>
                <a href="#" 
                  className="text-muted-foreground hover:text-white transition-colors opacity-70 cursor-not-allowed" 
                  onClick={handleDisabledLink}
                >
                  FAQs
                </a>
              </li>
              <li>
                <a href="#" 
                  className="text-muted-foreground hover:text-white transition-colors opacity-70 cursor-not-allowed" 
                  onClick={handleDisabledLink}
                >
                  Devices
                </a>
              </li>
              <li>
                <a href="#" 
                  className="text-muted-foreground hover:text-white transition-colors opacity-70 cursor-not-allowed" 
                  onClick={handleDisabledLink}
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Newsletter</h4>
            <p className="text-sm text-muted-foreground mb-4">Stay updated with the latest releases and news.</p>
            <form onSubmit={handleSubscribe} className="flex">
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded-l-md bg-muted px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-hype-purple"
              />
              <button 
                type="submit"
                disabled={isSubmitting}
                className="rounded-r-md bg-hype-purple px-4 py-2 text-white hover:bg-hype-purple/90 disabled:opacity-50"
              >
                <Mail className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} HypeStream. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
