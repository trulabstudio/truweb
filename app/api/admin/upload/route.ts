import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { imageFolders, type ImageFolder } from "@/lib/admin/schema";
import { storageReady, writeFileToSite } from "@/lib/admin/storage";

// Vercel limits request bodies to 4.5 MB.
const MAX_BYTES = 4 * 1024 * 1024;

function imageExtension(data: Buffer) {
  if (data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (data.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return "jpg";
  if (data.toString("latin1", 0, 4) === "RIFF" && data.toString("latin1", 8, 12) === "WEBP") return "webp";
  return null;
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  if (!storageReady()) return NextResponse.json({ error: "GITHUB_CONTENT_TOKEN is not configured." }, { status: 503 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const folder = form?.get("folder");
  if (!(file instanceof File) || typeof folder !== "string" || !imageFolders.includes(folder as ImageFolder)) {
    return NextResponse.json({ error: "Invalid image." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Image is larger than 4 MB." }, { status: 413 });

  const data = Buffer.from(await file.arrayBuffer());
  const extension = imageExtension(data);
  if (!extension) return NextResponse.json({ error: "Only PNG, JPG or WebP are allowed." }, { status: 415 });

  const name = `${Date.now()}-${randomBytes(3).toString("hex")}.${extension}`;
  try {
    await writeFileToSite(`public/images/${folder}/${name}`, data, `Admin: upload ${folder} image`);
    return NextResponse.json({ path: `/images/${folder}/${name}` });
  } catch (error) {
    console.error("Admin upload:", error);
    return NextResponse.json({ error: "Could not upload. Please try again." }, { status: 502 });
  }
}
