"use client";

import Image from "next/image";
import { useState } from "react";
import Container from "@/components/ui/Container";
import { logoMarqueeContent } from "@/lib/content/home";

function LogoTile({ name, src, duplicate = false }: { name: string; src: string; duplicate?: boolean }) {
  const [failed, setFailed] = useState(false);
  const initials = name.replace("Client logo slot ", "Logo ");

  return (
    <div
      className={`mx-3 flex h-24 w-44 shrink-0 items-center justify-center rounded-lg border border-black/8 bg-white px-6 shadow-[0_12px_36px_rgba(23,23,23,0.05)] sm:w-52 ${duplicate ? "logo-duplicate" : ""}`}
      aria-hidden={duplicate || undefined}
    >
      {failed ? (
        <span className="text-center text-xs font-semibold uppercase tracking-normal text-black/38">{initials}</span>
      ) : (
        <Image
          src={src}
          alt={duplicate ? "" : name}
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
  return (
    <section aria-labelledby="logo-marquee-title" className="py-8 sm:py-12">
      <Container>
        <p id="logo-marquee-title" className="mb-6 text-center text-sm font-semibold text-black/54">
          {logoMarqueeContent.title}
        </p>
      </Container>
      <div className="marquee-mask overflow-hidden">
        <div className="logo-track flex w-max animate-marquee hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]">
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
