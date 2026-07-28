import { editableSite } from "@/lib/EDIT-SITE-HERE";

const { seo } = editableSite;

export const seoConfig = {
  homepageTitle: seo.homepageTitle,
  titleTemplate: seo.titleTemplate,
  keywords: seo.keywords,
  socialImageAlt: seo.socialImageAlt,
  locale: seo.locale,
  twitterCard: seo.twitterCard,
  businessType: seo.structuredData.businessType,
  serviceTypes: seo.structuredData.serviceTypes,
  areaServed: seo.structuredData.areaServed,
  availableLanguages: seo.structuredData.availableLanguages,
  contactType: seo.structuredData.contactType,
  robots: seo.robots,
  sitemap: seo.sitemap,
} as const;
