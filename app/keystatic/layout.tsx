import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { footerContent } from "@/lib/content/home";
import KeystaticApp from "./keystatic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function Layout() {
  // Local storage only works on a developer machine, so hide the panel online until GitHub is set up.
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_KEYSTATIC_STORAGE !== "github") {
    notFound();
  }

  return (
    <>
      <KeystaticApp />
      <a
        href={footerContent.adminHomeLink.href}
        className="focus-ring fixed bottom-4 right-4 z-10 rounded-full bg-trulab-button-primary px-4 py-2 text-sm font-semibold text-trulab-button-primary-text shadow-sm transition hover:bg-trulab-button-primary-hover"
      >
        {footerContent.adminHomeLink.label}
      </a>
    </>
  );
}
