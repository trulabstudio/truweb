import type { ContentItem, HomeSectionContent } from "@/lib/types/content";

export const processContent = { kicker: "Process", title: "A clear production process from consultation to content delivery." } satisfies HomeSectionContent;

export const processSteps = [
  { title: "Consultation", description: "Clarify goals, format, audience, production requirements, and delivery needs." },
  { title: "Planning", description: "Shape episode structure, flow, talking points, schedule, and technical setup." },
  { title: "Recording", description: "Capture audio and video through remote, on-location, or flexible workflows." },
  { title: "Editing", description: "Refine pacing, clean audio, balance visuals, and prepare publish-ready assets." },
  { title: "Delivery", description: "Export final files in the right formats for platforms, teams, and campaigns." },
  { title: "Repurposing", description: "Turn the strongest moments into Shorts/Reels and supporting content assets." },
] satisfies ReadonlyArray<ContentItem>;
