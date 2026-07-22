import type { Metadata } from "next";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import QrGeneratorTool from "@/components/tools/QrGeneratorTool";
import { toolPageContent } from "@/lib/content/pages";
import { siteConfig } from "@/lib/site-config";

const content = toolPageContent.qrGenerator;

export const metadata: Metadata = {
  title: content.title,
  description: content.description,
  alternates: {
    canonical: content.path,
  },
  openGraph: {
    url: content.path,
    title: `${content.title} | ${siteConfig.name}`,
    description: content.socialDescription,
    images: [
      {
        url: siteConfig.assets.socialImage,
        width: 1200,
        height: 630,
        alt: content.socialImageAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${content.title} | ${siteConfig.name}`,
    description: content.socialDescription,
    images: [siteConfig.assets.socialImage],
  },
};

export default function QrGeneratorPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24">
        <section className="section-shell pb-10 pt-10 sm:pb-14 sm:pt-16">
          <span className="section-kicker">{content.kicker}</span>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-trulab-ink sm:text-6xl">
              {content.heading}
            </h1>
            <p className="max-w-2xl text-base leading-8 text-trulab-muted">
              {content.introduction}
            </p>
          </div>
        </section>

        <section className="section-shell pb-20 sm:pb-28">
          <QrGeneratorTool />
        </section>
      </main>
      <Footer />
    </>
  );
}
