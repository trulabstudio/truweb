import type { MetadataRoute } from "next";
import { brandTheme } from "@/lib/brand-theme";
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
        src: siteConfig.assets.logo,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: siteConfig.assets.logoLight,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
