import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import LoginForm from "@/components/admin/LoginForm";
import { isAdmin } from "@/lib/admin/auth";
import { adminText } from "@/lib/admin/text";
import { siteConfig } from "@/lib/site-config";

export default async function AdminLogin() {
  if (await isAdmin()) redirect("/admin/threads");
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-trulab-dark p-12 text-trulab-on-dark lg:flex">
        <div className="flex items-center gap-3">
          <Image src={siteConfig.assets.logoLight} alt="" width={44} height={44} className="h-11 w-11 rounded-xl object-cover" />
          <span className="font-semibold">{siteConfig.name}</span>
        </div>
        <div>
          <h2 className="max-w-md text-4xl font-semibold leading-tight tracking-tight">{adminText.panelHeadline}</h2>
          <ul className="mt-8 grid gap-3">
            {adminText.panelPoints.map((point) => (
              <li key={point} className="flex items-center gap-3 text-trulab-on-dark/70">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-trulab-accent text-trulab-ink"><Check size={14} aria-hidden /></span>
                {point}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-trulab-on-dark/40">{siteConfig.divisionLine}</p>
      </aside>
      <main className="flex flex-col justify-center px-4 py-12 sm:px-8">
        <div className="mx-auto w-full max-w-md">
          <Image src={siteConfig.assets.logo} alt="" width={44} height={44} className="mb-8 h-11 w-11 rounded-xl object-cover lg:hidden" />
          <span className="section-kicker">{adminText.signInKicker}</span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">{adminText.signInTitle}</h1>
          <p className="mt-2 text-trulab-muted">{adminText.signInDescription}</p>
          <LoginForm />
          <Link href="/" className="focus-ring mt-6 inline-flex items-center gap-2 rounded-md text-sm font-medium text-trulab-muted transition hover:text-trulab-ink">
            <ArrowLeft size={16} aria-hidden />
            {adminText.backToWebsite}
          </Link>
        </div>
      </main>
    </div>
  );
}
