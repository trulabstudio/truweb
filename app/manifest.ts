import type { MetadataRoute } from "next";
import { brandTheme } from "@/lib/brand-theme";
import { editableSite } from "@/lib/EDIT-SITE-HERE";
import { siteConfig } from "@/lib/site-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: brandTheme.background,
    theme_color: brandTheme.background,
    icons: [
      {
        src: editableSite.images.pwa.icon192.src,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: editableSite.images.pwa.icon512.src,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: editableSite.images.pwa.maskable512.src,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
