import type { ClientLogo, HomeSectionContent } from "@/lib/types/content";

export const heroContent = {
  kicker: "Podcast production for professional teams",
  title: "Professional Podcasts, Produced Properly.",
  description: "Trulab Production helps brands, organisations, government bodies, SMEs, and creators plan, record, edit, and publish polished podcasts without needing a fixed studio visit.",
  primaryCta: { label: "Book Consultation", href: "#contact" },
  secondaryCta: { label: "View Services", href: "#services" },
  image: { src: "/og-image.jpg", alt: "Professional podcast production setup" },
};

export const trustPills = ["Remote recording", "On-location setup", "Multi-camera video", "Editing & clips"];

export const logoMarqueeContent = {
  title: "Trusted production workflow for professional podcast projects",
  logos: [
    { name: "Client logo slot 01", src: "/clients/client-01.svg" },
    { name: "Client logo slot 02", src: "/clients/client-02.svg" },
    { name: "Client logo slot 03", src: "/clients/client-03.svg" },
    { name: "Client logo slot 04", src: "/clients/client-04.svg" },
    { name: "Client logo slot 05", src: "/clients/client-05.svg" },
    { name: "Client logo slot 06", src: "/clients/client-06.svg" },
  ] satisfies ReadonlyArray<ClientLogo>,
};

export const whyTrulabContent = {
  kicker: "Why Trulab",
  title: "A flexible production partner for serious podcast projects.",
  description: "Premium podcast production does not depend on visitors coming to a fixed studio. It depends on planning, technical control, clean capture, careful editing, and a workflow that fits the client.",
  points: [
    "Professional podcast production workflow from planning to final delivery.",
    "Built for government bodies, SMEs, private companies, brands, creators, and organisations.",
    "Flexible remote, on-location, and client-site recording workflows without requiring a studio visit.",
    "Multi-camera video podcast capability for corporate and creator-led formats.",
    "Content repurposing for Shorts/Reels and social distribution.",
    "Clean audio, clean visuals, and clean storytelling for audience trust.",
    "Suitable for corporate, educational, promotional, interview, and branded content podcasts.",
  ],
} satisfies HomeSectionContent & { points: ReadonlyArray<string> };

export const coverageContent = {
  kicker: "Malaysia-wide production support",
  title: "A production workflow that adapts to your team.",
  paragraphs: [
    "Whether you are based in Kuala Lumpur, Selangor, Putrajaya, Johor, Penang, Sabah, Sarawak or anywhere across Malaysia, Trulab Production supports professional podcast projects for organisations that want high-quality audio, video, editing, and content delivery.",
    "Teams searching for podcast production Malaysia, podcast producer Malaysia, video podcast Malaysia, corporate podcast Malaysia, podcast editing Malaysia, podcast recording Malaysia, podcast agency Malaysia, or a podcast production company Malaysia can work with Trulab through remote, on-location, and flexible production workflows.",
  ],
};

export const contactContent = {
  kicker: "Start the workflow",
  title: "Book a Podcast Production Consultation",
  description: "Tell us what you want to produce, who it is for, and how you want to record. Trulab Production will help shape the right production workflow for your team.",
};

export const footerContent = {
  description: "Professional podcast production, video podcast, editing, Shorts/Reels, and livestream podcast workflows for brands, organisations, SMEs, creators, and government bodies in Malaysia.",
  domainNote: "Metadata is centralised in constants for future updates.",
  rights: "All rights reserved.",
};
