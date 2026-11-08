import type { MetadataRoute } from "next";
import { APP_CONFIG } from "@/config/version";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${APP_CONFIG.name} (${APP_CONFIG.nameArabic})`,
    short_name: APP_CONFIG.name,
    description: APP_CONFIG.description,
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#059669",
    orientation: "portrait",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}

