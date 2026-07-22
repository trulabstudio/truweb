import type { FaqItem, HomeSectionContent } from "@/lib/types/content";

export const faqContent = { kicker: "FAQ", title: "Questions before starting a podcast project." } satisfies HomeSectionContent;
export const faqs = [
  { question: "Do I need a studio to produce a podcast?", answer: "No. A professional podcast can be produced through a remote, on-location, or flexible recording workflow. Trulab Production helps plan the setup based on your content goals, people, environment, and delivery needs." },
  { question: "Can Trulab Production record at our office or location?", answer: "Yes. Trulab can support on-location podcast recording for companies, organisations, brands, and teams that prefer to record at their own venue or selected location." },
  { question: "Do you produce video podcasts?", answer: "Yes. Trulab produces video podcasts with structured camera, audio, lighting, editing, and delivery workflows for professional publishing." },
  { question: "Can you help with corporate podcasts?", answer: "Yes. Trulab supports corporate podcast Malaysia projects for internal communications, thought leadership, education, brand storytelling, interviews, launches, and campaigns." },
  { question: "Do you provide podcast editing?", answer: "Yes. Podcast editing can include audio cleanup, video editing, pacing, episode assembly, export preparation, and content formatting for publishing platforms." },
  { question: "Can you create Shorts and Reels from podcast episodes?", answer: "Yes. Trulab can repurpose podcast episodes into short-form clips for social media, helping each recording produce more usable content." },
  { question: "Do you support livestream podcasts?", answer: "Yes. Trulab can support livestream podcast workflows for panels, launches, live interviews, brand sessions, and online events." },
  { question: "How do I book a consultation?", answer: "Use the consultation form on this website or contact Trulab Production through WhatsApp. The form prepares your project details so the team can respond with the right next step." },
] satisfies ReadonlyArray<FaqItem>;
