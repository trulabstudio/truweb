"use client";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import StatusState from "@/components/shared/StatusState";
import { editableSite } from "@/lib/EDIT-SITE-HERE";

const content = editableSite.statusPages.error;
const common = editableSite.statusPages.common;

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <StatusState
          code={content.code}
          title={content.title}
          description={content.description}
          variant="error"
          primaryHref="/"
          primaryLabel={common.backToHomepage}
        />
        <div className="section-shell -mt-20 pb-20">
          <button
            type="button"
            onClick={reset}
            className="focus-ring rounded-full border border-trulab-border/10 bg-trulab-button-secondary px-5 py-3 text-sm font-semibold text-trulab-button-secondary-text shadow-sm transition hover:-translate-y-0.5 hover:shadow-lift"
          >
            {common.tryAgain}
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
}
