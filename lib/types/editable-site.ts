export type EditableImage = {
  src: string;
  alt: string;
};

export type EditableLink = {
  label: string;
  href: string;
};

export type EditableSite = {
  company: {
    name: string;
    slug: string;
    domain: string;
    websiteUrl: string;
    email: string;
    phoneDisplay: string;
    whatsappNumber: string;
    address: string;
    defaultWhatsAppMessage: string;
    socialLinks: ReadonlyArray<EditableLink>;
  };
  branding: {
    colors: {
      primary: string;
      accent: string;
      accentStrong: string;
      accentIcon: string;
      accentText: string;
      background: string;
      surface: string;
      text: string;
      mutedText: string;
      border: string;
      darkSection: string;
      onDark: string;
      buttonPrimaryBackground: string;
      buttonPrimaryHoverBackground: string;
      buttonPrimaryText: string;
      buttonSecondaryBackground: string;
      buttonSecondaryText: string;
      checkerboard: string;
    };
  };
  images: {
    brand: Record<string, EditableImage>;
    pwa: Record<string, EditableImage>;
    social: Record<string, EditableImage>;
    hero: Record<string, EditableImage>;
    clients: ReadonlyArray<EditableImage & { name: string }>;
    production: Record<string, EditableImage>;
  };
  seo: {
    defaultTitle: string;
    titleTemplate: string;
    homepageTitle: string;
    description: string;
    keywords: ReadonlyArray<string>;
    canonicalUrl: string;
    locale: string;
    socialImageAlt: string;
    twitterCard: "summary_large_image";
    structuredData: {
      businessType: string;
      serviceTypes: ReadonlyArray<string>;
      areaServed: { code: string; name: string };
      availableLanguages: ReadonlyArray<string>;
      contactType: string;
    };
    robots: {
      disallow: ReadonlyArray<string>;
    };
    sitemap: ReadonlyArray<{
      path: string;
      changeFrequency: "weekly" | "monthly";
      priority: number;
    }>;
  };
  navigation: {
    navbarLinks: ReadonlyArray<EditableLink>;
    toolLinks: ReadonlyArray<EditableLink>;
    mainCta: EditableLink;
    accessibility: {
      homeSuffix: string;
      toggleNavigation: string;
    };
  };
  homepage: Record<string, unknown>;
  packages: Record<string, unknown>;
  faq: Record<string, unknown>;
  tools: Record<string, unknown>;
  forms: Record<string, unknown>;
  statusPages: Record<string, unknown>;
  marketing: Record<string, unknown>;
};
