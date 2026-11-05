import { ArrowUpRight, Check } from "lucide-react";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import { foxduskContent } from "@/lib/content/services";

export default function Foxdusk() {
  const { kicker, title, description, features, price, cta } = foxduskContent;
  const external = /^https?:\/\//.test(cta.href);

  return (
    <Section id="foxdusk">
      <Container>
        <div className="grid gap-10 rounded-[32px] bg-trulab-dark p-7 text-trulab-on-dark shadow-lift sm:p-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14 lg:p-14">
          <div className="min-w-0">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-trulab-accent">{kicker}</span>
            <h2 className="mt-5 text-3xl font-semibold leading-tight sm:text-5xl">{title}</h2>
            <p className="mt-5 text-base leading-8 text-trulab-on-dark/72">{description}</p>
            <p className="mt-6 text-sm font-semibold text-trulab-on-dark/90">{price}</p>
            <a
              href={cta.href}
              {...(external ? { target: "_blank", rel: "noopener" } : {})}
              className="focus-ring mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-trulab-accent px-6 py-3.5 text-sm font-semibold text-trulab-ink shadow-sm transition hover:-translate-y-0.5"
            >
              {cta.label}
              <ArrowUpRight size={16} aria-hidden />
            </a>
          </div>

          <ul className="grid content-center gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {features.map((feature) => (
              <li key={feature} className="flex gap-3 rounded-2xl border border-trulab-on-dark/12 px-4 py-3.5 text-sm leading-6 text-trulab-on-dark/86">
                <Check size={17} className="mt-0.5 shrink-0 text-trulab-accent" strokeWidth={2.5} aria-hidden />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}
