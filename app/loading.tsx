import StatusState from "@/components/shared/StatusState";
import { editableSite } from "@/lib/EDIT-SITE-HERE";

export default function Loading() {
  const content = editableSite.statusPages.loading;

  return (
    <main className="pt-16">
      <StatusState
        title={content.title}
        description={content.description}
        variant="loading"
      />
    </main>
  );
}
