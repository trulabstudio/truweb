import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

const routes = ["", "/qr-generator", "/background-remover"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: route ? "monthly" : "weekly",
    priority: route ? 0.7 : 1,
  }));
}
