import type { LucideIcon } from "lucide-react";

export type Service = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type ContentItem = {
  title: string;
  description: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type ClientLogo = {
  name: string;
  src: string;
  alt: string;
};

export type HomeSectionContent = {
  kicker: string;
  title: string;
  description?: string;
};
