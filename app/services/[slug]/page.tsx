import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import Container from "@/components/ui/Container";
import { productionPackages } from "@/lib/content/packages";
import { servicePages, servicePageText as text } from "@/lib/content/service-pages";
import { siteConfig } from "@/lib/site-config";

export const dynamicParams = false;

export function generateStaticParams() {
  return servicePages.map((page) => ({ slug: page.slug }));
}

const find = (slug: string) => servicePages.find((page) => page.slug === slug);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const page = find((await params).slug);
  if (!page) return {};
  const path = `/services/${page.slug}`;
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: { canonical: path },
    openGraph: { url: path, title: page.metaTitle, description: page.metaDescription, images: [siteConfig.assets.socialImage] },
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const page = find((await params).slug);
  if (!page) notFound();

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: page.title,
        description: page.metaDescription,
        provider: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
        areaServed: { "@type": "Country", name: "Malaysia" },
      },
      {
        "@type": "FAQPage",
        mainEntity: page.faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      <Navbar />
      <main className="pb-16 pt-28 sm:pt-36">
        <Container className="grid max-w-3xl gap-10">
          <header className="grid gap-5">
            <span className="section-kicker w-fit">{page.kicker}</span>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{page.title}</h1>
            <p className="text-lg leading-8 text-trulab-muted">{page.intro}</p>
          </header>

          {page.sections.map((section) => (
            <section key={section.heading} className="grid gap-4">
              <h2 className="text-2xl font-semibold">{section.heading}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph} className="leading-8 text-trulab-muted">{paragraph}</p>)}
              {section.bullets && (
                <ul className="grid gap-2">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3 leading-7"><Check size={18} className="mt-1.5 shrink-0 text-lime-600" aria-hidden />{bullet}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          {page.showPackages && (
            <section className="grid gap-4">
              <h2 className="text-2xl font-semibold">{text.packagesTitle}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {productionPackages.map((item) => (
                  <div key={item.id} className="grid content-start gap-2 rounded-3xl border border-trulab-border/8 bg-trulab-surface p-5">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-2xl font-semibold">{item.price}</p>
                    <p className="text-sm text-trulab-muted">{item.description}</p>
                    {item.features.length > 0 && <p className="text-sm leading-6"><span className="font-semibold">{text.from}:</span> {item.features.join(", ")}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="grid gap-3">
            <h2 className="text-2xl font-semibold">{text.faqTitle}</h2>
            {page.faqs.map((faq) => (
              <div key={faq.question} className="rounded-2xl border border-trulab-border/8 bg-trulab-surface p-5">
                <h3 className="font-semibold">{faq.question}</h3>
                <p className="mt-2 leading-7 text-trulab-muted">{faq.answer}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-4 rounded-3xl bg-trulab-dark p-7 text-trulab-on-dark">
            <h2 className="text-2xl font-semibold">{text.ctaTitle}</h2>
            <p className="leading-7 text-trulab-on-dark/75">{text.ctaText}</p>
            <Link href="/#contact" className="focus-ring w-fit rounded-full bg-trulab-accent px-6 py-3 font-semibold text-trulab-ink">{text.ctaButton}</Link>
          </section>

          <nav aria-label={text.morePages} className="grid gap-2">
            <p className="font-semibold">{text.morePages}</p>
            {servicePages.filter((other) => other.slug !== page.slug).map((other) => (
              <Link key={other.slug} href={`/services/${other.slug}`} className="focus-ring w-fit underline">{other.title}</Link>
            ))}
          </nav>
        </Container>
      </main>
      <Footer />
    </>
  );
}
