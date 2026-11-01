import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { isAdmin } from "@/lib/admin/auth";
import { siteConfig } from "@/lib/site-config";

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");
  return <AdminShell logo={siteConfig.assets.logoLight} companyName={siteConfig.name}>{children}</AdminShell>;
}
