import type { SiteConfig } from "@/lib/types/site";

export const siteConfig = {
  name: "Trulab Production",
  slug: "trulab",
  domain: "trulabstudio.com",
  url: "https://trulabstudio.com",
  email: "trulabstudio@gmail.com",
  phoneDisplay: "0176982032",
  whatsapp: "60176982032",
  address: "",
  socialLinks: [],
  title: "Trulab Production | Professional Podcast Production Malaysia",
  description:
    "Trulab Production provides professional podcast production, video podcast, multi-camera recording, editing, Shorts/Reels, and livestream podcast services for brands, organisations, SMEs, creators, and government bodies in Malaysia.",
  assets: {
    logo: "/logo.png",
    logoLight: "/logo-white.png",
    logoFull: "/full-logo.png",
    socialImage: "/og-image.jpg",
  },
} satisfies SiteConfig;

export function buildWhatsAppUrl(message: string) {
  return `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(message)}`;
}

export const defaultWhatsAppMessage =
  "Hi Trulab Production, I’m interested in producing a podcast. Could you share the next steps for a consultation?";
