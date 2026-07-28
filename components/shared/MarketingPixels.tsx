"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { editableSite } from "@/lib/EDIT-SITE-HERE";

function cleanEnv(value: string | undefined) {
  return value?.trim() || "";
}

const googleTagId = cleanEnv(process.env.NEXT_PUBLIC_GTM_ID);
const googleAnalyticsId = cleanEnv(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
const googleAdsId = cleanEnv(process.env.NEXT_PUBLIC_GOOGLE_ADS_ID);
const metaPixelId = cleanEnv(process.env.NEXT_PUBLIC_META_PIXEL_ID);
const tiktokPixelId = cleanEnv(process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID);
const linkedInPartnerId = cleanEnv(process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID);
const xPixelId = cleanEnv(process.env.NEXT_PUBLIC_X_PIXEL_ID);
const pinterestTagId = cleanEnv(process.env.NEXT_PUBLIC_PINTEREST_TAG_ID);
const snapPixelId = cleanEnv(process.env.NEXT_PUBLIC_SNAP_PIXEL_ID);
const hasConfiguredPixel = [
  googleTagId,
  googleAnalyticsId,
  googleAdsId,
  metaPixelId,
  tiktokPixelId,
  linkedInPartnerId,
  xPixelId,
  pinterestTagId,
  snapPixelId,
].some(Boolean);
const copy = editableSite.marketing.consent;
const consentKey = copy.storageKey;

export default function MarketingPixels() {
  const [consent, setConsent] = useState<"accepted" | "rejected" | null>(null);
  const gtagIds = [googleAnalyticsId, googleAdsId].filter(Boolean);

  useEffect(() => {
    const storedConsent = window.localStorage.getItem(consentKey);

    if (storedConsent === "accepted" || storedConsent === "rejected") {
      setConsent(storedConsent);
    }
  }, []);

  function saveConsent(nextConsent: "accepted" | "rejected") {
    window.localStorage.setItem(consentKey, nextConsent);
    setConsent(nextConsent);
  }

  if (!hasConfiguredPixel) {
    return null;
  }

  return (
    <>
      {consent === "accepted" && googleTagId ? (
        <>
          <Script id="gtm-loader" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${googleTagId}');
            `}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${googleTagId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title={copy.googleTagManagerTitle}
            />
          </noscript>
        </>
      ) : null}

      {consent === "accepted" && gtagIds.length ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gtagIds[0]}`}
            strategy="afterInteractive"
          />
          <Script id="gtag-config" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              ${gtagIds.map((id) => `gtag('config', '${id}');`).join("\n")}
            `}
          </Script>
        </>
      ) : null}

      {consent === "accepted" && metaPixelId ? (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${metaPixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      ) : null}

      {consent === "accepted" && tiktokPixelId ? (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
              ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];
              ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
              for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
              ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
              ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;
              ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};
              n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;
              e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
              ttq.load('${tiktokPixelId}');
              ttq.page();
            }(window, document, 'ttq');
          `}
        </Script>
      ) : null}

      {consent === "accepted" && linkedInPartnerId ? (
        <Script id="linkedin-insight" strategy="afterInteractive">
          {`
            _linkedin_partner_id = "${linkedInPartnerId}";
            window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
            window._linkedin_data_partner_ids.push(_linkedin_partner_id);
            (function(l) {
              if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
              window.lintrk.q=[]}
              var s = document.getElementsByTagName("script")[0];
              var b = document.createElement("script");
              b.type = "text/javascript";b.async = true;
              b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
              s.parentNode.insertBefore(b, s);
            })(window.lintrk);
          `}
        </Script>
      ) : null}

      {consent === "accepted" && xPixelId ? (
        <Script id="x-pixel" strategy="afterInteractive">
          {`
            !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
            },s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
            a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
            twq('config','${xPixelId}');
          `}
        </Script>
      ) : null}

      {consent === "accepted" && pinterestTagId ? (
        <Script id="pinterest-tag" strategy="afterInteractive">
          {`
            !function(e){if(!window.pintrk){window.pintrk=function(){window.pintrk.queue.push(
            Array.prototype.slice.call(arguments))};var n=window.pintrk;n.queue=[],n.version="3.0";
            var t=document.createElement("script");t.async=!0,t.src=e;
            var r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(t,r)}}
            ("https://s.pinimg.com/ct/core.js");
            pintrk('load', '${pinterestTagId}');
            pintrk('page');
          `}
        </Script>
      ) : null}

      {consent === "accepted" && snapPixelId ? (
        <Script id="snap-pixel" strategy="afterInteractive">
          {`
            (function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function()
            {a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
            a.queue=[];var s='script';r=t.createElement(s);r.async=!0;
            r.src=n;var u=t.getElementsByTagName(s)[0];
            u.parentNode.insertBefore(r,u);})(window,document,
            'https://sc-static.net/scevent.min.js');
            snaptr('init', '${snapPixelId}');
            snaptr('track', 'PAGE_VIEW');
          `}
        </Script>
      ) : null}

      {consent === null ? (
        <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-3xl rounded-2xl border border-trulab-border/10 bg-trulab-surface p-4 shadow-lift sm:flex sm:items-center sm:justify-between sm:gap-5">
          <p className="text-sm leading-6 text-trulab-muted">
            {copy.message}
          </p>
          <div className="mt-3 flex shrink-0 gap-2 sm:mt-0">
            <button
              type="button"
              onClick={() => saveConsent("rejected")}
              className="focus-ring rounded-full border border-trulab-border/10 bg-trulab-button-secondary px-4 py-2 text-sm font-semibold text-trulab-button-secondary-text"
            >
              {copy.rejectLabel}
            </button>
            <button
              type="button"
              onClick={() => saveConsent("accepted")}
              className="focus-ring rounded-full bg-trulab-button-primary px-4 py-2 text-sm font-semibold text-trulab-button-primary-text"
            >
              {copy.acceptLabel}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
