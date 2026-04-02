
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
      toast({ title: "Invalid email", description: "Please enter a valid email address", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      console.log('Starting newsletter subscription process for:', email);
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id ?? null;
      const { data: functionData, error: saveError } = await supabase.functions.invoke('save-newsletter-subscriber', {
        body: { email, adminEmail: 'awokojorichmond@gmail.com', userId }
      });
      if (saveError) { console.error('Error saving subscriber:', saveError); throw saveError; }
      if (functionData?.error === 'ALREADY_SUBSCRIBED') {
        toast({ title: "Already subscribed", description: "This email has already subscribed to the newsletter", variant: "default" });
        return;
      }
      console.log('Subscriber saved successfully, sending confirmation emails...');
      const { error: emailError } = await supabase.functions.invoke('send-newsletter-notification', {
        body: { subscriberEmail: email, adminEmail: 'awokojorichmond@gmail.com', userId }
      });
      if (emailError) { console.error('Error sending emails:', emailError); throw emailError; }
      console.log('Newsletter subscription completed successfully');
      setEmail('');
      toast({ title: "Successfully subscribed!", description: "Thank you for subscribing to our newsletter. Check your email for confirmation.", variant: "default" });
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      toast({ title: "Subscription failed", description: "There was a problem with your subscription. Please try again later.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-10">
          <div className="md:col-span-5 text-center md:text-left">
            <h3 className="text-xl font-bold mb-4 text-foreground">Subscribe to Our Newsletter</h3>
            <p className="text-muted-foreground mb-4">Get updates on the latest movies and shows. No spam, we promise!</p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
              <Input
                type="email"
                placeholder="Your email address"
                className="flex-grow bg-secondary border-border text-foreground"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>
          </div>
          
          <div className="md:col-span-3">
            <h3 className="text-xl font-bold mb-4 text-foreground">Explore</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/?category=movie" className="text-muted-foreground hover:text-primary transition-colors">Movies</Link></li>
              <li><Link to="/?category=tv" className="text-muted-foreground hover:text-primary transition-colors">TV Shows</Link></li>
              <li><Link to="/favorites" className="text-muted-foreground hover:text-primary transition-colors">My List</Link></li>
            </ul>
          </div>
          
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold mb-4 text-foreground">Help</h3>
            <ul className="space-y-2">
              <li><Link to="/faqs" className="text-muted-foreground hover:text-primary transition-colors">FAQs</Link></li>
              <li><Link to="/support" className="text-muted-foreground hover:text-primary transition-colors">Support</Link></li>
              <li><a href="mailto:hypestream127@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</a></li>
            </ul>
          </div>
          
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold mb-4 text-foreground">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/terms-of-use" className="text-muted-foreground hover:text-primary transition-colors">Terms of Use</Link></li>
              <li><Link to="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/cookie-policy" className="text-muted-foreground hover:text-primary transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border pt-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col items-center gap-4 md:flex-row md:items-center">
            <div className="flex space-x-4">
              <a href="#" className="p-2 rounded-full bg-secondary hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all">
                <Facebook size={18} />
              </a>
              <a href="#" className="p-2 rounded-full bg-secondary hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all">
                <Twitter size={18} />
              </a>
              <a href="#" className="p-2 rounded-full bg-secondary hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all">
                <Instagram size={18} />
              </a>
              <a href="#" className="p-2 rounded-full bg-secondary hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all">
                <Youtube size={18} />
              </a>
              <a href="mailto:hypestream127@gmail.com" className="p-2 rounded-full bg-secondary hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all">
                <Mail size={18} />
              </a>
            </div>

            <a
              href="/app-release.apk"
              download="HypeStream.apk"
              aria-label="Download HypeStream Android app"
              className="inline-flex items-center gap-3 rounded-full border border-border bg-secondary px-4 py-2 text-xs text-foreground hover:bg-primary/10 hover:border-primary/40 transition-all"
            >
              <div className="flex h-5 w-5 flex-col items-center justify-center rounded-full text-[9px] font-semibold uppercase tracking-wide">
                <svg className="w-3.5 h-3.5 mb-0.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M14.222 9.374c1.037-.61 1.037-2.137 0-2.748L11.528 5.04 8.32 8l3.207 2.96zm-3.595 2.116L7.583 8.68 1.03 14.73c.201 1.029 1.36 1.61 2.303 1.055zM1 13.396V2.603L6.846 8zM1.03 1.27l6.553 6.05 3.044-2.81L3.333.215C2.39-.341 1.231.24 1.03 1.27" />
                </svg>
              </div>
              <span className="text-sm font-medium">Download app</span>
            </a>
          </div>
          
          <div className="text-muted-foreground text-sm text-center md:text-right">
            <p>© {new Date().getFullYear()} HypeStream. All rights reserved.</p>
            <p className="mt-1">Built with <span className="mx-1">❤️</span> for movie enthusiasts everywhere</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;