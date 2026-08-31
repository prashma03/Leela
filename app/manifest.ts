import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Leela — Stories of Krishna",
    short_name: "Leela",
    description: "Krishna stories and Bhagavad Gita wisdom in simple, welcoming English.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fbf7ec",
    theme_color: "#073f40",
    orientation: "portrait-primary",
    categories: ["education", "books", "lifestyle"],
    icons: [
      { src: "/icons/leela-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/leela-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/leela-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
