import { Camera, Clapperboard, Mic2, Radio, Scissors, Video } from "lucide-react";
import { editableSite } from "@/lib/EDIT-SITE-HERE";
import type { HomeSectionContent, Service } from "@/lib/types/content";

const icons = { Camera, Clapperboard, Mic2, Radio, Scissors, Video } as const;

export const servicesContent = editableSite.homepage.services satisfies HomeSectionContent;
export const services = editableSite.homepage.services.items.map((service) => ({
  title: service.title,
  description: service.description,
  icon: icons[service.icon],
})) satisfies ReadonlyArray<Service>;
