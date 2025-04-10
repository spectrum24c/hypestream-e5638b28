
import React, { useState, useEffect } from 'react';
import { Facebook, Twitter, Instagram, Youtube, Mail, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DeviceInfo } from '@/types/movie';

// Create a new table for newsletter subscribers if it doesn't exist
const createNewsletterSubscribersTable = async () => {
  const { error } = await supabase.rpc('create_newsletter_subscribers_if_not_exists');
  if (error) console.error('Error creating newsletter_subscribers table:', error);
};

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [showDevices, setShowDevices] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Get auth session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    // Get device info
    const userAgent = navigator.userAgent;
    const device = {
      name: getUserDeviceName(userAgent),
      type: getUserDeviceType(userAgent),
      lastActive: new Date().toLocaleString()
    };
    setDeviceInfo(device);

    // Check if already subscribed from localStorage
    const subscribedEmail = localStorage.getItem('newsletter_email');
    if (subscribedEmail) {
      setIsSubscribed(true);
    }

    // Ensure the newsletter_subscribers table exists
    createNewsletterSubscribersTable();

    return () => subscription.unsubscribe();
  }, []);

  const getUserDeviceName = (userAgent: string) => {
    let deviceName = "Unknown Device";
    
    if (/Windows NT 10.0/.test(userAgent)) deviceName = "Windows 10";
    else if (/Windows NT 6.3/.test(userAgent)) deviceName = "Windows 8.1";
    else if (/Windows NT 6.2/.test(userAgent)) deviceName = "Windows 8";
    else if (/Windows NT 6.1/.test(userAgent)) deviceName = "Windows 7";
    else if (/Windows NT 6.0/.test(userAgent)) deviceName = "Windows Vista";
    else if (/Windows NT 5.1/.test(userAgent)) deviceName = "Windows XP";
    else if (/Mac OS X/.test(userAgent)) deviceName = "Mac OS X";
    else if (/Linux/.test(userAgent)) deviceName = "Linux";
    else if (/Android/.test(userAgent)) deviceName = "Android";
    else if (/iPhone|iPad|iPod/.test(userAgent)) deviceName = "iOS";
    
    return deviceName;
  };
  
  const getUserDeviceType = (userAgent: string) => {
    if (/Mobile|Android|iPhone|iPad|iPod/.test(userAgent)) return "Mobile";
    if (/Tablet|iPad/.test(userAgent)) return "Tablet";
    return "Desktop/Laptop";
  };

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
    if (session) {
      navigate('/profile');
      window.scrollTo(0, 0);
    } else {
      toast({
        title: "Authentication required",
        description: "Please login to access your account",
        variant: "destructive"
      });
    }
  };

  const handleDevicesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/devices');
    window.scrollTo(0, 0);
  };

  const handleFAQsClick = () => {
    navigate('/faqs');
    window.scrollTo(0, 0);
  };

  const validateEmail = (email: string) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Store the email in custom function that stores to database
      const { error } = await supabase.functions.invoke('save-newsletter-subscriber', {
        body: { 
          email: email,
          adminEmail: 'hypestream127@gmail.com',
          userId: session?.user?.id || null
        }
      });

      if (error) throw error;
      
      // Store email in localStorage to remember subscription
      localStorage.setItem('newsletter_email', email);
      
      setEmail('');
      setIsSubscribed(true);
      
      toast({
        title: "Subscription successful!",
        description: "Thank you for subscribing to our newsletter",
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 footer-grid">
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
                  onClick={() => handleNavigation('horror')} 
                  className="text-muted-foreground hover:text-white transition-colors"
                >
                  Horror
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('comedy')} 
                  className="text-muted-foreground hover:text-white transition-colors"
                >
                  Comedy
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
                  className={`${session ? 'text-muted-foreground hover:text-white' : 'text-gray-600 cursor-not-allowed'} transition-colors`}
                  disabled={!session}
                >
                  Account
                </button>
              </li>
              <li>
                <button 
                  onClick={handleFAQsClick}
                  className="text-muted-foreground hover:text-white transition-colors"
                >
                  FAQs
                </button>
              </li>
              <li>
                <button 
                  onClick={handleDevicesClick}
                  className="text-muted-foreground hover:text-white transition-colors"
                >
                  Devices
                </button>
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
            <p className="text-sm text-muted-foreground mb-4">Stay updated with the latest releases and exclusive offers.</p>
            
            {isSubscribed ? (
              <div className="bg-green-900/20 border border-green-600/30 rounded-md p-4 text-sm flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" /> 
                <span>Thank you for subscribing!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                  <input
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-md sm:rounded-r-none bg-muted px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-hype-purple w-full"
                  />
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-md sm:rounded-l-none bg-hype-purple px-4 py-2 text-white hover:bg-hype-purple/90 disabled:opacity-50 sm:whitespace-nowrap"
                  >
                    {isSubmitting ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    ) : (
                      "Subscribe"
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  By subscribing, you agree to receive marketing emails from us. You can unsubscribe anytime.
                </p>
              </form>
            )}
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
