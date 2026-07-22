import type { Metadata } from "next";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import StatusState from "@/components/shared/StatusState";
import { statusPageContent } from "@/lib/content/pages";

const content = statusPageContent.maintenance;

export const metadata: Metadata = {
  title: content.metadataTitle,
  description: content.metadataDescription,
  robots: {
    index: false,
    follow: false,
  },
};

export default function MaintenancePage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <StatusState
          title={content.title}
          description={content.description}
          variant="error"
        />
      </main>
      <Footer />
    </>
  );
}
