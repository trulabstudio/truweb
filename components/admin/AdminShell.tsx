"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import {
  ArrowUpRight, Building2, ChartNoAxesColumn, ListChecks, MessagesSquare, SlidersHorizontal, CircleHelp, ClipboardList, Cookie, FileWarning, Image as ImageIcon, Images, Inbox, LayoutDashboard,
  LayoutTemplate, LogOut, Mail, Menu, Package, Palette, Phone, Rows3, Search, Shapes, Sparkles, Wrench, X, type LucideIcon,
} from "lucide-react";
import { confirmLeave } from "@/components/admin/unsaved";
import { sections } from "@/lib/admin/schema";
import { adminText } from "@/lib/admin/text";

const icons: Record<string, LucideIcon> = {
  packages: Package,
  faq: CircleHelp,
  contact: Phone,
  hero: LayoutTemplate,
  services: Sparkles,
  other: Rows3,
  "hero-image": ImageIcon,
  clients: Images,
  seo: Search,
  company: Building2,
  "brand-assets": Shapes,
  "brand-colors": Palette,
  navigation: Menu,
  "contact-form": ClipboardList,
  emails: Mail,
  tools: Wrench,
  "status-pages": FileWarning,
  "cookie-banner": Cookie,
};

export const sectionIcon = (key: string) => icons[key] ?? Rows3;

const guard = (event: MouseEvent) => {
  if (!confirmLeave()) event.preventDefault();
};

function NavLink({ href, icon: Icon, label, active, onNavigate }: { href: string; icon: LucideIcon; label: string; active: boolean; onNavigate: () => void }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      onClick={(event) => {
        guard(event);
        if (!event.defaultPrevented) onNavigate();
      }}
      className={`focus-ring flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-trulab-on-dark/10 text-trulab-on-dark" : "text-trulab-on-dark/60 hover:bg-trulab-on-dark/5 hover:text-trulab-on-dark"}`}
    >
      <Icon size={17} aria-hidden className={active ? "text-trulab-accent" : ""} />
      {label}
    </Link>
  );
}

export default function AdminShell({ logo, companyName, children }: { logo: string; companyName: string; children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const groups = [...new Set(sections.map((section) => section.group))];
  const close = () => setOpen(false);
  // Enquiries is shared, so opening it keeps the space the user was already in.
  const [lastSpace, setLastSpace] = useState<"website" | "threads">("website");
  const space = pathname === "/admin/enquiries" ? lastSpace : pathname?.startsWith("/admin/threads") ? "threads" : "website";

  useEffect(() => setLastSpace(space), [space]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function signOut() {
    if (!confirmLeave()) return;
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  const brand = (
    <Link href="/admin" onClick={guard} className="focus-ring flex items-center gap-3 rounded-xl">
      <Image src={logo} alt="" width={36} height={36} className="h-9 w-9 rounded-lg object-cover" />
      <span className="grid text-sm font-semibold leading-tight text-trulab-on-dark">
        {companyName}
        <span className="text-xs font-medium text-trulab-on-dark/50">{adminText.panelName}</span>
      </span>
    </Link>
  );

  return (
    <div className="lg:pl-72">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-trulab-dark px-4 lg:hidden">
        {brand}
        <button type="button" onClick={() => setOpen(true)} aria-label={adminText.openMenu} className="focus-ring grid h-10 w-10 place-items-center rounded-full text-trulab-on-dark hover:bg-trulab-on-dark/10">
          <Menu size={20} aria-hidden />
        </button>
      </header>

      {open && <button type="button" aria-label={adminText.closeMenu} onClick={close} className="fixed inset-0 z-40 bg-trulab-dark/50 lg:hidden" />}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-trulab-dark transition-transform duration-200 lg:translate-x-0 ${open ? "translate-x-0" : "invisible -translate-x-full lg:visible"}`}>
        <div className="flex h-20 shrink-0 items-center justify-between px-5">
          {brand}
          <button type="button" onClick={close} aria-label={adminText.closeMenu} className="focus-ring grid h-10 w-10 place-items-center rounded-full text-trulab-on-dark hover:bg-trulab-on-dark/10 lg:hidden">
            <X size={20} aria-hidden />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 pb-6">
          <NavLink href="/admin/enquiries" icon={Inbox} label={adminText.enquiries} active={pathname === "/admin/enquiries"} onNavigate={close} />
          <div className="my-3 grid grid-cols-2 gap-1 rounded-xl bg-trulab-on-dark/5 p-1">
            {([["website", "/admin", adminText.spaces.website], ["threads", "/admin/threads", adminText.spaces.threads]] as const).map(([id, href, label]) => (
              <Link
                key={id}
                href={href}
                aria-current={space === id ? "true" : undefined}
                onClick={(event) => {
                  guard(event);
                  if (!event.defaultPrevented) close();
                }}
                className={`focus-ring rounded-lg px-3 py-2 text-center text-sm font-semibold transition ${space === id ? "bg-trulab-accent text-trulab-ink" : "text-trulab-on-dark/60 hover:text-trulab-on-dark"}`}
              >
                {label}
              </Link>
            ))}
          </div>
          {space === "threads" ? (
            <>
              <NavLink href="/admin/threads" icon={ListChecks} label={adminText.threads.queue} active={pathname === "/admin/threads"} onNavigate={close} />
              <NavLink href="/admin/threads/conversations" icon={MessagesSquare} label={adminText.threads.conversations} active={pathname === "/admin/threads/conversations"} onNavigate={close} />
              <NavLink href="/admin/threads/performance" icon={ChartNoAxesColumn} label={adminText.threads.performance} active={pathname === "/admin/threads/performance"} onNavigate={close} />
              <NavLink href="/admin/threads/settings" icon={SlidersHorizontal} label={adminText.threads.settings} active={pathname === "/admin/threads/settings"} onNavigate={close} />
            </>
          ) : (
            <>
              <NavLink href="/admin" icon={LayoutDashboard} label={adminText.overview} active={pathname === "/admin"} onNavigate={close} />
              {groups.map((group) => (
                <div key={group} className="mt-5 grid gap-1">
                  <p className="px-3 pb-1 text-xs font-semibold text-trulab-on-dark/40">{group}</p>
                  {sections.filter((section) => section.group === group).map((section) => {
                    const href = `/admin/${section.key}`;
                    return <NavLink key={section.key} href={href} icon={sectionIcon(section.key)} label={section.label} active={pathname === href} onNavigate={close} />;
                  })}
                </div>
              ))}
            </>
          )}
        </nav>
        <div className="grid gap-1 border-t border-trulab-on-dark/10 p-3">
          <a href="/" target="_blank" rel="noreferrer" className="focus-ring flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-trulab-on-dark/60 transition hover:bg-trulab-on-dark/5 hover:text-trulab-on-dark">
            <ArrowUpRight size={17} aria-hidden />
            {adminText.viewWebsite}
          </a>
          <button type="button" onClick={signOut} className="focus-ring flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-trulab-on-dark/60 transition hover:bg-trulab-on-dark/5 hover:text-trulab-on-dark">
            <LogOut size={17} aria-hidden />
            {adminText.signOut}
          </button>
        </div>
      </aside>

      <main className="mx-auto w-full max-w-5xl px-4 pb-16 sm:px-8">{children}</main>
    </div>
  );
}
