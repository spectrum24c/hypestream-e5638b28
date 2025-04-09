
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { Laptop, Smartphone, Tablet, Monitor, User, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { DeviceInfo } from '@/types/movie';

const Devices = () => {
  const [session, setSession] = useState<any>(null);
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (!currentSession) {
        navigate('/auth');
      } else {
        // Get current device
        const userAgent = navigator.userAgent;
        const currentDevice: DeviceInfo = {
          name: getUserDeviceName(userAgent),
          type: getUserDeviceType(userAgent),
          lastActive: new Date().toLocaleString()
        };

        // For demo purposes, let's add some mock devices
        const mockDevices: DeviceInfo[] = [
          currentDevice,
          {
            name: 'iPhone 14',
            type: 'Mobile',
            lastActive: '2 days ago'
          },
          {
            name: 'Windows PC',
            type: 'Desktop',
            lastActive: 'Yesterday'
          }
        ];
        
        setDevices(mockDevices);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        if (!newSession) {
          navigate('/auth');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const getUserDeviceName = (userAgent: string) => {
    let deviceName = "Unknown Device";
    
    if (/Windows NT 10.0/.test(userAgent)) deviceName = "Windows 10";
    else if (/Windows NT 6.3/.test(userAgent)) deviceName = "Windows 8.1";
    else if (/Windows NT 6.2/.test(userAgent)) deviceName = "Windows 8";
    else if (/Windows NT 6.1/.test(userAgent)) deviceName = "Windows 7";
    else if (/Windows NT 6.0/.test(userAgent)) deviceName = "Windows Vista";
    else if (/Windows NT 5.1/.test(userAgent)) deviceName = "Windows XP";
    else if (/Mac OS X/.test(userAgent)) deviceName = "Mac OS X";
    else if (/Linux/.test(userAgent)) deviceName = "Linux";
    else if (/Android/.test(userAgent)) deviceName = "Android";
    else if (/iPhone|iPad|iPod/.test(userAgent)) deviceName = "iOS";
    
    return deviceName;
  };
  
  const getUserDeviceType = (userAgent: string) => {
    if (/Mobile|Android|iPhone|iPod/.test(userAgent)) return "Mobile";
    if (/Tablet|iPad/.test(userAgent)) return "Tablet";
    return "Desktop/Laptop";
  };

  const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-6 w-6" />;
      case 'tablet':
        return <Tablet className="h-6 w-6" />;
      case 'desktop':
      case 'laptop':
        return <Laptop className="h-6 w-6" />;
      case 'tv':
        return <Monitor className="h-6 w-6" />;
      default:
        return <User className="h-6 w-6" />;
    }
  };

  const handleSignOut = async (deviceIndex: number) => {
    try {
      // In a real implementation, this would sign out a specific session
      // For now, we'll just remove the device from the list
      const newDevices = [...devices];
      newDevices.splice(deviceIndex, 1);
      setDevices(newDevices);
      
      toast({
        title: "Device signed out",
        description: "The device has been signed out successfully",
      });
    } catch (error) {
      console.error("Error signing out device:", error);
      toast({
        title: "Error",
        description: "Failed to sign out device",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-hype-dark text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4 text-muted-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <h1 className="text-3xl font-bold">Your Devices</h1>
            <p className="text-muted-foreground mt-2">
              Manage all devices currently signed in to your HypeStream account
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hype-purple"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {devices.map((device, index) => (
                <div key={index} className="bg-card rounded-lg p-4 border border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-muted rounded-full p-3">
                        {getDeviceIcon(device.type)}
                      </div>
                      <div>
                        <h3 className="font-medium">{device.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {device.type} • Last active: {device.lastActive}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => handleSignOut(index)}
                      className="text-sm"
                    >
                      Sign Out
                    </Button>
                  </div>
                </div>
              ))}

              <div className="mt-8 text-center p-4 bg-muted/20 rounded-lg border border-dashed border-muted">
                <p className="text-sm text-muted-foreground">
                  Note: For security reasons, we recommend signing out of devices you no longer use.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Devices;
