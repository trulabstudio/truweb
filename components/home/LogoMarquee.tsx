"use client";

import Image from "next/image";
import { useState } from "react";
import Container from "@/components/ui/Container";
import { logoMarqueeContent } from "@/lib/content/home";

function LogoTile({ name, src, alt, duplicate = false }: { name: string; src: string; alt: string; duplicate?: boolean }) {
  const [failed, setFailed] = useState(false);
  const initials = name.replace(
    logoMarqueeContent.fallbackNamePrefix,
    logoMarqueeContent.fallbackLabelPrefix,
  );

  return (
    <div
      className={`mx-3 flex h-24 w-44 shrink-0 items-center justify-center rounded-lg border border-trulab-border/8 bg-trulab-surface px-6 shadow-[0_12px_36px_rgb(var(--trulab-ink-rgb)/0.05)] sm:w-52 ${duplicate ? "logo-duplicate" : ""}`}
      aria-hidden={duplicate || undefined}
    >
      {failed ? (
        <span className="text-center text-xs font-semibold uppercase tracking-normal text-trulab-ink/38">{initials}</span>
      ) : (
        <Image
          src={src}
          alt={duplicate ? "" : alt}
          width={220}
          height={120}
          className="max-h-12 w-auto object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

export default function LogoMarquee() {
  const animationDuration = `${Math.max(logoMarqueeContent.logos.length * 5.3, 32)}s`;

  return (
    <section aria-labelledby="logo-marquee-title" className="py-8 sm:py-12">
      <Container>
        <p id="logo-marquee-title" className="mb-6 text-center text-sm font-semibold text-trulab-ink/54">
          {logoMarqueeContent.title}
        </p>
      </Container>
      <div className="marquee-mask overflow-hidden">
        <div
          className="logo-track flex w-max animate-marquee hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]"
          style={{ animationDuration }}
        >
          {logoMarqueeContent.logos.map((logo) => (
            <LogoTile key={logo.name} {...logo} />
          ))}
          {logoMarqueeContent.logos.map((logo) => (
            <LogoTile key={`${logo.name}-duplicate`} {...logo} duplicate />
          ))}
        </div>
      </div>
    </section>
  );
}
