import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import Container from "@/components/ui/Container";
import { footerContent } from "@/lib/content/home";
import { navLinks, toolLinks } from "@/lib/navigation";
import { resolveNavigationHref } from "@/lib/navigation-utils";
import { buildWhatsAppUrl, defaultWhatsAppMessage, siteConfig } from "@/lib/site-config";

export default function Footer() {
  return (
    <footer className="border-t border-black/8 bg-trulab-ink py-10 text-white">
      <Container className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-end">
        <div>
          <div className="flex items-center gap-3">
            <Image src={siteConfig.assets.logoLight} alt="" width={44} height={44} className="h-11 w-11 rounded-xl object-cover" />
            <span className="text-base font-semibold">{siteConfig.name}</span>
          </div>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/66">
            {footerContent.description}
          </p>
          <p className="mt-3 text-sm text-white/54">
            Domain: {siteConfig.domain}. {footerContent.domainNote}
          </p>
          {siteConfig.address ? (
            <address className="mt-3 text-sm not-italic text-white/54">{siteConfig.address}</address>
          ) : null}
        </div>

        <div className="grid gap-5 md:justify-items-end">
          <div className="flex flex-wrap gap-4 text-sm text-white/70 md:justify-end">
            {navLinks.map((link) => (
              <Link key={link.href} href={resolveNavigationHref(link.href)} className="focus-ring rounded-md transition hover:text-white">
                {link.label}
              </Link>
            ))}
            {toolLinks.map((link) => (
              <Link key={link.href} href={resolveNavigationHref(link.href)} className="focus-ring rounded-md transition hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a href={`mailto:${siteConfig.email}`} className="focus-ring rounded-full border border-white/12 px-5 py-3 text-center text-sm font-semibold text-white/82 transition hover:bg-white/8">
              {siteConfig.email}
            </a>
            <a href={buildWhatsAppUrl(defaultWhatsAppMessage)} target="_blank" rel="noreferrer" className="focus-ring inline-flex items-center justify-center gap-2 rounded-full bg-trulab-accent px-5 py-3 text-sm font-semibold text-trulab-ink transition hover:bg-white">
              <MessageCircle size={17} aria-hidden />
              WhatsApp
            </a>
          </div>
          <p className="text-sm text-white/44">{"©"} {new Date().getFullYear()} {siteConfig.name}. {footerContent.rights}</p>
        </div>
      </Container>
    </footer>
  );
}
