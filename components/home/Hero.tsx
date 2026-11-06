import Image from "next/image";
import { ArrowDown, ArrowRight, CheckCircle2 } from "lucide-react";
import ButtonLink from "@/components/ui/ButtonLink";
import Container from "@/components/ui/Container";
import { heroContent, trustPills } from "@/lib/content/home";

export default function Hero() {
  // On phones only the first sentence shows, so the photo fits on the first screen.
  const [leadSentence, ...restSentences] = heroContent.description.split(/(?<=\.)\s+/);
  const restOfDescription = restSentences.join(" ");

  return (
    <section className="overflow-hidden pt-[4.5rem] sm:pt-24 lg:pt-28">
      <Container className="pb-10 sm:pb-14">
        <div className="grid gap-5 sm:gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
          <div className="reveal">
            <span className="section-kicker">
              <span className="h-2 w-2 rounded-full bg-trulab-accent" />
              {heroContent.kicker}
            </span>
            <h1 className="mt-3 max-w-3xl text-[1.85rem] font-semibold leading-[1.06] tracking-[-0.025em] text-trulab-ink [text-wrap:balance] sm:mt-6 sm:text-6xl lg:text-[3.5rem]">
              {heroContent.title}
            </h1>
            <p className="mt-3 max-w-xl text-[0.95rem] leading-6 text-trulab-muted sm:mt-6 sm:text-lg sm:leading-8">
              {leadSentence}
              {restOfDescription && <span className="hidden sm:inline"> {restOfDescription}</span>}
            </p>

            <div className="mt-4 flex flex-col gap-2 sm:mt-7 sm:flex-row sm:gap-3">
              <ButtonLink href={heroContent.primaryCta.href} className="max-sm:!py-3">{heroContent.primaryCta.label} <ArrowRight size={17} aria-hidden /></ButtonLink>
              <ButtonLink href={heroContent.secondaryCta.href} variant="secondary" className="max-sm:!py-3">{heroContent.secondaryCta.label} <ArrowDown size={17} aria-hidden /></ButtonLink>
            </div>
          </div>

          <div className="reveal relative lg:pl-6" style={{ animationDelay: "120ms" }}>
            <div className="relative overflow-hidden rounded-[22px] border border-trulab-border/8 bg-trulab-surface p-1.5 shadow-soft sm:rounded-[30px] sm:p-3">
              <Image
                src={heroContent.image.src}
                alt={heroContent.image.alt}
                width={1536}
                height={1024}
                sizes="(min-width: 1024px) 56vw, (min-width: 640px) calc(100vw - 32px), calc(100vw - 32px)"
                className="aspect-[16/9] w-full rounded-[17px] object-cover object-center sm:aspect-[16/10] sm:rounded-[22px]"
                priority
              />
            </div>
          </div>
        </div>

        <div className="reveal mt-7 rounded-[24px] border border-trulab-border/8 bg-trulab-surface/72 p-2 shadow-[0_18px_60px_rgb(var(--trulab-ink-rgb)/0.06)] backdrop-blur-xl sm:mt-8 sm:rounded-[26px]" style={{ animationDelay: "180ms" }}>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {trustPills.map((pill) => (
              <div key={pill} className="flex min-h-14 items-center gap-3 rounded-[20px] bg-trulab-bg px-4 py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[rgb(var(--trulab-accent-rgb)/0.35)] bg-trulab-surface text-[var(--trulab-accent-icon)]">
                  <CheckCircle2 size={16} aria-hidden />
                </span>
                <span className="text-sm font-semibold text-trulab-ink">{pill}</span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
