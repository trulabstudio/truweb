import { adminText } from "@/lib/admin/text";

export default function ThreadsSetupNotice() {
  return (
    <div role="alert" className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
      <h2 className="font-semibold">{adminText.threads.setupTitle}</h2>
      <p className="mt-1 text-sm leading-6">{adminText.threads.setupBody}</p>
    </div>
  );
}
