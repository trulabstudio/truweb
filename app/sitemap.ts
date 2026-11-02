import type { MetadataRoute } from "next";
import { publishedPosts } from "@/lib/blog/db";
import { servicePages } from "@/lib/content/service-pages";
import { seoConfig } from "@/lib/seo-config";
import { siteConfig } from "@/lib/site-config";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const page = (path: string, changeFrequency: "weekly" | "monthly", priority: number, lastModified?: string) => ({ url: `${siteConfig.url}${path}`, changeFrequency, priority, ...(lastModified ? { lastModified } : {}) });
  const posts = await publishedPosts();
  return [
    ...seoConfig.sitemap.map((route) => page(route.path, route.changeFrequency, route.priority)),
    ...servicePages.map((service) => page(`/services/${service.slug}`, "monthly", 0.9)),
    page("/konsultasi", "monthly", 0.8),
    page("/blog", "weekly", 0.8),
    ...posts.map((post) => page(`/blog/${post.slug}`, "monthly", 0.7, post.updated_at)),
  ];
}
