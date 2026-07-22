import StatusState from "@/components/shared/StatusState";
import { siteConfig } from "@/lib/site-config";

export default function Loading() {
  return (
    <main className="pt-16">
      <StatusState
        title={`Loading ${siteConfig.name}.`}
        description="Preparing the page and production tools."
        variant="loading"
      />
    </main>
  );
}
