
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import NumericPinAuth from './NumericPinAuth';
import { useToast } from '@/hooks/use-toast';
import { isCapacitorNative } from '@/utils/mobileUtils';
import { Fingerprint, Smartphone, Shield } from 'lucide-react';

interface BiometricAuthProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

const BiometricAuth: React.FC<BiometricAuthProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = "Authentication Required",
  description = "Please authenticate to continue"
}) => {
  const [authMethod, setAuthMethod] = useState<'biometric' | 'pin' | 'select'>('select');
  const [pinSetup, setPinSetup] = useState(false);
  const { isAvailable, isSupported, biometricType, authenticate } = useBiometricAuth();
  const { toast } = useToast();

  // Check if PIN is already set up
  const storedPin = localStorage.getItem('userPin');
  const hasPinSetup = !!storedPin;

  useEffect(() => {
    if (isOpen && !isCapacitorNative()) {
      // For non-mobile devices, just proceed with regular auth
      onSuccess();
      return;
    }

    if (isOpen && isAvailable) {
      // Automatically try biometric if available
      handleBiometricAuth();
    } else if (isOpen && hasPinSetup) {
      // Fall back to PIN if biometric not available but PIN is set up
      setAuthMethod('pin');
    }
  }, [isOpen, isAvailable, hasPinSetup]);

  const handleBiometricAuth = async () => {
    const result = await authenticate(description);
    
    if (result.success) {
      toast({
        title: "Authentication successful",
        description: "Welcome back!",
      });
      onSuccess();
    } else {
      toast({
        title: "Authentication failed",
        description: result.error || "Please try again",
        variant: "destructive"
      });
      
      if (hasPinSetup) {
        setAuthMethod('pin');
      } else {
        setAuthMethod('select');
      }
    }
  };

  const handlePinSuccess = (pin: string) => {
    if (!hasPinSetup) {
      // Setting up new PIN
      localStorage.setItem('userPin', pin);
      toast({
        title: "PIN setup complete",
        description: "Your PIN has been saved securely",
      });
    }
    
    toast({
      title: "Authentication successful",
      description: "Welcome back!",
    });
    onSuccess();
  };

  const handleSetupPin = () => {
    setPinSetup(true);
    setAuthMethod('pin');
  };

  if (!isCapacitorNative()) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-hype-purple" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {authMethod === 'select' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                {description}
              </p>

              {isAvailable && (
                <Button
                  onClick={handleBiometricAuth}
                  className="w-full bg-hype-purple hover:bg-hype-purple/90"
                >
                  <Fingerprint className="mr-2 h-4 w-4" />
                  Use {biometricType}
                </Button>
              )}

              {hasPinSetup ? (
                <Button
                  variant="outline"
                  onClick={() => setAuthMethod('pin')}
                  className="w-full"
                >
                  <Smartphone className="mr-2 h-4 w-4" />
                  Use PIN
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleSetupPin}
                  className="w-full"
                >
                  <Smartphone className="mr-2 h-4 w-4" />
                  Set up PIN
                </Button>
              )}

              <Button
                variant="ghost"
                onClick={onClose}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          )}

          {authMethod === 'pin' && (
            <NumericPinAuth
              mode={!hasPinSetup || pinSetup ? 'setup' : 'verify'}
              storedPin={storedPin || undefined}
              onSuccess={handlePinSuccess}
              onCancel={() => {
                setPinSetup(false);
                setAuthMethod('select');
              }}
            />
          )}

          {authMethod === 'biometric' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Fingerprint className="h-16 w-16 text-hype-purple animate-pulse" />
              </div>
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
              <Button
                variant="outline"
                onClick={() => setAuthMethod('select')}
                className="w-full"
              >
                Use different method
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BiometricAuth;
