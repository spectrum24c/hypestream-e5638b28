
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.e54599b5531f468292fa4a17971f6048',
  appName: 'HypeStream',
  webDir: 'dist',
  server: {
    url: 'https://e54599b5-531f-4682-92fa-4a17971f6048.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#121212",
      showSpinner: false,
      androidShowSpinner: false,
      iosShowSpinner: false
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#121212'
    }
  },
  ios: {
    contentInset: 'automatic'
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
