import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DMN Solutions",
    short_name: "DMN Solutions",
    description: "Digital, technology, electrical, computer training, and internet services.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f5f2",
    theme_color: "#1e3a5f",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
