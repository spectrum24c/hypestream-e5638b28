import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from '@/integrations/supabase/client';

/**
 * Registers the device for FCM/APNs push when running inside the native Capacitor app.
 * No-op in browsers.
 */
export function useNativePushRegistration() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return; // wait until logged in

        const perm = await PushNotifications.checkPermissions();
        let status = perm.receive;
        if (status === 'prompt' || status === 'prompt-with-rationale') {
          status = (await PushNotifications.requestPermissions()).receive;
        }
        if (status !== 'granted') return;

        await PushNotifications.register();

        PushNotifications.addListener('registration', async token => {
          try {
            await supabase.functions.invoke('subscribe-push', {
              body: {
                platform: Capacitor.getPlatform() === 'ios' ? 'ios' : 'android',
                device_token: token.value,
                user_agent: navigator.userAgent,
              },
            });
          } catch (e) {
            console.error('Failed to register push token', e);
          }
        });

        PushNotifications.addListener('registrationError', err => {
          console.error('Push registration error', err);
        });
      } catch (e) {
        console.error('Native push init failed', e);
      }
    };

    init();
    return () => { PushNotifications.removeAllListeners().catch(() => {}); };
  }, []);
}
