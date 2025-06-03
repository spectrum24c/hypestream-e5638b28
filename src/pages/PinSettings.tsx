
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import PinManagement from '@/components/PinManagement';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Home } from 'lucide-react';

const PinSettings = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to access PIN settings",
          variant: "destructive"
        });
        navigate('/auth');
      }
      setLoading(false);
    };
    
    checkAuth();
  }, [navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-hype-dark text-foreground flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hype-purple"></div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-hype-dark text-foreground">
      <Navbar />
      <main className="pt-24 pb-16 mx-auto container px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost" 
              className="flex items-center gap-1 text-hype-purple" 
              onClick={() => navigate('/')}
            >
              <Home size={16} />
              <span>Back to Home</span>
            </Button>
            <h1 className="text-2xl font-bold">PIN Settings</h1>
          </div>
          
          <div className="bg-card border border-border rounded-xl p-6">
            <PinManagement userId={session.user.id} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PinSettings;
