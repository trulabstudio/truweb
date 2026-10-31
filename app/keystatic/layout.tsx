import type { Metadata } from "next";
import { notFound } from "next/navigation";
import KeystaticApp from "./keystatic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function Layout() {
  // Local storage only works on a developer machine, so hide the panel online until GitHub is set up.
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_KEYSTATIC_STORAGE !== "github") {
    notFound();
  }

  return <KeystaticApp />;
}
