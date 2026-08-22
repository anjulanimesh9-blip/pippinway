import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pippinway.app',
  appName: 'Pippinway',
  webDir: 'public',
  server: {
    androidScheme: 'https',
    hostname: 'pippinway-e9719.firebaseapp.com',
  },
};

export default config;
