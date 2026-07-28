import type { EditableSite } from "@/lib/types/editable-site";

/**
 * CLIENT EDITING FILE
 *
 * Update website wording, images, links, contact information,
 * packages, colours and SEO from this file.
 *
 * Do not edit components unless changing the website design.
 */

/**
 * CONTENTS
 *
 * 01 COMPANY
 * 02 CONTACT
 * 03 BRAND COLOURS
 * 04 IMAGES
 * 05 NAVIGATION
 * 06 HOMEPAGE
 * 07 PACKAGES
 * 08 FAQ
 * 09 CONTACT FORM
 * 10 SEO
 * 11 TOOLS
 * 12 STATUS PAGES
 * 13 MARKETING
 */

// ============================================================
// 01. COMPANY
// Search: EDIT COMPANY
// ============================================================

const companyName = "Trulab Production";
const companyDomain = "truweb.vercel.app";

const company = {
  name: companyName,
  slug: "trulab",
  domain: companyDomain,
  websiteUrl: `https://${companyDomain}`,

  // ==========================================================
  // 02. CONTACT
  // Search: EDIT CONTACT
  // ==========================================================
  email: "trulabstudio@gmail.com",
  phoneDisplay: "0176982032",
  whatsappNumber: "60176982032",
  address: "",
  defaultWhatsAppMessage:
    `Hi ${companyName}, I’m interested in producing a podcast. Could you share the next steps for a consultation?`,
  socialLinks: [],
} as const;

// ============================================================
// 03. BRAND COLOURS
// Search: EDIT BRAND COLOURS
// ============================================================

const branding = {
  colors: {
    primary: "#171717",
    accent: "#bfd730",
    accentStrong: "#9db514",
    accentIcon: "#8fa30f",
    accentText: "#738600",
    background: "#f8fbfd",
    surface: "#ffffff",
    text: "#171717",
    mutedText: "#5f666d",
    border: "#171717",
    darkSection: "#171717",
    onDark: "#ffffff",
    buttonPrimaryBackground: "#171717",
    buttonPrimaryHoverBackground: "#000000",
    buttonPrimaryText: "#ffffff",
    buttonSecondaryBackground: "#ffffff",
    buttonSecondaryText: "#171717",
    checkerboard: "#eef1f3",
  },
} as const;

// ============================================================
// 04. IMAGES
// Search: EDIT IMAGES
// Dimensions and replacement guidance: public/images/IMAGE-SPECS.md
// ============================================================

const brandImages = {
  logoMain: {
    src: "/images/brand/logo-main.png",
    alt: "",
  },
  logoWhite: {
    src: "/images/brand/logo-white.png",
    alt: "",
  },
  logoFull: {
    src: "/images/brand/logo-full.png",
    alt: company.name,
  },
  favicon: {
    src: "/images/brand/favicon.png",
    alt: `${company.name} favicon`,
  },
} as const;

const pwaImages = {
  icon192: {
    src: "/images/brand/pwa-icon-192.png",
    alt: `${company.name} 192 px app icon`,
  },
  icon512: {
    src: "/images/brand/pwa-icon-512.png",
    alt: `${company.name} 512 px app icon`,
  },
  maskable512: {
    src: "/images/brand/pwa-maskable-512.png",
    alt: `${company.name} maskable app icon`,
  },
} as const;

const socialImages = {
  openGraph: {
    src: "/images/social/social-og-image.jpg",
    alt: `${company.name} professional podcast production Malaysia`,
  },
} as const;

const heroImages = {
  main: {
    src: "/images/hero/hero-founder-cinematic.png",
    alt: "Founder speaking during a cinematic multi-camera podcast interview",
  },
  founderAlternativeOne: {
    src: "/images/hero/hero-founder-cinematic-alt-01.png",
    alt: "Founder speaking in a cinematic podcast interview",
  },
  founderAlternativeTwo: {
    src: "/images/hero/hero-founder-cinematic-alt-02.png",
    alt: "Founder speaking into a podcast microphone during an interview",
  },
  podcastProductionAlternative: {
    src: "/images/hero/hero-podcast-production.png",
    alt: "Professional two-person podcast production setup",
  },
} as const;

