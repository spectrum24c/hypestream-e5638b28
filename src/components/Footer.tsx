
import React from 'react';
import { Facebook, Twitter, Instagram, Youtube, Mail } from 'lucide-react';

const Footer = () => {
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
              <a href="#" className="text-muted-foreground hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-white transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Browse</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-white transition-colors">Movies</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-white transition-colors">TV Shows</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-white transition-colors">Anime</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-white transition-colors">New Releases</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-white transition-colors">Popular</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Help</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-white transition-colors">Account</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-white transition-colors">FAQs</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-white transition-colors">Devices</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Newsletter</h4>
            <p className="text-sm text-muted-foreground mb-4">Stay updated with the latest releases and news.</p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 rounded-l-md bg-muted px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-hype-purple"
              />
              <button className="rounded-r-md bg-hype-purple px-4 py-2 text-white hover:bg-hype-purple/90">
                <Mail className="h-4 w-4" />
              </button>
            </div>
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
