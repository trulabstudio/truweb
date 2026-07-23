import type { CSSProperties } from "react";
import type { Metadata, Viewport } from "next";
import MarketingPixels from "@/components/shared/MarketingPixels";
import Preloader from "@/components/shared/Preloader";
import { brandTheme, brandThemeRgb } from "@/lib/brand-theme";
import { siteFont } from "@/lib/fonts";
import { seoConfig } from "@/lib/seo-config";
import "./globals.css";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  keywords: [...seoConfig.keywords],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: [{ url: "/favicon.png", type: "image/png" }],
    shortcut: ["/favicon.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_MY",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.assets.socialImage,
        width: 1200,
        height: 630,
        alt: seoConfig.socialImageAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.assets.socialImage],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: brandTheme.background,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-MY"
      className={siteFont.variable}
      style={{
        "--trulab-bg": brandTheme.background,
        "--trulab-accent": brandTheme.accent,
        "--trulab-accent-strong": brandTheme.accentStrong,
        "--trulab-accent-icon": brandTheme.accentIcon,
        "--trulab-accent-text": brandTheme.accentText,
        "--trulab-ink": brandTheme.ink,
        "--trulab-muted": brandTheme.muted,
        "--trulab-bg-rgb": brandThemeRgb.background,
        "--trulab-accent-rgb": brandThemeRgb.accent,
        "--trulab-ink-rgb": brandThemeRgb.ink,
        "--trulab-muted-rgb": brandThemeRgb.muted,
      } as CSSProperties}
    >
      <body className="font-sans antialiased">
        <Preloader />
        <MarketingPixels />
        {children}
      </body>
    </html>
  );
}
