import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import LogoMarquee from "@/components/home/LogoMarquee";
import KonsultasiForm from "@/components/konsultasi/KonsultasiForm";
import { konsultasiContent as content } from "@/lib/content/konsultasi";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: content.metaTitle,
  description: content.metaDescription,
  alternates: { canonical: "/konsultasi" },
  openGraph: { url: "/konsultasi", title: content.metaTitle, description: content.metaDescription, images: [siteConfig.assets.socialImage] },
};

// Kept short and free of site navigation, so a visitor from Threads has one thing to do.
export default function KonsultasiPage() {
  return (
    <main className="min-h-screen bg-trulab-bg text-trulab-ink">
      <header className="mx-auto flex max-w-6xl items-center px-4 pt-5 sm:px-8">
        <Link href="/" className="focus-ring flex items-center gap-3 rounded-xl">
          <Image src={siteConfig.assets.logo} alt="" width={36} height={36} className="h-9 w-9 rounded-lg object-cover" priority />
          <span className="text-sm font-semibold">{siteConfig.name}</span>
        </Link>
      </header>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 pb-12 pt-8 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:pt-16">
        <div className="grid gap-5">
          <span className="section-kicker w-fit">{content.kicker}</span>
          <h1 className="text-[2rem] font-semibold leading-tight tracking-tight sm:text-5xl">{content.title}</h1>
          <p className="text-base leading-7 text-trulab-muted sm:text-lg sm:leading-8">{content.description}</p>
          <div className="hidden lg:block">
            <Benefits />
          </div>
        </div>
        <div className="lg:sticky lg:top-8">
          <KonsultasiForm />
        </div>
        <div className="lg:hidden">
          <Benefits />
        </div>
      </section>

      <LogoMarquee title={content.proofTitle} />

      <section className="mx-auto grid max-w-3xl gap-3 px-4 pb-16 sm:px-8">
        <h2 className="text-2xl font-semibold">{content.faqTitle}</h2>
        {content.faqs.map((faq) => (
          <details key={faq.question} className="group rounded-2xl border border-trulab-border/8 bg-trulab-surface px-5 py-4">
            <summary className="focus-ring cursor-pointer font-semibold">{faq.question}</summary>
            <p className="mt-2 text-sm leading-6 text-trulab-muted">{faq.answer}</p>
          </details>
        ))}
        <Link href="/" className="focus-ring mt-4 w-fit text-sm font-semibold text-trulab-muted underline">{content.back}</Link>
      </section>
    </main>
  );
}

function Benefits() {
  return (
    <div className="grid gap-3">
      <p className="font-semibold">{content.benefitsTitle}</p>
      {content.benefits.map((benefit) => (
        <div key={benefit.title} className="flex gap-3 rounded-2xl bg-trulab-surface p-4">
          <Check size={20} className="mt-0.5 shrink-0 text-lime-600" aria-hidden />
          <p className="text-sm leading-6"><strong className="font-semibold">{benefit.title}.</strong> {benefit.text}</p>
        </div>
      ))}
    </div>
  );
}
