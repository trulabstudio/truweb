import Link from "next/link";
import { redirect } from "next/navigation";
import { Mail, MessageCircle } from "lucide-react";
import { isAdmin } from "@/lib/admin/auth";
import { enquiriesConfigured, listEnquiries, whatsappNumber } from "@/lib/admin/enquiries";
import { adminText } from "@/lib/admin/text";

export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat("en-MY", { dateStyle: "medium", timeStyle: "short", hourCycle: "h23", timeZone: "Asia/Kuala_Lumpur" });
const actionClass = "focus-ring inline-flex items-center gap-2 rounded-full border border-trulab-border/10 bg-trulab-surface px-3.5 py-1.5 text-sm font-semibold transition hover:shadow-lift";
const notice = "rounded-3xl border border-trulab-border/10 bg-trulab-surface p-5";

export default async function AdminEnquiries({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const params = await searchParams;
  const search = (params.q ?? "").slice(0, 100);
  const page = Math.max(1, Math.floor(Number(params.page)) || 1);

  const header = (
    <header>
      <span className="section-kicker">{adminText.enquiriesKicker}</span>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">{adminText.enquiries}</h1>
      <p className="mt-2 text-trulab-muted">{adminText.enquiriesDescription}</p>
    </header>
  );

  if (!enquiriesConfigured()) {
    return <div className="grid gap-8 pt-8 lg:pt-12">{header}<p role="alert" className={notice}>{adminText.enquiriesMissing}</p></div>;
  }

  let result: Awaited<ReturnType<typeof listEnquiries>>;
  try {
    result = await listEnquiries(page, search);
  } catch (error) {
    console.error("Admin enquiries:", error);
    return <div className="grid gap-8 pt-8 lg:pt-12">{header}<p role="alert" className={notice}>{adminText.enquiriesFailed}</p></div>;
  }

  const { enquiries, total, pageSize } = result;
  const pageLink = (target: number) => `/admin/enquiries?${new URLSearchParams({ ...(search ? { q: search } : {}), page: String(target) })}`;
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="grid grid-cols-1 gap-6 pt-8 lg:pt-12">
      {header}

      <form action="/admin/enquiries" className="flex flex-wrap gap-2">
        <input name="q" type="search" defaultValue={search} aria-label={adminText.searchLabel} placeholder={adminText.searchLabel} className="tool-input min-w-60 flex-1" />
        <button className="focus-ring rounded-full bg-trulab-button-primary px-5 py-2.5 text-sm font-semibold text-trulab-button-primary-text transition hover:bg-trulab-button-primary-hover">{adminText.searchButton}</button>
        {search && <Link href="/admin/enquiries" className={`${actionClass} py-2.5`}>{adminText.clearSearch}</Link>}
      </form>

      {enquiries.length === 0 ? <p className={notice}>{adminText.enquiriesEmpty}</p> : (
        <div className="grid grid-cols-1 gap-3">
          {enquiries.map((enquiry) => (
            <article key={enquiry.id} className="grid gap-3 rounded-3xl border border-trulab-border/10 bg-trulab-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                <div className="min-w-0">
                  <h2 className="font-semibold">{enquiry.name}</h2>
                  <p className="text-sm text-trulab-muted">{enquiry.company || adminText.noCompany} · {enquiry.packageLabel || adminText.noPackage}{enquiry.threadsPostId ? ` · ${adminText.threads.fromPost(enquiry.threadsPostId)}` : ""}</p>
                </div>
                <time dateTime={enquiry.createdAt} className="text-sm text-trulab-muted">{dateFormat.format(new Date(enquiry.createdAt))}</time>
              </div>
              <p className="whitespace-pre-wrap break-words text-sm leading-6">{enquiry.message}</p>
              <div className="flex flex-wrap gap-2">
                <a href={`https://wa.me/${whatsappNumber(enquiry.phone)}`} target="_blank" rel="noreferrer" className={actionClass}>
                  <MessageCircle size={15} aria-hidden />
                  {adminText.whatsapp} · {enquiry.phone}
                </a>
                <a href={`mailto:${enquiry.email}`} className={`${actionClass} min-w-0 break-all`}>
                  <Mail size={15} aria-hidden className="shrink-0" />
                  {enquiry.email}
                </a>
              </div>
            </article>
          ))}
        </div>
      )}

      {total > 0 && (
        <nav className="flex items-center justify-between gap-3 text-sm">
          <span className="text-trulab-muted">{adminText.pageSummary(from, to, total)}</span>
          <div className="flex gap-2">
            {page > 1 && <Link href={pageLink(page - 1)} className={actionClass}>{adminText.newer}</Link>}
            {to < total && <Link href={pageLink(page + 1)} className={actionClass}>{adminText.older}</Link>}
          </div>
        </nav>
      )}
    </div>
  );
}
