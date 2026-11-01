type TextFormat = "link" | "webUrl" | "email" | "whatsapp" | "domain";

// Keep in sync with the site: tests compare these with the rendered sections and routes.
export const homepageAnchors = ["services", "packages", "why-trulab", "process", "faq", "contact"];
export const siteRoutes = ["/", "/qr-generator", "/background-remover"];
const allowedTokens = ["{company}", "{phone}", "{email}", "{website}"];

function formatError(format: TextFormat, value: string) {
  const webUrl = /^https?:\/\/[^\s/]+\.[^\s]+$/i.test(value);
  switch (format) {
    case "webUrl":
      return webUrl ? null : "use a full https:// address.";
    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : "enter a valid email address.";
    case "whatsapp":
      return /^[1-9]\d{7,14}$/.test(value) ? null : "use digits only with the country code, for example 60123456789.";
    case "domain":
      return /^(?!www\.)[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(value) ? null : "enter the domain only, for example example.com, without https:// or www.";
    case "link": {
      if (webUrl) return null;
      const anchor = value.match(/^\/?#(.+)$/)?.[1];
      if (anchor) return homepageAnchors.includes(anchor) ? null : `#${anchor} is not a homepage section. Use ${homepageAnchors.map((id) => `#${id}`).join(", ")}.`;
      return siteRoutes.includes(value) ? null : `this page does not exist. Use a homepage section, ${siteRoutes.join(", ")} or a full https:// address.`;
    }
  }
}

function relativeLuminance(hex: string) {
  const channels = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16) / 255);
  const [red, green, blue] = channels.map((channel) => (channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4));
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(first: string, second: string) {
  const [lighter, darker] = [relativeLuminance(first), relativeLuminance(second)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

// 4.5:1 is the WCAG AA minimum for normal text; 3:1 applies to large text such as accent prices.
const contrastPairs: [string, string, string, string, number][] = [
  ["text", "background", "Text", "Page background", 4.5],
  ["text", "surface", "Text", "Card background", 4.5],
  ["mutedText", "background", "Secondary text", "Page background", 4.5],
  ["mutedText", "surface", "Secondary text", "Card background", 4.5],
  ["onDark", "darkSection", "Text on dark sections", "Dark section background", 4.5],
  ["buttonPrimaryText", "buttonPrimaryBackground", "Primary button text", "Primary button", 4.5],
  ["buttonPrimaryText", "buttonPrimaryHoverBackground", "Primary button text", "Primary button, hover", 4.5],
  ["buttonSecondaryText", "buttonSecondaryBackground", "Secondary button text", "Secondary button", 4.5],
  ["text", "accent", "Text", "Accent", 4.5],
  ["accentText", "surface", "Accent, text", "Card background", 3],
  ["accentText", "background", "Accent, text", "Page background", 3],
];

function checkContrast(data: Record<string, unknown>) {
  const errors: string[] = [];
  for (const [foreground, background, foregroundLabel, backgroundLabel, minimum] of contrastPairs) {
    const [first, second] = [data[foreground], data[background]];
    if (typeof first !== "string" || typeof second !== "string" || !/^#[0-9a-f]{6}$/i.test(first) || !/^#[0-9a-f]{6}$/i.test(second)) continue;
    const ratio = contrastRatio(first, second);
    if (ratio < minimum) errors.push(`${foregroundLabel} on ${backgroundLabel} is hard to read (contrast ${ratio.toFixed(1)}:1, minimum ${minimum}:1).`);
  }
  return errors;
}

export const imageFolders = ["hero", "clients", "brand", "social"] as const;
export type ImageFolder = (typeof imageFolders)[number];

type ImageSpec = { width: number; height: number; format: string; note: string; pngOnly?: boolean; darkPreview?: boolean };

export type Field =
  | { kind: "text"; label: string; description?: string; required?: boolean; multiline?: boolean; format?: TextFormat }
  | { kind: "checkbox"; label: string }
  | { kind: "color"; label: string; description?: string }
  | { kind: "select"; label: string; description?: string; options: { label: string; value: string }[] }
  | { kind: "image"; label: string; folder: ImageFolder; spec: ImageSpec }
  | { kind: "object"; label?: string; fields: Record<string, Field> }
  | {
      kind: "array";
      label: string;
      item: Field;
      min?: number;
      max?: number;
      unique?: string;
      itemLabel?: (item: never) => string;
      display?: "gallery";
    };

const companyTokenNote = "{company} is replaced with the company name automatically.";

const shortText = (label: string, description?: string): Field => ({ kind: "text", label, description, required: true });
const optionalText = (label: string, description?: string): Field => ({ kind: "text", label, description });
const longText = (label: string, description: string = companyTokenNote): Field => ({
  kind: "text",
  label,
  description,
  required: true,
  multiline: true,
});
const link = (label: string): Field => ({
  kind: "object",
  label,
  fields: {
    label: shortText("Button text"),
    href: { ...shortText("Button link", "Use #contact for the homepage contact section, or a full https:// address."), format: "link" } as Field,
  },
});
const textList = (label: string, itemName: string): Field => ({
  kind: "array",
  label,
  item: shortText(itemName),
  itemLabel: (item: string) => item,
});
const colour = (label: string, description?: string): Field => ({ kind: "color", label, description });
const brandImage = (label: string, spec: ImageSpec): Field => ({
  kind: "object",
  label,
  fields: { src: { kind: "image", label: "Image", folder: "brand", spec } },
});
const pwaIcon = (label: string, size: number, note: string) =>
  brandImage(label, { width: size, height: size, format: "PNG", pngOnly: true, note });
const linkList = (label: string, itemName: string): Field => ({
  kind: "array",
  label,
  unique: "href",
  itemLabel: (item: { label: string }) => item.label,
  item: {
    kind: "object",
    fields: {
      label: shortText(itemName),
      href: { ...shortText("Link", "Use #services for a homepage section, /qr-generator for a page, or a full https:// address."), format: "link" } as Field,
    },
  },
});
const tokenNote = "Available: {company}, {phone}, {email} and {website}.";
const toolPage = (label: string): Field => ({
  kind: "object",
  label,
  fields: {
    kicker: shortText("Eyebrow label"),
    heading: shortText("Page heading"),
    introduction: longText("Introduction"),
    title: shortText("Browser tab title"),
    description: longText("Search description"),
    socialDescription: longText("Social sharing description"),
    socialImageAlt: shortText("Social image description"),
  },
});
const statusMessage = (label: string, withMetadata = false): Field => ({
  kind: "object",
  label,
  fields: {
    title: shortText("Title"),
    description: longText("Description"),
    ...(withMetadata
      ? { metadataTitle: shortText("Browser tab title"), metadataDescription: longText("Search description") }
      : {}),
  },
});
const formField = (label: string, placeholder?: boolean): Field => ({
  kind: "object",
  label,
  fields: { label: shortText("Label"), placeholder: placeholder ? shortText("Placeholder") : optionalText("Placeholder") },
});
const sectionHeading = {
  kicker: shortText("Eyebrow label"),
  title: shortText("Title"),
};
const titled = (item: { title: string }) => item.title;

export type Section = {
  key: string;
  label: string;
  group: string;
  description: string;
  path: string;
  fields: Record<string, Field>;
  check?: (data: Record<string, unknown>) => string[];
};

export const sections: Section[] = [
  {
    key: "packages",
    label: "Packages & Pricing",
    group: "Content",
    description: "Package names, prices and what each one includes.",
    path: "content/packages.json",
    fields: {
      section: {
        kind: "object",
        label: "Section heading",
        fields: { ...sectionHeading, description: longText("Description") },
      },
      items: {
        kind: "array",
        label: "Packages",
        min: 1,
        max: 4,
        unique: "id",
        itemLabel: (item: { name: string; price: string }) => `${item.name} (${item.price})`,
        item: {
          kind: "object",
          fields: {
            name: shortText("Package name"),
            price: shortText("Price", "Example: RM2,800"),
            priceSuffix: optionalText("Text after price"),
            description: longText("Description"),
            features: textList("What is included", "Item"),
            featured: { kind: "checkbox", label: "Feature this package" },
            highlightLabel: optionalText("Badge text", "Example: Most Popular"),
            closingText: optionalText("Closing line", "Shown on the wide layout only."),
            cta: link("Button"),
            whatsappMessage: longText("WhatsApp message"),
            formLabel: optionalText("Contact form label", "Leave empty to use the name and price."),
            number: shortText("Card number", "Example: 01"),
            layout: {
              kind: "select",
              label: "Layout",
              options: [
                { label: "Card", value: "card" },
                { label: "Wide", value: "wide" },
              ],
            },
            id: {
              kind: "select",
              label: "Package type (do not change)",
              description: "Permanent code stored with every enquiry. Each type can only be used once.",
              options: [
                { label: "Solo", value: "solo" },
                { label: "Duo", value: "duo" },
                { label: "Panel", value: "panel" },
                { label: "Monthly Partnership", value: "monthly-partnership" },
              ],
            },
          },
        },
      },
      notes: textList("Notes below packages", "Note"),
    },
  },
  {
    key: "faq",
    label: "FAQ",
    group: "Content",
    description: "Questions and answers shown on the homepage.",
    path: "content/faq.json",
    fields: {
      ...sectionHeading,
      items: {
        kind: "array",
        label: "Questions",
        itemLabel: (item: { question: string }) => item.question,
        item: {
          kind: "object",
          fields: { question: shortText("Question", companyTokenNote), answer: longText("Answer") },
        },
      },
    },
  },
  {
    key: "contact",
    label: "Contact Details",
    group: "Content",
    description: "Phone, WhatsApp, email and address.",
    path: "content/contact.json",
    fields: {
      phoneDisplay: shortText("Phone number"),
      whatsappNumber: { ...shortText("WhatsApp number", "Digits only with country code, for example 60123456789"), format: "whatsapp" } as Field,
      email: { ...shortText("Email"), format: "email" } as Field,
      address: optionalText("Address", "Leave empty to hide the address."),
      defaultWhatsAppMessage: longText("Default WhatsApp message"),
    },
  },
  {
    key: "hero",
    label: "Hero Section",
    group: "Homepage",
    description: "Headline, description and main buttons.",
    path: "content/home/hero.json",
    fields: {
      kicker: shortText("Eyebrow label"),
      title: shortText("Headline"),
      description: longText("Description"),
      primaryCta: link("Primary button"),
      secondaryCta: link("Secondary button"),
      trustPills: textList("Badges below buttons", "Badge"),
    },
  },
  {
    key: "services",
    label: "Services",
    group: "Homepage",
    description: "The services listed on the homepage.",
    path: "content/home/services.json",
    fields: {
      ...sectionHeading,
      description: longText("Description"),
      items: {
        kind: "array",
        label: "Services",
        itemLabel: titled,
        item: {
          kind: "object",
          fields: {
            title: shortText("Service name"),
            description: longText("Description"),
            icon: {
              kind: "select",
              label: "Icon",
              options: [
                { label: "Microphone", value: "Mic2" },
                { label: "Video", value: "Video" },
                { label: "Camera", value: "Camera" },
                { label: "Scissors", value: "Scissors" },
                { label: "Clapperboard", value: "Clapperboard" },
                { label: "Radio", value: "Radio" },
              ],
            },
          },
        },
      },
    },
  },
  {
    key: "other",
    label: "Homepage Sections",
    group: "Homepage",
    description: "Why Trulab, process, certifications, coverage and footer.",
    path: "content/home/other.json",
    fields: {
      whyTrulab: {
        kind: "object",
        label: "Why Trulab",
        fields: { ...sectionHeading, description: longText("Description"), points: textList("Advantages", "Advantage") },
      },
      process: {
        kind: "object",
        label: "Process",
        fields: {
          ...sectionHeading,
          items: {
            kind: "array",
            label: "Steps",
            itemLabel: titled,
            item: { kind: "object", fields: { title: shortText("Step name"), description: longText("Description") } },
          },
        },
      },
      certifications: {
        kind: "object",
        label: "Registrations & Certifications",
        fields: {
          ...sectionHeading,
          items: {
            kind: "array",
            label: "Registrations",
            itemLabel: titled,
            item: { kind: "object", fields: { title: shortText("Name"), description: shortText("Description") } },
          },
        },
      },
      coverage: {
        kind: "object",
        label: "Malaysia Coverage",
        fields: {
          ...sectionHeading,
          paragraphs: { kind: "array", label: "Paragraph", item: longText("Paragraph"), itemLabel: (item: string) => item },
        },
      },
      contact: {
        kind: "object",
        label: "Contact Section",
        fields: { ...sectionHeading, description: longText("Description") },
      },
      footer: { kind: "object", label: "Footer", fields: { description: longText("Description") } },
    },
  },
  {
    key: "hero-image",
    label: "Hero Image",
    group: "Media",
    description: "The main image at the top of the homepage.",
    path: "content/home/hero-image.json",
    fields: {
      image: {
        kind: "object",
        label: "Hero image",
        fields: {
          src: { kind: "image", label: "Image", folder: "hero", spec: { width: 1536, height: 1024, format: "PNG, JPG or WebP", note: "Shown as a 16:10 crop on desktop and 4:3 on mobile. Keep the speaker near the centre." } },
          alt: shortText("Image description", "Used by Google and screen readers."),
        },
      },
    },
  },
  {
    key: "clients",
    label: "Client Logos",
    group: "Media",
    description: "Logos in the client marquee.",
    path: "content/home/clients.json",
    fields: {
      title: shortText("Title"),
      logos: {
        kind: "array",
        label: "Logos",
        display: "gallery",
        unique: "name",
        itemLabel: (item: { name: string }) => item.name,
        item: {
          kind: "object",
          fields: {
            name: shortText("Client name", "Each logo needs a different name."),
            src: { kind: "image", label: "Logo", folder: "clients", spec: { width: 1500, height: 584, format: "Transparent PNG", note: "Keep the complete logo inside the canvas. It is scaled to fit, not cropped." } },
            alt: shortText("Logo description"),
          },
        },
      },
    },
  },
  {
    key: "seo",
    label: "Search Engine",
    group: "SEO",
    description: "Titles, description and keywords for Google.",
    path: "content/seo.json",
    fields: {
      homepageTitle: shortText("Homepage title", "The company name is added automatically."),
      description: longText("Search description", `Aim for about 150 characters. ${companyTokenNote}`),
      defaultTitle: shortText("Default page title", companyTokenNote),
      keywords: textList("Keywords", "Keyword"),
    },
  },
  {
    key: "company",
    label: "Company Details",
    group: "Brand",
    description: "Company name, legal name, domain and social links.",
    path: "content/company.json",
    fields: {
      name: shortText("Company name", "Shown across the website, emails and search results."),
      legalName: shortText("Legal name", "Shown in the footer copyright line."),
      domain: { ...shortText("Domain", "Without www, for example example.com. Changing this affects links and SEO."), format: "domain" } as Field,
      socialLinks: {
        kind: "array",
        label: "Social links",
        unique: "href",
        itemLabel: (item: { label: string }) => item.label,
        item: {
          kind: "object",
          fields: { label: shortText("Name", "Example: Instagram"), href: { ...shortText("Link", "Full https:// address."), format: "webUrl" } as Field },
        },
      },
    },
  },
  {
    key: "brand-assets",
    label: "Logos & Icons",
    group: "Brand",
    description: "Logos, favicon, app icons and the social sharing image.",
    path: "content/brand/assets.json",
    fields: {
      logoMain: brandImage("Main logo", { width: 512, height: 512, format: "PNG or WebP", note: "Shown in the navbar at about 40 px. Keep the symbol centred." }),
      logoWhite: brandImage("White logo", { width: 512, height: 512, format: "Transparent PNG or WebP", darkPreview: true, note: "Shown on dark backgrounds in the footer and admin panel." }),
      logoFull: brandImage("Full logo", { width: 2134, height: 399, format: "Transparent PNG or WebP", note: "Shown on the loading screen. It is scaled to fit, not cropped." }),
      favicon: brandImage("Favicon", { width: 512, height: 512, format: "PNG", pngOnly: true, note: "Shown in browser tabs. Use a simple mark that is clear at 16 px." }),
      icon192: pwaIcon("App icon, small", 192, "Shown when the website is installed as an app."),
      icon512: pwaIcon("App icon, large", 512, "Shown when the website is installed as an app."),
      maskable512: pwaIcon("App icon, maskable", 512, "Devices may crop this to a circle. Keep the logo inside the central area."),
      socialImage: {
        kind: "object",
        label: "Social sharing image",
        fields: {
          src: { kind: "image", label: "Image", folder: "social", spec: { width: 1200, height: 630, format: "PNG, JPG or WebP", note: "Shown when a website link is shared on WhatsApp, Facebook and others. Keep text away from the edges." } },
          alt: shortText("Image description", companyTokenNote),
        },
      },
    },
  },
  {
    key: "brand-colors",
    label: "Brand Colours",
    group: "Brand",
    description: "Colours used across the entire website.",
    path: "content/brand/colors.json",
    check: checkContrast,
    fields: {
      primary: colour("Primary"),
      accent: colour("Accent", "Main highlight colour, used for the WhatsApp button and badges."),
      accentStrong: colour("Accent, strong", "Used for focus outlines."),
      accentIcon: colour("Accent, icons"),
      accentText: colour("Accent, text", "Must stay readable on light backgrounds."),
      background: colour("Page background"),
      surface: colour("Card background"),
      text: colour("Text"),
      mutedText: colour("Secondary text"),
      border: colour("Border"),
      darkSection: colour("Dark section background"),
      onDark: colour("Text on dark sections"),
      buttonPrimaryBackground: colour("Primary button"),
      buttonPrimaryHoverBackground: colour("Primary button, hover"),
      buttonPrimaryText: colour("Primary button text"),
      buttonSecondaryBackground: colour("Secondary button"),
      buttonSecondaryText: colour("Secondary button text"),
      checkerboard: colour("Transparent preview pattern", "Used by the Background Remover preview."),
    },
  },
  {
    key: "navigation",
    label: "Navigation",
    group: "Brand",
    description: "Menu links, tool links and the main button.",
    path: "content/navigation.json",
    fields: {
      mainCta: link("Main button"),
      navbarLinks: linkList("Menu links", "Link text"),
      toolLinks: linkList("Tool links", "Link text"),
    },
  },
  {
    key: "contact-form",
    label: "Contact Form",
    group: "Communication",
    description: "Form labels, messages and the WhatsApp message.",
    path: "content/forms/contact.json",
    fields: {
      submitLabel: shortText("Submit button"),
      success: longText("Success message"),
      fields: {
        kind: "object",
        label: "Form fields",
        fields: {
          name: formField("Name"),
          company: formField("Company"),
          email: formField("Email"),
          phone: formField("Phone"),
          packageInterest: formField("Package interest", true),
          message: formField("Message"),
        },
      },
      whatsapp: {
        kind: "object",
        label: "WhatsApp message after submitting",
        fields: {
          introduction: longText("Introduction"),
          detailsHeading: shortText("Details heading"),
          projectLabel: shortText("Project label"),
          closing: longText("Closing"),
        },
      },
      turnstileNotice: shortText("Anti-spam notice"),
      turnstileMissing: shortText("Anti-spam not configured"),
      turnstileRequired: shortText("Anti-spam required"),
      submitFallbackError: shortText("Submit error"),
      unexpectedError: shortText("Unexpected error"),
      apiMessages: {
        kind: "object",
        label: "Server error messages",
        fields: {
          invalidRequest: shortText("Invalid request"),
          submissionRejected: shortText("Submission rejected"),
          invalidFields: shortText("Invalid fields"),
          antiSpamUnavailable: shortText("Anti-spam unavailable"),
          antiSpamFailed: shortText("Anti-spam failed"),
          storageUnavailable: shortText("Storage unavailable"),
          saveFailed: shortText("Save failed"),
          submitFailed: shortText("Submit failed"),
        },
      },
    },
  },
  {
    key: "emails",
    label: "Emails",
    group: "Communication",
    description: "The confirmation email to customers and your enquiry alert.",
    path: "content/forms/email.json",
    fields: {
      customer: {
        kind: "object",
        label: "Confirmation email to customer",
        fields: {
          subject: shortText("Subject", tokenNote),
          heading: shortText("Heading"),
          introduction: longText("Introduction", tokenNote),
          detailsHeading: shortText("Details heading"),
          correctionNotice: longText("Correction notice"),
          signOff: longText("Signature", `Basic HTML is allowed, such as <br> for a new line. ${tokenNote}`),
        },
      },
      team: {
        kind: "object",
        label: "Enquiry alert to your team",
        fields: { subjectPrefix: shortText("Subject prefix"), heading: shortText("Heading") },
      },
    },
  },
  {
    key: "tools",
    label: "Tool Pages",
    group: "Pages",
    description: "Headings and search text for the QR Generator and Background Remover.",
    path: "content/tools.json",
    fields: { qrGenerator: toolPage("QR Generator"), backgroundRemover: toolPage("Background Remover") },
  },
  {
    key: "status-pages",
    label: "Status Pages",
    group: "Pages",
    description: "Text for 404, 403, error, loading and maintenance pages.",
    path: "content/status-pages.json",
    fields: {
      common: {
        kind: "object",
        label: "Shared buttons",
        fields: { backToHomepage: shortText("Back to homepage"), tryAgain: shortText("Try again") },
      },
      notFound: statusMessage("404 Page not found", true),
      forbidden: statusMessage("403 Access restricted", true),
      maintenance: statusMessage("Maintenance", true),
      loading: statusMessage("Loading"),
      error: statusMessage("500 Page error"),
      serverError: statusMessage("500 Server error"),
      globalError: statusMessage("500 Critical error"),
    },
  },
  {
    key: "cookie-banner",
    label: "Cookie Banner",
    group: "Pages",
    description: "The tracking consent message and its buttons.",
    path: "content/cookie-banner.json",
    fields: {
      message: longText("Message"),
      acceptLabel: shortText("Accept button"),
      rejectLabel: shortText("Reject button"),
    },
  },
];

export function findSection(key: string) {
  return sections.find((section) => section.key === key);
}

export function emptyValue(field: Field): unknown {
  switch (field.kind) {
    case "text":
    case "image":
      return "";
    case "checkbox":
      return false;
    case "color":
      return "#000000";
    case "select":
      return field.options[0].value;
    case "array":
      return [];
    case "object":
      return Object.fromEntries(Object.entries(field.fields).map(([key, child]) => [key, emptyValue(child)]));
  }
}

function validateField(field: Field, value: unknown, trail: string, errors: string[]): unknown {
  const name = trail || ("label" in field ? field.label : "");
  switch (field.kind) {
    case "text": {
      if (typeof value !== "string") {
        errors.push(`${name}: invalid value.`);
        return "";
      }
      if (field.required && !value.trim()) errors.push(`${name}: required.`);
      else if (field.format && value.trim()) {
        const problem = formatError(field.format, value.trim());
        if (problem) errors.push(`${name}: ${problem}`);
      }
      for (const token of value.match(/\{[a-zA-Z]+\}/g) ?? []) {
        if (!allowedTokens.includes(token)) errors.push(`${name}: ${token} is not recognised. Use ${allowedTokens.join(", ")}.`);
      }
      if (/<\s*script|javascript:/i.test(value)) errors.push(`${name}: scripts are not allowed.`);
      return value;
    }
    case "checkbox":
      if (typeof value !== "boolean") errors.push(`${name}: invalid value.`);
      return value === true;
    case "color":
      if (typeof value !== "string" || !/^#[0-9a-f]{6}$/i.test(value)) errors.push(`${name}: use a six-digit colour such as #bfd730.`);
      return value;
    case "select":
      if (!field.options.some((option) => option.value === value)) errors.push(`${name}: invalid option.`);
      return value;
    case "image":
      if (typeof value !== "string" || !new RegExp(`^/images/${field.folder}/[\\w.-]+$`).test(value)) {
        errors.push(`${name}: please choose an image.`);
      } else if (field.spec.pngOnly && !value.endsWith(".png")) {
        errors.push(`${name}: this image must be a PNG.`);
      }
      return value;
    case "object": {
      const source = value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
      return validateFields(field.fields, source, trail, errors);
    }
    case "array": {
      if (!Array.isArray(value)) {
        errors.push(`${name}: invalid value.`);
        return [];
      }
      if (field.min !== undefined && value.length < field.min) errors.push(`${name}: at least ${field.min} required.`);
      if (field.max !== undefined && value.length > field.max) errors.push(`${name}: maximum ${field.max} allowed.`);
      if (field.unique) {
        const seen = value.map((item) => (item as Record<string, unknown>)?.[field.unique as string]);
        if (new Set(seen).size !== seen.length) errors.push(`${name}: each item must be different.`);
      }
      return value.map((item, index) => validateField(field.item, item, `${name} #${index + 1}`, errors));
    }
  }
}

function validateFields(fields: Record<string, Field>, source: Record<string, unknown>, trail: string, errors: string[]) {
  return Object.fromEntries(
    Object.entries(fields).map(([key, field]) => {
      const label = "label" in field && field.label ? field.label : key;
      return [key, validateField(field, source[key], trail ? `${trail} › ${label}` : label, errors)];
    }),
  );
}

/** Returns data containing only schema fields, plus a list of plain-language errors. */
export function validateSection(section: Section, value: unknown) {
  const errors: string[] = [];
  const source = value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  const data = validateFields(section.fields, source, "", errors);
  errors.push(...(section.check?.(data) ?? []));
  return { data, errors };
}
