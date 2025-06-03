
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Check } from 'lucide-react';

interface NumericPinAuthProps {
  onSuccess: (pin: string) => void;
  onCancel: () => void;
  mode: 'setup' | 'verify';
  storedPin?: string;
}

const NumericPinAuth: React.FC<NumericPinAuthProps> = ({
  onSuccess,
  onCancel,
  mode,
  storedPin
}) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const { toast } = useToast();

  const handleDigitPress = (digit: string) => {
    if (step === 'enter') {
      if (pin.length < 6) {
        setPin(prev => prev + digit);
      }
    } else {
      if (confirmPin.length < 6) {
        setConfirmPin(prev => prev + digit);
      }
    }
  };

  const handleDelete = () => {
    if (step === 'enter') {
      setPin(prev => prev.slice(0, -1));
    } else {
      setConfirmPin(prev => prev.slice(0, -1));
    }
  };

  const handleClear = () => {
    if (step === 'enter') {
      setPin('');
    } else {
      setConfirmPin('');
    }
  };

  const handleSubmit = () => {
    if (mode === 'setup') {
      if (step === 'enter') {
        if (pin.length === 6) {
          setStep('confirm');
        } else {
          toast({
            title: "Invalid PIN",
            description: "PIN must be 6 digits",
            variant: "destructive"
          });
        }
      } else {
        if (pin === confirmPin) {
          onSuccess(pin);
        } else {
          toast({
            title: "PINs don't match",
            description: "Please try again",
            variant: "destructive"
          });
          setStep('enter');
          setPin('');
          setConfirmPin('');
        }
      }
    } else {
      // Verify mode
      if (pin === storedPin) {
        onSuccess(pin);
      } else {
        toast({
          title: "Incorrect PIN",
          description: "Please try again",
          variant: "destructive"
        });
        setPin('');
      }
    }
  };

  const currentPin = step === 'enter' ? pin : confirmPin;
  const isComplete = currentPin.length === 6;

  return (
    <div className="flex flex-col items-center space-y-6 p-6 bg-card rounded-lg">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">
          {mode === 'setup' 
            ? (step === 'enter' ? 'Set up your PIN' : 'Confirm your PIN')
            : 'Enter your PIN'
          }
        </h3>
        <p className="text-sm text-muted-foreground">
          {mode === 'setup' 
            ? 'Create a 6-digit PIN for quick access'
            : 'Enter your 6-digit PIN to continue'
          }
        </p>
      </div>

      {/* PIN Display */}
      <div className="flex space-x-3">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className={`w-4 h-4 rounded-full border-2 ${
              index < currentPin.length
                ? 'bg-hype-purple border-hype-purple'
                : 'border-border'
            }`}
          />
        ))}
      </div>

      {/* Numeric Keypad */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
          <Button
            key={digit}
            variant="outline"
            size="lg"
            className="h-14 text-xl font-semibold"
            onClick={() => handleDigitPress(digit.toString())}
          >
            {digit}
          </Button>
        ))}
        
        <Button
          variant="outline"
          size="lg"
          className="h-14"
          onClick={handleClear}
        >
          Clear
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          className="h-14 text-xl font-semibold"
          onClick={() => handleDigitPress('0')}
        >
          0
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          className="h-14"
          onClick={handleDelete}
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4 w-full max-w-xs">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!isComplete}
          className="flex-1 bg-hype-purple hover:bg-hype-purple/90"
        >
          <Check className="mr-2 h-4 w-4" />
          {mode === 'setup' 
            ? (step === 'enter' ? 'Next' : 'Confirm')
            : 'Unlock'
          }
        </Button>
      </div>
    </div>
  );
};

export default NumericPinAuth;
