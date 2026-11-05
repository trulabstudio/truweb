import { siteConfig } from "@/lib/site-config";
import { showPrices } from "@/lib/content/packages";

// The landing page for Threads readers, in proper Bahasa Melayu so the business reads as professional.
export const konsultasiContent = {
  metaTitle: "Konsultasi Percuma untuk Podcast, Video dan Branding",
  metaDescription: `Mohon konsultasi percuma bersama ${siteConfig.name} dan ketahui bagaimana podcast, video, rekaan dan branding boleh membina kepercayaan pelanggan terhadap perniagaan anda.`,
  kicker: "Konsultasi percuma",
  title: "Bina kepercayaan pelanggan melalui kandungan perniagaan anda.",
  description: "Kongsikan sedikit maklumat tentang perniagaan anda. Pasukan kami akan menghubungi anda untuk membincangkan sama ada podcast, video, fotografi, rekaan, laman web atau branding yang paling sesuai, tanpa sebarang kos.",
  benefitsTitle: "Apa yang anda peroleh dalam sesi ini",
  benefits: [
    { title: "Memahami perniagaan anda", text: "Kami mendengar dahulu tentang pelanggan anda, soalan yang sering mereka tanya dan perkara yang membuatkan mereka ragu-ragu." },
    { title: "Cadangan yang sesuai", text: "Format kandungan yang paling sesuai untuk perniagaan anda, sama ada podcast, video, fotografi atau branding." },
    { title: "Kos dan proses yang jelas", text: "Penerangan lengkap tentang proses dan kos. Tiada sebarang kewajipan untuk meneruskan." },
  ],
  form: {
    title: "Isi maklumat anda",
    name: "Nama penuh",
    company: "Nama syarikat",
    phone: "Nombor WhatsApp",
    phoneHint: "Contoh: 0123456789",
    submit: "Mohon konsultasi percuma",
    sending: "Sedang dihantar...",
    reassurance: "Pasukan kami akan menghubungi anda melalui WhatsApp.",
    success: "Maklumat anda telah kami terima. WhatsApp sedang dibuka supaya anda boleh terus berhubung dengan pasukan kami.",
    successTitle: "Terima kasih",
    antiSpamRequired: "Sila tunggu sehingga semakan keselamatan selesai, kemudian cuba semula.",
    failed: "Maklumat tidak berjaya dihantar. Sila cuba semula.",
    // Shown only after the details are saved, in case the browser blocked WhatsApp from opening.
    whatsappDirect: "Buka WhatsApp",
    whatsappMessage: (name: string, company: string) => `Hai ${siteConfig.name}, saya ${name} dari ${company}. Saya ingin memohon konsultasi percuma.`,
    leadMessage: "Permohonan konsultasi percuma melalui halaman /konsultasi.",
  },
  proofTitle: "Antara pelanggan yang pernah bekerjasama dengan kami",
  faqTitle: "Soalan lazim",
  faqs: [
    { question: "Adakah konsultasi ini benar-benar percuma?", answer: "Ya. Sesi ini bertujuan untuk memahami perniagaan anda dan menilai jenis kandungan yang sesuai. Tiada sebarang bayaran dikenakan." },
    { question: "Saya tidak biasa bercakap di hadapan kamera.", answer: "Ramai pemilik perniagaan berasa begitu pada mulanya. Kami merancang soalan dan aliran perbualan, jadi anda hanya perlu berkongsi tentang perkara yang anda sudah kuasai." },
    { question: "Berapakah kosnya?", answer: showPrices
      ? "Pakej bermula dari RM2,800 untuk satu episod lengkap berserta video pendek. Kami akan terangkan pilihan yang sesuai semasa sesi konsultasi."
      : "Kos bergantung pada skop kerja, contohnya bilangan penceramah dan kamera untuk podcast, atau jumlah rekaan dan halaman untuk branding dan laman web. Kami akan sediakan sebut harga yang sesuai selepas sesi konsultasi percuma." },
  ],
  back: "Ke laman utama",
};
