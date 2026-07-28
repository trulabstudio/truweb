export type SiteConfig = {
  name: string;
  slug: string;
  domain: string;
  url: string;
  email: string;
  phoneDisplay: string;
  whatsapp: string;
  address: string;
  socialLinks: ReadonlyArray<SocialLink>;
  title: string;
  description: string;
  assets: {
    logo: string;
    logoLight: string;
    logoFull: string;
    favicon: string;
    socialImage: string;
  };
};

export type SocialLink = {
  label: string;
  href: string;
};

export type NavigationLink = {
  label: string;
  href: string;
};
