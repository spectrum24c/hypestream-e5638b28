
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Mail, Phone, MessageSquare, HelpCircle, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const Support = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleBackToHome = () => {
    navigate('/');
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Send form data to designated email
      // In a real application, you would use an API endpoint to send emails
      // This is a mock implementation that simulates the submission
      
      // Create a mailto link as a fallback for now
      const mailtoLink = `mailto:awokojorichmond@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`;
      window.open(mailtoLink, '_blank');
      
      toast({
        title: "Support request submitted",
        description: "We'll get back to you as soon as possible.",
      });
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (error) {
      toast({
        title: "Error submitting form",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const supportCategories = [
    {
      title: "Getting Started",
      items: [
        { question: "How do I create an account?", answer: "To create an account, click on the 'Sign Up' button in the top right corner of the homepage. Fill in your details, verify your email address, and you're all set!" },
        { question: "Is there a free trial available?", answer: "Yes, we offer a 7-day free trial for all new users. You can access all premium features during this period without any charges." },
        { question: "What devices can I watch on?", answer: "Our service is available on web browsers, mobile devices (iOS and Android), smart TVs, gaming consoles, and streaming devices like Roku and Apple TV." }
      ]
    },
    {
      title: "Account & Billing",
      items: [
        { question: "How do I change my payment method?", answer: "You can update your payment method in Settings > Billing Information. We accept bank transfers, credit cards, and mobile payments." },
        { question: "Why was my account locked?", answer: "Accounts may be temporarily locked for security reasons, such as multiple failed login attempts or suspicious activity. Contact our support team for assistance." },
        { question: "How do I upgrade my subscription plan?", answer: "Go to Settings > Subscription and select 'Upgrade Plan' to see available options and complete your upgrade." }
      ]
    },
    {
      title: "Technical Issues",
      items: [
        { question: "Why is my video buffering?", answer: "Buffering may occur due to internet connection issues, device limitations, or server load. Try lowering video quality, closing other applications, or switching to a wired connection." },
        { question: "How do I fix playback errors?", answer: "Try refreshing the page, clearing your browser cache, or switching browsers. If the issue persists, check our system status page or contact support." },
        { question: "Can I download content to watch offline?", answer: "Premium subscribers can download select titles for offline viewing on mobile devices using our app. Look for the download icon next to eligible content." }
      ]
    },
    {
      title: "Content & Features",
      items: [
        { question: "When will new episodes be available?", answer: "New episodes of ongoing series are typically added within 24 hours of their original broadcast. Release schedules are available on each show's detail page." },
        { question: "How do I request new content?", answer: "You can suggest content through the 'Request Content' form in your account settings. While we can't guarantee all requests, we regularly review user suggestions." },
        { question: "How does the recommendation system work?", answer: "Our recommendation system analyzes your viewing history, ratings, and preferences to suggest content you might enjoy. The more you watch and rate, the better our suggestions become." }
      ]
    }
  ];

  const filteredCategories = searchQuery
    ? supportCategories.map(category => ({
        ...category,
        items: category.items.filter(item => 
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.items.length > 0)
    : supportCategories;

  return (
    <div className="min-h-screen bg-hype-dark text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 pt-20 pb-12 md:px-6">
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center">
            <Button 
              onClick={handleBackToHome} 
              variant="ghost" 
              className="mr-2 md:mr-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold">Help & Support Center</h1>
          </div>
          
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search help articles..." 
              className="pl-10 bg-background/10 border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="faq" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="faq">Help Center</TabsTrigger>
            <TabsTrigger value="support">Contact Support</TabsTrigger>
          </TabsList>
          
          {/* FAQ Tab */}
          <TabsContent value="faq">
            <Card className="bg-card/50 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle className="text-xl">Knowledge Base</CardTitle>
                <CardDescription>
                  Browse through our most common questions and answers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((category, index) => (
                      <div key={index} className="space-y-3">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <HelpCircle className="h-5 w-5 text-hype-purple" />
                          {category.title}
                        </h3>
                        <Accordion type="single" collapsible className="w-full">
                          {category.items.map((item, itemIndex) => (
                            <AccordionItem key={itemIndex} value={`faq-${index}-${itemIndex}`} className="border-border">
                              <AccordionTrigger className="text-left hover:text-hype-purple">
                                {item.question}
                              </AccordionTrigger>
                              <AccordionContent className="text-muted-foreground">
                                <p>{item.answer}</p>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No results found</h3>
                      <p className="text-muted-foreground mb-4">We couldn't find any help articles matching "{searchQuery}"</p>
                      <Button variant="outline" onClick={() => setSearchQuery('')}>
                        Clear Search
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-center border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  Can't find what you're looking for?{" "}
                  <Button variant="link" className="h-auto p-0" onClick={() => {
                    const element = document.querySelector('[data-state="inactive"][value="support"]');
                    if (element) {
                      (element as HTMLElement).click();
                    }
                  }}>
                    Contact our support team
                  </Button>
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Contact Support Tab */}
          <TabsContent value="support">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-6">
                <Card className="bg-card/50 backdrop-blur-sm border-border hover:border-hype-purple/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-hype-purple" />
                      Chat Support
                    </CardTitle>
                    <CardDescription>Get help through our chat support</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Our customer support team is available 24/7 via WhatsApp. Average response time is under 5 minutes during peak hours.</p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full bg-hype-purple hover:bg-hype-purple/90"
                      onClick={() => window.open('https://wa.link/ho4enf', '_blank')}
                    >
                      Start Chat
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="bg-card/50 backdrop-blur-sm border-border hover:border-hype-purple/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Mail className="h-5 w-5 text-hype-purple" />
                      Email Support
                    </CardTitle>
                    <CardDescription>Send us an email for assistance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>For complex issues or detailed inquiries, reach out via email. We respond to all emails within 24 hours.</p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full bg-hype-purple hover:bg-hype-purple/90"
                      onClick={() => window.open('mailto:awokojorichmond@gmail.com', '_blank')}
                    >
                      Send Email
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="bg-card/50 backdrop-blur-sm border-border hover:border-hype-purple/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Phone className="h-5 w-5 text-hype-purple" />
                      Phone Support
                    </CardTitle>
                    <CardDescription>Speak with a representative directly</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Call our dedicated support line for urgent issues or if you prefer speaking with a representative directly.</p>
                    <div className="mt-4 text-center">
                      <p className="text-lg font-medium">+234 912 720 4575</p>
                      <p className="text-sm text-muted-foreground">Mon-Fri: 8AM-8PM | Sat-Sun: 10AM-6PM</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full bg-hype-purple hover:bg-hype-purple/90"
                      onClick={() => window.open('tel:+2349127204575', '_blank')}
                    >
                      Call Support
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              <div>
                <Card className="bg-card/50 backdrop-blur-sm border-border sticky top-24">
                  <CardHeader>
                    <CardTitle className="text-xl">Contact Form</CardTitle>
                    <CardDescription>
                      Fill out this form and we'll get back to you as soon as possible
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitForm} className="space-y-4">
                      <div className="grid gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">Name</label>
                            <Input 
                              id="name" 
                              value={name} 
                              onChange={(e) => setName(e.target.value)}
                              placeholder="Your name" 
                              required
                              className="bg-background/10"
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">Email</label>
                            <Input 
                              id="email" 
                              type="email" 
                              value={email} 
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="Your email" 
                              required
                              className="bg-background/10"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                          <Input 
                            id="subject" 
                            value={subject} 
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="What is this regarding?" 
                            required 
                            className="bg-background/10"
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="message" className="text-sm font-medium">Message</label>
                          <Textarea 
                            id="message" 
                            value={message} 
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Describe your issue or question in detail" 
                            rows={5} 
                            required 
                            className="bg-background/10"
                          />
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-hype-purple hover:bg-hype-purple/90" 
                        disabled={submitting}
                      >
                        {submitting ? "Submitting..." : "Submit Support Request"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Support;
