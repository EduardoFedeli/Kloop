import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kloop",
    short_name: "Kloop",
    description: "Marketplace consolidador de desapegos. Mobile-first, mercado brasileiro de seminovos.",
    start_url: "/",
    display: "standalone",
    background_color: "#F8FAF8",
    theme_color: "#1B4332",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}
