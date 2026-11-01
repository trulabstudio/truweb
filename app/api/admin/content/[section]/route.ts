import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { findSection, validateSection } from "@/lib/admin/schema";
import { ConflictError, storageReady, writeFileToSite } from "@/lib/admin/storage";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ section: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  if (!storageReady()) return NextResponse.json({ error: "GITHUB_CONTENT_TOKEN is not configured." }, { status: 503 });

  const section = findSection((await params).section);
  if (!section) return NextResponse.json({ error: "Section not found." }, { status: 404 });

  const body = (await request.json().catch(() => null)) as { value?: unknown; sha?: string | null } | null;
  const { data, errors } = validateSection(section, body?.value);
  if (errors.length) return NextResponse.json({ error: "Please fix the following fields.", errors }, { status: 400 });

  try {
    const sha = await writeFileToSite(
      section.path,
      Buffer.from(`${JSON.stringify(data, null, 2)}\n`),
      `Admin: update ${section.label}`,
      body?.sha,
    );
    return NextResponse.json({ sha });
  } catch (error) {
    if (error instanceof ConflictError) {
      return NextResponse.json({ error: "This content changed elsewhere. Reload the page and try again." }, { status: 409 });
    }
    console.error("Admin save:", error);
    return NextResponse.json({ error: "Could not save. Please try again." }, { status: 502 });
  }
}
