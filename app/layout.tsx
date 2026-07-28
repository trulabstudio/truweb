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
    template: seoConfig.titleTemplate,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  keywords: [...seoConfig.keywords],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: siteConfig.assets.favicon, type: "image/png" }],
    apple: [{ url: siteConfig.assets.favicon, type: "image/png" }],
    shortcut: [siteConfig.assets.favicon],
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
    locale: seoConfig.locale,
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
    card: seoConfig.twitterCard,
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
      lang={seoConfig.locale.replace("_", "-")}
      className={siteFont.variable}
      style={{
        "--trulab-bg": brandTheme.background,
        "--trulab-accent": brandTheme.accent,
        "--trulab-accent-strong": brandTheme.accentStrong,
        "--trulab-accent-icon": brandTheme.accentIcon,
        "--trulab-accent-text": brandTheme.accentText,
        "--trulab-ink": brandTheme.ink,
        "--trulab-muted": brandTheme.muted,
        "--trulab-surface": brandTheme.surface,
        "--trulab-border": brandTheme.border,
        "--trulab-dark-section": brandTheme.darkSection,
        "--trulab-on-dark": brandTheme.onDark,
        "--trulab-button-primary-bg": brandTheme.buttonPrimaryBackground,
        "--trulab-button-primary-text": brandTheme.buttonPrimaryText,
        "--trulab-button-secondary-bg": brandTheme.buttonSecondaryBackground,
        "--trulab-button-secondary-text": brandTheme.buttonSecondaryText,
        "--trulab-checkerboard": brandTheme.checkerboard,
        "--trulab-bg-rgb": brandThemeRgb.background,
        "--trulab-accent-rgb": brandThemeRgb.accent,
        "--trulab-ink-rgb": brandThemeRgb.ink,
        "--trulab-muted-rgb": brandThemeRgb.muted,
        "--trulab-surface-rgb": brandThemeRgb.surface,
        "--trulab-border-rgb": brandThemeRgb.border,
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
