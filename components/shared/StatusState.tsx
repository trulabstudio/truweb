import Link from "next/link";
import { AlertTriangle, ArrowLeft, Home, Loader2, ShieldAlert } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

type StatusStateProps = {
  eyebrow?: string;
  title: string;
  description: string;
  code?: string;
  variant?: "default" | "error" | "loading" | "empty" | "blocked";
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

const iconMap = {
  default: Home,
  error: AlertTriangle,
  loading: Loader2,
  empty: Home,
  blocked: ShieldAlert,
};

export default function StatusState({
  eyebrow = siteConfig.name,
  title,
  description,
  code,
  variant = "default",
  primaryHref = "/",
  primaryLabel = "Back to homepage",
  secondaryHref,
  secondaryLabel,
}: StatusStateProps) {
  const Icon = iconMap[variant];
  const isLoading = variant === "loading";

  return (
    <section className="section-shell flex min-h-[70vh] items-center py-24 sm:py-28">
      <div className="w-full max-w-3xl">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-black/10 bg-white text-trulab-ink shadow-sm">
          <Icon className={isLoading ? "h-5 w-5 animate-spin" : "h-5 w-5"} aria-hidden />
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.12em] text-trulab-muted">
          {code ? `${code} / ${eyebrow}` : eyebrow}
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-trulab-ink sm:text-6xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-trulab-muted sm:text-lg">
          {description}
        </p>
        {!isLoading ? (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={primaryHref}
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-full bg-trulab-ink px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-black"
            >
              <Home size={17} aria-hidden />
              {primaryLabel}
            </Link>
            {secondaryHref && secondaryLabel ? (
              <Link
                href={secondaryHref}
                className="focus-ring inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-6 py-3.5 text-sm font-semibold text-trulab-ink shadow-sm transition hover:-translate-y-0.5 hover:shadow-lift"
              >
                <ArrowLeft size={17} aria-hidden />
                {secondaryLabel}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
