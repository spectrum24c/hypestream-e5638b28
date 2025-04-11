
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail } from 'lucide-react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQs = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
  };

  const faqItems = [
    {
      question: "What is HypeStream?",
      answer: "HypeStream is a streaming platform that offers movies, TV shows, and anime content. Our service provides users with high-quality streaming options for their favorite entertainment content."
    },
    {
      question: "How do I create an account and log in to HypeStream?",
      answer: "To create an account: 1) Click on 'Sign In' in the top-right corner, 2) Select 'Create an account', 3) Enter your email address, 4) Create a strong password, 5) Verify your email by clicking the link sent to your inbox. To log in: Simply enter your email and password on the sign-in page. If you forget your password, use the 'Forgot Password' link to reset it."
    },
    {
      question: "Is HypeStream free to use?",
      answer: "HypeStream offers both free and premium content. You can browse and watch many titles without a subscription, but creating a free account gives you access to personalized features like favorites, recommendations, and the ability to track your watch history."
    },
    {
      question: "Do I need to create an account to use HypeStream?",
      answer: "While you can browse our catalog without an account, creating a free account allows you to save favorites, receive personalized recommendations, and access premium features like HD streaming."
    },
    {
      question: "Is HypeStream available on mobile devices?",
      answer: "Yes! HypeStream is fully responsive and works on all devices including smartphones, tablets, laptops, and desktop computers. You can stream your favorite content anywhere with an internet connection."
    },
    {
      question: "How do I add a movie or TV show to my favorites?",
      answer: "To add content to your favorites, click on a movie or TV show to open its details, then click the 'Add to Favorites' button. You must be logged in to use this feature. You can access your favorites from your profile page."
    },
    {
      question: "Are there subtitles available for non-English content?",
      answer: "Yes, many of our international titles include subtitle options. When available, subtitle controls will appear in the player controls during playback."
    },
    {
      question: "How often is new content added to HypeStream?",
      answer: "We regularly update our library with new releases. You'll receive notifications about new content in the notification bell at the top of the page. Make sure to check back frequently for the latest additions!"
    },
    {
      question: "What should I do if a stream isn't working?",
      answer: "If you're experiencing playback issues, try: 1) Refreshing the page, 2) Checking your internet connection, 3) Trying a different browser, or 4) Clearing your browser cache. If problems persist, the stream may be temporarily unavailable."
    },
    {
      question: "How do I manage notifications?",
      answer: "You can view all your notifications by clicking the bell icon in the top navigation bar. From there, you can mark notifications as read or click on them to go directly to the new content."
    },
    {
      question: "Can I watch HypeStream on my smart TV?",
      answer: "Yes, HypeStream is compatible with most smart TVs that have web browsing capabilities. You can also use devices like Chromecast, Apple TV, or other HDMI streaming devices to cast HypeStream from your mobile device or computer to your TV."
    },
    {
      question: "What internet speed do I need for streaming?",
      answer: "For SD quality streaming, we recommend at least 3 Mbps. For HD quality, 5+ Mbps is recommended. For the best 4K streaming experience, we recommend 25+ Mbps internet connection speed."
    },
    {
      question: "How do I update my profile information?",
      answer: "To update your profile, log into your account, click on your profile icon in the top-right corner, select 'Profile', and then edit your information as needed. Don't forget to save your changes."
    },
    {
      question: "Can I download content to watch offline?",
      answer: "Currently, HypeStream only supports online streaming. We may add download functionality for offline viewing in future updates."
    },
    {
      question: "How can I delete my account?",
      answer: "To delete your account, go to your profile page and click the 'Delete Account' button. Please note that this action is permanent and will remove all your data including favorites and watch history."
    }
  ];

  return (
    <div className="min-h-screen bg-hype-dark text-foreground flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 pt-20 pb-12">
        <div className="mb-8 flex items-center">
          <Button 
            onClick={handleBackToHome} 
            variant="ghost" 
            className="mr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
          <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-lg">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-lg font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-4">
            Still have questions? We're here to help!
          </p>
          <Button 
            className="bg-hype-purple hover:bg-hype-purple/90"
            onClick={() => window.open('mailto:awokojorichmond@gmail.com', '_blank')}
          >
            Contact Support
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQs;
