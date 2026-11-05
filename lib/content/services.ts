import { Aperture, Camera, Clapperboard, Film, Globe, Megaphone, Mic2, PenTool, Radio, Scissors, Sparkles, Video } from "lucide-react";
import { editableSite } from "@/lib/EDIT-SITE-HERE";
import type { HomeSectionContent, Service } from "@/lib/types/content";

const icons = { Aperture, Camera, Clapperboard, Film, Globe, Megaphone, Mic2, PenTool, Radio, Scissors, Sparkles, Video } as const;

const withIcons = (items: ReadonlyArray<{ title: string; description: string; icon: keyof typeof icons }>) =>
  items.map((service) => ({
    title: service.title,
    description: service.description,
    icon: icons[service.icon],
  })) satisfies ReadonlyArray<Service>;

export const servicesContent = editableSite.homepage.services satisfies HomeSectionContent;
export const services = withIcons(editableSite.homepage.services.items);
export const featuredServiceLink = editableSite.homepage.services.featuredLink;

export const podcastServicesContent = editableSite.homepage.podcastServices satisfies HomeSectionContent;
export const podcastServices = withIcons(editableSite.homepage.podcastServices.items);

export const foxduskContent = editableSite.homepage.foxdusk;
