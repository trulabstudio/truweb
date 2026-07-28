# Trulab Website Image Specifications

For normal image replacements, keep the same filename and replace the file in place. When the filename stays the same, no code change is required. If a filename must change, update its `src` in `lib/EDIT-SITE-HERE.ts`.

Do not stretch a replacement to the listed size. Crop or export it at the recommended aspect ratio so the subject remains natural.

## Images currently used by the website

| Purpose | Path | Where it appears | Recommended width | Recommended height | Aspect ratio | Preferred format | Transparent background required | Display behaviour | Mobile considerations |
| --- | --- | --- | ---: | ---: | --- | --- | --- | --- | --- |
| Main logo | `/images/brand/logo-main.png` | Fixed navbar on every page; fallback if the preloader lockup fails | 512 px | 512 px | 1:1 | PNG or WebP | No | Cover | Centre the symbol; it is displayed at only 40–42 px. |
| White logo | `/images/brand/logo-white.png` | Footer on the dark background | 512 px | 512 px | 1:1 | Transparent PNG or WebP | Yes | Cover | Keep generous transparent padding so the mark remains clear at 44 px. |
| Full logo lockup | `/images/brand/logo-full.png` | Full-screen loading preloader | 2134 px | 399 px | 5.35:1 | Transparent PNG or WebP | Yes | Contain | Scales to a maximum of 78vw and is never intentionally cropped. |
| Favicon | `/images/brand/favicon.png` | Browser tab, shortcut icon and Apple touch metadata | 512 px | 512 px | 1:1 | PNG | No | Contain | Use a simple mark that remains recognizable at 16–32 px. |
| PWA icon | `/images/brand/pwa-icon-192.png` | Web app manifest, 192 px launcher icon | 192 px | 192 px | 1:1 | PNG | No | Contain | Keep important artwork inside the central safe area. |
| PWA icon | `/images/brand/pwa-icon-512.png` | Web app manifest, 512 px launcher icon | 512 px | 512 px | 1:1 | PNG | No | Contain | Keep important artwork inside the central safe area. |
| Maskable PWA icon | `/images/brand/pwa-maskable-512.png` | Web app manifest on devices that mask launcher icons | 512 px | 512 px | 1:1 | PNG | No | Contain | Keep the logo within the maskable safe zone so circular or rounded masks do not crop it. |
| Social sharing image | `/images/social/social-og-image.jpg` | Open Graph and Twitter/X previews for every public page | 1200 px | 630 px | 1.91:1 | JPG or PNG | No | Cover | Keep important text and logos away from the outer edges used by social-card crops. |
| Homepage hero | `/images/hero/hero-founder-cinematic.png` | Homepage hero image | 1536 px | 1024 px | 3:2 | PNG, JPG or WebP | No | Cover | Desktop displays a 16:10 crop and mobile displays a 4:3 crop; keep the main speaker near the centre. |
| Client logo 01 | `/images/clients/Client-01.png` | Homepage client-logo marquee | 1500 px | 584 px | 375:146 | Transparent PNG | Yes | Contain | Keep the complete logo inside the transparent canvas. |
| Client logo 02 | `/images/clients/Client-02.png` | Homepage client-logo marquee | 1500 px | 584 px | 375:146 | Transparent PNG | Yes | Contain | Keep the complete logo inside the transparent canvas. |
| Client logo 03 | `/images/clients/Client-03.png` | Homepage client-logo marquee | 1500 px | 584 px | 375:146 | Transparent PNG | Yes | Contain | Keep the complete logo inside the transparent canvas. |
| Client logo 04 | `/images/clients/Client-04.png` | Homepage client-logo marquee | 1500 px | 584 px | 375:146 | Transparent PNG | Yes | Contain | Keep the complete logo inside the transparent canvas. |
| Client logo 05 | `/images/clients/Client-05.png` | Homepage client-logo marquee | 1500 px | 584 px | 375:146 | Transparent PNG | Yes | Contain | Keep the complete logo inside the transparent canvas. |
| Client logo 06 | `/images/clients/Client-06.png` | Homepage client-logo marquee | 1500 px | 584 px | 375:146 | Transparent PNG | Yes | Contain | Keep the complete logo inside the transparent canvas. |
| Client logo 07 | `/images/clients/Client-07.png` | Homepage client-logo marquee | 1500 px | 584 px | 375:146 | Transparent PNG | Yes | Contain | Keep the complete logo inside the transparent canvas. |
| Client logo 08 | `/images/clients/Client-08.png` | Homepage client-logo marquee | 1500 px | 584 px | 375:146 | Transparent PNG | Yes | Contain | Keep the complete logo inside the transparent canvas. |
| Client logo 09 | `/images/clients/Client-09.png` | Homepage client-logo marquee | 1500 px | 584 px | 375:146 | Transparent PNG | Yes | Contain | Keep the complete logo inside the transparent canvas. |
| Client logo 10 | `/images/clients/Client-10.png` | Homepage client-logo marquee | 1500 px | 584 px | 375:146 | Transparent PNG | Yes | Contain | Keep the complete logo inside the transparent canvas. |
| Client logo 11 | `/images/clients/Client-11.png` | Homepage client-logo marquee | 1500 px | 584 px | 375:146 | Transparent PNG | Yes | Contain | Keep the complete logo inside the transparent canvas. |
| Client logo 12 | `/images/clients/Client-12.png` | Homepage client-logo marquee | 1500 px | 584 px | 375:146 | Transparent PNG | Yes | Contain | Keep the complete logo inside the transparent canvas. |
| Client logo 13 | `/images/clients/Client-13.png` | Homepage client-logo marquee | 1500 px | 584 px | 375:146 | Transparent PNG | Yes | Contain | Keep the complete logo inside the transparent canvas. |
| Client logo 14 | `/images/clients/Client-14.png` | Homepage client-logo marquee | 1500 px | 584 px | 375:146 | Transparent PNG | Yes | Contain | Keep the complete logo inside the transparent canvas. |
| Client logo 15 | `/images/clients/Client-15.png` | Homepage client-logo marquee | 1500 px | 584 px | 375:146 | Transparent PNG | Yes | Contain | Keep the complete logo inside the transparent canvas. |
| Client logo 16 | `/images/clients/Client-16.png` | Homepage client-logo marquee | 1500 px | 584 px | 375:146 | Transparent PNG | Yes | Contain | Keep the complete logo inside the transparent canvas. |
| Client logo 17 | `/images/clients/Client-17.png` | Homepage client-logo marquee | 1500 px | 584 px | 375:146 | Transparent PNG | Yes | Contain | Keep the complete logo inside the transparent canvas. |
| Client logo 18 | `/images/clients/Client-18.png` | Homepage client-logo marquee | 1500 px | 584 px | 375:146 | Transparent PNG | Yes | Contain | Keep the complete logo inside the transparent canvas. |
| Client logo 19 | `/images/clients/Client-19.png` | Homepage client-logo marquee | 1500 px | 584 px | 375:146 | Transparent PNG | Yes | Contain | Keep the complete logo inside the transparent canvas. |
| Client logo 20 | `/images/clients/Client-20.png` | Homepage client-logo marquee | 1500 px | 584 px | 375:146 | Transparent PNG | Yes | Contain | Keep the complete logo inside the transparent canvas. |
| Client logo 21 | `/images/clients/Client-21.png` | Homepage client-logo marquee | 1500 px | 584 px | 375:146 | Transparent PNG | Yes | Contain | Keep the complete logo inside the transparent canvas. |
| Client logo 22 | `/images/clients/Client-22.png` | Homepage client-logo marquee | 1500 px | 584 px | 375:146 | Transparent PNG | Yes | Contain | Keep the complete logo inside the transparent canvas. |
| Client logo 23 | `/images/clients/Client-23.png` | Homepage client-logo marquee | 1500 px | 584 px | 375:146 | Transparent PNG | Yes | Contain | Keep the complete logo inside the transparent canvas. |
| Client logo 24 | `/images/clients/Client-24.png` | Homepage client-logo marquee | 1500 px | 584 px | 375:146 | Transparent PNG | Yes | Contain | Keep the complete logo inside the transparent canvas. |
| Client logo 25 | `/images/clients/Client-25.png` | Homepage client-logo marquee | 1500 px | 584 px | 375:146 | Transparent PNG | Yes | Contain | Keep the complete logo inside the transparent canvas. |
| Client logo 26 | `/images/clients/Client-26.png` | Homepage client-logo marquee | 1500 px | 584 px | 375:146 | Transparent PNG | Yes | Contain | Keep the complete logo inside the transparent canvas. |
| Client logo 27 | `/images/clients/Client-27.png` | Homepage client-logo marquee | 1500 px | 584 px | 375:146 | Transparent PNG | Yes | Contain | Keep the complete logo inside the transparent canvas. |
| Client logo 28 | `/images/clients/Client-28.png` | Homepage client-logo marquee | 1500 px | 584 px | 375:146 | Transparent PNG | Yes | Contain | Keep the complete logo inside the transparent canvas. |
| Client logo 29 | `/images/clients/Client-29.png` | Homepage client-logo marquee | 1500 px | 584 px | 375:146 | Transparent PNG | Yes | Contain | Keep the complete logo inside the transparent canvas. |
