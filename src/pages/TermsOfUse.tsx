
import React from 'react';
import PageSEO from '@/components/PageSEO';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const TermsOfUse = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-hype-dark text-foreground">
      <PageSEO title="Terms of Use" description="Read the HypeStream terms of use and service agreement." path="/terms-of-use" />
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
              <p className="text-muted-foreground mb-3">
                <strong>Version 1.0 — Last revised:</strong> October 23, 2026
              </p>
              <p className="text-muted-foreground mb-3">
                The website located at <a href="https://hypestream.lovable.app" className="text-primary underline">hypestream.lovable.app</a> (the "<strong>Site</strong>") is owned and operated by HypeStream ("<strong>Company</strong>," "<strong>us</strong>," "<strong>our</strong>," or "<strong>we</strong>"). Certain features of the Site may be subject to additional guidelines or rules posted on the Site, which are incorporated by reference into these Terms.
              </p>
              <p className="text-muted-foreground mb-3">
                These Terms of Use ("<strong>Terms</strong>") govern your use of the Site. By accessing or using the Site, or by clicking "I agree" (or a similar button or checkbox) when that option is presented to you, you agree to these Terms on behalf of yourself or the entity you represent, and you confirm that you have the authority to do so. You must be at least 18 years old to use the Site. If you do not agree to these Terms, please do not use the Site.
              </p>
              <p className="text-muted-foreground">
                <strong>IMPORTANT — PLEASE READ SECTION 11 CAREFULLY.</strong> It contains an agreement to resolve disputes through binding individual arbitration instead of in court, and includes a waiver of class action rights and jury trial rights. You have 30 days to opt out of the arbitration agreement, as further described in Section 11.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">1. Accounts</h2>
              <p className="text-muted-foreground mb-2"><strong>1.1 Creating an Account.</strong> Some features of the Site may require you to register for an account. When you register, you agree to provide accurate and complete information and to keep that information current. You can delete your account at any time by following the instructions on the Site or by contacting us at hypestream127@gmail.com. We may suspend or terminate your account as described in Section 8.</p>
              <p className="text-muted-foreground"><strong>1.2 Account Security.</strong> You are responsible for keeping your login credentials confidential and for all activity that occurs under your account. If you believe your account has been accessed without your authorization, please notify us immediately. We are not liable for any losses resulting from your failure to keep your credentials secure.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">2. Access to the Site</h2>
              <p className="text-muted-foreground mb-2"><strong>2.1 License.</strong> Subject to these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Site for your own personal, non-commercial purposes.</p>
              <p className="text-muted-foreground mb-2"><strong>2.2 Restrictions.</strong> You may not: (i) license, sell, rent, lease, transfer, assign, distribute, or commercially exploit the Site or any content on it; (ii) modify, create derivative works from, disassemble, reverse-compile, or reverse-engineer any part of the Site; (iii) access the Site in order to build a similar or competing product or service; or (iv) copy, reproduce, distribute, republish, download, display, post, or transmit any part of the Site except as expressly permitted by these Terms. All copyright and proprietary notices on the Site must be kept intact on any copies you are permitted to make.</p>
              <p className="text-muted-foreground mb-2"><strong>2.3 Changes to the Site.</strong> We may modify, suspend, or discontinue the Site (or any part of it) at any time, with or without notice. We are not liable to you or any third party for any such modification, suspension, or discontinuation.</p>
              <p className="text-muted-foreground mb-2"><strong>2.4 No Support Obligation.</strong> We have no obligation to provide you with support or maintenance for the Site.</p>
              <p className="text-muted-foreground mb-2"><strong>2.5 Ownership.</strong> All intellectual property rights in the Site and its content — including copyrights, patents, trademarks, and trade secrets — belong to Company or its suppliers. These Terms do not transfer any ownership rights to you, except for the limited access rights in Section 2.1. All rights not expressly granted are reserved.</p>
              <p className="text-muted-foreground"><strong>2.6 Feedback.</strong> If you share feedback or suggestions about the Site with us, you grant us a perpetual, irrevocable, worldwide, non-exclusive, fully-paid, royalty-free license to use that feedback freely, in any manner and for any purpose, without attribution. Please do not submit any feedback that you consider proprietary or confidential.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">3. Privacy</h2>
              <p className="text-muted-foreground mb-2">Your use of the Site is also governed by our <a href="/privacy-policy" className="text-primary underline">Privacy Policy</a>, which is incorporated into these Terms by reference. The Privacy Policy describes the types of personal data and other information we collect from you or your device, how we use that information, and the circumstances under which we may share it with third parties.</p>
              <p className="text-muted-foreground mb-2"><strong>3.1 Processing of Personal Data.</strong> By using the Site, you acknowledge that you have read and understand our Privacy Policy and that Company will process your personal data and other information in accordance with the Privacy Policy. If there is a conflict between these Terms and the Privacy Policy with respect to the collection, use, or processing of your personal data, the Privacy Policy will control.</p>
              <p className="text-muted-foreground"><strong>3.2 Cookies and Tracking Technologies.</strong> The Site may use cookies, web beacons, pixels, and similar tracking technologies ("<strong>Tracking Technologies</strong>") to collect information about your use of the Site. For details on what Tracking Technologies the Site uses, what information they collect, and how you can manage your preferences, please refer to our <a href="/cookie-policy" className="text-primary underline">Cookie Policy</a>.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">4. Indemnification</h2>
              <p className="text-muted-foreground">You agree to defend, indemnify, and hold harmless Company and its officers, employees, and agents from any claims and reasonable costs or attorneys' fees arising out of (i) your use of the Site, (ii) your violation of these Terms, or (iii) your violation of any applicable law or regulation. We may assume control of the defense of any such claim at your expense, and you agree to cooperate with our defense. You agree not to settle any such claim without our prior written consent. We will make reasonable efforts to notify you promptly of any claim we become aware of.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">5. Third-Party Services &amp; Other Users</h2>
              <p className="text-muted-foreground mb-2"><strong>5.1 Third-Party Services.</strong> The Site may include links to or integrations with third-party websites or services, or may display third-party advertisements (collectively, "<strong>Third-Party Services</strong>"). This includes, without limitation, third-party content sources, streaming and video providers, and download services that the Site uses to deliver video content to you. We do not control, endorse, or take responsibility for any Third-Party Services. You use all Third-Party Services at your own risk, and you acknowledge and agree that the applicable third party's own terms and privacy practices will apply to such use.</p>
              <p className="text-muted-foreground mb-2"><strong>5.2 Other Users.</strong> Your interactions with other users of the Site are solely between you and those users. We are not responsible for any loss or harm resulting from those interactions, and we reserve the right, but have no obligation, to get involved in disputes between users.</p>
              <p className="text-muted-foreground"><strong>5.3 Release.</strong> To the fullest extent permitted by law, you release Company and its officers, employees, agents, successors, and assigns from all claims, demands, and damages of any kind arising out of or related to the Site, other users, or Third-Party Services. If you are a California resident, you waive California Civil Code Section 1542, which provides: "A general release does not extend to claims which the creditor or releasing party does not know or suspect to exist in his or her favor at the time of executing the release, which if known by him or her must have materially affected his or her settlement with the debtor or released party."</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">6. Disclaimers</h2>
              <p className="text-muted-foreground">THE SITE IS PROVIDED "AS IS" AND "AS AVAILABLE." TO THE FULLEST EXTENT PERMITTED BY LAW, COMPANY AND ITS SUPPLIERS DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SITE WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR FREE OF VIRUSES OR HARMFUL CODE. WHERE APPLICABLE LAW REQUIRES WARRANTIES, THEY ARE LIMITED TO 90 DAYS FROM YOUR FIRST USE.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">7. Limitation of Liability</h2>
              <p className="text-muted-foreground">TO THE MAXIMUM EXTENT PERMITTED BY LAW: (A) COMPANY AND ITS SUPPLIERS WILL NOT BE LIABLE FOR ANY LOST PROFITS, LOST DATA, COSTS OF SUBSTITUTE PRODUCTS, OR ANY INDIRECT, CONSEQUENTIAL, INCIDENTAL, SPECIAL, EXEMPLARY, OR PUNITIVE DAMAGES ARISING FROM OR RELATED TO THESE TERMS OR YOUR USE OF (OR INABILITY TO USE) THE SITE; AND (B) OUR TOTAL LIABILITY TO YOU FOR ANY CLAIM ARISING UNDER THESE TERMS IS CAPPED AT THE GREATER OF (i) $50 USD AND (ii) THE AMOUNT PAID TO COMPANY BY YOU UNDER THESE TERMS IN THE SIX MONTHS PRIOR TO THE INCIDENT GIVING RISE TO THE CLAIM. THE EXISTENCE OF MULTIPLE CLAIMS DOES NOT INCREASE THIS CAP.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">8. Term and Termination</h2>
              <p className="text-muted-foreground">These Terms remain in effect while you use the Site. We may suspend or terminate your access (including suspending access to or deleting your account) at any time and for any reason, including if we believe you have violated these Terms. We are not liable to you for any such termination. Upon termination, Sections 2.2 through 2.6 and Sections 3 through 11 will survive.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">9. State-Specific Legal Notices</h2>
              <p className="text-muted-foreground mb-2">The provisions in this Section 9 apply only to users to the extent such users are subject to the laws of the applicable states identified below. If a provision in this section conflicts with another provision of these Terms, the state-specific provision controls for users subject to that state's laws.</p>
              <p className="text-muted-foreground mb-2"><strong>9.1 California.</strong> If you are a California resident, you may report complaints to the Complaint Assistance Unit of the Division of Consumer Services of the California Department of Consumer Affairs, at 1625 N. Market Blvd. Suite N112, Sacramento, CA 95834, or by phone at (800) 952-5210. Under California Civil Code Section 1789.3, California users of the Site are entitled to the following specific consumer rights notice: The provider of the Site is HypeStream. To file a complaint regarding the Site, or to receive further information regarding use of the Site, contact us at hypestream127@gmail.com. You may also contact the Complaint Assistance Unit at the address and phone number above. If you are a California resident, you may have additional rights under the California Consumer Privacy Act (as amended by the California Privacy Rights Act), including the right to know what personal information we collect, the right to delete your personal information, the right to correct inaccurate personal information, and the right to opt out of the sale or sharing of your personal information. For details on how to exercise these rights, please see our <a href="/privacy-policy" className="text-primary underline">Privacy Policy</a>.</p>
              <p className="text-muted-foreground mb-2"><strong>9.2 Colorado.</strong> If you are a Colorado resident, you may have additional rights under the Colorado Privacy Act (CPA), including the right to opt out of the processing of your personal data for purposes of targeted advertising, the sale of personal data, and certain profiling. For details, please see our Privacy Policy.</p>
              <p className="text-muted-foreground mb-2"><strong>9.3 Connecticut.</strong> If you are a Connecticut resident, you may have additional rights under the Connecticut Data Privacy Act (CTDPA), including rights of access, correction, deletion, and data portability, as well as the right to opt out of the sale of personal data, targeted advertising, and profiling. For details, please see our Privacy Policy.</p>
              <p className="text-muted-foreground mb-2"><strong>9.4 Virginia.</strong> If you are a Virginia resident, you may have additional rights under the Virginia Consumer Data Protection Act (VCDPA), including the right to access, correct, delete, and obtain a copy of your personal data, and the right to opt out of the processing of your personal data for targeted advertising, sale, or profiling. For details, please see our Privacy Policy.</p>
              <p className="text-muted-foreground"><strong>9.5 Nevada.</strong> If you are a Nevada resident, you have the right under Nevada Revised Statutes Chapter 603A to direct us not to sell certain information we have collected or will collect about you. To exercise this right, please contact us at hypestream127@gmail.com.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">10. General</h2>
              <p className="text-muted-foreground mb-2"><strong>10.1 Changes to Terms.</strong> We may update these Terms from time to time. If we make material changes, we may notify you by email (at the address on file) or by a prominent notice on the Site. Your continued use of the Site after notice of changes means you accept the updated Terms.</p>
              <p className="text-muted-foreground mb-2"><strong>10.2 Governing Law.</strong> These Terms and any dispute arising out of or related to these Terms or the Site will be governed by and construed in accordance with the laws of the State of California, without regard to its conflict-of-law principles. For any claim or dispute not subject to the arbitration provisions in Section 11, you and Company irrevocably consent to the exclusive jurisdiction and venue of the state and federal courts located in Los Angeles County, California. Notwithstanding the foregoing: (a) either party may bring an action in any court of competent jurisdiction for injunctive or other equitable relief to protect its intellectual property rights (including patents, copyrights, trademarks, and trade secrets); and (b) either party may bring an individual action in small claims court for claims within that court's jurisdictional limits.</p>
              <p className="text-muted-foreground mb-2"><strong>10.3 Export.</strong> You agree not to export, re-export, or transfer any technical data or products acquired from the Site in violation of U.S. export control laws or applicable regulations in other countries.</p>
              <p className="text-muted-foreground mb-2"><strong>10.4 Electronic Communications.</strong> By using the Site, you consent to receiving communications from us electronically (by email or notices posted on the Site). These electronic communications satisfy any legal requirement for written notice.</p>
              <p className="text-muted-foreground mb-2"><strong>10.5 Accessibility.</strong> Company is committed to making the Site accessible to all users, including individuals with disabilities. We endeavor to conform to the Web Content Accessibility Guidelines (WCAG) 2.1, Level AA, as published by the World Wide Web Consortium (W3C). If you experience any difficulty accessing or navigating the Site, or if you have suggestions for improving accessibility, please contact us at hypestream127@gmail.com. We will make reasonable efforts to address accessibility concerns promptly.</p>
              <p className="text-muted-foreground mb-2"><strong>10.6 Entire Agreement.</strong> These Terms (together with the Privacy Policy and any other policies or guidelines referenced herein) are the entire agreement between you and Company regarding your use of the Site. If any provision of these Terms is found to be invalid or unenforceable, it will be modified to the minimum extent necessary to be valid, and the remaining provisions will continue in effect. Our failure to enforce any provision is not a waiver of that provision. The word "including" means "including without limitation." You may not assign these Terms without our prior written consent; we may assign them freely. These Terms bind any permitted assignees.</p>
              <p className="text-muted-foreground mb-2"><strong>10.7 Copyright/Trademark.</strong> Copyright © 2026 HypeStream. All rights reserved. All trademarks, logos, and service marks displayed on the Site are owned by Company or third parties. You may not use any of them without prior written consent from the owner.</p>
              <p className="text-muted-foreground"><strong>10.8 Contact Information:</strong> hypestream127@gmail.com</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">11. Dispute Resolution</h2>
              <p className="text-muted-foreground mb-2"><strong>Please read this section carefully. It affects your legal rights, including your right to sue in court and your right to a jury trial.</strong></p>
              <p className="text-muted-foreground mb-2"><strong>11.1 Applicability.</strong> Except as described below, you and Company agree to resolve all disputes arising out of or relating to the Site, its services, or these Terms through binding individual arbitration — not in court. Exceptions include: (i) claims that qualify for small claims court, brought on an individual basis; and (ii) requests for equitable relief related to intellectual property (such as trademarks, trade secrets, or copyrights). This arbitration agreement applies to all claims, including those that arose before you agreed to these Terms.</p>
              <p className="text-muted-foreground mb-2"><strong>11.2 Try to Resolve First.</strong> Before starting arbitration, the parties agree to try to resolve the dispute informally. The party raising the dispute must send written notice (an "Informal Notice") to the other party. Within 45 days of receiving that Informal Notice, the parties will meet by phone or video in good faith to try to work things out. Company's notice address: hypestream127@gmail.com. If the informal dispute resolution process doesn't resolve the dispute within 60 days, either party may start arbitration.</p>
              <p className="text-muted-foreground mb-2"><strong>11.3 Arbitration Rules.</strong> Arbitrations will be administered by JAMS (www.jamsadr.com). Claims under $250,000 (excluding fees and interest) will use JAMS' Streamlined Arbitration Rules; larger claims will use JAMS' Comprehensive Arbitration Rules. Unless the parties agree otherwise, arbitration will be conducted in the county where you live. All arbitration materials and documents are confidential.</p>
              <p className="text-muted-foreground mb-2"><strong>11.4 Arbitration Request.</strong> The arbitration request must include: (i) your contact information and account username (if applicable); (ii) a description of the claims and supporting facts; (iii) the relief you're seeking and a good-faith damages estimate; (iv) confirmation that you completed the informal resolution process; and (v) proof of any required filing fee payment.</p>
              <p className="text-muted-foreground mb-2"><strong>11.5 Authority of Arbitrator.</strong> The arbitrator has authority to resolve all arbitrable disputes, including questions about the scope and enforceability of this arbitration agreement — except that courts (not arbitrators) will decide: (i) challenges to the class action waiver below; (ii) disputes about arbitration fees; (iii) whether a condition precedent to arbitration has been satisfied; and (iv) which version of this agreement applies. The arbitrator may award the same relief as a court, but on an individual basis only. The arbitrator's award is final and binding, and judgment may be entered in any court with jurisdiction.</p>
              <p className="text-muted-foreground mb-2"><strong>11.6 Waiver of Jury Trial.</strong> BY AGREEING TO ARBITRATION, YOU AND COMPANY WAIVE THE RIGHT TO A TRIAL BY JUDGE OR JURY FOR ALL COVERED CLAIMS.</p>
              <p className="text-muted-foreground mb-2"><strong>11.7 Waiver of Class Actions.</strong> ALL DISPUTES MUST BE BROUGHT ON AN INDIVIDUAL BASIS. NEITHER YOU NOR COMPANY MAY BRING CLAIMS AS A PLAINTIFF OR CLASS MEMBER IN ANY CLASS, REPRESENTATIVE, OR COLLECTIVE PROCEEDING. The arbitrator may only award relief on an individual basis. If a court finds this class action waiver unenforceable as to a specific claim, that claim may be litigated in state or federal court in California; all other claims remain subject to arbitration.</p>
              <p className="text-muted-foreground mb-2"><strong>11.8 Attorneys' Fees.</strong> Each party bears its own attorneys' fees unless the arbitrator finds a claim was frivolous or brought for an improper purpose.</p>
              <p className="text-muted-foreground mb-2"><strong>11.9 Batch Arbitration.</strong> If 100 or more substantially similar arbitration demands are filed against Company within a 30-day period by the same law firm or coordinated group, JAMS will batch them into groups of 100 and appoint one arbitrator per batch, with one set of fees per batch.</p>
              <p className="text-muted-foreground mb-2"><strong>11.10 Opt-Out.</strong> You may opt out of this arbitration agreement within 30 days of first accepting these Terms by sending written notice to hypestream127@gmail.com. Your notice must include your name, address, and a clear statement that you wish to opt out. Opting out does not affect any other part of these Terms.</p>
              <p className="text-muted-foreground"><strong>11.11 Severability.</strong> If any part of this arbitration agreement is found invalid, it will be modified to the minimum extent necessary to make it enforceable; the rest of the agreement remains in effect.</p>
            </section>

            <section>
              <p className="text-xs text-muted-foreground border-t border-border pt-4">
                These Terms are based on a template prepared and made publicly available by General Legal, PC ("General Legal"). It is provided for general reference purposes only and does not constitute, and should not be construed as, legal advice, or an endorsement or review of any particular transaction in which it is used. Use of this template does not create an attorney-client relationship with General Legal.
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
