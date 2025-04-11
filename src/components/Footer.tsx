
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
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
      const adminEmail = "hypestream127@gmail.com";
      
      // Store email in our database
      await supabase
        .from('newsletter_subscribers')
        .insert([{ email }]);
      
      // Send notification email to admin
      await supabase.functions.invoke('notify-admin', {
        body: { subscriberEmail: email, adminEmail }
      });
      
      // Clear the form
      setEmail('');
      
      toast({
        title: "Successfully subscribed!",
        description: "Thank you for subscribing to our newsletter",
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
    <footer className="bg-hype-dark border-t border-hype-dark-light">
      <div className="container mx-auto px-4 py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">HypeStream</h3>
            <p className="text-muted-foreground mb-6">Watch the latest movies and TV shows anytime, anywhere.</p>
            
            <div className="space-y-4 mb-8">
              <h4 className="font-medium">Join our Newsletter</h4>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-sm">
                <Input
                  type="email"
                  placeholder="Your email address"
                  className="bg-card border-hype-purple/30 text-white pl-4"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button 
                  type="submit" 
                  className="bg-hype-purple hover:bg-hype-purple/90 whitespace-nowrap"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                </Button>
              </form>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <div className="grid grid-cols-1 gap-2">
              <a href="/" className="text-muted-foreground hover:text-white transition-colors">Home</a>
              <a href="/favorites" className="text-muted-foreground hover:text-white transition-colors">My List</a>
              <a href="/devices" className="text-muted-foreground hover:text-white transition-colors">Devices</a>
              <a href="/faqs" className="text-muted-foreground hover:text-white transition-colors">FAQs</a>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Browse</h3>
            <div className="grid grid-cols-1 gap-2">
              <Link to="/" className="text-muted-foreground hover:text-white transition-colors">Home</Link>
              <Link to="/?category=movie" className="text-muted-foreground hover:text-white transition-colors">Movies</Link>
              <Link to="/?category=tv" className="text-muted-foreground hover:text-white transition-colors">TV Shows</Link>
              <Link to="/favorites" className="text-muted-foreground hover:text-white transition-colors">My List</Link>
            </div>
            
            <h3 className="text-xl font-bold mb-4 mt-8">Connect</h3>
            <div className="flex gap-4 mb-6">
              <a href="#" className="h-10 w-10 bg-hype-dark-light hover:bg-hype-purple rounded-full flex items-center justify-center">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
              <a href="#" className="h-10 w-10 bg-hype-dark-light hover:bg-hype-purple rounded-full flex items-center justify-center">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
              <a href="#" className="h-10 w-10 bg-hype-dark-light hover:bg-hype-purple rounded-full flex items-center justify-center">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17.5 6.5h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
            <p className="text-muted-foreground text-sm">© {new Date().getFullYear()} HypeStream. All rights reserved.</p>
            <p className="text-muted-foreground text-sm mt-1">Terms of Service • Privacy Policy</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
