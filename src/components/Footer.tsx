
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Facebook, Twitter, Instagram, Mail, Youtube } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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
      console.log('Starting newsletter subscription process for:', email);
      
      // Save subscriber to database
      const { error: saveError } = await supabase.functions.invoke('save-newsletter-subscriber', {
        body: {
          email: email,
          adminEmail: 'awokojorichmond@gmail.com',
          userId: null
        }
      });

      if (saveError) {
        console.error('Error saving subscriber:', saveError);
        throw saveError;
      }

      console.log('Subscriber saved successfully, sending confirmation emails...');

      // Send confirmation emails
      const { error: emailError } = await supabase.functions.invoke('newsletter-confirm', {
        body: {
          email: email,
          adminEmail: 'awokojorichmond@gmail.com'
        }
      });

      if (emailError) {
        console.error('Error sending emails:', emailError);
        throw emailError;
      }

      console.log('Newsletter subscription completed successfully');

      // Clear the form
      setEmail('');
      
      toast({
        title: "Successfully subscribed!",
        description: "Thank you for subscribing to our newsletter. Check your email for confirmation.",
        variant: "default"
      });
      
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      toast({
        title: "Subscription failed",
        description: "There was a problem with your subscription. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAppStoreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toast({
      title: "App Not Available",
      description: "Our iOS app is not available yet. Coming soon!",
      variant: "default"
    });
  };
  
  return (
    <footer className="bg-hype-dark border-t border-gray-800">
      <div className="container mx-auto px-4 py-12">
        {/* Top section with newsletter and quick links */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-10">
          {/* Newsletter */}
          <div className="md:col-span-5">
            <h3 className="text-xl font-bold mb-4 text-white">Subscribe to Our Newsletter</h3>
            <p className="text-gray-400 mb-4">Get updates on the latest movies and shows. No spam, we promise!</p>
            
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
              <Input
                type="email"
                placeholder="Your email address"
                className="flex-grow bg-gray-800 border-gray-700 text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button 
                type="submit" 
                className="bg-hype-purple hover:bg-hype-purple/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>
          </div>
          
          {/* Quick links */}
          <div className="md:col-span-3">
            <h3 className="text-xl font-bold mb-4 text-white">Explore</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/?category=movie" className="text-gray-400 hover:text-white transition-colors">Movies</Link></li>
              <li><Link to="/?category=tv" className="text-gray-400 hover:text-white transition-colors">TV Shows</Link></li>
              <li><Link to="/favorites" className="text-gray-400 hover:text-white transition-colors">My List</Link></li>
            </ul>
          </div>
          
          {/* Help */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold mb-4 text-white">Help</h3>
            <ul className="space-y-2">
              <li><Link to="/faqs" className="text-gray-400 hover:text-white transition-colors">FAQs</Link></li>
              <li><Link to="/support" className="text-gray-400 hover:text-white transition-colors">Support</Link></li>
              <li><a href="mailto:awokojorichmond@gmail.com" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>
          
          {/* Legal */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold mb-4 text-white">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/terms-of-use" className="text-gray-400 hover:text-white transition-colors">Terms of Use</Link></li>
              <li><Link to="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/cookie-policy" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        
        {/* Social Media and Copyright */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex space-x-4 mb-4 md:mb-0">
            <a href="#" className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
              <Facebook size={18} />
            </a>
            <a href="#" className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
              <Twitter size={18} />
            </a>
            <a href="#" className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
              <Instagram size={18} />
            </a>
            <a href="#" className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
              <Youtube size={18} />
            </a>
            <a href="mailto:awokojorichmond@gmail.com" className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
              <Mail size={18} />
            </a>
          </div>
          
          <div className="text-gray-500 text-sm text-center md:text-right">
            <p>© {new Date().getFullYear()} HypeStream. All rights reserved.</p>
            <p className="mt-1">
              Built with 
              <span className="mx-1">❤️</span>
              for movie enthusiasts everywhere
            </p>
          </div>
        </div>
        
        {/* App store links */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 mb-3">Get the HypeStream app</p>
          <div className="flex justify-center space-x-4">
            <a href="#" onClick={handleAppStoreClick} className="inline-flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white text-sm">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.79 1.18-.12 2.19-.84 3.11-.73 1.35.16 2.33.8 2.96 1.95-2.58 1.54-2.01 4.76.05 5.98-.71 1.84-1.63 3.71-3.2 4.98zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.32 2.32-1.66 4.11-3.74 4.25z" />
              </svg>
              App Store
            </a>
            <a href="https://median.co/share/dqnldn" target="_blank" className="inline-flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white text-sm">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.609 1.814L13.792 12 3.609 22.186a.996.996 0 0 1-.289-.707V2.521a1 1 0 0 1 .289-.707zM14.83 12.955l2.909-1.686 2.646 1.535a.996.996 0 0 1 .365 1.248 1 1 0 0 1-.384.432L17.739 16l-2.908-1.687L14.83 12.955zm0-1.91l.001-1.358L17.739 8l2.626 1.516a1 1 0 0 1 .018 1.695l-2.646 1.535-2.907-1.686v-.015zM12.792 1.59l8.792 5.087v.003a1 1 0 0 1 .106 1.653l-2.676 1.552-2.906-1.688a1.03 1.03 0 0 1-.125-.082l-4.019-2.326 4.394-4.199H12.793zm0 20.819h-.001l-6.792-3.933-2.384 2.391a1.006 1.006 0 0 1-.584.262A1 1 0 0 1 2 20.13V3.87a1 1 0 0 1 1.031-.999.994.994 0 0 1 .584.262l2.384 2.39 6.792-3.932h.001A1 1 0 0 1 14 2.522v18.956a1 1 0 0 1-1.209.931z" />
              </svg>
              Google Play
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
