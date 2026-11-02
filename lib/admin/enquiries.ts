import { konsultasiContent } from "@/lib/content/konsultasi";
import { getPackageInterestLabel } from "@/lib/types/lead";

const PAGE_SIZE = 25;

type Enquiry = {
  id: string;
  createdAt: string;
  name: string;
  company: string | null;
  email: string;
  phone: string;
  packageLabel: string;
  message: string;
  threadsPostId: string | null;
  form: "konsultasi" | "website";
};

type LeadRow = {
  id: string;
  created_at: string;
  name: string;
  company: string | null;
  email: string;
  phone: string;
  // The database keeps its historical `budget` column, which stores package IDs or old budget labels.
  budget: string | null;
  message: string;
  source: string;
};

export const enquiriesConfigured = () => Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

/** Malaysian numbers are stored as typed, so WhatsApp links need the country code added. */
export function whatsappNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("0") ? `6${digits}` : digits;
}

export async function listEnquiries(page: number, search: string) {
  const query = new URLSearchParams({
    select: "id,created_at,name,company,email,phone,budget,message,source",
    order: "created_at.desc",
    limit: String(PAGE_SIZE),
    offset: String((page - 1) * PAGE_SIZE),
  });
  // Characters with a meaning in PostgREST filters are removed rather than passed through.
  const term = search.replace(/[^\p{L}\p{N} @.+-]/gu, "").trim();
  if (term) {
    query.set("or", `(${["name", "company", "email", "phone"].map((column) => `${column}.ilike.*${term}*`).join(",")})`);
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/leads?${query}`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, Prefer: "count=exact" },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Supabase ${response.status} while listing enquiries`);

  const rows = (await response.json()) as LeadRow[];
  const total = Number(response.headers.get("content-range")?.split("/")[1] ?? rows.length);
  const enquiries: Enquiry[] = rows.map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    name: row.name,
    company: row.company,
    email: row.email,
    phone: row.phone,
    packageLabel: getPackageInterestLabel(row.budget ?? "") || (row.budget ?? ""),
    message: row.message,
    threadsPostId: row.source.match(/^threads-(\d+)$/)?.[1] ?? null,
    // The short form saves a fixed message, which tells the two forms apart without a database change.
    form: row.message === konsultasiContent.form.leadMessage ? "konsultasi" : "website",
  }));
  return { enquiries, total, pageSize: PAGE_SIZE };
}

export async function deleteEnquiry(id: string) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/leads?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Supabase ${response.status} while deleting an enquiry`);
}
