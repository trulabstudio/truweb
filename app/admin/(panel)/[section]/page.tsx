import { notFound, redirect } from "next/navigation";
import SectionEditor from "@/components/admin/SectionEditor";
import { isAdmin } from "@/lib/admin/auth";
import { findSection } from "@/lib/admin/schema";
import { readContent, storageReady } from "@/lib/admin/storage";
import { adminText } from "@/lib/admin/text";

export const dynamic = "force-dynamic";

export default async function AdminSection({ params }: { params: Promise<{ section: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const section = findSection((await params).section);
  if (!section) notFound();

  if (!storageReady()) {
    return (
      <div className="pt-12">
        <h1 className="text-4xl font-semibold tracking-tight">{section.label}</h1>
        <p role="alert" className="mt-4 rounded-3xl border border-trulab-border/8 bg-trulab-surface p-5">{adminText.tokenMissing}</p>
      </div>
    );
  }

  const { text, sha } = await readContent(section.path);
  return <SectionEditor key={section.key} sectionKey={section.key} initial={JSON.parse(text)} sha={sha} />;
}
