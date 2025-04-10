import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { categories } from '@/data/categories';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface MobileNavigationProps {
  session: any;
  onSignOut: () => Promise<void>;
  onDeleteAccount: () => Promise<void>;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  session,
  onSignOut,
  onDeleteAccount,
}) => {
  const [menuOpen, setMenuOpen] = useState(true); // Set the menu to open by default

  return (
    <>
      {/* Full-Screen Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 bg-hype-dark text-white z-50 overflow-y-auto">
          {/* Close Button */}
          <button
            className="absolute top-4 right-4 text-white"
            onClick={() => setMenuOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>

          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-1">
              <Link to="/" className="text-foreground hover:text-white py-2">
                Home
              </Link>

              <Accordion type="single" collapsible className="w-full border-0">
                {categories.map((category) => (
                  <AccordionItem
                    key={category.id}
                    value={category.id}
                    className="border-b-0"
                  >
                    {category.subcategories.length > 0 ? (
                      <>
                        <AccordionTrigger className="py-2 text-foreground hover:text-white">
                          {category.name}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pl-4 flex flex-col gap-2 py-1">
                            <Link
                              to={`/?category=${category.id}`}
                              className="text-muted-foreground hover:text-white py-1"
                            >
                              All {category.name}
                            </Link>
                            {category.subcategories.map((subcategory) => (
                              <Link
                                key={subcategory.id}
                                to={`/?category=${category.id}&genre=${subcategory.id}`}
                                className="text-muted-foreground hover:text-white py-1"
                              >
                                {subcategory.name}
                              </Link>
                            ))}
                          </div>
                        </AccordionContent>
                      </>
                    ) : (
                      <Link
                        to={`/?category=${category.id}`}
                        className="text-foreground hover:text-white py-2 block"
                      >
                        {category.name}
                      </Link>
                    )}
                  </AccordionItem>
                ))}
              </Accordion>

              <Link
                to="/favorites"
                className="text-foreground hover:text-white py-2"
              >
                My List
              </Link>
              <Link
                to="/devices"
                className="text-foreground hover:text-white py-2"
              >
                Devices
              </Link>
              <Link
                to="/faqs"
                className="text-foreground hover:text-white py-2"
              >
                FAQs
              </Link>

              {session ? (
                <div className="pt-4 border-t border-border mt-4">
                  <div className="text-sm text-muted-foreground mb-2">
                    Signed in as {session.user.email}
                  </div>
                  <div className="space-y-2">
                    <Link to="/profile" className="block text-foreground">
                      Profile
                    </Link>
                    <Link to="/favorites" className="block text-foreground">
                      My Favorites
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center mt-2"
                      onClick={onSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex items-center mt-2 w-full"
                      onClick={onDeleteAccount}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t border-border mt-4 space-y-2">
                  <Link to="/auth">
                    <Button className="w-full bg-hype-purple hover:bg-hype-purple/90">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button variant="outline" className="w-full">
                      Create Account
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNavigation;