const clientImages = [
  {
    name: "Client logo slot 01",
    src: "/images/clients/client-01.svg",
    alt: "Client logo slot 01",
  },
  {
    name: "Client logo slot 02",
    src: "/images/clients/client-02.svg",
    alt: "Client logo slot 02",
  },
  {
    name: "Client logo slot 03",
    src: "/images/clients/client-03.svg",
    alt: "Client logo slot 03",
  },
  {
    name: "Client logo slot 04",
    src: "/images/clients/client-04.svg",
    alt: "Client logo slot 04",
  },
  {
    name: "Client logo slot 05",
    src: "/images/clients/client-05.svg",
    alt: "Client logo slot 05",
  },
  {
    name: "Client logo slot 06",
    src: "/images/clients/client-06.svg",
    alt: "Client logo slot 06",
  },
] as const;

const productionImages = {
  equipment: {
    src: "/images/production/production-equipment.png",
    alt: "Podcast microphones, headphones and professional video camera equipment",
  },
} as const;

export const editableSite = {
  company,
  branding,

  images: {
    brand: brandImages,
    pwa: pwaImages,
    social: socialImages,
    hero: heroImages,
    clients: clientImages,
    production: productionImages,
  },

  // ==========================================================
  // 05. NAVIGATION
  // Search: EDIT NAVIGATION
  // ==========================================================
  navigation: {
    navbarLinks: [
      { label: "Services", href: "#services" },
      { label: "Packages", href: "#packages" },
      { label: "Why Trulab", href: "#why-trulab" },
      { label: "Process", href: "#process" },
      { label: "FAQ", href: "#faq" },
      { label: "Contact", href: "#contact" },
    ],
    toolLinks: [
      { label: "QR Generator", href: "/qr-generator" },
      { label: "BG Remover", href: "/background-remover" },
    ],
    mainCta: { label: "Book Consultation", href: "/#contact" },
    accessibility: {
      homeSuffix: "home",
      toggleNavigation: "Toggle navigation",
    },
  },

  // ==========================================================
  // 06. HOMEPAGE
  // Search: EDIT HOMEPAGE
  // ==========================================================
  homepage: {
    hero: {
      kicker: "Podcast production for professional teams",
      title: "Professional Podcasts, Produced Properly.",
      description:
        `${company.name} helps brands, organisations, government bodies, SMEs, and creators plan, record, edit, and publish polished podcasts without needing a fixed studio visit.`,
      primaryCta: { label: "Book Consultation", href: "#contact" },
      secondaryCta: { label: "View Services", href: "#services" },
      image: heroImages.main,
    },
    trustPills: ["Remote recording", "On-location setup", "Multi-camera video", "Editing & clips"],
    clientLogoMarquee: {
      title: "Trusted production workflow for professional podcast projects",
      fallbackNamePrefix: "Client logo slot ",
      fallbackLabelPrefix: "Logo ",
      logos: clientImages,
    },
    services: {
      kicker: "Services",
      title: "Podcast production services built around professional delivery.",
      description:
        `From the first conversation to publish-ready exports, ${company.name} supports the production details that help a podcast sound clear, look polished, and serve its audience.`,
      items: [
        {
          title: "Podcast Production",
          description:
            "End-to-end production support for interview, educational, promotional, and creator-led podcast formats.",
          icon: "Mic2",
        },
        {
          title: "Video Podcast",
          description:
            "Professional video podcast workflows for brands and organisations that need a strong visual presence.",
          icon: "Video",
        },
        {
          title: "Multi-camera Recording",
          description:
            "Structured multi-angle recording for cleaner edits, better pacing, and more polished final episodes.",
          icon: "Camera",
        },
        {
          title: "Editing",
          description:
            "Audio cleanup, video editing, episode assembly, and delivery-ready exports for publishing channels.",
          icon: "Scissors",
        },
        {
          title: "Shorts/Reels",
          description:
            "Repurpose long-form episodes into short social clips designed for LinkedIn, Instagram, TikTok, and YouTube.",
          icon: "Clapperboard",
        },
        {
          title: "Livestream Podcast",
          description:
            "Live podcast production support for launches, panels, internal communications, and online events.",
          icon: "Radio",
        },
      ],
    },
    whyTrulab: {
      kicker: "Why Trulab",
      title: "A flexible production partner for serious podcast projects.",
      description:
        "Premium podcast production does not depend on visitors coming to a fixed studio. It depends on planning, technical control, clean capture, careful editing, and a workflow that fits the client.",
      points: [
        "Professional podcast production workflow from planning to final delivery.",
        "Built for government bodies, SMEs, private companies, brands, creators, and organisations.",
        "Flexible remote, on-location, and client-site recording workflows without requiring a studio visit.",
        "Multi-camera video podcast capability for corporate and creator-led formats.",
        "Content repurposing for Shorts/Reels and social distribution.",
        "Clean audio, clean visuals, and clean storytelling for audience trust.",
        "Suitable for corporate, educational, promotional, interview, and branded content podcasts.",
      ],
    },
    process: {
      kicker: "Process",
      title: "A clear production process from consultation to content delivery.",
      stepAriaLabel: "Step",
      items: [
        {
          title: "Consultation",
          description: "Clarify goals, format, audience, production requirements, and delivery needs.",
        },
        {
          title: "Planning",
          description: "Shape episode structure, flow, talking points, schedule, and technical setup.",
        },
        {
          title: "Recording",
          description: "Capture audio and video through remote, on-location, or flexible workflows.",
        },
        {
          title: "Editing",
          description: "Refine pacing, clean audio, balance visuals, and prepare publish-ready assets.",
        },
        {
          title: "Delivery",
          description: "Export final files in the right formats for platforms, teams, and campaigns.",
        },
        {
          title: "Repurposing",
          description: "Turn the strongest moments into Shorts/Reels and supporting content assets.",
        },
      ],
    },
    certifications: {
      kicker: "Registrations & Industry Recognition",
      title: "Structured for professional and corporate procurement conversations.",
      items: [
        { title: "MOF", description: "Registration" },
        { title: "FINAS", description: "Industry recognition" },
        { title: "FDAM", description: "Industry recognition" },
      ],
    },
    productionCoverage: {
      kicker: "Malaysia-wide production support",
      title: "A production workflow that adapts to your team.",
      paragraphs: [
        `Whether you are based in Kuala Lumpur, Selangor, Putrajaya, Johor, Penang, Sabah, Sarawak or anywhere across Malaysia, ${company.name} supports professional podcast projects for organisations that want high-quality audio, video, editing, and content delivery.`,
        `Teams searching for podcast production Malaysia, podcast producer Malaysia, video podcast Malaysia, corporate podcast Malaysia, podcast editing Malaysia, podcast recording Malaysia, podcast agency Malaysia, or a podcast production company Malaysia can work with Trulab through remote, on-location, and flexible production workflows.`,
      ],
    },
    contact: {
      kicker: "Start the workflow",
      title: "Book a Podcast Production Consultation",
      description:
        `Tell us what you want to produce, who it is for, and how you want to record. ${company.name} will help shape the right production workflow for your team.`,
    },
    footer: {
      description:
        "Professional podcast production, video podcast, editing, Shorts/Reels, and livestream podcast workflows for brands, organisations, SMEs, creators, and government bodies in Malaysia.",
      domainLabel: "Domain",
      domainNote: "Metadata is centralised in constants for future updates.",
      whatsappLabel: "WhatsApp",
      rights: "All rights reserved.",
    },
  },

  // ==========================================================
  // 07. PACKAGES
  // Search: EDIT PACKAGES
  //
  // IMPORTANT: `id` is permanent technical data.
  // Never change an existing package `id`.
  // Names, prices, wording, features and formLabel are editable.
  // Leave formLabel empty to generate "Name — Price" automatically.
  // ==========================================================
  packages: {
    section: {
      kicker: "Production packages",
      title: "Choose the setup that fits your conversation.",
      description:
        "Choose the production that fits your podcast. Need recurring content? Our Monthly Partnership is built for brands producing podcasts consistently.",
    },
    items: [
      {
        id: "solo",
        number: "01",
        layout: "card",
        name: "Solo",
        price: "RM2,800",
        priceSuffix: "",
        description: "For personal branding & solo podcast.",
        features: [
          "1 Speaker",
          "2 Professional Cameras",
          "1 Wireless Microphone",
          "Professional Lighting Setup",
          "Up to 2 Hours On-site Recording",
          "Fully Edited Podcast Episode",
          "10 Short-form Videos",
          "Color Grading",
          "Social Media Subtitles",
          "Custom Thumbnail",
        ],
        featured: false,
        highlightLabel: "",
        closingText: "",
        cta: { label: "Request Quote", href: "#contact" },
        formLabel: "",
        whatsappMessage: `Hi ${company.name}, I’m interested in the Solo podcast package.`,
      },
      {
        id: "duo",
        number: "02",
        layout: "card",
        name: "Duo",
        price: "RM4,200",
        priceSuffix: "",
        description: "For interviews & business conversations.",
        features: [
          "Up to 2 Speakers",
          "3 Professional Cameras",
          "2 Wireless Microphones",
          "Professional Lighting Setup",
          "Up to 2 Hours On-site Recording",
          "Fully Edited Podcast Episode",
          "20 Short-form Videos",
          "Color Grading",
          "Social Media Subtitles",
          "Custom Thumbnail",
        ],
        featured: true,
        highlightLabel: "Most Popular",
        closingText: "",
        cta: { label: "Request Quote", href: "#contact" },
        formLabel: "",
        whatsappMessage: `Hi ${company.name}, I’m interested in the Duo podcast package.`,
      },
      {
        id: "panel",
        number: "03",
        layout: "card",
        name: "Panel",
        price: "RM6,500",
        priceSuffix: "",
        description: "For panel discussions & corporate podcasts.",
        features: [
          "Up to 4 Speakers",
          "5 Professional Cameras",
          "4 Wireless Microphones",
          "Professional Lighting Setup",
          "Up to 3 Hours On-site Recording",
          "Fully Edited Podcast Episode",
          "30 Short-form Videos",
          "Color Grading",
          "Social Media Subtitles",
          "Custom Thumbnail",
        ],
        featured: false,
        highlightLabel: "",
        closingText: "",
        cta: { label: "Request Quote", href: "#contact" },
        formLabel: "",
        whatsappMessage: `Hi ${company.name}, I’m interested in the Panel podcast package.`,
      },
      {
        id: "monthly-partnership",
        number: "04",
        layout: "wide",
        name: "Monthly Partnership",
        price: "Custom Quote",
        priceSuffix: "",
        description: "For brands producing podcasts consistently.",
        features: [
          "Weekly or Monthly Recording Sessions",
          "Dedicated Production Team",
          "Multi-Camera Production",
          "Full Podcast Editing",
          "Social Media Repurposing",
          "Priority Scheduling",
          "Content Planning Support",
          "Flexible Deliverables",
        ],
        featured: false,
        highlightLabel: "",
        closingText: "Let’s build your content system.",
        cta: { label: "Schedule a Call", href: "#contact" },
        formLabel: "Monthly Partnership",
        whatsappMessage: `Hi ${company.name}, I’m interested in a Monthly Partnership.`,
      },
    ],
    notes: [
      "On-location recording included (Klang Valley).",
      "Studio rental available upon request.",
      "Travel charges may apply outside coverage area.",
      "Need something different? We'll prepare a custom quotation.",
    ],
  },

  // ==========================================================
  // 08. FAQ
  // Search: EDIT FAQ
  // ==========================================================
  faq: {
    kicker: "FAQ",
    title: "Questions before starting a podcast project.",
    items: [
      {
        question: "Do I need a studio to produce a podcast?",
        answer:
          `No. A professional podcast can be produced through a remote, on-location, or flexible recording workflow. ${company.name} helps plan the setup based on your content goals, people, environment, and delivery needs.`,
      },
      {
        question: `Can ${company.name} record at our office or location?`,
        answer:
          "Yes. Trulab can support on-location podcast recording for companies, organisations, brands, and teams that prefer to record at their own venue or selected location.",
      },
      {
        question: "Do you produce video podcasts?",
        answer:
          "Yes. Trulab produces video podcasts with structured camera, audio, lighting, editing, and delivery workflows for professional publishing.",
      },
      {
        question: "Can you help with corporate podcasts?",
        answer:
          "Yes. Trulab supports corporate podcast Malaysia projects for internal communications, thought leadership, education, brand storytelling, interviews, launches, and campaigns.",
      },
      {
        question: "Do you provide podcast editing?",
        answer:
          "Yes. Podcast editing can include audio cleanup, video editing, pacing, episode assembly, export preparation, and content formatting for publishing platforms.",
      },
      {
        question: "Can you create Shorts and Reels from podcast episodes?",
        answer:
          "Yes. Trulab can repurpose podcast episodes into short-form clips for social media, helping each recording produce more usable content.",
      },
      {
        question: "Do you support livestream podcasts?",
        answer:
          "Yes. Trulab can support livestream podcast workflows for panels, launches, live interviews, brand sessions, and online events.",
      },
      {
        question: "How do I book a consultation?",
        answer:
          `Use the consultation form on this website or contact ${company.name} through WhatsApp. The form prepares your project details so the team can respond with the right next step.`,
      },
    ],
  },

  // ==========================================================
  // 09. CONTACT FORM
  // Search: EDIT CONTACT FORM
  // ==========================================================
  forms: {
    contact: {
      fields: {
        name: { label: "Name", placeholder: "" },
        company: { label: "Company", placeholder: "" },
        email: { label: "Email", placeholder: "" },
        phone: { label: "Phone", placeholder: "" },
        packageInterest: { label: "Package Interest", placeholder: "Select a package" },
        message: { label: "Message", placeholder: "" },
      },
      // IDs are permanent and are stored in the legacy database `budget` column.
      additionalPackageOptions: [{ id: "others", label: "Others" }],
      emptyValue: "-",
      submitLabel: "Book Consultation",
      turnstileNotice: "Protected by Cloudflare Turnstile.",
      turnstileMissing: "Anti-spam is not configured yet.",
      turnstileRequired: "Please complete the anti-spam check before submitting.",
      submitFallbackError: "Unable to submit your enquiry.",
      unexpectedError: "Something went wrong. Please try again.",
      success: "Thank you. Your enquiry has been saved and WhatsApp is opening now.",
      whatsapp: {
        introduction: `Hi ${company.name}, I'd like to book a podcast production consultation.`,
        detailsHeading: "My details:",
        projectLabel: "Project message",
        closing: "Please let me know the next step. Thank you.",
      },
      apiMessages: {
        invalidRequest: "Invalid request.",
        submissionRejected: "Submission rejected.",
        invalidFields: "Please check the required fields.",
        antiSpamUnavailable: "Anti-spam verification is unavailable.",
        antiSpamFailed: "Anti-spam verification failed. Please try again.",
        storageUnavailable: "Lead storage is not configured.",
        saveFailed: "Unable to save your enquiry. Please try again.",
        submitFailed: "Unable to submit your enquiry. Please try again.",
      },
      notificationEmail: {
        fallbackFrom: "Website <onboarding@resend.dev>",
        subjectPrefix: "New website lead",
        heading: "New website enquiry",
        labels: {
          name: "Name",
          company: "Company",
          email: "Email",
          phone: "Phone",
          packageInterest: "Package Interest",
          message: "Message",
        },
        emptyValue: "-",
      },
    },
  },

  // ==========================================================
  // 10. SEO
  // Search: EDIT SEO
  // ==========================================================
  seo: {
    defaultTitle: `${company.name} | Professional Podcast Production Malaysia`,
    titleTemplate: `%s | ${company.name}`,
    homepageTitle: "Professional Podcast Production Malaysia",
    description:
      `${company.name} provides professional podcast production, video podcast, multi-camera recording, editing, Shorts/Reels, and livestream podcast services for brands, organisations, SMEs, creators, and government bodies in Malaysia.`,
    keywords: [
      "podcast production Malaysia",
      "podcast producer Malaysia",
      "video podcast Malaysia",
      "corporate podcast Malaysia",
      "podcast editing Malaysia",
      "podcast recording Malaysia",
      "podcast agency Malaysia",
      "podcast production company Malaysia",
    ],
    canonicalUrl: company.websiteUrl,
    locale: "en_MY",
    socialImageAlt: socialImages.openGraph.alt,
    twitterCard: "summary_large_image",
    structuredData: {
      businessType: "ProfessionalService",
      serviceTypes: [
        "Podcast Production",
        "Video Podcast Production",
        "Podcast Editing",
        "Multi-camera Recording",
        "Livestream Podcast Production",
      ],
      areaServed: { code: "MY", name: "Malaysia" },
      availableLanguages: ["English", "Malay"],
      contactType: "consultation",
    },
    robots: {
      disallow: ["/401", "/403", "/500", "/maintenance"],
    },
    sitemap: [
      { path: "", changeFrequency: "weekly", priority: 1 },
      { path: "/qr-generator", changeFrequency: "monthly", priority: 0.7 },
      { path: "/background-remover", changeFrequency: "monthly", priority: 0.7 },
    ],
  },

  // ==========================================================
  // 11. TOOLS
  // Search: EDIT TOOLS
  // ==========================================================
  tools: {
    qrGenerator: {
      page: {
        path: "/qr-generator",
        title: "QR Generator",
        description:
          "Generate downloadable PNG, JPG, and SVG QR codes for campaign links, event pages, registration forms, and podcast URLs.",
        socialDescription:
          "Generate downloadable QR codes for campaign links, event pages, registration forms, and podcast URLs.",
        socialImageAlt: `${company.name} QR generator utility`,
        kicker: "Trulab utility",
        heading: "Generate QR Codes for Production Links",
        introduction:
          "Create QR codes for proposals, registration pages, show notes, campaign URLs, and client-facing materials. Preview first, then download in the format you need.",
      },
      interface: {
        title: "QR Generator",
        description:
          "Convert campaign links, event pages, registration forms, and podcast URLs into downloadable QR codes.",
        emptyError: "Enter a link first.",
        generateError: "Failed to generate QR code.",
        downloadError: "Failed to download QR code.",
        prepareJpgError: "Failed to prepare JPG file.",
        noLoginLabel: "No login required",
        linkLabel: "Link",
        formatLabel: "Format",
        resolutionLabel: "Resolution",
        transparentBackgroundLabel: "Transparent background",
        generatingLabel: "Generating...",
        generateLabel: "Generate QR",
        downloadLabel: "Download",
        previewAriaLabel: "Generated QR preview",
        previewEmptyLabel: "QR preview appears here",
        correctionHelper: "High correction level is enabled for cleaner scanning on printed materials.",
        formats: { png: "PNG", jpg: "JPG", svg: "SVG" },
        resolutions: [
          { value: 1024, label: "1024 px" },
          { value: 2048, label: "2048 px" },
          { value: 4096, label: "4096 px" },
        ],
      },
    },
    backgroundRemover: {
      page: {
        path: "/background-remover",
        title: "Background Remover",
        description:
          `Remove image backgrounds and export production-ready PNG, WEBP, or JPEG assets with ${company.name}'s browser-based tool.`,
        socialDescription:
          `Remove image backgrounds and export production-ready PNG, WEBP, or JPEG assets with ${company.name}'s browser-based tool.`,
        socialImageAlt: `${company.name} background remover utility`,
        kicker: "Trulab utility",
        heading: "Remove Backgrounds for Production Assets",
        introduction:
          "Prepare clean thumbnails, speaker profile images, product visuals, and campaign assets directly in the browser. Upload an image, remove the background, adjust export settings, and download.",
      },
      interface: {
        title: "Background Remover",
        description:
          "Remove image backgrounds in-browser, then export with transparent, solid color, shadow, and size settings.",
        uploadLabel: "Upload image",
        uploadHelper: "PNG, JPG, or WEBP up to 15MB. Drag and drop supported.",
        chooseFileLabel: "Choose File",
        removeLabel: "Remove Background",
        regenerateLabel: "Generate Again",
        downloadLabel: "Download",
        processingLabel: "Processing...",
        originalLabel: "Original",
        resultLabel: "Result",
        exportSettingsLabel: "Export Settings",
        processingImageLabel: "Processing image...",
        removedImageAlt: "Removed background",
        fileSizeUnit: "KB",
        presets: [
          { name: "Original", size: "original" },
          { name: "Instagram", size: "custom", width: 1080, height: 1080 },
          { name: "Profile", size: "custom", width: 512, height: 512 },
          { name: "Banner", size: "custom", width: 1920, height: 1080 },
          { name: "4K Square", size: "custom", width: 4096, height: 4096 },
        ],
        fields: {
          size: "Size",
          format: "Format",
          background: "Background",
          shadow: "Shadow",
          quality: "Quality",
          width: "Width",
          height: "Height",
          keepAspectRatio: "Keep aspect ratio",
          backgroundColor: "Background color",
          contrast: "Contrast",
          brightness: "Brightness",
          saturation: "Saturation",
        },
        options: {
          original: "Original",
          small: "Small 512px",
          medium: "Medium 1024px",
          large: "Large 2048px",
          custom: "Custom",
          png: "PNG",
          webp: "WEBP",
          jpeg: "JPEG",
          transparent: "Transparent",
          solidColor: "Solid color",
          none: "None",
          soft: "Soft",
          studio: "Studio",
          floating: "Floating",
        },
        progress: {
          loadingAiModel: "Loading AI model...",
          loadingModel: "Loading model",
          removingBackground: "Removing background...",
        },
        errors: {
          invalidImage: "Please upload a valid image file.",
          imageTooLarge: "Image is too large. Maximum file size is 15MB.",
          uploadFirst: "Upload an image first.",
          removeFailed: "Failed to remove background. Please try another image.",
          prepareFailed: "Failed to prepare image.",
          exportFailed: "Failed to export image.",
          downloadFailed: "Failed to download image.",
        },
      },
    },
  },

  // ==========================================================
  // 12. STATUS PAGES
  // Search: EDIT STATUS PAGES
  // ==========================================================
  statusPages: {
    common: {
      backToHomepage: "Back to homepage",
      tryAgain: "Try again",
    },
    loading: {
      title: `Loading ${company.name}.`,
      description: "Preparing the page and production tools.",
    },
    error: {
      code: "500",
      title: "Something went wrong.",
      description:
        "The page could not finish loading. Try again, or return to the homepage if the issue continues.",
    },
    globalError: {
      code: "500",
      title: "Critical application error.",
      description: "The application shell could not render. Try loading the site again.",
    },
    serverError: {
      code: "500",
      title: "Internal server error.",
      description:
        "The server could not complete this request. Please try again later or return to the homepage.",
    },
    forbidden: {
      metadataTitle: "403 Forbidden",
      metadataDescription: `Access to this ${company.name} page is restricted.`,
      code: "403",
      title: "Access is restricted.",
      description: "You do not have permission to view this page.",
    },
    notFound: {
      metadataTitle: "404 Not Found",
      metadataDescription: `The page you are looking for could not be found on ${company.name}.`,
      code: "404",
      title: "Page not found.",
      description:
        `The page may have moved, expired, or been typed incorrectly. Return to the homepage to continue browsing ${company.name}.`,
    },
    maintenance: {
      metadataTitle: "Maintenance",
      metadataDescription: `${company.name} is temporarily offline for maintenance.`,
      title: "Site maintenance in progress.",
      description:
        `${company.name} is temporarily offline while updates are being completed. Please check again shortly.`,
    },
    api: {
      unauthorized: "Unauthorized",
      healthCheckUnavailable: "Supabase health check is not configured.",
      healthCheckFailed: "Supabase health check failed.",
      healthCheckRequestFailed: "Supabase health check request failed.",
    },
  },

  // ==========================================================
  // 13. MARKETING
  // Search: EDIT MARKETING
  // ==========================================================
  marketing: {
    consent: {
      storageKey: "trulab_marketing_consent",
      message:
        `${company.name} uses optional marketing pixels to measure campaigns. You can accept or reject ad tracking.`,
      rejectLabel: "Reject",
      acceptLabel: "Accept",
      googleTagManagerTitle: "Google Tag Manager",
    },
  },
} as const satisfies EditableSite;
