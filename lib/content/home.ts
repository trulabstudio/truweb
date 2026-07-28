import { editableSite } from "@/lib/EDIT-SITE-HERE";
import type { ClientLogo, HomeSectionContent } from "@/lib/types/content";

const { homepage } = editableSite;

export const heroContent = homepage.hero;
export const trustPills = homepage.trustPills;

export const logoMarqueeContent = {
  title: homepage.clientLogoMarquee.title,
  fallbackNamePrefix: homepage.clientLogoMarquee.fallbackNamePrefix,
  fallbackLabelPrefix: homepage.clientLogoMarquee.fallbackLabelPrefix,
  logos: homepage.clientLogoMarquee.logos satisfies ReadonlyArray<ClientLogo>,
};

export const whyTrulabContent = homepage.whyTrulab satisfies HomeSectionContent & {
  points: ReadonlyArray<string>;
};

export const coverageContent = homepage.productionCoverage;
export const contactContent = homepage.contact;
export const footerContent = homepage.footer;
