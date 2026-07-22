import { Camera, Clapperboard, Mic2, Radio, Scissors, Video } from "lucide-react";
import type { HomeSectionContent, Service } from "@/lib/types/content";

export const servicesContent = {
  kicker: "Services",
  title: "Podcast production services built around professional delivery.",
  description: "From the first conversation to publish-ready exports, Trulab Production supports the production details that help a podcast sound clear, look polished, and serve its audience.",
} satisfies HomeSectionContent;

export const services = [
  { title: "Podcast Production", description: "End-to-end production support for interview, educational, promotional, and creator-led podcast formats.", icon: Mic2 },
  { title: "Video Podcast", description: "Professional video podcast workflows for brands and organisations that need a strong visual presence.", icon: Video },
  { title: "Multi-camera Recording", description: "Structured multi-angle recording for cleaner edits, better pacing, and more polished final episodes.", icon: Camera },
  { title: "Editing", description: "Audio cleanup, video editing, episode assembly, and delivery-ready exports for publishing channels.", icon: Scissors },
  { title: "Shorts/Reels", description: "Repurpose long-form episodes into short social clips designed for LinkedIn, Instagram, TikTok, and YouTube.", icon: Clapperboard },
  { title: "Livestream Podcast", description: "Live podcast production support for launches, panels, internal communications, and online events.", icon: Radio },
] satisfies ReadonlyArray<Service>;
