import clients from "@/content/home/clients.json";
import services from "@/content/home/services.json";
import faq from "@/content/faq.json";
import packages from "@/content/packages.json";
import SectionCards from "@/components/admin/SectionCards";
import { isAdmin } from "@/lib/admin/auth";
import { hasGithubStorage, storageReady } from "@/lib/admin/storage";
import { adminText } from "@/lib/admin/text";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  if (!(await isAdmin())) redirect("/admin/login");

  const metrics: [string, number][] = [
    [adminText.metrics.packages, packages.items.length],
    [adminText.metrics.faqs, faq.items.length],
    [adminText.metrics.services, services.items.length],
    [adminText.metrics.logos, clients.logos.length],
  ];
  const ready = storageReady();
  const github = hasGithubStorage();
  const status = github ? adminText.statusLive : ready ? adminText.statusLocal : adminText.statusOff;
  const statusText = github ? adminText.publishingLive : ready ? adminText.publishingLocal : adminText.publishingOff;

  return (
    <div className="grid gap-8 pt-8 lg:pt-12">
      <header>
        <span className="section-kicker">{adminText.overviewKicker}</span>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">{adminText.overview}</h1>
        <p className="mt-2 text-trulab-muted">{adminText.overviewDescription}</p>
      </header>

      <section aria-label={adminText.metricsLabel} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map(([label, value]) => (
          <div key={label} className="rounded-3xl border border-trulab-border/8 bg-trulab-surface p-5">
            <p className="text-3xl font-semibold tabular-nums">{value}</p>
            <p className="mt-1 text-sm text-trulab-muted">{label}</p>
          </div>
        ))}
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-trulab-dark p-5 text-trulab-on-dark">
        <div>
          <h2 className="font-semibold">{adminText.publishing}</h2>
          <p className="mt-0.5 text-sm text-trulab-on-dark/70">{statusText}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${github ? "bg-trulab-accent text-trulab-ink" : "bg-trulab-on-dark/10 text-trulab-on-dark"}`}>{status}</span>
      </section>

      <SectionCards />
    </div>
  );
}
