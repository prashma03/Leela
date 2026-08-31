import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.pronita.leela",
  appName: "Leela",
  webDir: "public",
  server: {
    url: "https://leela-ruddy.vercel.app",
    cleartext: false,
  },
  android: {
    backgroundColor: "#fbf7ec",
  },
};

export default config;
