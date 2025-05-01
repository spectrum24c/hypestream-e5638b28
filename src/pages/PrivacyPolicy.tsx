
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
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
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
          </div>
          
          <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            <section>
              <h2 className="text-xl font-bold mb-3">1. Introduction</h2>
              <p className="text-muted-foreground">
                At HypeStream, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information when you use our service. By using HypeStream, you consent to the data practices described in this policy.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">2. Information We Collect</h2>
              <p className="text-muted-foreground mb-2">
                We may collect the following types of information:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Personal identifiable information such as name and email address when you register</li>
                <li>Payment information when you subscribe to our premium services</li>
                <li>Device information including IP address, browser type, and operating system</li>
                <li>Usage data such as viewing history, watch time, and search queries</li>
                <li>Communications you send to us such as customer support requests</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">3. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-2">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send notifications, updates, and support messages</li>
                <li>Personalize your experience with content recommendations</li>
                <li>Analyze usage patterns to improve our service</li>
                <li>Detect and prevent fraudulent or unauthorized activities</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">4. Cookies and Tracking Technologies</h2>
              <p className="text-muted-foreground">
                HypeStream uses cookies and similar tracking technologies to track activity on our service and hold certain information. Cookies are files with a small amount of data that may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">5. Data Sharing and Disclosure</h2>
              <p className="text-muted-foreground">
                We do not sell your personal information. We may share your information with trusted third parties who assist us in operating our service, conducting our business, or servicing you. We may also release your information when we believe release is appropriate to comply with the law, enforce our site policies, or protect our or others' rights, property, or safety.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">6. Data Security</h2>
              <p className="text-muted-foreground">
                We implement a variety of security measures to maintain the safety of your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">7. Your Rights</h2>
              <p className="text-muted-foreground">
                Depending on your location, you may have the right to access, correct, delete, or restrict the use of your personal information. You may also have the right to data portability and to withdraw your consent at any time. To exercise these rights, please contact us through our support channels.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">8. Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
              </p>
              <p className="text-muted-foreground mt-3">
                Last Updated: May 1, 2025
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">9. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about this Privacy Policy, please contact us at hypestream127@gmail.com.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
