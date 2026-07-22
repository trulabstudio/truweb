"use client";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import StatusState from "@/components/shared/StatusState";

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
          code="500"
          title="Something went wrong."
          description="The page could not finish loading. Try again, or return to the homepage if the issue continues."
          variant="error"
          primaryHref="/"
          primaryLabel="Back to homepage"
        />
        <div className="section-shell -mt-20 pb-20">
          <button
            type="button"
            onClick={reset}
            className="focus-ring rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-trulab-ink shadow-sm transition hover:-translate-y-0.5 hover:shadow-lift"
          >
            Try again
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
}
