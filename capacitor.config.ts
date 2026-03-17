import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'vn.lancoffee.pos',
  appName: 'Lân Coffee POS',
  webDir: 'out',
  server: {
    url: 'https://pos-project-v2-one.vercel.app',
    cleartext: true
  }
};

export default config;
