import { adminText } from "@/lib/admin/text";

// Keeps the sidebar in place and responds immediately while a section loads.
export default function AdminPanelLoading() {
  return (
    <div role="status" aria-label={adminText.loading} className="grid animate-pulse gap-4 pt-8 lg:pt-12">
      <div className="h-10 w-64 rounded-2xl bg-trulab-border/10" />
      <div className="h-4 w-80 max-w-full rounded-full bg-trulab-border/10" />
      <div className="mt-4 h-48 rounded-3xl bg-trulab-border/5" />
      <div className="h-64 rounded-3xl bg-trulab-border/5" />
    </div>
  );
}
