import contactContent from "../content/contact.json";
import faqContent from "../content/faq.json";
import certificationsContent from "../content/home/certifications.json";
import clientsContent from "../content/home/clients.json";
import homeContactContent from "../content/home/contact.json";
import coverageContent from "../content/home/coverage.json";
import footerContent from "../content/home/footer.json";
import heroContent from "../content/home/hero.json";
import processContent from "../content/home/process.json";
import servicesContent from "../content/home/services.json";
import whyTrulabContent from "../content/home/why-trulab.json";
import packagesContent from "../content/packages.json";
import seoContent from "../content/seo.json";
import type { ProductionPackage } from "@/lib/content/packages";
import type { EditableSite } from "@/lib/types/editable-site";

/**
 * CLIENT EDITING FILE
 *
 * Wording, contact details, packages, hero and client images and SEO
 * text live in content/ and are edited from the /keystatic admin panel.
 * Update colours, navigation, tools and status pages from this file.
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

const companyName = "Trulab Studio";
const companyLegalName = "Trulab Production Sdn. Bhd.";
const companyDomain = "trulabstudio.com";

type ServiceIcon = "Camera" | "Clapperboard" | "Mic2" | "Radio" | "Scissors" | "Video";

// Replaces the {company} token used by the admin panel content.
function fill<T>(value: T): T {
  return JSON.parse(JSON.stringify(value).replaceAll("{company}", companyName)) as T;
}

const contact = fill(contactContent);

const company = {
  name: companyName,
  // Parent company that owns the Trulab Studio brand
  legalName: companyLegalName,
  divisionLine: `A division of ${companyLegalName}`,
  slug: "trulab",
  domain: companyDomain,
  websiteUrl: `https://www.${companyDomain}`,

  // ==========================================================
  // 02. CONTACT
  // Search: EDIT CONTACT
  // Edited from the admin panel: content/contact.json
  // ==========================================================
  email: contact.email,
  phoneDisplay: contact.phoneDisplay,
  whatsappNumber: contact.whatsappNumber,
  address: contact.address,
  defaultWhatsAppMessage: contact.defaultWhatsAppMessage,
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
  main: heroContent.image,
} as const;

// Edited from the admin panel: content/home/clients.json
const clientImages = clientsContent.logos;

export const editableSite = {
  company,
  branding,

  images: {
    brand: brandImages,
    pwa: pwaImages,
    social: socialImages,
    hero: heroImages,
    clients: clientImages,
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
  // Edited from the admin panel: content/home/
  homepage: {
    hero: {
      kicker: heroContent.kicker,
      title: heroContent.title,
      description: fill(heroContent.description),
      primaryCta: heroContent.primaryCta,
      secondaryCta: heroContent.secondaryCta,
      image: heroImages.main,
    },
    trustPills: heroContent.trustPills,
    clientLogoMarquee: {
      title: clientsContent.title,
      fallbackNamePrefix: "Client logo slot ",
      fallbackLabelPrefix: "Logo ",
      logos: clientImages,
    },
    services: {
      ...fill(servicesContent),
      items: fill(servicesContent.items) as ReadonlyArray<
        Omit<(typeof servicesContent.items)[number], "icon"> & { icon: ServiceIcon }
      >,
    },
    whyTrulab: fill(whyTrulabContent),
    process: {
      ...fill(processContent),
      stepAriaLabel: "Step",
    },
    certifications: fill(certificationsContent),
    productionCoverage: fill(coverageContent),
    contact: fill(homeContactContent),
    footer: {
      ...fill(footerContent),
      whatsappLabel: "WhatsApp",
      rights: "All rights reserved.",
    },
  },

  // ==========================================================
  // 07. PACKAGES
  // Search: EDIT PACKAGES
  // Edited from the admin panel: content/packages.json
  //
  // IMPORTANT: `id` is permanent technical data.
  // Never change an existing package `id`.
  // Names, prices, wording, features and formLabel are editable.
  // Leave formLabel empty to generate "Name — Price" automatically.
  // ==========================================================
  packages: {
    section: fill(packagesContent.section),
    items: fill(packagesContent.items) as ReadonlyArray<ProductionPackage>,
    notes: packagesContent.notes,
  },

  // ==========================================================
  // 08. FAQ
  // Search: EDIT FAQ
  // Search: EDIT FAQ
  // Edited from the admin panel: content/faq.json
  // ==========================================================
  faq: fill(faqContent),

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
        customer: {
          subject: `We received your enquiry | ${company.name}`,
          heading: "Thank you for your enquiry",
          introduction: `We’ve successfully received your enquiry. The ${company.name} team will review your project details and contact you shortly.`,
          detailsHeading: "Your submitted details",
          correctionNotice: "If any information below is incorrect, simply reply to this email and let us know.",
          signOff: `Thank you,<br><br>Ismul Idzham<br>Managing Director<br><br>${company.name}<br><br>📞 ${company.phoneDisplay}<br>✉️ ${company.email}<br>🌐 <a href="${company.websiteUrl}">${company.websiteUrl}</a><br><br>We help brands, organisations, government bodies, SMEs, and creators<br>plan, record, edit, and publish premium podcasts.`,
        },
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
  // Search: EDIT SEO
  // Titles, description and keywords are edited from the admin panel: content/seo.json
  // ==========================================================
  seo: {
    defaultTitle: fill(seoContent.defaultTitle),
    titleTemplate: `%s | ${company.name}`,
    homepageTitle: seoContent.homepageTitle,
    description: fill(seoContent.description),
    keywords: seoContent.keywords,
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
      disallow: ["/401", "/403", "/500", "/maintenance", "/keystatic"],
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
