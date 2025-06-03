
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Lock, ArrowLeft } from 'lucide-react';
import bcrypt from 'bcryptjs';

interface PinEntryProps {
  onSuccess: () => void;
  onBack: () => void;
  userEmail: string;
}

const PinEntry: React.FC<PinEntryProps> = ({ onSuccess, onBack, userEmail }) => {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const { toast } = useToast();

  const handlePinSubmit = async () => {
    if (pin.length !== 4) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be 4 digits",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Get the user's PIN hash
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('pin_hash')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (error) throw error;

      if (!profile?.pin_hash) {
        toast({
          title: "PIN not set",
          description: "No PIN found for this account",
          variant: "destructive",
        });
        return;
      }

      const isValidPin = await bcrypt.compare(pin, profile.pin_hash);

      if (isValidPin) {
        toast({
          title: "Access granted",
          description: "PIN verified successfully",
        });
        onSuccess();
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setPin('');
        
        if (newAttempts >= 3) {
          toast({
            title: "Too many attempts",
            description: "Please use regular login",
            variant: "destructive",
          });
          onBack();
        } else {
          toast({
            title: "Invalid PIN",
            description: `Incorrect PIN. ${3 - newAttempts} attempts remaining`,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error verifying PIN:', error);
      toast({
        title: "Error",
        description: "Failed to verify PIN",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePinChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 4);
    setPin(numericValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && pin.length === 4) {
      handlePinSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-hype-dark text-foreground flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-md">
        <div className="bg-card border border-border rounded-xl p-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Lock className="h-12 w-12 text-hype-purple" />
            </div>
            <h1 className="text-2xl font-bold">Enter your PIN</h1>
            <p className="text-muted-foreground">
              Welcome back, {userEmail}
            </p>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                4-digit PIN
              </label>
              <Input
                type="password"
                value={pin}
                onChange={(e) => handlePinChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="••••"
                className="text-center text-2xl tracking-widest"
                maxLength={4}
                autoFocus
              />
            </div>

            <Button
              onClick={handlePinSubmit}
              disabled={loading || pin.length !== 4}
              className="w-full bg-hype-purple hover:bg-hype-purple/90"
            >
              {loading ? 'Verifying...' : 'Enter'}
            </Button>

            <Button
              variant="outline"
              onClick={onBack}
              className="w-full flex items-center justify-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Use Password Instead
            </Button>

            {attempts > 0 && (
              <div className="text-center text-sm text-muted-foreground">
                {3 - attempts} attempts remaining
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PinEntry;
