import { config, fields, singleton } from "@keystatic/core";

const companyTokenNote = "{company} is replaced with the company name automatically.";

const shortText = (label: string, description?: string) =>
  fields.text({ label, description, validation: { isRequired: true } });
const optionalText = (label: string, description?: string) =>
  fields.text({ label, description });
const longText = (label: string, description: string = companyTokenNote) =>
  fields.text({ label, description, multiline: true, validation: { isRequired: true } });
const link = (label: string) =>
  fields.object(
    {
      label: shortText("Button text"),
      href: shortText("Link", "Use #contact for a homepage section, or a full https:// address."),
    },
    { label },
  );
const textList = (label: string, itemLabel: string) =>
  fields.array(shortText(itemLabel), {
    label,
    itemLabel: (props) => props.value,
  });
const sectionHeading = {
  kicker: shortText("Small label above the title"),
  title: shortText("Title"),
};

export default config({
  storage:
    process.env.NEXT_PUBLIC_KEYSTATIC_STORAGE === "github"
      ? { kind: "github", repo: { owner: "trulabstudio", name: "truweb" } }
      : { kind: "local" },
  ui: {
    brand: { name: "Trulab Studio" },
    navigation: {
      Contact: ["contact"],
      Homepage: [
        "hero",
        "clients",
        "services",
        "whyTrulab",
        "process",
        "certifications",
        "coverage",
        "homeContact",
        "footer",
      ],
      Sales: ["packages", "faq"],
      Search: ["seo"],
    },
  },
  singletons: {
    contact: singleton({
      label: "Contact details",
      path: "content/contact",
      format: { data: "json" },
      schema: {
        email: shortText("Email"),
        phoneDisplay: shortText("Phone shown on the website"),
        whatsappNumber: shortText("WhatsApp number", "Digits only with country code, for example 60123456789."),
        address: optionalText("Address", "Leave empty to hide the address."),
        defaultWhatsAppMessage: longText("Default WhatsApp message"),
      },
    }),
    hero: singleton({
      label: "Hero (top of homepage)",
      path: "content/home/hero",
      format: { data: "json" },
      schema: {
        ...sectionHeading,
        description: longText("Description"),
        primaryCta: link("Main button"),
        secondaryCta: link("Second button"),
        image: fields.object(
          {
            src: fields.image({
              label: "Image",
              directory: "public/images/hero",
              publicPath: "/images/hero/",
              validation: { isRequired: true },
            }),
            alt: shortText("Image description", "Describes the image for Google and screen readers."),
          },
          { label: "Hero image" },
        ),
        trustPills: textList("Small badges under the buttons", "Badge"),
      },
    }),
    clients: singleton({
      label: "Client logos",
      path: "content/home/clients",
      format: { data: "json" },
      schema: {
        title: shortText("Title"),
        logos: fields.array(
          fields.object({
            name: shortText("Client name", "Must be different for every logo."),
            src: fields.image({
              label: "Logo",
              directory: "public/images/clients",
              publicPath: "/images/clients/",
              validation: { isRequired: true },
            }),
            alt: shortText("Logo description"),
          }),
          { label: "Logos", itemLabel: (props) => props.fields.name.value },
        ),
      },
    }),
    services: singleton({
      label: "Services",
      path: "content/home/services",
      format: { data: "json" },
      schema: {
        ...sectionHeading,
        description: longText("Description"),
        items: fields.array(
          fields.object({
            title: shortText("Service name"),
            description: longText("Description"),
            icon: fields.select({
              label: "Icon",
              options: [
                { label: "Microphone", value: "Mic2" },
                { label: "Video", value: "Video" },
                { label: "Camera", value: "Camera" },
                { label: "Scissors", value: "Scissors" },
                { label: "Clapperboard", value: "Clapperboard" },
                { label: "Radio", value: "Radio" },
              ],
              defaultValue: "Mic2",
            }),
          }),
          { label: "Services", itemLabel: (props) => props.fields.title.value },
        ),
      },
    }),
    whyTrulab: singleton({
      label: "Why Trulab",
      path: "content/home/why-trulab",
      format: { data: "json" },
      schema: {
        ...sectionHeading,
        description: longText("Description"),
        points: textList("Points", "Point"),
      },
    }),
    process: singleton({
      label: "Process",
      path: "content/home/process",
      format: { data: "json" },
      schema: {
        ...sectionHeading,
        items: fields.array(
          fields.object({
            title: shortText("Step name"),
            description: longText("Description"),
          }),
          { label: "Steps", itemLabel: (props) => props.fields.title.value },
        ),
      },
    }),
    certifications: singleton({
      label: "Registrations",
      path: "content/home/certifications",
      format: { data: "json" },
      schema: {
        ...sectionHeading,
        items: fields.array(
          fields.object({
            title: shortText("Name"),
            description: shortText("Description"),
          }),
          { label: "Registrations", itemLabel: (props) => props.fields.title.value },
        ),
      },
    }),
    coverage: singleton({
      label: "Malaysia coverage",
      path: "content/home/coverage",
      format: { data: "json" },
      schema: {
        ...sectionHeading,
        paragraphs: fields.array(longText("Paragraph"), {
          label: "Paragraphs",
          itemLabel: (props) => props.value,
        }),
      },
    }),
    homeContact: singleton({
      label: "Contact section",
      path: "content/home/contact",
      format: { data: "json" },
      schema: {
        ...sectionHeading,
        description: longText("Description"),
      },
    }),
    footer: singleton({
      label: "Footer",
      path: "content/home/footer",
      format: { data: "json" },
      schema: {
        description: longText("Description"),
      },
    }),
    packages: singleton({
      label: "Packages & prices",
      path: "content/packages",
      format: { data: "json" },
      schema: {
        section: fields.object(
          {
            ...sectionHeading,
            description: longText("Description"),
          },
          { label: "Section heading" },
        ),
        items: fields.array(
          fields.object({
            id: fields.select({
              label: "Package type",
              description: "Permanent ID saved with each enquiry. Use each one only once.",
              options: [
                { label: "Solo", value: "solo" },
                { label: "Duo", value: "duo" },
                { label: "Panel", value: "panel" },
                { label: "Monthly Partnership", value: "monthly-partnership" },
              ],
              defaultValue: "solo",
            }),
            number: shortText("Number shown on the card"),
            layout: fields.select({
              label: "Layout",
              options: [
                { label: "Card", value: "card" },
                { label: "Wide banner", value: "wide" },
              ],
              defaultValue: "card",
            }),
            name: shortText("Name"),
            price: shortText("Price"),
            priceSuffix: optionalText("Text after the price"),
            description: longText("Description"),
            features: textList("What is included", "Item"),
            featured: fields.checkbox({ label: "Highlight this package" }),
            highlightLabel: optionalText("Highlight badge text"),
            closingText: optionalText("Closing line", "Only shown on the wide banner."),
            cta: link("Button"),
            formLabel: optionalText("Label in the contact form", "Leave empty to use the name and price."),
            whatsappMessage: longText("WhatsApp message"),
          }),
          {
            label: "Packages",
            validation: { length: { min: 1, max: 4 } },
            itemLabel: (props) => `${props.fields.name.value} (${props.fields.price.value})`,
          },
        ),
        notes: textList("Notes under the packages", "Note"),
      },
    }),
    faq: singleton({
      label: "FAQ",
      path: "content/faq",
      format: { data: "json" },
      schema: {
        ...sectionHeading,
        items: fields.array(
          fields.object({
            question: shortText("Question", companyTokenNote),
            answer: longText("Answer"),
          }),
          { label: "Questions", itemLabel: (props) => props.fields.question.value },
        ),
      },
    }),
    seo: singleton({
      label: "SEO",
      path: "content/seo",
      format: { data: "json" },
      schema: {
        defaultTitle: shortText("Default page title", companyTokenNote),
        homepageTitle: shortText("Homepage title", "The company name is added after this automatically."),
        description: longText("Google description", `Aim for about 150 characters. ${companyTokenNote}`),
        keywords: textList("Keywords", "Keyword"),
      },
    }),
  },
});
