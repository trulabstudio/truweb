import { ArrowDown } from "lucide-react";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { featuredServiceLink, services, servicesContent } from "@/lib/content/services";
import type { Service } from "@/lib/types/content";

// The first service is the speciality: it takes two columns and links to its own section.
export default function Services() {
  return (
    <Section id="services">
      <Container>
        <SectionHeading {...servicesContent} />
        <ServiceCards items={services} featured={featuredServiceLink} />
      </Container>
    </Section>
  );
}

const card = "group flex h-full min-w-0 flex-col rounded-[26px] border p-6 shadow-[0_14px_40px_rgb(var(--trulab-ink-rgb)/0.05)] transition duration-300 hover:-translate-y-0.5 hover:shadow-lift";

export function ServiceCards({ items, featured }: { items: ReadonlyArray<Service>; featured?: { label: string; href: string } }) {
  return (
    <div className={`mt-9 grid items-stretch gap-4 sm:mt-10 sm:grid-cols-2 ${featured ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
      {items.map(({ title, description, icon: Icon }, index) =>
        featured && index === 0 ? (
          <article key={title} className={`${card} border-trulab-accent bg-trulab-dark text-trulab-on-dark sm:col-span-2`}>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-trulab-accent text-trulab-ink">
              <Icon size={22} aria-hidden />
            </div>
            <h3 className="mt-6 text-2xl font-semibold">{title}</h3>
            <p className="mt-3 max-w-xl break-words text-sm leading-7 text-trulab-on-dark/72">{description}</p>
            <Link href={featured.href} className="focus-ring mt-auto inline-flex items-center gap-2 self-start rounded-full pt-6 text-sm font-semibold text-trulab-accent">
              {featured.label}
              <ArrowDown size={16} aria-hidden />
            </Link>
          </article>
        ) : (
          <article key={title} className={`${card} border-trulab-border/8 bg-trulab-surface hover:border-trulab-border/12`}>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-trulab-accent/30 text-trulab-ink transition group-hover:bg-trulab-accent">
              <Icon size={22} aria-hidden />
            </div>
            <h3 className="mt-6 text-xl font-semibold text-trulab-ink">{title}</h3>
            <p className="mt-3 break-words text-sm leading-7 text-trulab-muted">{description}</p>
          </article>
        ),
      )}
    </div>
  );
}
