import { showPackages, showPrices } from "@/lib/content/packages";
import { siteConfig } from "@/lib/site-config";

const name = siteConfig.name;

export type ServicePage = {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  kicker: string;
  title: string;
  intro: string;
  sections: { heading: string; paragraphs: string[]; bullets?: string[] }[];
  showPackages?: boolean;
  faqs: { question: string; answer: string }[];
};

// Search pages for people looking to hire a podcast producer. Each answers one kind of search
// in full, rather than repeating the homepage, so Google has a reason to show it.
const howWeRecord = {
  heading: "Recorded wherever suits you",
  paragraphs: [
    `${name} does not need you to come to a studio. We come to you, anywhere in Malaysia.`,
  ],
  bullets: [
    "At your location: we bring the cameras, microphones and lighting to your office, shop or venue.",
    "We arrange everything: tell us what you need and we sort out the venue, set and schedule.",
  ],
};

export const servicePages: ServicePage[] = [
  {
    slug: "corporate-podcast-production",
    metaTitle: "Corporate Podcast Production in Malaysia",
    metaDescription: `${name} produces corporate podcasts in Malaysia for companies, agencies and government bodies, recorded at your office or anywhere you choose.`,
    kicker: "Corporate podcasts",
    title: "Corporate podcast production in Malaysia",
    intro: "A podcast lets your leaders explain what your organisation does, in their own voice, to clients, partners and staff. We plan, record and edit it so your team only has to show up and talk.",
    sections: [
      {
        heading: "What a corporate podcast is good for",
        paragraphs: ["Organisations use a podcast when written posts are not enough to build trust or explain something complex."],
        bullets: [
          "Thought leadership: show clients how your leaders think before the first meeting.",
          "Internal communication: reach staff across branches with a format they actually finish.",
          "Explaining services or policies: one clear conversation answers questions you otherwise repeat every day.",
          "Events and launches: record panels and talks and turn them into content that lasts.",
        ],
      },
      howWeRecord,
      {
        heading: "What we handle",
        paragraphs: ["You get one team for the whole production, from planning the conversation to files ready to publish."],
        bullets: [
          "Planning the episode, questions and flow",
          "Multi-camera video, microphones and lighting",
          "Full editing, colour grading and subtitles",
          "Short clips for LinkedIn, Instagram, TikTok and YouTube",
          "Custom thumbnails and files ready for each platform",
        ],
      },
    ],
    showPackages: true,
    faqs: [
      { question: "Can you record at our office?", answer: "Yes. On-location recording is included in our packages. We bring the full setup to your office or any venue you choose." },
      { question: "Do you work with government agencies?", answer: "Yes. We produce podcasts for companies, government bodies, SMEs and organisations across Malaysia." },
      { question: "Our leaders are not used to speaking on camera. Can you help?", answer: "Yes. We plan the questions and flow with you beforehand, so speakers talk about what they already know rather than reading a script." },
      { question: "Can you produce a series instead of one episode?", answer: "Yes. Our Monthly Partnership covers regular recording sessions, a dedicated team, photos, social media posts and content planning support." },
    ],
  },
  {
    slug: "video-podcast-production",
    metaTitle: "Video Podcast Production in Malaysia",
    metaDescription: `Video podcast production in Malaysia by ${name}: multi-camera recording, lighting, editing and short clips, recorded at your location anywhere in Malaysia.`,
    kicker: "Video podcasts",
    title: "Video podcast production in Malaysia",
    intro: "Most people now watch podcasts on YouTube, Instagram and TikTok as much as they listen. We record your podcast on multiple cameras and edit it into a full episode plus short clips for every platform.",
    sections: [
      {
        heading: "Why video",
        paragraphs: [
          "A video podcast gives you two things from one recording: a long episode that builds trust with people who watch it in full, and short clips that reach new people on social media.",
          "Seeing the speaker also helps viewers trust them faster than audio alone.",
        ],
      },
      {
        heading: "What a video podcast production includes",
        paragraphs: ["The setup depends on how many people are speaking. Every package includes the following."],
        bullets: [
          "Two to five professional cameras",
          "Wireless microphones for each speaker",
          "Professional lighting",
          "A fully edited episode with colour grading",
          "Short-form videos with social media subtitles",
          "A custom thumbnail",
        ],
      },
      howWeRecord,
    ],
    showPackages: true,
    faqs: [
      { question: "How many cameras do you use?", answer: "Two cameras for one speaker, three for two speakers and five for a panel of up to four." },
      { question: "Do we get short clips for social media?", answer: "Yes. Packages include 10 to 30 short-form videos with subtitles, depending on the package." },
      { question: "Do we need our own studio?", answer: "No. We record at your location, or we arrange a venue for you." },
    ],
  },
  {
    slug: "podcast-production-cost-malaysia",
    metaTitle: "How Much Does Podcast Production Cost in Malaysia?",
    metaDescription: showPrices
      ? `What it costs to produce a podcast in Malaysia, with ${name}'s package prices and what affects the price.`
      : `What affects the cost of producing a podcast in Malaysia, and what ${name}'s packages include.`,
    kicker: "Podcast pricing",
    title: "How much does podcast production cost in Malaysia?",
    intro: `The cost of a podcast depends mostly on how many people speak, how many cameras you need and how much content you want from each recording. ${showPrices ? "Below are our current prices, so you can budget before you talk to anyone." : showPackages ? "Below is what each package includes. Tell us what you need and we will send a quote." : "Tell us what you need and we will suggest the right setup and send a quote."}`,
    sections: [
      {
        heading: "What affects the price",
        paragraphs: ["Three things make the biggest difference to the cost of a podcast."],
        bullets: [
          "Number of speakers: more speakers need more cameras and microphones.",
          "Length of the recording session.",
          "How many short clips you want from each episode.",
        ],
      },
      {
        heading: "What is not extra",
        paragraphs: ["On-location recording is included in every package. Travel charges may apply outside our coverage area, and studio rental is available on request."],
      },
    ],
    showPackages: true,
    faqs: [
      { question: "What is the cheapest way to start a podcast?", answer: showPackages ? "Our Solo package, for one speaker, is the lowest-cost way to get a fully edited video podcast with short clips." : "A single-speaker setup is the lowest-cost way to get a fully edited video podcast with short clips." },
      { question: "Is there a monthly option?", answer: "Yes. The Monthly Partnership is quoted to your schedule and includes regular recording sessions, photos, social media posts and content planning support." },
      { question: "Can you prepare a custom quote?", answer: "Yes. If none of the packages fit, we prepare a custom quotation." },
    ],
  },
];

export const servicePageText = {
  packagesTitle: "Current packages",
  from: "Includes",
  faqTitle: "Questions",
  ctaTitle: "Planning a podcast?",
  ctaText: "Tell us what you want to produce and we will suggest the right setup and quote.",
  ctaButton: "Get a quote",
  morePages: "More about podcast production",
};
