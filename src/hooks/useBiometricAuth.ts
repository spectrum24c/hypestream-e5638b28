
import { useState, useEffect } from 'react';
import { BiometricAuth, BiometricAuthenticationStatus } from '@capacitor/biometric-auth';
import { Device } from '@capacitor/device';
import { isCapacitorNative } from '@/utils/mobileUtils';
import { useToast } from '@/hooks/use-toast';

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
}

export const useBiometricAuth = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    if (!isCapacitorNative()) {
      console.log('Biometric auth not available in web environment');
      return;
    }

    try {
      const info = await Device.getInfo();
      const isIOS = info.platform === 'ios';
      const isAndroid = info.platform === 'android';
      
      if (!isIOS && !isAndroid) {
        return;
      }

      const result = await BiometricAuth.checkBiometry();
      setIsAvailable(result.isAvailable);
      setIsSupported(true);

      if (result.isAvailable) {
        // Determine biometric type
        if (isIOS) {
          setBiometricType('Face ID / Touch ID');
        } else {
          setBiometricType('Fingerprint / Face Unlock');
        }
      }
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      setIsAvailable(false);
      setIsSupported(false);
    }
  };

  const authenticate = async (reason: string = 'Please authenticate to continue'): Promise<BiometricAuthResult> => {
    if (!isCapacitorNative() || !isAvailable) {
      return { success: false, error: 'Biometric authentication not available' };
    }

    try {
      const result = await BiometricAuth.authenticate({
        reason,
        title: 'Biometric Authentication',
        subtitle: 'Use your biometric to authenticate',
        description: 'Place your finger on the sensor or look at the camera'
      });

      return { success: true };
    } catch (error: any) {
      console.error('Biometric authentication error:', error);
      
      let errorMessage = 'Authentication failed';
      if (error.message?.includes('UserCancel')) {
        errorMessage = 'Authentication was cancelled';
      } else if (error.message?.includes('UserFallback')) {
        errorMessage = 'User chose fallback authentication';
      } else if (error.message?.includes('SystemCancel')) {
        errorMessage = 'Authentication was cancelled by system';
      }

      return { success: false, error: errorMessage };
    }
  };

  return {
    isAvailable,
    isSupported,
    biometricType,
    authenticate,
    checkBiometricAvailability
  };
};
