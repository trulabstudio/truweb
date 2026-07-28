import { editableSite } from "@/lib/EDIT-SITE-HERE";
import type { SiteConfig } from "@/lib/types/site";

const { company, images, seo } = editableSite;

export const siteConfig = {
  name: company.name,
  slug: company.slug,
  domain: company.domain,
  url: company.websiteUrl,
  email: company.email,
  phoneDisplay: company.phoneDisplay,
  whatsapp: company.whatsappNumber,
  address: company.address,
  socialLinks: company.socialLinks,
  title: seo.defaultTitle,
  description: seo.description,
  assets: {
    logo: images.brand.logoMain.src,
    logoLight: images.brand.logoWhite.src,
    logoFull: images.brand.logoFull.src,
    favicon: images.brand.favicon.src,
    socialImage: images.social.openGraph.src,
  },
} satisfies SiteConfig;

export function buildWhatsAppUrl(message: string) {
  return `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(message)}`;
}

export const defaultWhatsAppMessage = company.defaultWhatsAppMessage;
