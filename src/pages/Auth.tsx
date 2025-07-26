
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, AlertTriangle } from 'lucide-react';

const passwordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters")
});

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        navigate('/');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session) {
          navigate('/');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Add a small delay to show the loading animation but prevent hanging
    const timeoutId = setTimeout(() => {
      if (loading) {
        setLoading(false);
        toast({
          title: "Connection timeout",
          description: "Please check your internet connection and try again.",
          variant: "destructive",
        });
      }
    }, 10000); // 10 second timeout

    try {
      if (isSignUp) {
        // For sign up, we'll use email and password
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          }
        });

        if (error) {
          // Check if the error is because user already exists
          if (error.message.includes('User already registered') || 
              error.message.includes('already registered') ||
              error.message.includes('already exists')) {
            toast({
              title: "Account already exists",
              description: "An account with this email already exists. Please sign in instead or use a different email address.",
              variant: "destructive",
            });
            return;
          }
          throw error;
        }

        // Check if user already exists (Supabase might return success but with existing user)
        if (data.user && !data.user.email_confirmed_at && data.user.created_at) {
          const userCreatedTime = new Date(data.user.created_at).getTime();
          const now = new Date().getTime();
          const timeDiff = now - userCreatedTime;
          
          // If user was created more than 5 seconds ago, they likely already existed
          if (timeDiff > 5000) {
            toast({
              title: "Account already exists",
              description: "An account with this email already exists. Please sign in instead.",
              variant: "destructive",
            });
            // Switch to sign in mode
            setIsSignUp(false);
            return;
          }
        }

        setSuccessMessage(
          "Registration successful! Please check your email for a confirmation link to complete your signup."
        );
        toast({
          title: "Check your email",
          description: "A confirmation link has been sent to your email",
        });
      } else {
        // For sign in, we use email and password
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // Provide more specific error messages for sign in
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: "Invalid credentials",
              description: "The email or password you entered is incorrect. Please check and try again.",
              variant: "destructive",
            });
          } else if (error.message.includes('Email not confirmed')) {
            toast({
              title: "Email not confirmed",
              description: "Please check your email and click the confirmation link before signing in.",
              variant: "destructive",
            });
          } else {
            throw error;
          }
          return;
        }

        navigate('/');
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast({
        title: "Authentication error",
        description: error.message || "An error occurred during authentication",
        variant: "destructive",
      });
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const switchMode = () => {
    setIsSignUp(!isSignUp);
    setSuccessMessage('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-hype-dark via-slate-900 to-hype-dark text-foreground relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-hype-purple/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-hype-teal/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <Navbar />
      <main className="pb-8 pt-24 relative z-10">
        <div className="container mx-auto px-4 max-w-md">
          <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-hype-purple/10 to-hype-teal/10 rounded-2xl blur-xl -z-10"></div>
            {successMessage ? (
              <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-hype-purple to-hype-teal bg-clip-text text-transparent">Registration Successful!</h1>
                <p className="text-muted-foreground">{successMessage}</p>
                <Button 
                  onClick={() => {
                    setIsSignUp(false);
                    setSuccessMessage('');
                    setEmail('');
                    setPassword('');
                  }}
                  className="mt-4 bg-hype-purple hover:bg-hype-purple/90 w-full"
                >
                  Back to Sign In
                </Button>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-hype-purple to-hype-teal bg-clip-text text-transparent">
                  {isSignUp ? 'Create an Account' : 'Welcome Back'}
                </h1>

                <form onSubmit={handleAuth} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email
                    </label>
                    <Input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full pr-10"
                        placeholder="••••••••"
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>

                  {isSignUp && (
                    <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-3 flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-amber-200">
                        <p className="font-medium">Important Password Notice</p>
                        <p className="mt-1">Please use a 6-digit password that you can easily remember. Password recovery is not currently available, so make sure it's something you won't forget.</p>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-hype-purple to-hype-teal hover:from-hype-purple/90 hover:to-hype-teal/90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-glow"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Processing...
                      </div>
                    ) : (
                      isSignUp ? 'Create Account' : 'Sign In'
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    onClick={switchMode}
                    className="text-sm text-hype-purple hover:underline"
                  >
                    {isSignUp
                      ? 'Already have an account? Sign In'
                      : "Don't have an account? Sign Up"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
