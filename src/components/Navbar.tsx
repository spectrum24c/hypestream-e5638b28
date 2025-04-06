
import React, { useState } from 'react';
import { Search, Bell, User, Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  
  const categories = [
    { name: 'Movies', subcategories: ['Action', 'Comedy', 'Drama', 'Horror'] },
    { name: 'TV Shows', subcategories: ['Drama', 'Comedy', 'Crime', 'Fantasy'] },
    { name: 'Anime', subcategories: ['Shonen', 'Seinen', 'Romance', 'Fantasy'] },
    { name: 'New', subcategories: [] },
  ];

  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-hype-dark/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-white">HYPE<span className="text-hype-orange">STREAM</span></span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {categories.map((category) => (
              <div key={category.name} className="relative group">
                <button className="nav-link group flex items-center">
                  {category.name}
                  {category.subcategories.length > 0 && <ChevronDown className="ml-1 h-4 w-4" />}
                </button>
                
                {category.subcategories.length > 0 && (
                  <div className="absolute left-0 top-full z-10 mt-2 w-48 origin-top-left rounded-md bg-card border border-border shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none hidden group-hover:block">
                    <div className="py-1">
                      {category.subcategories.map((sub) => (
                        <a
                          key={sub}
                          href={`#${sub.toLowerCase()}`}
                          className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
                        >
                          {sub}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Section: Search + User Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Bar (hidden by default on mobile) */}
            <div className={`${searchOpen ? 'flex' : 'hidden'} md:flex items-center relative`}>
              <input
                type="text"
                placeholder="Search titles..."
                className="bg-muted rounded-full py-2 px-4 pr-10 text-sm border border-border focus:border-hype-purple focus:outline-none w-full md:w-auto"
              />
              <Search className="absolute right-3 h-4 w-4 text-muted-foreground" />
            </div>

            {/* Mobile search toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Notifications */}
            <button className="p-2 text-muted-foreground hover:text-foreground">
              <Bell className="h-5 w-5" />
            </button>

            {/* User Profile */}
            <Button variant="ghost" className="rounded-full p-2 flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span className="hidden md:inline-block">Account</span>
            </Button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white hover:text-gray-200"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 animate-fade-in">
            <nav className="flex flex-col space-y-4">
              {categories.map((category) => (
                <div key={category.name} className="space-y-2">
                  <a href={`#${category.name.toLowerCase()}`} className="text-foreground text-lg font-medium">
                    {category.name}
                  </a>
                  {category.subcategories.length > 0 && (
                    <div className="ml-4 space-y-2 border-l border-border pl-4">
                      {category.subcategories.map((sub) => (
                        <a
                          key={sub}
                          href={`#${sub.toLowerCase()}`}
                          className="block text-muted-foreground hover:text-foreground"
                        >
                          {sub}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
