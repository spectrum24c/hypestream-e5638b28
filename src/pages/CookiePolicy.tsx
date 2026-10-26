
import React from 'react';
import PageSEO from '@/components/PageSEO';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const cookieTypes = [
  { type: 'Essential', desc: 'Necessary for the technical operation of the Service, such as keeping you signed in, remembering your active profile, and security.', who: 'HypeStream and our authentication/hosting providers', control: 'Cannot be switched off without breaking the Service; you can clear them in your browser.' },
  { type: 'Functionality / performance', desc: 'Remember your preferences (theme, chatbot settings, notification choices, watch progress) and improve performance.', who: 'HypeStream', control: 'Browser settings.' },
  { type: 'Analytics', desc: 'Help us understand how the Service is performing and being used.', who: 'HypeStream and our analytics providers', control: 'Browser settings or the provider\u2019s opt-out tools.' },
  { type: 'Third-party video players', desc: 'Embedded third-party video players and trailer providers (e.g., YouTube) may set their own cookies when you play content.', who: 'The respective video/trailer provider', control: 'Browser settings and the provider\u2019s own privacy settings.' },
];

const CookiePolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-hype-dark text-foreground">
      <PageSEO title="Cookie Policy" description="Understand how HypeStream uses cookies and similar technologies, and how you can control them." path="/cookie-policy" />
      <Navbar />
      <main className="pb-8 pt-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-center mb-8">
            <Button onClick={() => navigate('/')} variant="ghost" className="mr-2">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Button>
            <h1 className="text-3xl font-bold">Cookie Policy</h1>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 space-y-6 text-muted-foreground">
            <p>This Cookie Notice explains how HypeStream ("<strong>HypeStream</strong>", "<strong>we</strong>", "<strong>us</strong>" or "<strong>our</strong>") uses cookies and similar technologies in connection with the hypestream.lovable.app website, any other website we own or control that links to this notice (the "<strong>Sites</strong>"), and our mobile app (the "<strong>App</strong>").</p>

            <section>
              <h2 className="text-xl font-bold mb-3 text-foreground">1. What are cookies?</h2>
              <p className="mb-2">Cookies are small data files placed on your computer or mobile device when you visit a website. They help us understand how a site is used, let you navigate efficiently, remember your preferences, and generally improve your experience.</p>
              <p className="mb-2">We may use both session cookies (which expire when you close your browser) and persistent cookies (which stay on your device until you delete them).</p>
              <p>We use first-party cookies, served directly by us, and third-party cookies, served by service providers or partners, which can be used to recognize your device when it visits other websites.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3 text-foreground">2. What types of cookies do we use?</h2>
              <div className="space-y-3">
                {cookieTypes.map((c) => (
                  <div key={c.type} className="border border-border rounded-lg p-3">
                    <p className="font-semibold text-foreground mb-1">{c.type}</p>
                    <p className="mb-1">{c.desc}</p>
                    <p className="text-sm"><strong>Served by:</strong> {c.who}</p>
                    <p className="text-sm"><strong>How to control:</strong> {c.control}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3">We do not currently use advertising cookies for interest-based advertising.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3 text-foreground">3. Other technologies</h2>
              <p className="mb-2"><strong>Browser web storage.</strong> We use browser storage (such as localStorage) for similar purposes as cookies — for example, to keep you signed in and remember your settings. Your browser lets you clear this storage.</p>
              <p className="mb-2"><strong>Web beacons.</strong> We may use pixel tags in our emails to understand whether they were opened, so we can manage our communications more effectively.</p>
              <p className="mb-2"><strong>Push notification tokens.</strong> If you enable notifications, your browser or device generates a token that lets us deliver notifications to you. You can revoke this in your browser or device settings, or in Settings → Notifications.</p>
              <p><strong>Mobile SDKs.</strong> Our App may use third-party software development kits, for example to deliver push notifications.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3 text-foreground">4. Your choices</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Blocking cookies in your browser.</strong> Most browsers let you remove or reject cookies. If you disable cookies, the Sites may not work properly — for example, you may need to sign in every time.</li>
                <li><strong>Blocking images/clear gifs.</strong> Most browsers and devices let you prevent images from loading.</li>
                <li><strong>Third-party opt-outs.</strong> Use the privacy settings offered by the third parties listed above.</li>
                <li><strong>Mobile settings.</strong> Your device settings may let you limit use of your advertising ID and disable notifications.</li>
              </ul>
              <p className="mt-2">You will need to apply these settings on each device and browser you use. For more about how we collect, use and share information, see our <a href="/privacy-policy" className="text-primary underline">Privacy Policy</a>.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3 text-foreground">5. Changes</h2>
              <p>Information about the cookies we use may be updated from time to time, so please check back regularly.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3 text-foreground">6. Questions</h2>
              <p>If you have any questions about this Cookie Notice, please email us at hypestream127@gmail.com.</p>
              <p className="mt-3">Last modified October 23, 2026.</p>
            </section>

            <p className="text-xs border-t border-border pt-4">
              This Cookie Notice is based on a template prepared and made publicly available by General Legal, PC ("General Legal"). It is provided for general reference purposes only and does not constitute legal advice. Use of this template does not create an attorney-client relationship with General Legal.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CookiePolicy;
