import { Check, Star } from "lucide-react";
import ButtonLink from "@/components/ui/ButtonLink";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import {
  packageNotes,
  packagesContent,
  productionPackages,
} from "@/lib/content/packages";

export default function Packages() {
  return (
    <Section id="packages" className="bg-trulab-surface/55">
      <Container>
        <SectionHeading {...packagesContent} />

        <div className="mt-10 grid items-stretch gap-5 sm:mt-12 lg:grid-cols-3">
          {productionPackages.filter((item) => item.layout === "card").map((item) => (
            <article
              key={item.id}
              className={`relative flex h-full min-w-0 flex-col rounded-[28px] border p-6 shadow-[0_14px_40px_rgb(var(--trulab-ink-rgb)/0.05)] sm:p-7 ${
                item.featured
                  ? "border-trulab-accent bg-trulab-dark text-trulab-on-dark shadow-lift"
                  : "border-trulab-border/8 bg-trulab-surface text-trulab-ink"
              }`}
            >
              {item.featured ? (
                <span className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-trulab-accent px-3 py-1.5 text-xs font-semibold text-trulab-ink">
                  <Star size={13} fill="currentColor" aria-hidden />
                  {item.highlightLabel}
                </span>
              ) : null}

              <p className={`text-xs font-semibold tracking-[0.18em] ${item.featured ? "text-trulab-on-dark/55" : "text-trulab-muted"}`}>
                {item.number}
              </p>
              <h3 className="mt-5 text-2xl font-semibold uppercase tracking-tight">{item.name}</h3>
              <p className={`mt-5 text-3xl font-semibold sm:text-4xl ${item.featured ? "text-trulab-accent" : ""}`}>
                {item.price}{item.priceSuffix ? ` ${item.priceSuffix}` : ""}
              </p>
              <p className={`mt-4 min-h-14 text-sm leading-7 ${item.featured ? "text-trulab-on-dark/68" : "text-trulab-muted"}`}>
                {item.description}
              </p>

              <ul className={`mt-7 flex-1 space-y-3 border-t pt-7 ${item.featured ? "border-trulab-on-dark/12" : "border-trulab-border/8"}`}>
                {item.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm leading-6">
                    <Check
                      size={17}
                      className={`mt-1 shrink-0 ${item.featured ? "text-trulab-accent" : "text-trulab-ink"}`}
                      strokeWidth={2.5}
                      aria-hidden
                    />
                    <span className={item.featured ? "text-trulab-on-dark/82" : "text-trulab-muted"}>{feature}</span>
                  </li>
                ))}
              </ul>

              <ButtonLink
                href={item.cta.href}
                variant={item.featured ? "secondary" : "primary"}
                className="mt-8 w-full"
              >
                {item.cta.label}
              </ButtonLink>
            </article>
          ))}
        </div>

        {productionPackages.filter((item) => item.layout === "wide").map((item) => (
          <article
            key={item.id}
            className="mt-5 grid gap-8 rounded-[28px] border border-trulab-border/8 bg-trulab-accent/30 p-6 shadow-[0_14px_40px_rgb(var(--trulab-ink-rgb)/0.04)] sm:p-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:p-10"
          >
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-trulab-muted">{item.number}</p>
              <h3 className="mt-5 text-2xl font-semibold uppercase tracking-tight text-trulab-ink sm:text-3xl">
                {item.name}
              </h3>
              <p className="mt-5 text-3xl font-semibold text-trulab-ink sm:text-4xl">{item.price}{item.priceSuffix ? ` ${item.priceSuffix}` : ""}</p>
              <p className="mt-4 max-w-lg text-sm leading-7 text-trulab-muted">{item.description}</p>
              {item.closingText ? <p className="mt-5 text-base font-semibold text-trulab-ink">{item.closingText}</p> : null}
              <ButtonLink href={item.cta.href} className="mt-7">
                {item.cta.label}
              </ButtonLink>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2">
              {item.features.map((feature) => (
                <li key={feature} className="flex gap-3 rounded-2xl bg-trulab-surface/70 px-4 py-3 text-sm leading-6 text-trulab-muted">
                  <Check size={17} className="mt-1 shrink-0 text-trulab-ink" strokeWidth={2.5} aria-hidden />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}

        <div className="mt-6 rounded-[22px] border border-trulab-border/8 bg-trulab-surface px-5 py-5 sm:px-6">
          <ul className="grid gap-x-8 gap-y-2 text-xs leading-6 text-trulab-muted sm:grid-cols-2">
            {packageNotes.map((note) => (
              <li key={note} className="flex gap-2.5">
                <span aria-hidden>•</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}
