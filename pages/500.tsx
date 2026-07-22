import Link from "next/link";
import { brandTheme } from "@/lib/brand-theme";
import { siteFont } from "@/lib/fonts";
import { siteConfig } from "@/lib/site-config";

export default function Custom500() {
  return (
    <main className={`error-page ${siteFont.className}`}>
      <section className="error-shell">
        <p className="eyebrow">500 / {siteConfig.name}</p>
        <h1>Internal server error.</h1>
        <p>
          The server could not complete this request. Please try again later or return to the homepage.
        </p>
        <Link href="/">Back to homepage</Link>
      </section>
      <style jsx>{`
        .error-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          background: ${brandTheme.background};
          color: ${brandTheme.ink};
          padding: 64px 24px;
        }

        .error-shell {
          width: min(720px, 100%);
          margin: 0 auto;
        }

        .eyebrow {
          color: ${brandTheme.muted};
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          margin: 0 0 18px;
          text-transform: uppercase;
        }

        h1 {
          font-size: clamp(2.5rem, 9vw, 4.75rem);
          line-height: 1.04;
          letter-spacing: 0;
          margin: 0;
        }

        p {
          color: ${brandTheme.muted};
          font-size: 1rem;
          line-height: 1.8;
          margin: 22px 0 0;
          max-width: 620px;
        }

        a {
          align-items: center;
          background: ${brandTheme.ink};
          border-radius: 999px;
          color: #ffffff;
          display: inline-flex;
          font-size: 0.92rem;
          font-weight: 700;
          margin-top: 30px;
          padding: 14px 22px;
          text-decoration: none;
        }
      `}</style>
    </main>
  );
}
