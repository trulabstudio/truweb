"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { adminText } from "@/lib/admin/text";

export default function DeleteEnquiryButton({ id, name, className }: { id: string; name: string; className: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (busy || !window.confirm(adminText.deleteEnquiryConfirm(name))) return;
    setBusy(true);
    const response = await fetch(`/api/admin/enquiries?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => null);
    setBusy(false);
    if (!response?.ok) {
      window.alert(adminText.deleteEnquiryFailed);
      return;
    }
    router.refresh();
  }

  return (
    <button type="button" onClick={remove} disabled={busy} className={`${className} text-red-700 disabled:opacity-60`}>
      {busy ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <Trash2 size={15} aria-hidden />}
      {adminText.deleteEnquiry}
    </button>
  );
}
