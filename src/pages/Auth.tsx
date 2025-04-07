
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { 
  InputOTP, 
  InputOTPGroup, 
  InputOTPSlot 
} from '@/components/ui/input-otp';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const verificationSchema = z.object({
  code: z.string().min(6, "Verification code must be 6 digits").max(6)
});

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [verificationStep, setVerificationStep] = useState(false);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof verificationSchema>>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      code: "",
    },
  });

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

    try {
      if (isSignUp) {
        // For sign up, we'll now send a one-time password
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: true,
          },
        });

        if (error) throw error;

        setVerificationStep(true);
        toast({
          title: "Verification code sent",
          description: "Please check your email for a verification code",
        });
      } else {
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

  const verifyCode = async (values: z.infer<typeof verificationSchema>) => {
    setLoading(true);
    try {
      // Verify the OTP
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: values.code,
        type: 'signup',
      });

      if (error) throw error;

      toast({
        title: "Verification successful",
        description: "Your account has been verified",
      });
      
      navigate('/');
    } catch (error: any) {
      console.error('Verification error:', error);
      toast({
        title: "Verification error",
        description: error.message || "Invalid or expired verification code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hype-dark text-foreground">
      <Navbar />
      <main className="pb-8 pt-24">
        <div className="container mx-auto px-4 max-w-md">
          <div className="bg-card border border-border rounded-xl p-8">
            {!verificationStep ? (
              <>
                <h1 className="text-2xl font-bold mb-6 text-center">
                  {isSignUp ? 'Create an Account' : 'Sign In to Your Account'}
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

                  {!isSignUp && (
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium mb-2">
                        Password
                      </label>
                      <Input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full"
                        placeholder="••••••••"
                        minLength={6}
                      />
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
                      ? 'Send Verification Code'
                      : 'Sign In'}
                  </Button>
                </form>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold mb-6 text-center">
                  Verify Your Email
                </h1>
                <p className="text-center text-muted-foreground mb-6">
                  Enter the 6-digit code sent to {email}
                </p>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(verifyCode)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem className="mx-auto w-full max-w-xs">
                          <FormControl>
                            <InputOTP maxLength={6} {...field}>
                              <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                              </InputOTPGroup>
                            </InputOTP>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full bg-hype-purple hover:bg-hype-purple/90"
                      disabled={loading}
                    >
                      {loading ? 'Verifying...' : 'Verify Code'}
                    </Button>
                  </form>
                </Form>

                <div className="mt-4 text-center">
                  <Button
                    variant="link"
                    className="text-sm text-hype-purple"
                    onClick={() => setVerificationStep(false)}
                  >
                    Go Back
                  </Button>
                </div>
              </>
            )}

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setVerificationStep(false);
                }}
                className="text-sm text-hype-purple hover:underline"
              >
                {isSignUp
                  ? 'Already have an account? Sign In'
                  : "Don't have an account? Sign Up"}
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
