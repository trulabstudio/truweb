import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { processContent, processSteps } from "@/lib/content/process";

export default function Process() {
  return (
    <Section id="process">
      <Container>
        <SectionHeading {...processContent} />

        <div className="relative mt-10 grid items-stretch gap-4 sm:mt-12 md:grid-cols-2 lg:grid-cols-3">
          {processSteps.map((step, index) => (
            <article key={step.title} className="relative flex h-full min-w-0 flex-col rounded-[26px] border border-black/8 bg-white p-6 shadow-[0_14px_40px_rgba(23,23,23,0.05)]">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-trulab-ink text-sm font-semibold tabular-nums text-white" aria-label={`Step ${index + 1}`}>
                {index + 1}
              </span>
              <h3 className="mt-6 text-xl font-semibold text-trulab-ink">{step.title}</h3>
              <p className="mt-3 break-words text-sm leading-7 text-trulab-muted">{step.description}</p>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
