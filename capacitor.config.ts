import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.pronita.leela",
  appName: "Leela",
  webDir: "public",
  loggingBehavior: "none",
  server: {
    url: "https://leela-ruddy.vercel.app",
    cleartext: false,
    errorPath: "offline.html",
  },
  android: {
    allowMixedContent: false,
    backgroundColor: "#fbf7ec",
    loggingBehavior: "none",
    webContentsDebuggingEnabled: false,
  },
};

export default config;
