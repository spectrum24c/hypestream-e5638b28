
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const CookiePolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-hype-dark text-foreground">
      <Navbar />
      <main className="pb-8 pt-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-center mb-8">
            <Button 
              onClick={() => navigate('/')} 
              variant="ghost" 
              className="mr-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Button>
            <h1 className="text-3xl font-bold">Cookie Policy</h1>
          </div>
          
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-bold mb-3">1. What Are Cookies</h2>
              <p className="text-muted-foreground">
                Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to the owners of the site. Cookies help provide a more personalized experience and can remember your preferences for future visits.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">2. How We Use Cookies</h2>
              <p className="text-muted-foreground mb-2">
                HypeStream uses cookies for the following purposes:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Authentication: To remember you when you're signed in to access our service</li>
                <li>Preferences: To remember your settings and preferences</li>
                <li>Analytics: To understand how visitors use our website</li>
                <li>Performance: To ensure the website performs efficiently</li>
                <li>Advertising: To deliver relevant advertisements</li>
                <li>Security: To help protect our service and users</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">3. Types of Cookies We Use</h2>
              <p className="text-muted-foreground mb-2">
                We use the following types of cookies:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li><strong>Essential Cookies:</strong> Necessary for the website to function properly</li>
                <li><strong>Functionality Cookies:</strong> Remember choices you make and provide enhanced features</li>
                <li><strong>Performance/Analytics Cookies:</strong> Collect information about how you use our website</li>
                <li><strong>Targeting/Advertising Cookies:</strong> Deliver advertisements relevant to your interests</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">4. Third-Party Cookies</h2>
              <p className="text-muted-foreground">
                In addition to our own cookies, we may also use various third-party cookies to report usage statistics, deliver advertisements, and so on. These cookies may track your browsing on other websites as well. We have no access to or control over these cookies.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">5. Managing Cookies</h2>
              <p className="text-muted-foreground">
                Most web browsers allow you to control cookies through their settings. You can typically find these settings in the "options" or "preferences" menu of your browser. You can delete existing cookies, allow or block all cookies, or block cookies from particular sites. Please note that if you choose to block cookies, some features of our service may not function properly.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">6. Changes to This Cookie Policy</h2>
              <p className="text-muted-foreground">
                We may update our Cookie Policy from time to time. We will notify you of any changes by posting the new Cookie Policy on this page. You are advised to review this Cookie Policy periodically for any changes.
              </p>
              <p className="text-muted-foreground mt-3">
                Last Updated: May 1, 2025
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">7. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about our Cookie Policy, please contact us at hypestream127@gmail.com.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CookiePolicy;
