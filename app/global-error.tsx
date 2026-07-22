"use client";

import { brandTheme } from "@/lib/brand-theme";
import { siteFont } from "@/lib/fonts";
import { siteConfig } from "@/lib/site-config";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en-MY">
      <body className={siteFont.className} style={{ background: brandTheme.background, color: brandTheme.ink }}>
        <main style={{ minHeight: "100vh", padding: "64px 24px" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <p style={{ color: brandTheme.muted, fontWeight: 700, letterSpacing: "0.12em" }}>500 / {siteConfig.name.toUpperCase()}</p>
            <h1 style={{ margin: "16px 0", fontSize: "clamp(2.25rem, 8vw, 4.5rem)", lineHeight: 1.05 }}>
              Critical application error.
            </h1>
            <p style={{ color: brandTheme.muted, fontSize: "1rem", lineHeight: 1.8 }}>
              The application shell could not render. Try loading the site again.
            </p>
            <button
              type="button"
              onClick={reset}
              style={{
                marginTop: 28,
                border: 0,
                borderRadius: 999,
                background: brandTheme.ink,
                color: "#ffffff",
                cursor: "pointer",
                fontWeight: 700,
                padding: "14px 22px",
              }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
