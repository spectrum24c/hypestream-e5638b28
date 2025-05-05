
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Mail, Phone, MessageSquare, Copy, CheckCircle, HelpCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const Support = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const accountNumber = '8028151231';
  const bankName = 'PALMPAY';
  
  const handleBackToHome = () => {
    navigate('/');
  };

  const copyAccountNumber = () => {
    navigator.clipboard.writeText(accountNumber);
    setIsCopied(true);
    
    toast({
      title: "Account number copied!",
      description: "The account number has been copied to your clipboard.",
    });
    
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Support request submitted",
        description: "We'll get back to you as soon as possible.",
      });
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setSubmitting(false);
    }, 1000);
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
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="support">Contact Support</TabsTrigger>
            <TabsTrigger value="faq">Frequently Asked Questions</TabsTrigger>
            <TabsTrigger value="payments">Payment Information</TabsTrigger>
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
                    <CardDescription>Get help through our live chat</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Our customer support team is available 24/7 via live chat. Average response time is under 5 minutes during peak hours.</p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full"
                      onClick={() => window.open('https://t.me/HypeStreamSupport', '_blank')}
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
                      onClick={() => window.open('mailto:hypestream127@gmail.com', '_blank')}
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
                      <p className="text-lg font-medium">+234 801 234 5678</p>
                      <p className="text-sm text-muted-foreground">Mon-Fri: 8AM-8PM | Sat-Sun: 10AM-6PM</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full"
                      onClick={() => window.open('tel:+2348012345678', '_blank')}
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
                  <Button variant="link" className="h-auto p-0" onClick={() => window.open('mailto:hypestream127@gmail.com', '_blank')}>
                    Contact our support team
                  </Button>
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Payment Information Tab */}
          <TabsContent value="payments">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-xl">Payment Support</CardTitle>
                <CardDescription>Use these account details for payments and subscriptions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-secondary/30 rounded-lg p-4 border border-border">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Bank Name</p>
                      <p className="font-medium">{bankName}</p>
                    </div>
                    <div className="relative">
                      <p className="text-sm text-muted-foreground mb-1">Account Number</p>
                      <div className="flex items-center justify-between bg-background rounded-md p-3 border border-input">
                        <span className="font-medium">{accountNumber}</span>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={copyAccountNumber}
                          className="flex gap-1"
                        >
                          {isCopied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          {isCopied ? "Copied!" : "Copy"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Payment Instructions</h3>
                  <div className="grid gap-4">
                    <div className="bg-primary/10 rounded-md p-3 border border-primary/20">
                      <p className="text-sm font-medium">
                        Please include your HypeStream account email as reference when making payments to ensure proper allocation.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Subscription Payment Steps:</h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground pl-2">
                        <li>Log in to your banking app or visit your bank</li>
                        <li>Select "Transfer to other banks"</li>
                        <li>Enter the account number: {accountNumber}</li>
                        <li>Select the bank: {bankName}</li>
                        <li>Enter the amount for your chosen subscription plan</li>
                        <li>Add your HypeStream email as the payment reference</li>
                        <li>Complete the transaction</li>
                        <li>Your account will be activated within 24 hours</li>
                      </ol>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Accepted Payment Methods</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-3 border border-border rounded-md text-center">
                      <p className="font-medium">Bank Transfers</p>
                    </div>
                    <div className="p-3 border border-border rounded-md text-center">
                      <p className="font-medium">Mobile Money</p>
                    </div>
                    <div className="p-3 border border-border rounded-md text-center">
                      <p className="font-medium">USSD Payments</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-destructive/10 text-destructive rounded-md p-3 border border-destructive/20">
                  <div className="flex items-start gap-2">
                    <HelpCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Payment Issues?</p>
                      <p className="text-sm">
                        If you've made a payment but your account hasn't been activated, please contact our billing department at billing@hypestream.com with your payment receipt.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Support;
