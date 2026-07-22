import { CheckCircle2 } from "lucide-react";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { whyTrulabContent } from "@/lib/content/home";

export default function WhyTrulab() {
  return (
    <Section id="why-trulab" className="bg-white">
      <Container className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
        <SectionHeading kicker={whyTrulabContent.kicker} title={whyTrulabContent.title} description={whyTrulabContent.description} />

        <div className="grid min-w-0 gap-3">
          {whyTrulabContent.points.map((point) => (
            <div key={point} className="flex min-w-0 gap-4 rounded-2xl border border-black/8 bg-trulab-bg p-4 transition duration-200 hover:border-black/12 hover:bg-white hover:shadow-sm">
              <CheckCircle2 size={22} className="mt-0.5 shrink-0 text-[var(--trulab-accent-icon)]" aria-hidden />
              <p className="min-w-0 break-words text-sm leading-7 text-trulab-muted">{point}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
