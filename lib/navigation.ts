import type { NavigationLink } from "@/lib/types/site";

export const navLinks = [
  { label: "Services", href: "#services" },
  { label: "Why Trulab", href: "#why-trulab" },
  { label: "Process", href: "#process" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
] satisfies ReadonlyArray<NavigationLink>;

export const toolLinks = [
  { label: "QR Generator", href: "/qr-generator" },
  { label: "BG Remover", href: "/background-remover" },
] satisfies ReadonlyArray<NavigationLink>;

export const navigationCta = { label: "Book Consultation", href: "/#contact" } satisfies NavigationLink;
