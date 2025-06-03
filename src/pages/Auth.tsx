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
import { Eye, EyeOff, AlertTriangle, Fingerprint } from 'lucide-react';
import BiometricAuth from '@/components/auth/BiometricAuth';
import { isCapacitorNative } from '@/utils/mobileUtils';

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
  const [showBiometricAuth, setShowBiometricAuth] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if we're on mobile
    setIsMobile(isCapacitorNative());
    
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

    try {
      if (isSignUp) {
        // For sign up, we'll use email and password
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          }
        });

        if (error) throw error;

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

        if (error) throw error;

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
      setLoading(false);
    }
  };

  const handleBiometricAuthSuccess = () => {
    setShowBiometricAuth(false);
    // Proceed with regular sign in flow or navigate to home
    navigate('/');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-hype-dark text-foreground">
      <Navbar />
      <main className="pb-8 pt-24">
        <div className="container mx-auto px-4 max-w-md">
          <div className="bg-card border border-border rounded-xl p-8">
            {successMessage ? (
              <div className="text-center space-y-4">
                <h1 className="text-2xl font-bold mb-2 text-hype-purple">Registration Successful!</h1>
                <p className="text-muted-foreground">{successMessage}</p>
                <Button 
                  onClick={() => {
                    setIsSignUp(false);
                    setSuccessMessage('');
                  }}
                  className="mt-4 bg-hype-purple hover:bg-hype-purple/90 w-full"
                >
                  Back to Sign In
                </Button>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold mb-6 text-center">
                  {isSignUp ? 'Create an Account' : 'Sign In to Your Account'}
                </h1>

                {/* Biometric Auth Button for Mobile */}
                {isMobile && !isSignUp && (
                  <div className="mb-6">
                    <Button
                      onClick={() => setShowBiometricAuth(true)}
                      className="w-full bg-hype-purple hover:bg-hype-purple/90 mb-4"
                    >
                      <Fingerprint className="mr-2 h-4 w-4" />
                      Quick Sign In
                    </Button>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                          Or continue with email
                        </span>
                      </div>
                    </div>
                  </div>
                )}

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
                    className="w-full bg-hype-purple hover:bg-hype-purple/90"
                    disabled={loading}
                  >
                    {loading
                      ? 'Loading...'
                      : isSignUp
                      ? 'Sign Up'
                      : 'Sign In'}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setSuccessMessage('');
                    }}
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

        {/* Biometric Authentication Dialog */}
        <BiometricAuth
          isOpen={showBiometricAuth}
          onClose={() => setShowBiometricAuth(false)}
          onSuccess={handleBiometricAuthSuccess}
          title="Quick Sign In"
          description="Use biometric authentication or PIN to sign in quickly"
        />
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
