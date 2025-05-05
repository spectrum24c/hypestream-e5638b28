
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Mail, Phone, MessageSquare, HelpCircle, Info } from 'lucide-react';
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
      title: "Account & Billing",
      items: [
        { question: "How do I change my payment method?", answer: "You can update your payment method in Settings > Billing Information. We accept bank transfers, credit cards, and mobile payments." },
        { question: "Why was my subscription canceled?", answer: "Subscriptions may be canceled due to payment failures or at your request. Check your email for notifications or contact our billing team for assistance." },
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

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
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
          <h1 className="text-3xl font-bold">Help & Support Center</h1>
        </div>

        <Tabs defaultValue="support" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="support">Contact Support</TabsTrigger>
            <TabsTrigger value="faq">Frequently Asked Questions</TabsTrigger>
          </TabsList>
          
          {/* Contact Support Tab */}
          <TabsContent value="support">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-6">
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      Chat Support
                    </CardTitle>
                    <CardDescription>Get help through our chat support</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Our customer support team is available 24/7 via WhatsApp. Average response time is under 5 minutes during peak hours.</p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full"
                      onClick={() => window.open('https://wa.link/ho4enf', '_blank')}
                    >
                      Start Chat
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Mail className="h-5 w-5 text-primary" />
                      Email Support
                    </CardTitle>
                    <CardDescription>Send us an email for assistance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>For complex issues or detailed inquiries, reach out via email. We respond to all emails within 24 hours.</p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full"
                      onClick={() => window.open('mailto:awokojorichmond@gmail.com', '_blank')}
                    >
                      Send Email
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Phone className="h-5 w-5 text-primary" />
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
                      className="w-full"
                      onClick={() => window.open('tel:+2349127204575', '_blank')}
                    >
                      Call Support
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              <div>
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-xl">Contact Form</CardTitle>
                    <CardDescription>
                      Fill out this form and we'll get back to you as soon as possible
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitForm} className="space-y-4">
                      <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">Name</label>
                            <Input 
                              id="name" 
                              value={name} 
                              onChange={(e) => setName(e.target.value)}
                              placeholder="Your name" 
                              required
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
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full" disabled={submitting}>
                        {submitting ? "Submitting..." : "Submit Support Request"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* FAQ Tab */}
          <TabsContent value="faq">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-xl">Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Browse through our most common questions and answers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {supportCategories.map((category, index) => (
                    <div key={index} className="space-y-3">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Info className="h-5 w-5 text-primary" />
                        {category.title}
                      </h3>
                      <Accordion type="single" collapsible className="w-full">
                        {category.items.map((item, itemIndex) => (
                          <AccordionItem key={itemIndex} value={`faq-${index}-${itemIndex}`}>
                            <AccordionTrigger className="text-left">
                              {item.question}
                            </AccordionTrigger>
                            <AccordionContent>
                              <p className="text-muted-foreground">{item.answer}</p>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-center border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  Can't find what you're looking for?{" "}
                  <Button variant="link" className="h-auto p-0" onClick={() => window.open('mailto:awokojorichmond@gmail.com', '_blank')}>
                    Contact our support team
                  </Button>
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Support;
