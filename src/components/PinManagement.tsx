
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, Lock } from 'lucide-react';
import bcrypt from 'bcryptjs';

interface PinManagementProps {
  userId: string;
}

const PinManagement: React.FC<PinManagementProps> = ({ userId }) => {
  const [pinEnabled, setPinEnabled] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasExistingPin, setHasExistingPin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPinSettings();
  }, [userId]);

  const fetchPinSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('pin_enabled, pin_hash')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        setPinEnabled(data.pin_enabled || false);
        setHasExistingPin(!!data.pin_hash);
      }
    } catch (error) {
      console.error('Error fetching PIN settings:', error);
    }
  };

  const handlePinToggle = async (enabled: boolean) => {
    if (!enabled) {
      // Disable PIN
      try {
        setLoading(true);
        const { error } = await supabase
          .from('profiles')
          .update({ pin_enabled: false })
          .eq('id', userId);

        if (error) throw error;

        setPinEnabled(false);
        toast({
          title: "PIN disabled",
          description: "PIN authentication has been disabled",
        });
      } catch (error) {
        console.error('Error disabling PIN:', error);
        toast({
          title: "Error",
          description: "Failed to disable PIN",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    } else if (hasExistingPin) {
      // Enable existing PIN
      try {
        setLoading(true);
        const { error } = await supabase
          .from('profiles')
          .update({ pin_enabled: true })
          .eq('id', userId);

        if (error) throw error;

        setPinEnabled(true);
        toast({
          title: "PIN enabled",
          description: "PIN authentication has been enabled",
        });
      } catch (error) {
        console.error('Error enabling PIN:', error);
        toast({
          title: "Error",
          description: "Failed to enable PIN",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    // If no existing PIN and trying to enable, user needs to set up PIN first
  };

  const handleSetupPin = async () => {
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be exactly 4 digits",
        variant: "destructive",
      });
      return;
    }

    if (newPin !== confirmPin) {
      toast({
        title: "PIN mismatch",
        description: "PIN and confirmation do not match",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const pinHash = await bcrypt.hash(newPin, 10);

      const { error } = await supabase
        .from('profiles')
        .update({ 
          pin_hash: pinHash, 
          pin_enabled: true 
        })
        .eq('id', userId);

      if (error) throw error;

      setPinEnabled(true);
      setHasExistingPin(true);
      setNewPin('');
      setConfirmPin('');
      
      toast({
        title: "PIN set successfully",
        description: "Your PIN has been set and enabled",
      });
    } catch (error) {
      console.error('Error setting PIN:', error);
      toast({
        title: "Error",
        description: "Failed to set PIN",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePin = async () => {
    if (!currentPin || currentPin.length !== 4) {
      toast({
        title: "Invalid current PIN",
        description: "Please enter your current 4-digit PIN",
        variant: "destructive",
      });
      return;
    }

    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      toast({
        title: "Invalid new PIN",
        description: "New PIN must be exactly 4 digits",
        variant: "destructive",
      });
      return;
    }

    if (newPin !== confirmPin) {
      toast({
        title: "PIN mismatch",
        description: "New PIN and confirmation do not match",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Verify current PIN
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('pin_hash')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;

      const isCurrentPinValid = await bcrypt.compare(currentPin, profile.pin_hash);
      
      if (!isCurrentPinValid) {
        toast({
          title: "Invalid current PIN",
          description: "The current PIN you entered is incorrect",
          variant: "destructive",
        });
        return;
      }

      // Set new PIN
      const newPinHash = await bcrypt.hash(newPin, 10);

      const { error } = await supabase
        .from('profiles')
        .update({ pin_hash: newPinHash })
        .eq('id', userId);

      if (error) throw error;

      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      
      toast({
        title: "PIN changed successfully",
        description: "Your PIN has been updated",
      });
    } catch (error) {
      console.error('Error changing PIN:', error);
      toast({
        title: "Error",
        description: "Failed to change PIN",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">PIN Authentication</h3>
          <p className="text-sm text-muted-foreground">
            Use a 4-digit PIN for quick access to your account
          </p>
        </div>
        <Switch
          checked={pinEnabled}
          onCheckedChange={handlePinToggle}
          disabled={loading || (!hasExistingPin && !pinEnabled)}
        />
      </div>

      {!hasExistingPin ? (
        <div className="space-y-4">
          <h4 className="font-medium">Set up your PIN</h4>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">New PIN (4 digits)</label>
              <div className="relative">
                <Input
                  type={showPin ? "text" : "password"}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="••••"
                  className="pr-10"
                  maxLength={4}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPin ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Confirm PIN</label>
              <Input
                type={showPin ? "text" : "password"}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="••••"
                maxLength={4}
              />
            </div>
            <Button 
              onClick={handleSetupPin} 
              disabled={loading || newPin.length !== 4 || confirmPin.length !== 4}
              className="w-full"
            >
              <Lock className="mr-2 h-4 w-4" />
              Set PIN
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h4 className="font-medium">Change your PIN</h4>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Current PIN</label>
              <Input
                type={showPin ? "text" : "password"}
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="••••"
                maxLength={4}
              />
            </div>
            <div>
              <label className="text-sm font-medium">New PIN (4 digits)</label>
              <div className="relative">
                <Input
                  type={showPin ? "text" : "password"}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="••••"
                  className="pr-10"
                  maxLength={4}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPin ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Confirm New PIN</label>
              <Input
                type={showPin ? "text" : "password"}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="••••"
                maxLength={4}
              />
            </div>
            <Button 
              onClick={handleChangePin} 
              disabled={loading || currentPin.length !== 4 || newPin.length !== 4 || confirmPin.length !== 4}
              className="w-full"
            >
              <Lock className="mr-2 h-4 w-4" />
              Change PIN
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PinManagement;
