import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { services, servicesContent } from "@/lib/content/services";

export default function Services() {
  return (
    <Section id="services">
      <Container>
        <SectionHeading {...servicesContent} />

        <div className="mt-9 grid items-stretch gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(({ title, description, icon: Icon }) => (
            <article key={title} className="group flex h-full min-w-0 flex-col rounded-[26px] border border-trulab-border/8 bg-trulab-surface p-6 shadow-[0_14px_40px_rgb(var(--trulab-ink-rgb)/0.05)] transition duration-300 hover:-translate-y-0.5 hover:border-trulab-border/12 hover:shadow-lift">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-trulab-accent/30 text-trulab-ink transition group-hover:bg-trulab-accent">
                <Icon size={22} aria-hidden />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-trulab-ink">{title}</h3>
              <p className="mt-3 break-words text-sm leading-7 text-trulab-muted">{description}</p>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
