import { config, fields, singleton } from "@keystatic/core";

const companyTokenNote = "Tulisan {company} akan bertukar kepada nama syarikat secara automatik.";

const shortText = (label: string, description?: string) =>
  fields.text({ label, description, validation: { isRequired: true } });
const optionalText = (label: string, description?: string) =>
  fields.text({ label, description });
const longText = (label: string, description: string = companyTokenNote) =>
  fields.text({ label, description, multiline: true, validation: { isRequired: true } });
const link = (label: string) =>
  fields.object(
    {
      label: shortText("Teks butang"),
      href: shortText("Pautan butang", "Guna #contact untuk ke bahagian Contact di homepage, atau alamat penuh https://."),
    },
    { label },
  );
const textList = (label: string, itemLabel: string) =>
  fields.array(shortText(itemLabel), {
    label,
    itemLabel: (props) => props.value,
  });
const sectionHeading = {
  kicker: shortText("Label kecil atas tajuk"),
  title: shortText("Tajuk"),
};
const titledItems = (label: string, itemName: string) =>
  fields.array(
    fields.object({
      title: shortText(itemName),
      description: longText("Penerangan"),
    }),
    { label, itemLabel: (props) => props.fields.title.value },
  );

export default config({
  storage:
    process.env.NEXT_PUBLIC_KEYSTATIC_STORAGE === "github"
      ? { kind: "github", repo: { owner: "trulabstudio", name: "truweb" } }
      : { kind: "local" },
  ui: {
    brand: { name: "Trulab Studio" },
    navigation: {
      "Paling kerap diedit": ["packages", "faq", "contact"],
      Homepage: ["hero", "services", "otherHome"],
      "Gambar (lambat sikit nak buka)": ["heroImage", "clients"],
      Google: ["seo"],
    },
  },
  singletons: {
    packages: singleton({
      label: "Pakej & Harga",
      path: "content/packages",
      format: { data: "json" },
      schema: {
        items: fields.array(
          fields.object({
            name: shortText("Nama pakej"),
            price: shortText("Harga", "Contoh: RM2,800"),
            priceSuffix: optionalText("Teks selepas harga"),
            description: longText("Penerangan"),
            features: textList("Apa yang termasuk", "Perkara"),
            featured: fields.checkbox({ label: "Tonjolkan pakej ini" }),
            highlightLabel: optionalText("Teks lencana", "Contoh: Most Popular"),
            closingText: optionalText("Ayat penutup", "Hanya keluar pada paparan lebar."),
            cta: link("Butang"),
            whatsappMessage: longText("Mesej WhatsApp"),
            formLabel: optionalText("Nama dalam borang hubungi", "Biar kosong untuk guna nama dan harga."),
            number: shortText("Nombor pada kad", "Contoh: 01"),
            layout: fields.select({
              label: "Paparan",
              options: [
                { label: "Kad", value: "card" },
                { label: "Lebar", value: "wide" },
              ],
              defaultValue: "card",
            }),
            id: fields.select({
              label: "Jenis pakej (jangan ubah)",
              description: "Kod tetap yang disimpan bersama setiap pertanyaan. Setiap jenis hanya boleh digunakan sekali.",
              options: [
                { label: "Solo", value: "solo" },
                { label: "Duo", value: "duo" },
                { label: "Panel", value: "panel" },
                { label: "Monthly Partnership", value: "monthly-partnership" },
              ],
              defaultValue: "solo",
            }),
          }),
          {
            label: "Senarai pakej",
            validation: { length: { min: 1, max: 4 } },
            itemLabel: (props) => `${props.fields.name.value} (${props.fields.price.value})`,
          },
        ),
        notes: textList("Nota bawah pakej", "Nota"),
        section: fields.object(
          {
            ...sectionHeading,
            description: longText("Penerangan"),
          },
          { label: "Tajuk bahagian" },
        ),
      },
    }),
    faq: singleton({
      label: "Soalan Lazim (FAQ)",
      path: "content/faq",
      format: { data: "json" },
      schema: {
        items: fields.array(
          fields.object({
            question: shortText("Soalan", companyTokenNote),
            answer: longText("Jawapan"),
          }),
          { label: "Senarai soalan", itemLabel: (props) => props.fields.question.value },
        ),
        ...sectionHeading,
      },
    }),
    contact: singleton({
      label: "Telefon & Emel",
      path: "content/contact",
      format: { data: "json" },
      schema: {
        phoneDisplay: shortText("Nombor telefon"),
        whatsappNumber: shortText("Nombor WhatsApp", "Nombor sahaja dengan kod negara, contoh: 60123456789"),
        email: shortText("Emel"),
        address: optionalText("Alamat", "Biar kosong untuk sembunyikan alamat."),
        defaultWhatsAppMessage: longText("Mesej WhatsApp asal"),
      },
    }),
    hero: singleton({
      label: "Bahagian Atas Homepage",
      path: "content/home/hero",
      format: { data: "json" },
      schema: {
        title: shortText("Tajuk besar"),
        description: longText("Penerangan"),
        kicker: shortText("Label kecil atas tajuk"),
        primaryCta: link("Butang utama"),
        secondaryCta: link("Butang kedua"),
        trustPills: textList("Lencana kecil bawah butang", "Lencana"),
      },
    }),
    heroImage: singleton({
      label: "Gambar Utama Homepage",
      path: "content/home/hero-image",
      format: { data: "json" },
      schema: {
        image: fields.object(
          {
            src: fields.image({
              label: "Gambar",
              directory: "public/images/hero",
              publicPath: "/images/hero/",
              validation: { isRequired: true },
            }),
            alt: shortText("Penerangan gambar", "Untuk Google dan pembaca skrin."),
          },
          { label: "Gambar utama" },
        ),
      },
    }),
    services: singleton({
      label: "Perkhidmatan",
      path: "content/home/services",
      format: { data: "json" },
      schema: {
        items: fields.array(
          fields.object({
            title: shortText("Nama perkhidmatan"),
            description: longText("Penerangan"),
            icon: fields.select({
              label: "Ikon",
              options: [
                { label: "Mikrofon", value: "Mic2" },
                { label: "Video", value: "Video" },
                { label: "Kamera", value: "Camera" },
                { label: "Gunting", value: "Scissors" },
                { label: "Papan klip", value: "Clapperboard" },
                { label: "Radio", value: "Radio" },
              ],
              defaultValue: "Mic2",
            }),
          }),
          { label: "Senarai perkhidmatan", itemLabel: (props) => props.fields.title.value },
        ),
        ...sectionHeading,
        description: longText("Penerangan"),
      },
    }),
    clients: singleton({
      label: "Logo Client",
      path: "content/home/clients",
      format: { data: "json" },
      schema: {
        title: shortText("Tajuk"),
        logos: fields.array(
          fields.object({
            name: shortText("Nama client", "Setiap logo mesti ada nama berbeza."),
            src: fields.image({
              label: "Logo",
              directory: "public/images/clients",
              publicPath: "/images/clients/",
              validation: { isRequired: true },
            }),
            alt: shortText("Penerangan logo"),
          }),
          { label: "Senarai logo", itemLabel: (props) => props.fields.name.value },
        ),
      },
    }),
    otherHome: singleton({
      label: "Teks Lain Homepage",
      path: "content/home/other",
      format: { data: "json" },
      schema: {
        whyTrulab: fields.object(
          {
            ...sectionHeading,
            description: longText("Penerangan"),
            points: textList("Senarai kelebihan", "Kelebihan"),
          },
          { label: "Kenapa Trulab" },
        ),
        process: fields.object(
          {
            ...sectionHeading,
            items: titledItems("Langkah kerja", "Nama langkah"),
          },
          { label: "Proses" },
        ),
        certifications: fields.object(
          {
            ...sectionHeading,
            items: fields.array(
              fields.object({
                title: shortText("Nama"),
                description: shortText("Penerangan"),
              }),
              { label: "Senarai pendaftaran", itemLabel: (props) => props.fields.title.value },
            ),
          },
          { label: "Pendaftaran & Pengiktirafan" },
        ),
        coverage: fields.object(
          {
            ...sectionHeading,
            paragraphs: fields.array(longText("Perenggan"), {
              label: "Perenggan",
              itemLabel: (props) => props.value,
            }),
          },
          { label: "Liputan Malaysia" },
        ),
        contact: fields.object(
          {
            ...sectionHeading,
            description: longText("Penerangan"),
          },
          { label: "Bahagian Borang Hubungi" },
        ),
        footer: fields.object(
          {
            description: longText("Penerangan"),
          },
          { label: "Footer" },
        ),
      },
    }),
    seo: singleton({
      label: "SEO (Carian Google)",
      path: "content/seo",
      format: { data: "json" },
      schema: {
        homepageTitle: shortText("Tajuk homepage di Google", "Nama syarikat ditambah di hujung secara automatik."),
        description: longText("Penerangan di Google", `Sasarkan lebih kurang 150 aksara. ${companyTokenNote}`),
        defaultTitle: shortText("Tajuk asal laman", companyTokenNote),
        keywords: textList("Kata kunci", "Kata kunci"),
      },
    }),
  },
});
