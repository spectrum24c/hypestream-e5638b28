
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Phone, MessageSquare, Copy, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const Support = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  
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
          <h1 className="text-3xl font-bold">Support Center</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-card hover:bg-card/80 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-hype-purple" />
                Chat Support
              </CardTitle>
              <CardDescription>Get help through our live chat</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Our chat support team is available Monday through Friday, 9 AM to 6 PM EST. Average response time is under 5 minutes.</p>
            </CardContent>
            <CardFooter>
              <Button 
                className="bg-hype-purple hover:bg-hype-purple/90 w-full"
                onClick={() => window.open('https://t.me/HypeStreamSupport', '_blank')}
              >
                Start Chat
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-card hover:bg-card/80 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-hype-purple" />
                Email Support
              </CardTitle>
              <CardDescription>Send us an email for assistance</CardDescription>
            </CardHeader>
            <CardContent>
              <p>For non-urgent issues, reach out via email. We respond to all emails within 24 hours.</p>
            </CardContent>
            <CardFooter>
              <Button 
                className="bg-hype-purple hover:bg-hype-purple/90 w-full"
                onClick={() => window.open('mailto:hypestream127@gmail.com', '_blank')}
              >
                Send Email
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mb-8">
          <Card className="bg-card border-hype-purple/30">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle>Payment Support</CardTitle>
              <CardDescription>Use these account details for payments and subscriptions</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
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
                      variant="ghost" 
                      onClick={copyAccountNumber}
                      className="text-hype-purple hover:text-hype-purple/80 flex gap-1"
                    >
                      {isCopied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {isCopied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                </div>
                <div className="bg-hype-purple/10 rounded-md p-3 border border-hype-purple/20 mt-4">
                  <p className="text-sm">
                    Please include your HypeStream account email as reference when making payments to ensure proper allocation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Frequently Asked Questions</h2>
          <div className="bg-card rounded-lg p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">How do I report streaming issues?</h3>
                <p className="text-muted-foreground">
                  To report streaming issues, note the movie/show title, specific timestamp, and device used. Then email these details to hypestream127@gmail.com with the subject "Streaming Issue Report".
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">What payment methods do you accept?</h3>
                <p className="text-muted-foreground">
                  We currently accept bank transfers to our PALMPAY account. Upcoming payment options will include credit/debit cards and mobile money.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">How long do refunds take to process?</h3>
                <p className="text-muted-foreground">
                  Refund requests are processed within 3-5 business days. Once approved, funds will be returned to your original payment method.
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-muted-foreground mb-4">
              Still need help? Our support team is available by phone.
            </p>
            <Button 
              className="bg-hype-purple hover:bg-hype-purple/90"
              onClick={() => window.open('tel:+1234567890', '_blank')}
            >
              <Phone className="mr-2 h-4 w-4" />
              Call Support
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Support;
