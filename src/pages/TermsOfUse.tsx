
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const TermsOfUse = () => {
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
            <h1 className="text-3xl font-bold">Terms of Use</h1>
          </div>
          
          <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            <section>
              <h2 className="text-xl font-bold mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using HypeStream, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use our service.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">2. Service Description</h2>
              <p className="text-muted-foreground">
                HypeStream provides an online platform that allows users to browse, discover, and stream movie and TV show content. We may offer both free and subscription-based services. Our content library may change from time to time without prior notice.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">3. User Accounts</h2>
              <p className="text-muted-foreground">
                To access certain features of HypeStream, you may be required to register for an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">4. Content Usage</h2>
              <p className="text-muted-foreground">
                All content available through HypeStream, including but not limited to videos, images, graphics, sound recordings, and scripts, is owned by HypeStream or its licensors and is protected by copyright, trademark, and other intellectual property laws. You may not download, reproduce, distribute, transmit, broadcast, display, sell, license, or otherwise exploit any content for any purpose without the prior written consent of HypeStream or the respective licensors.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">5. Prohibited Uses</h2>
              <p className="text-muted-foreground">
                You agree not to use HypeStream for any illegal purpose or in violation of any local, state, national, or international law. You agree not to attempt to gain unauthorized access to any portion of HypeStream or any other systems or networks connected to HypeStream or to any server through hacking, password mining, or any other means.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">6. Termination</h2>
              <p className="text-muted-foreground">
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the service will immediately cease.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">7. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                In no event shall HypeStream, its officers, directors, employees, or agents, be liable to you for any direct, indirect, incidental, special, punitive, or consequential damages whatsoever resulting from any (i) errors, mistakes, or inaccuracies of content; (ii) personal injury or property damage; (iii) unauthorized access to or use of our servers or any personal information stored therein.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">8. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfUse;
