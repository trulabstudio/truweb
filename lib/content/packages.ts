import { editableSite } from "@/lib/EDIT-SITE-HERE";

export type ProductionPackage = {
  id: string;
  number: string;
  layout: "card" | "wide";
  name: string;
  price: string;
  priceSuffix: string;
  description: string;
  features: ReadonlyArray<string>;
  featured: boolean;
  highlightLabel: string;
  closingText: string;
  cta: { label: string; href: string };
  formLabel: string;
  whatsappMessage: string;
};

export const packagesContent = editableSite.packages.section;
export const productionPackages = editableSite.packages.items satisfies ReadonlyArray<ProductionPackage>;
export const packageNotes = editableSite.packages.notes;
