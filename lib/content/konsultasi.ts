import { siteConfig } from "@/lib/site-config";

// The landing page for Threads readers, in proper Bahasa Melayu so the business reads as professional.
export const konsultasiContent = {
  metaTitle: "Konsultasi Podcast Percuma untuk Perniagaan",
  metaDescription: `Mohon konsultasi podcast percuma bersama ${siteConfig.name} dan ketahui bagaimana podcast boleh membina kepercayaan pelanggan terhadap perniagaan anda.`,
  kicker: "Konsultasi podcast percuma",
  title: "Bina kepercayaan pelanggan melalui podcast perniagaan anda.",
  description: "Kongsikan sedikit maklumat tentang perniagaan anda. Pasukan kami akan menghubungi anda untuk membincangkan format podcast yang sesuai, tanpa sebarang kos.",
  benefitsTitle: "Apa yang anda peroleh dalam sesi ini",
  benefits: [
    { title: "Memahami perniagaan anda", text: "Kami mendengar dahulu tentang pelanggan anda, soalan yang sering mereka tanya dan perkara yang membuatkan mereka ragu-ragu." },
    { title: "Cadangan episod pertama", text: "Format podcast dan topik episod yang sesuai dengan perniagaan anda." },
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
    whatsappMessage: (name: string, company: string) => `Hai ${siteConfig.name}, saya ${name} dari ${company}. Saya ingin memohon konsultasi podcast percuma.`,
    leadMessage: "Permohonan konsultasi podcast percuma melalui halaman /konsultasi.",
  },
  proofTitle: "Antara pelanggan yang pernah bekerjasama dengan kami",
  faqTitle: "Soalan lazim",
  faqs: [
    { question: "Adakah konsultasi ini benar-benar percuma?", answer: "Ya. Sesi ini bertujuan untuk memahami perniagaan anda dan menilai sama ada podcast sesuai. Tiada sebarang bayaran dikenakan." },
    { question: "Saya tidak biasa bercakap di hadapan kamera.", answer: "Ramai pemilik perniagaan berasa begitu pada mulanya. Kami merancang soalan dan aliran perbualan, jadi anda hanya perlu berkongsi tentang perkara yang anda sudah kuasai." },
    { question: "Berapakah kos untuk menghasilkan podcast?", answer: "Pakej bermula dari RM2,800 untuk satu episod lengkap berserta video pendek. Kami akan terangkan pilihan yang sesuai semasa sesi konsultasi." },
  ],
  back: "Ke laman utama",
};
