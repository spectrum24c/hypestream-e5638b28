
/// <reference types="vite/client" />
/// <reference types="@capacitor/cli" />

interface Capacitor {
  isNativePlatform: () => boolean;
}

interface Window {
  Capacitor?: Capacitor;
}
