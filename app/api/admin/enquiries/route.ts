import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { deleteEnquiry } from "@/lib/admin/enquiries";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function DELETE(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const id = request.nextUrl.searchParams.get("id") ?? "";
  if (!UUID.test(id)) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  try {
    await deleteEnquiry(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin enquiries:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Could not delete this enquiry." }, { status: 502 });
  }
}
