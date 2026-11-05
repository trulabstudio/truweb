import { ServiceCards } from "@/components/home/Services";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { podcastServices, podcastServicesContent } from "@/lib/content/services";

export default function PodcastServices() {
  return (
    <Section id="podcast" className="bg-trulab-surface/55">
      <Container>
        <SectionHeading {...podcastServicesContent} />
        <ServiceCards items={podcastServices} />
      </Container>
    </Section>
  );
}
