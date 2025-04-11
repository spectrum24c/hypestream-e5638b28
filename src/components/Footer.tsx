
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Facebook, Twitter, Instagram, Mail, Youtube, ExternalLink, Apple, SmartphoneIcon } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

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
      const adminEmail = "awokojorichmond@gmail.com"; // Updated email as requested
      
      // Call the save-newsletter-subscriber edge function
      const { error } = await supabase.functions.invoke('save-newsletter-subscriber', {
        body: { email, adminEmail }
      });
      
      if (error) throw error;
      
      // Call the newsletter-confirm edge function
      await supabase.functions.invoke('newsletter-confirm', {
        body: { email, adminEmail }
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

  const handleAppleStoreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toast({
      title: "Not Available",
      description: "App not available for iOS users yet",
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
              <li><Link to="/devices" className="text-gray-400 hover:text-white transition-colors">Devices</Link></li>
              <li>
                <SheetTrigger asChild>
                  <Button variant="link" className="text-gray-400 hover:text-white transition-colors p-0 h-auto">Contact Us</Button>
                </SheetTrigger>
              </li>
              <li><a href="mailto:awokojorichmond@gmail.com" className="text-gray-400 hover:text-white transition-colors">Support</a></li>
            </ul>
          </div>
          
          {/* Legal */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold mb-4 text-white">Legal</h3>
            <ul className="space-y-2">
              <li>
                <SheetTrigger asChild>
                  <Button variant="link" className="text-gray-400 hover:text-white transition-colors p-0 h-auto">Terms of Use</Button>
                </SheetTrigger>
              </li>
              <li>
                <SheetTrigger asChild>
                  <Button variant="link" className="text-gray-400 hover:text-white transition-colors p-0 h-auto">Privacy Policy</Button>
                </SheetTrigger>
              </li>
              <li>
                <SheetTrigger asChild>
                  <Button variant="link" className="text-gray-400 hover:text-white transition-colors p-0 h-auto">Cookie Policy</Button>
                </SheetTrigger>
              </li>
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
            <Button 
              onClick={handleAppleStoreClick} 
              className="inline-flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white text-sm"
            >
              <Apple className="w-5 h-5 mr-2" />
              App Store
            </Button>
            <a 
              href="https://median.co/share/dqnldn" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white text-sm"
            >
              <SmartphoneIcon className="w-5 h-5 mr-2" />
              Google Play
            </a>
          </div>
        </div>
      </div>

      {/* Terms of Use Sheet */}
      <Sheet>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Terms of Use</SheetTitle>
            <SheetDescription>Last updated: April 2025</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4 text-sm">
            <h3 className="font-bold text-lg">Welcome to HypeStream</h3>
            <p>These Terms of Use govern your use of the HypeStream platform and services.</p>
            
            <h4 className="font-semibold text-base mt-4">1. Acceptance of Terms</h4>
            <p>By accessing or using our service, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.</p>
            
            <h4 className="font-semibold text-base mt-4">2. User Accounts</h4>
            <p>When you create an account with us, you must provide accurate, complete, and current information. You are responsible for safeguarding the password and for all activities that occur under your account.</p>
            
            <h4 className="font-semibold text-base mt-4">3. Content and Conduct</h4>
            <p>Our service allows you to view content, add comments, and interact with other users. You are responsible for your conduct and any data, text, or information that you submit, post, or display on the service.</p>
            
            <h4 className="font-semibold text-base mt-4">4. Intellectual Property</h4>
            <p>The service and its original content, features, and functionality are and will remain the exclusive property of HypeStream and its licensors.</p>
            
            <h4 className="font-semibold text-base mt-4">5. Termination</h4>
            <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including without limitation if you breach the Terms.</p>
            
            <h4 className="font-semibold text-base mt-4">6. Changes to Terms</h4>
            <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. It is your responsibility to review these Terms periodically for changes.</p>
            
            <h4 className="font-semibold text-base mt-4">7. Contact Us</h4>
            <p>If you have any questions about these Terms, please contact us at awokojorichmond@gmail.com.</p>
          </div>
        </SheetContent>
      </Sheet>

      {/* Privacy Policy Sheet */}
      <Sheet>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Privacy Policy</SheetTitle>
            <SheetDescription>Last updated: April 2025</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4 text-sm">
            <h3 className="font-bold text-lg">HypeStream Privacy Policy</h3>
            <p>This Privacy Policy describes how we collect, use, and disclose your information when you use our service.</p>
            
            <h4 className="font-semibold text-base mt-4">1. Information Collection</h4>
            <p>We collect information you provide directly to us, such as when you create an account, update your profile, subscribe to our newsletter, or contact support.</p>
            
            <h4 className="font-semibold text-base mt-4">2. Use of Information</h4>
            <p>We use the information we collect to provide, maintain, and improve our services, communicate with you, and personalize your experience.</p>
            
            <h4 className="font-semibold text-base mt-4">3. Sharing of Information</h4>
            <p>We may share information as described in this policy, including with our service providers, for legal reasons, or in connection with business transfers.</p>
            
            <h4 className="font-semibold text-base mt-4">4. Security</h4>
            <p>We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access.</p>
            
            <h4 className="font-semibold text-base mt-4">5. Your Choices</h4>
            <p>You may update your account information and email preferences at any time by logging into your account settings.</p>
            
            <h4 className="font-semibold text-base mt-4">6. Changes to Policy</h4>
            <p>We may change this privacy policy from time to time. We will post any changes on this page and, if the changes are significant, provide a more prominent notice.</p>
            
            <h4 className="font-semibold text-base mt-4">7. Contact Us</h4>
            <p>If you have any questions about this Privacy Policy, please contact us at awokojorichmond@gmail.com.</p>
          </div>
        </SheetContent>
      </Sheet>

      {/* Cookie Policy Sheet */}
      <Sheet>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Cookie Policy</SheetTitle>
            <SheetDescription>Last updated: April 2025</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4 text-sm">
            <h3 className="font-bold text-lg">HypeStream Cookie Policy</h3>
            <p>This Cookie Policy explains how we use cookies and similar technologies on our website.</p>
            
            <h4 className="font-semibold text-base mt-4">1. What are Cookies</h4>
            <p>Cookies are small text files that are stored on your browser or device when you visit our website. They allow us to recognize your browser and remember certain information.</p>
            
            <h4 className="font-semibold text-base mt-4">2. Types of Cookies We Use</h4>
            <p>We use essential cookies, performance cookies, functional cookies, and targeting cookies to enhance your experience on our platform.</p>
            
            <h4 className="font-semibold text-base mt-4">3. How We Use Cookies</h4>
            <p>We use cookies to understand how you interact with our website, remember your preferences, and improve your browsing experience.</p>
            
            <h4 className="font-semibold text-base mt-4">4. Your Choices</h4>
            <p>Most web browsers are set to accept cookies by default. If you prefer, you can usually choose to set your browser to remove or reject cookies.</p>
            
            <h4 className="font-semibold text-base mt-4">5. Changes to This Policy</h4>
            <p>We may update this Cookie Policy from time to time to reflect changes in technology, regulation, or our business practices.</p>
            
            <h4 className="font-semibold text-base mt-4">6. Contact Us</h4>
            <p>If you have any questions about our use of cookies, please contact us at awokojorichmond@gmail.com.</p>
          </div>
        </SheetContent>
      </Sheet>

      {/* Contact Us Sheet */}
      <Sheet>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Contact Us</SheetTitle>
            <SheetDescription>We're here to help!</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <p>Have questions, feedback, or need assistance? We'd love to hear from you!</p>
            
            <div className="py-4">
              <h4 className="font-semibold mb-2">Email Us</h4>
              <a 
                href="mailto:awokojorichmond@gmail.com" 
                className="flex items-center text-blue-500 hover:text-blue-600"
              >
                <Mail className="mr-2 h-4 w-4" />
                awokojorichmond@gmail.com
              </a>
            </div>
            
            <div className="py-4">
              <h4 className="font-semibold mb-2">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-500 hover:text-gray-700">
                  <Facebook size={20} />
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-700">
                  <Twitter size={20} />
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-700">
                  <Instagram size={20} />
                </a>
              </div>
            </div>
            
            <div className="pt-4">
              <Button 
                onClick={() => window.open('mailto:awokojorichmond@gmail.com', '_blank')}
                className="w-full bg-hype-purple hover:bg-hype-purple/90"
              >
                Contact Support
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </footer>
  );
};

export default Footer;
