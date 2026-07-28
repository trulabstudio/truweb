import type { Metadata } from "next";
import Certifications from "@/components/home/Certifications";
import ContactForm from "@/components/home/ContactForm";
import FAQ from "@/components/home/FAQ";
import Hero from "@/components/home/Hero";
import LogoMarquee from "@/components/home/LogoMarquee";
import Packages from "@/components/home/Packages";
import Process from "@/components/home/Process";
import RichSeo from "@/components/home/RichSeo";
import Services from "@/components/home/Services";
import WhyTrulab from "@/components/home/WhyTrulab";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { seoConfig } from "@/lib/seo-config";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: seoConfig.homepageTitle,
  description: siteConfig.description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    url: "/",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.assets.socialImage,
        width: 1200,
        height: 630,
        alt: seoConfig.socialImageAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.assets.socialImage],
  },
};

const professionalServiceSchema = {
  "@context": "https://schema.org",
  "@type": seoConfig.businessType,
  name: siteConfig.name,
  url: siteConfig.url,
  image: `${siteConfig.url}${siteConfig.assets.socialImage}`,
  logo: `${siteConfig.url}${siteConfig.assets.logo}`,
  description: siteConfig.description,
  areaServed: {
    "@type": "Country",
    name: seoConfig.areaServed.name,
    identifier: seoConfig.areaServed.code,
  },
  serviceType: seoConfig.serviceTypes,
  ...(siteConfig.address ? { address: siteConfig.address } : {}),
  contactPoint: {
    "@type": "ContactPoint",
    telephone: `+${siteConfig.whatsapp}`,
    contactType: seoConfig.contactType,
    areaServed: seoConfig.areaServed.code,
    availableLanguage: seoConfig.availableLanguages,
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(professionalServiceSchema) }}
      />
      <Navbar />
      <main>
        <Hero />
        <LogoMarquee />
        <Services />
        <Packages />
        <WhyTrulab />
        <Process />
        <Certifications />
        <RichSeo />
        <FAQ />
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}
