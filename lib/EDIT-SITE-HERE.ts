import brandAssets from "../content/brand/assets.json";
import brandColors from "../content/brand/colors.json";
import companyContent from "../content/company.json";
import contactContent from "../content/contact.json";
import cookieBannerContent from "../content/cookie-banner.json";
import faqContent from "../content/faq.json";
import clientsContent from "../content/home/clients.json";
import contactFormContent from "../content/forms/contact.json";
import emailContent from "../content/forms/email.json";
import heroImageContent from "../content/home/hero-image.json";
import heroContent from "../content/home/hero.json";
import otherHomeContent from "../content/home/other.json";
import navigationContent from "../content/navigation.json";
import servicesContent from "../content/home/services.json";
import packagesContent from "../content/packages.json";
import seoContent from "../content/seo.json";
import statusPagesContent from "../content/status-pages.json";
import toolsContent from "../content/tools.json";
import type { ProductionPackage } from "@/lib/content/packages";
import type { EditableSite } from "@/lib/types/editable-site";

/**
 * CLIENT EDITING FILE
 *
 * Company details, wording, images, colours, navigation and SEO text
 * live in content/ and are edited from the /admin panel.
 * This file combines them with the technical settings below.
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

// Edited from the admin panel: content/company.json
const companyName = companyContent.name;
const companyLegalName = companyContent.legalName;
const companyDomain = companyContent.domain;
const companyWebsite = `https://www.${companyDomain}`;

type ServiceIcon = "Camera" | "Clapperboard" | "Mic2" | "Radio" | "Scissors" | "Video";

// Replaces the {company}, {phone}, {email} and {website} tokens used by the admin panel content.
const tokens: Record<string, string> = {
  "{company}": companyName,
  "{phone}": contactContent.phoneDisplay,
  "{email}": contactContent.email,
  "{website}": companyWebsite,
};

function fill<T>(value: T): T {
  let text = JSON.stringify(value);
  for (const [token, replacement] of Object.entries(tokens)) {
    text = text.replaceAll(token, JSON.stringify(replacement).slice(1, -1));
  }
  return JSON.parse(text) as T;
}

const contact = fill(contactContent);

const company = {
  name: companyName,
  // Parent company that owns the Trulab Studio brand
  legalName: companyLegalName,
  divisionLine: `A division of ${companyLegalName}`,
  slug: "trulab",
  domain: companyDomain,
  websiteUrl: companyWebsite,

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
  socialLinks: companyContent.socialLinks as ReadonlyArray<{ label: string; href: string }>,
} as const;

// ============================================================
// 03. BRAND COLOURS
// Search: EDIT BRAND COLOURS
// ============================================================

// Edited from the admin panel: content/brand/colors.json
const branding = {
  colors: brandColors,
} as const;

// ============================================================
// 04. IMAGES
// Search: EDIT IMAGES
// Dimensions and replacement guidance: public/images/IMAGE-SPECS.md
// ============================================================

// Edited from the admin panel: content/brand/assets.json
const brandImages = {
  logoMain: { src: brandAssets.logoMain.src, alt: "" },
  logoWhite: { src: brandAssets.logoWhite.src, alt: "" },
  logoFull: { src: brandAssets.logoFull.src, alt: company.name },
  favicon: { src: brandAssets.favicon.src, alt: `${company.name} favicon` },
} as const;

const pwaImages = {
  icon192: { src: brandAssets.icon192.src, alt: `${company.name} 192 px app icon` },
  icon512: { src: brandAssets.icon512.src, alt: `${company.name} 512 px app icon` },
  maskable512: { src: brandAssets.maskable512.src, alt: `${company.name} maskable app icon` },
} as const;

const socialImages = {
  openGraph: fill(brandAssets.socialImage),
} as const;

const heroImages = {
  main: heroImageContent.image,
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
    // Edited from the admin panel: content/navigation.json
    navbarLinks: fill(navigationContent.navbarLinks),
    toolLinks: fill(navigationContent.toolLinks),
    mainCta: fill(navigationContent.mainCta),
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
      kicker: fill(heroContent.kicker),
      title: fill(heroContent.title),
      description: fill(heroContent.description),
      primaryCta: fill(heroContent.primaryCta),
      secondaryCta: fill(heroContent.secondaryCta),
      image: heroImages.main,
    },
    trustPills: fill(heroContent.trustPills),
    clientLogoMarquee: {
      title: fill(clientsContent.title),
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
    whyTrulab: fill(otherHomeContent.whyTrulab),
    process: {
      ...fill(otherHomeContent.process),
      stepAriaLabel: "Step",
    },
    certifications: fill(otherHomeContent.certifications),
    productionCoverage: fill(otherHomeContent.coverage),
    contact: fill(otherHomeContent.contact),
    footer: {
      ...fill(otherHomeContent.footer),
      whatsappLabel: "WhatsApp",
      rights: "All rights reserved.",
      adminLink: { label: "Admin", href: "/admin" },
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
    notes: fill(packagesContent.notes),
  },

  // ==========================================================
  // 08. FAQ
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
      // Wording is edited from the admin panel: content/forms/contact.json
      fields: fill(contactFormContent.fields),
      // IDs are permanent and are stored in the legacy database `budget` column.
      additionalPackageOptions: [{ id: "others", label: "Others" }],
      emptyValue: "-",
      ...fill({
        submitLabel: contactFormContent.submitLabel,
        turnstileNotice: contactFormContent.turnstileNotice,
        turnstileMissing: contactFormContent.turnstileMissing,
        turnstileRequired: contactFormContent.turnstileRequired,
        submitFallbackError: contactFormContent.submitFallbackError,
        unexpectedError: contactFormContent.unexpectedError,
        success: contactFormContent.success,
        whatsapp: contactFormContent.whatsapp,
        apiMessages: contactFormContent.apiMessages,
      }),
      notificationEmail: {
        fallbackFrom: "Website <onboarding@resend.dev>",
        // Wording is edited from the admin panel: content/forms/email.json
        subjectPrefix: emailContent.team.subjectPrefix,
        heading: emailContent.team.heading,
        customer: fill(emailContent.customer),
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
  // Titles, description and keywords are edited from the admin panel: content/seo.json
  // ==========================================================
  seo: {
    defaultTitle: fill(seoContent.defaultTitle),
    titleTemplate: `%s | ${company.name}`,
    homepageTitle: fill(seoContent.homepageTitle),
    description: fill(seoContent.description),
    keywords: fill(seoContent.keywords),
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
      disallow: ["/401", "/403", "/500", "/maintenance", "/admin"],
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
      page: { path: "/qr-generator", ...fill(toolsContent.qrGenerator) },
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
      page: { path: "/background-remover", ...fill(toolsContent.backgroundRemover) },
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
    // Wording is edited from the admin panel: content/status-pages.json
    common: fill(statusPagesContent.common),
    loading: fill(statusPagesContent.loading),
    error: { code: "500", ...fill(statusPagesContent.error) },
    globalError: { code: "500", ...fill(statusPagesContent.globalError) },
    serverError: { code: "500", ...fill(statusPagesContent.serverError) },
    forbidden: { code: "403", ...fill(statusPagesContent.forbidden) },
    notFound: { code: "404", ...fill(statusPagesContent.notFound) },
    maintenance: fill(statusPagesContent.maintenance),
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
      // Wording is edited from the admin panel: content/cookie-banner.json
      ...fill(cookieBannerContent),
      googleTagManagerTitle: "Google Tag Manager",
    },
  },
} as const satisfies EditableSite;
