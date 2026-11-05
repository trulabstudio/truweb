import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import Container from "@/components/ui/Container";
import { blogContent } from "@/lib/content/blog";
import { footerContent } from "@/lib/content/home";
import { servicePages } from "@/lib/content/service-pages";
import { foxduskContent } from "@/lib/content/services";
import { navLinks, toolLinks } from "@/lib/navigation";
import { resolveNavigationHref } from "@/lib/navigation-utils";
import { siteConfig } from "@/lib/site-config";

export default function Footer() {
  return (
    <footer className="border-t border-trulab-border/8 bg-trulab-dark py-10 text-trulab-on-dark">
      <Container className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-end">
        <div>
          <div className="flex items-center gap-3">
            <Image src={siteConfig.assets.logoLight} alt="" width={44} height={44} className="h-11 w-11 rounded-xl object-cover" />
            <span className="text-base font-semibold">{siteConfig.name}</span>
          </div>
          <p className="mt-5 max-w-xl text-sm leading-7 text-trulab-on-dark/66">
            {footerContent.description}
          </p>
          {siteConfig.address ? (
            <address className="mt-3 text-sm not-italic text-trulab-on-dark/54">{siteConfig.address}</address>
          ) : null}
        </div>

        <div className="grid gap-5 md:justify-items-end">
          <div className="flex flex-wrap gap-4 text-sm text-trulab-on-dark/70 md:justify-end">
            {navLinks.map((link) => (
              <Link key={link.href} href={resolveNavigationHref(link.href)} className="focus-ring rounded-md transition hover:text-trulab-on-dark">
                {link.label}
              </Link>
            ))}
            {toolLinks.map((link) => (
              <Link key={link.href} href={resolveNavigationHref(link.href)} className="focus-ring rounded-md transition hover:text-trulab-on-dark">
                {link.label}
              </Link>
            ))}
            <a href={foxduskContent.cta.href} target="_blank" rel="noopener" className="focus-ring rounded-md transition hover:text-trulab-on-dark">
              {foxduskContent.name}
            </a>
            {siteConfig.socialLinks.map((link) => (
              <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="focus-ring rounded-md transition hover:text-trulab-on-dark">
                {link.label}
              </a>
            ))}
            <Link href={footerContent.adminLink.href} rel="nofollow" className="focus-ring rounded-md transition hover:text-trulab-on-dark">
              {footerContent.adminLink.label}
            </Link>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a href={`mailto:${siteConfig.email}`} className="focus-ring rounded-full border border-trulab-on-dark/12 px-5 py-3 text-center text-sm font-semibold text-trulab-on-dark/82 transition hover:bg-trulab-on-dark/8">
              {siteConfig.email}
            </a>
            {/* Goes through the short form first, so every WhatsApp contact is saved as an enquiry. */}
            <a href="/konsultasi" className="focus-ring inline-flex items-center justify-center gap-2 rounded-full bg-trulab-accent px-5 py-3 text-sm font-semibold text-trulab-ink transition hover:bg-trulab-surface">
              <MessageCircle size={17} aria-hidden />
              {footerContent.whatsappLabel}
            </a>
          </div>
        </div>
      </Container>
      {/* Links to the search pages, so Google and visitors can find them from every page. */}
      <Container className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-trulab-on-dark/60">
        {servicePages.map((page) => (
          <Link key={page.slug} href={`/services/${page.slug}`} className="focus-ring rounded-md transition hover:text-trulab-on-dark">{page.metaTitle}</Link>
        ))}
        <Link href="/blog" className="focus-ring rounded-md transition hover:text-trulab-on-dark">{blogContent.metaTitle}</Link>
      </Container>
      <Container className="mt-8 border-t border-trulab-on-dark/10 pt-6">
        <p className="text-sm text-trulab-on-dark/44">{"©"} {new Date().getFullYear()} {siteConfig.name} — {siteConfig.divisionLine} {footerContent.rights}</p>
      </Container>
    </footer>
  );
}
