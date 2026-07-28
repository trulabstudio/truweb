import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import { coverageContent } from "@/lib/content/home";

export default function RichSeo() {
  return (
    <Section>
      <Container className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div>
          <span className="section-kicker">{coverageContent.kicker}</span>
          <h2 className="mt-5 text-3xl font-semibold leading-tight text-trulab-ink sm:text-5xl">
            {coverageContent.title}
          </h2>
        </div>
        <div className="rounded-[28px] border border-trulab-border/8 bg-trulab-surface p-6 shadow-soft sm:p-8">
          {coverageContent.paragraphs.map((paragraph, index) => (
            <p key={paragraph} className={`${index ? "mt-5 " : ""}text-base leading-8 text-trulab-muted`}>{paragraph}</p>
          ))}
        </div>
      </Container>
    </Section>
  );
}
