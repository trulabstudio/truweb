"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { navLinks, navigationAccessibility, navigationCta, toolLinks } from "@/lib/navigation";
import { resolveNavigationHref } from "@/lib/navigation-utils";
import { siteConfig } from "@/lib/site-config";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuId = "primary-navigation-menu";

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        toggleRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-trulab-border/5 bg-trulab-bg/90 shadow-[0_8px_30px_rgb(var(--trulab-ink-rgb)/0.04)] backdrop-blur-xl supports-[backdrop-filter]:bg-trulab-bg/78">
      <nav className="section-shell flex h-16 items-center justify-between">
        <Link href="/" className="focus-ring flex items-center gap-3 rounded-full" aria-label={`${siteConfig.name} ${navigationAccessibility.homeSuffix}`}>
          <Image src={siteConfig.assets.logo} alt="" width={42} height={42} className="h-10 w-10 rounded-xl object-cover" priority />
          <span className="text-sm font-semibold tracking-normal text-trulab-ink sm:text-base">{siteConfig.name}</span>
        </Link>

        <div className="hidden items-center gap-7 xl:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={resolveNavigationHref(link.href)} className="focus-ring rounded-full text-sm font-medium text-trulab-ink/68 transition hover:text-trulab-ink">
              {link.label}
            </Link>
          ))}
          {toolLinks.map((link) => (
            <Link key={link.href} href={resolveNavigationHref(link.href)} className="focus-ring rounded-full text-sm font-medium text-trulab-ink/68 transition hover:text-trulab-ink">
              {link.label}
            </Link>
          ))}
        </div>

        <Link
          href={resolveNavigationHref(navigationCta.href)}
          className="focus-ring hidden rounded-full bg-trulab-button-primary px-5 py-2.5 text-sm font-semibold text-trulab-button-primary-text shadow-sm transition hover:-translate-y-0.5 hover:bg-trulab-button-primary-hover xl:inline-flex"
        >
          {navigationCta.label}
        </Link>

        <button
          ref={toggleRef}
          type="button"
          aria-label={navigationAccessibility.toggleNavigation}
          aria-expanded={isOpen}
          aria-controls={menuId}
          onClick={() => setIsOpen((value) => !value)}
          className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full border border-trulab-border/10 bg-trulab-surface/80 text-trulab-ink xl:hidden"
        >
          {isOpen ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
        </button>
      </nav>

      {isOpen ? (
        <div id={menuId} className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-trulab-border/5 bg-trulab-bg/98 px-4 py-4 shadow-lift backdrop-blur-xl xl:hidden">
          <div className="mx-auto flex max-w-xl flex-col gap-2 pb-[max(0px,env(safe-area-inset-bottom))]">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={resolveNavigationHref(link.href)}
                onClick={closeMenu}
                className="focus-ring rounded-xl px-4 py-3 text-sm font-semibold text-trulab-ink transition hover:bg-trulab-surface"
              >
                {link.label}
              </Link>
            ))}
            {toolLinks.map((link) => (
              <Link
                key={link.href}
                href={resolveNavigationHref(link.href)}
                onClick={closeMenu}
                className="focus-ring rounded-xl px-4 py-3 text-sm font-semibold text-trulab-ink transition hover:bg-trulab-surface"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={resolveNavigationHref(navigationCta.href)}
              onClick={closeMenu}
              className="focus-ring mt-2 rounded-full bg-trulab-button-primary px-5 py-3 text-center text-sm font-semibold text-trulab-button-primary-text"
            >
              {navigationCta.label}
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
