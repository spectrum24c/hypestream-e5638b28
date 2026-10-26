
import React from 'react';
import PageSEO from '@/components/PageSEO';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const EMAIL = 'hypestream127@gmail.com';

type Section = { title: string; body: React.ReactNode };

const P = ({ children }: { children: React.ReactNode }) => (
  <p className="text-muted-foreground mb-2">{children}</p>
);
const UL = ({ items }: { items: React.ReactNode[] }) => (
  <ul className="list-disc pl-6 text-muted-foreground space-y-1 mb-2">
    {items.map((it, i) => <li key={i}>{it}</li>)}
  </ul>
);

const sections: Section[] = [
  {
    title: 'Personal information we collect',
    body: (
      <>
        <P><strong>Information you provide to us.</strong> Personal information you may provide to us through the Service includes:</P>
        <UL items={[
          <><strong>Contact data</strong>, such as your name and email address.</>,
          <><strong>Profile data</strong>, such as the username and password you set for your account, viewing profiles you create, profile pictures, interests, genre preferences, favorites, watchlists, and any other information you add to your account.</>,
          <><strong>Communications data</strong> based on our exchanges with you, including when you contact us through the Service, use our AI chat assistant (HYPE), or email us.</>,
          <><strong>Marketing data</strong>, such as your newsletter subscription and notification preferences and details about your engagement with them.</>,
          <><strong>User-generated content</strong>, such as ratings, reviews, comments and messages you submit through the Service.</>,
          <><strong>Other data</strong> not specifically listed here, which we will use as described in this Privacy Policy or as otherwise disclosed at the time of collection.</>,
        ]} />
        <P><strong>Third-party sources.</strong> We may combine personal information we receive from you with information we obtain from service providers that help us operate the Service, and from third-party services you use to log into or link to your account.</P>
        <P><strong>Automatic data collection.</strong> We, our service providers, and our business partners may automatically log information about you, your device, and your interaction with the Service, such as:</P>
        <UL items={[
          <><strong>Device data</strong>, such as operating system, browser type, device type, IP address, unique identifiers, language settings, and general location (city, state or country).</>,
          <><strong>Online activity data</strong>, such as pages viewed, titles watched, watch progress and history, search queries, time spent, and navigation paths.</>,
          <><strong>Push notification data</strong>, such as device push tokens and subscription details when you enable notifications.</>,
          <><strong>Communication interaction data</strong>, such as whether you open our emails.</>,
        ]} />
      </>
    ),
  },
  {
    title: 'Tracking & other technologies',
    body: (
      <>
        <P><strong>Cookies and other technologies.</strong> Some of our automatic data collection is facilitated by cookies, browser storage and similar technologies. For more information, see our <a href="/cookie-policy" className="text-primary underline">Cookie Policy</a>.</P>
        <P><strong>Chat and AI technologies.</strong> Our HYPE assistant is powered by third-party generative AI providers. Messages you type into the chat, together with related context (such as titles you ask about), are sent to these providers to generate responses. Please do not share sensitive personal information in the chat.</P>
      </>
    ),
  },
  {
    title: 'How we use your personal information',
    body: (
      <>
        <P>We may use your personal information for the following purposes or as otherwise described at the time of collection:</P>
        <UL items={[
          <><strong>Service delivery and operations</strong> — provide the Service, maintain your account and profiles, enable security features, send service announcements and support messages, and respond to your requests.</>,
          <><strong>Service personalization</strong> — understand your interests, power recommendations such as the "For You" row, remember your preferences and continue-watching progress.</>,
          <><strong>Notifications</strong> — send push notifications and emails about new releases and recommendations according to the preferences you set.</>,
          <><strong>Service improvement and analytics</strong> — analyze how the Service is used and develop new features.</>,
          <><strong>Marketing</strong> — send newsletters you subscribe to. You may opt out at any time.</>,
          <><strong>Compliance and protection</strong> — comply with law, enforce our Terms, and prevent fraud, abuse and security incidents.</>,
          <><strong>Aggregated or de-identified data</strong> — create data that no longer identifies you, which we may use for lawful business purposes. We will not attempt to re-identify such data.</>,
        ]} />
      </>
    ),
  },
  {
    title: 'Retention',
    body: <P>We generally retain personal information for as long as needed to fulfill the purposes for which we collected it, including satisfying legal, accounting, or reporting requirements, establishing or defending legal claims, or preventing fraud. When we no longer require it, we delete it, anonymize it, or isolate it from further processing.</P>,
  },
  {
    title: 'How we share your personal information',
    body: (
      <UL items={[
        <><strong>Service providers</strong> that help us operate the Service, such as hosting, database and authentication, email delivery, push notification delivery, AI chat, and analytics providers.</>,
        <><strong>Content and video providers.</strong> Movie and show information is supplied by third-party databases, and video playback is provided by third-party players embedded in the Service, which may receive your IP address and device data under their own privacy policies.</>,
        <><strong>Third parties designated by you</strong>, where you instruct or consent to sharing.</>,
        <><strong>Professional advisors</strong>, such as lawyers and auditors.</>,
        <><strong>Authorities and others</strong>, where we believe in good faith it is necessary for compliance and protection purposes.</>,
        <><strong>Business transferees</strong>, in connection with an actual or prospective merger, acquisition, financing, or sale of assets.</>,
        <><strong>Other users and the public</strong> — reviews, ratings or other content you choose to publish may be visible to others.</>,
      ]} />
    ),
  },
  {
    title: 'Your choices',
    body: (
      <UL items={[
        <><strong>Access or update your information</strong> by signing in and visiting your profile and settings.</>,
        <><strong>Notifications.</strong> Manage push and email notifications in Settings → Notifications, or in your device settings.</>,
        <><strong>Opt-out of marketing emails</strong> using the unsubscribe link in any email or by contacting us.</>,
        <><strong>Cookies</strong> — see our Cookie Policy.</>,
        <><strong>Do Not Track.</strong> We currently do not respond to "Do Not Track" browser signals.</>,
        <><strong>Delete your account.</strong> To close your account and delete your data, email {EMAIL}.</>,
      ]} />
    ),
  },
  {
    title: 'Other sites and services',
    body: <P>The Service may contain links to, or embed content from, websites and services operated by third parties. We do not control them and are not responsible for their actions. We encourage you to read their privacy policies.</P>,
  },
  {
    title: 'Security',
    body: <P>We employ technical, organizational and physical safeguards designed to protect the personal information we collect. However, security risk is inherent in all internet technologies and we cannot guarantee the security of your personal information.</P>,
  },
  {
    title: 'International data transfer',
    body: <P>Our service providers may operate in the United States and other countries. Your personal information may be transferred to locations where privacy laws may not be as protective as those in your country. Users in Europe should read the Notice to European users below.</P>,
  },
  {
    title: 'Children',
    body: <P>The Service is not intended for anyone under 18 years of age. If you are a parent or guardian and believe we have collected personal information from a child in a manner prohibited by law, please contact us and we will delete it as required.</P>,
  },
  {
    title: 'Changes to this Privacy Policy',
    body: <P>We may modify this Privacy Policy at any time. If we make material changes, we will update the date of this Privacy Policy and post it on the Service. Your use of the Service after the effective date indicates that you acknowledge the modified Privacy Policy.</P>,
  },
  {
    title: 'How to contact us',
    body: <P>If you have questions or would like to exercise any privacy right, email us at <strong>{EMAIL}</strong>.</P>,
  },
  {
    title: 'State privacy rights notice',
    body: (
      <>
        <P>This section applies to residents of U.S. states with privacy laws applicable to us (the "State Privacy Laws"), such as California (CCPA/CPRA), Colorado, Connecticut, Virginia, Texas and others. Depending on your state, you may have the right to:</P>
        <UL items={[
          <><strong>Information</strong> about the categories of personal information we collect, its sources, purposes, and the third parties we share it with.</>,
          <><strong>Access</strong> a copy of your personal information.</>,
          <><strong>Correction</strong> of inaccurate personal information.</>,
          <><strong>Deletion</strong> of your personal information.</>,
          <><strong>Appeal</strong> our denial of a request.</>,
          <><strong>Opt-out of sale or targeted advertising.</strong> We do not sell your personal information within the meaning of State Privacy Laws and do not process it for targeted advertising. We honor Global Privacy Control (GPC) signals as opt-out requests.</>,
          <><strong>Profiling.</strong> We do not use personal information for automated decision-making that produces legal or similarly significant effects.</>,
          <><strong>Sensitive personal information.</strong> We do not intentionally collect or process sensitive personal information.</>,
          <><strong>Nondiscrimination</strong> for exercising these rights.</>,
        ]} />
        <P><strong>Exercising your rights.</strong> Email {EMAIL}. We may need to verify your identity (for example, by confirming control of the email address on your account) before processing your request. You may use an authorized agent, whose authority we may need to verify.</P>
        <P><strong>California "Shine the Light".</strong> California residents may request information about disclosures of personal information to third parties for their direct marketing purposes by emailing {EMAIL} with the subject "Shine the Light Request". We do not share personal information for such purposes.</P>
        <P><strong>Nevada.</strong> We do not sell personal information. Nevada residents may submit an opt-out request for any potential future sales to {EMAIL}.</P>
      </>
    ),
  },
  {
    title: 'Notice to European users',
    body: (
      <>
        <P>This section applies only to individuals in the European Economic Area and the United Kingdom ("Europe"). References to "personal information" include "personal data" as defined in the EU GDPR and UK GDPR ("GDPR").</P>
        <P><strong>Controller.</strong> HypeStream is the controller of the personal information covered by this Privacy Policy. Contact us at {EMAIL}.</P>
        <P><strong>Legal bases for processing.</strong></P>
        <UL items={[
          <><strong>Contractual Necessity</strong> — service delivery and operations, account and profile management.</>,
          <><strong>Legitimate Interests</strong> — security, service improvement, personalization, and protecting our rights. You may object to this processing.</>,
          <><strong>Consent</strong> — push notifications, marketing newsletters where required, and optional cookies. You may withdraw consent at any time.</>,
          <><strong>Compliance with Law</strong> — where we must comply with a legal obligation.</>,
        ]} />
        <P><strong>No sensitive personal information.</strong> Please do not provide sensitive personal information (e.g., health, religion, political opinions, biometrics) through the Service.</P>
        <P><strong>Your rights.</strong> You may ask us to: access your personal information; correct it; delete it; transfer a machine-readable copy to you or a third party; restrict processing; object to processing based on Legitimate Interests or for direct marketing; and withdraw consent. Submit requests to {EMAIL}. We may ask for information to confirm your identity.</P>
        <P><strong>Complaints.</strong> You may lodge a complaint with the data protection regulator where you live. In the UK, this is the Information Commissioner's Office, Wycliffe House, Water Lane, Wilmslow, Cheshire SK9 5AF, tel. +44 303 123 1113, ico.org.uk.</P>
        <P><strong>Data processing outside Europe.</strong> Many of our service providers are based in the United States, so your personal information will be processed there and possibly in other countries outside Europe. Where we transfer personal information to countries without an adequacy decision, we rely on appropriate safeguards such as Standard Contractual Clauses, or in limited cases on a derogation such as your explicit consent. Contact us for more information about these safeguards.</P>
      </>
    ),
  },
];

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-hype-dark text-foreground">
      <PageSEO title="Privacy Policy" description="Learn how HypeStream collects, uses, and protects your personal data, including your rights under U.S. state privacy laws and GDPR." path="/privacy-policy" />
      <Navbar />
      <main className="pb-8 pt-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-center mb-8">
            <Button onClick={() => navigate('/')} variant="ghost" className="mr-2">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Button>
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            <section>
              <P><strong>Effective as of October 23, 2026.</strong></P>
              <P>HypeStream ("<strong>HypeStream</strong>," "<strong>we</strong>," "<strong>us</strong>" or "<strong>our</strong>") provides an online platform for discovering and streaming movies and TV shows. This Privacy Policy describes how we process personal information that we collect through our website, mobile application, and other services that link to this Privacy Policy (collectively, the "<strong>Service</strong>").</P>
              <P><strong>California Notice at Collection / State Privacy Rights:</strong> see the State privacy rights notice section below. <strong>European users:</strong> see the Notice to European users section below.</P>
            </section>

            {sections.map((s, i) => (
              <section key={s.title}>
                <h2 className="text-xl font-bold mb-3">{i + 1}. {s.title}</h2>
                {s.body}
              </section>
            ))}

            <section>
              <p className="text-xs text-muted-foreground border-t border-border pt-4">
                This Privacy Policy is based on a template prepared and made publicly available by General Legal, PC ("General Legal"). It is provided for general reference purposes only and does not constitute legal advice. Use of this template does not create an attorney-client relationship with General Legal.
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
