
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
      
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id ?? null;
      
      // Save subscriber to database
      const { data: functionData, error: saveError } = await supabase.functions.invoke('save-newsletter-subscriber', {
        body: {
          email: email,
          adminEmail: 'awokojorichmond@gmail.com',
          userId
        }
      });

      if (saveError) {
        console.error('Error saving subscriber:', saveError);
        throw saveError;
      }

      // Check if this is a duplicate subscription
      if (functionData?.error === 'ALREADY_SUBSCRIBED') {
        toast({
          title: "Already subscribed",
          description: "This email has already subscribed to the newsletter",
          variant: "default"
        });
        return;
      }

      console.log('Subscriber saved successfully, sending confirmation emails...');

      // Send notification emails
      const { error: emailError } = await supabase.functions.invoke('send-newsletter-notification', {
        body: {
          subscriberEmail: email,
          adminEmail: 'awokojorichmond@gmail.com',
          userId
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

  
  
  return (
    <footer className="bg-hype-dark border-t border-gray-800">
      <div className="container mx-auto px-4 py-12">
        {/* Top section with newsletter and quick links */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-10">
          {/* Newsletter */}
          <div className="md:col-span-5">
            <h3 className="text-xl font-bold mb-4 text-white">Subscribe to Our Newsletter</h3>
            <p className="text-gray-400 mb-4">Get updates on the latest movies and shows. No spam, we promise!</p>
            
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
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
              <li><a href="mailto:hypestream127@gmail.com" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
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
            <a href="mailto:hypestream127@gmail.com" className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
              <Mail size={18} />
            </a>
            <a
              href="https://median.co/share/dqnldn"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Google Play"
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M14.222 9.374c1.037-.61 1.037-2.137 0-2.748L11.528 5.04 8.32 8l3.207 2.96zm-3.595 2.116L7.583 8.68 1.03 14.73c.201 1.029 1.36 1.61 2.303 1.055zM1 13.396V2.603L6.846 8zM1.03 1.27l6.553 6.05 3.044-2.81L3.333.215C2.39-.341 1.231.24 1.03 1.27" />
              </svg>
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
        
        
      </div>
    </footer>
  );
};

export default Footer;
