import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FluencyPal",
    short_name: "FluencyPal",
    description: "AI Speaking Practice for Fluency & Confidence",
    start_url: "/",
    display: "standalone",
    background_color: "#0a121e",
    theme_color: "#eaf3f7",
    icons: [
      { src: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
      {
        src: "/favicon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
