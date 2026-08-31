import type { Metadata } from "next";
import "./globals.css";
import PwaRegistration from "./pwa-registration";

export const metadata: Metadata = {
  title: "Leela - Stories of Krishna",
  description: "Little Krishna stories and Bhagavad Gita wisdom in simple, welcoming English.",
  applicationName: "Leela",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Leela" },
  icons: {
    icon: [
      { url: "/icons/leela-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/leela-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/leela-192.png",
  },
};

export const viewport = { themeColor: "#073f40" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}<PwaRegistration /></body></html>;
}
