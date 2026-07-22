import { BadgeCheck } from "lucide-react";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { certifications, certificationsContent } from "@/lib/content/certifications";

export default function Certifications() {
  return (
    <Section className="bg-white">
      <Container>
        <div className="rounded-[28px] border border-black/8 bg-trulab-bg p-5 shadow-soft sm:rounded-[32px] sm:p-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading {...certificationsContent} />
          </div>

          <div className="mt-8 grid items-stretch gap-4 sm:grid-cols-3">
            {certifications.map((item) => (
              <article key={item.title} className="flex h-full min-w-0 flex-col rounded-3xl border border-black/8 bg-white p-6 transition duration-200 hover:border-black/12 hover:shadow-sm">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-trulab-accent/30 text-[var(--trulab-accent-text)]">
                  <BadgeCheck size={24} aria-hidden />
                </span>
                <h3 className="mt-4 text-3xl font-semibold text-trulab-ink">{item.title}</h3>
                <p className="mt-2 text-sm font-medium text-trulab-muted">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
