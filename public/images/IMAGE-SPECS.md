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
| Client logo 01 | `/images/clients/client-01.svg` | Homepage client-logo marquee | 360 px | 140 px | 18:7 | SVG | Yes | Contain | Use a simple horizontal logo that stays readable inside a 176 px-wide mobile tile. |
| Client logo 02 | `/images/clients/client-02.svg` | Homepage client-logo marquee | 360 px | 140 px | 18:7 | SVG | Yes | Contain | Use a simple horizontal logo that stays readable inside a 176 px-wide mobile tile. |
| Client logo 03 | `/images/clients/client-03.svg` | Homepage client-logo marquee | 360 px | 140 px | 18:7 | SVG | Yes | Contain | Use a simple horizontal logo that stays readable inside a 176 px-wide mobile tile. |
| Client logo 04 | `/images/clients/client-04.svg` | Homepage client-logo marquee | 360 px | 140 px | 18:7 | SVG | Yes | Contain | Use a simple horizontal logo that stays readable inside a 176 px-wide mobile tile. |
| Client logo 05 | `/images/clients/client-05.svg` | Homepage client-logo marquee | 360 px | 140 px | 18:7 | SVG | Yes | Contain | Use a simple horizontal logo that stays readable inside a 176 px-wide mobile tile. |
| Client logo 06 | `/images/clients/client-06.svg` | Homepage client-logo marquee | 360 px | 140 px | 18:7 | SVG | Yes | Contain | Use a simple horizontal logo that stays readable inside a 176 px-wide mobile tile. |

## Optional image library

These files are centralized in `lib/EDIT-SITE-HERE.ts` but are not currently rendered. They can be selected as a future hero or production image without moving or recompressing them.

| Purpose | Path | Where it appears | Recommended width | Recommended height | Aspect ratio | Preferred format | Transparent background required | Display behaviour | Mobile considerations |
| --- | --- | --- | ---: | ---: | --- | --- | --- | --- | --- |
| Founder hero alternative 01 | `/images/hero/hero-founder-cinematic-alt-01.png` | Not currently rendered; available as a hero alternative | 1586 px | 992 px | 1.6:1 | PNG, JPG or WebP | No | Cover | Keep the speaker centred for a possible 4:3 mobile crop. |
| Founder hero alternative 02 | `/images/hero/hero-founder-cinematic-alt-02.png` | Not currently rendered; available as a hero alternative | 1536 px | 1024 px | 3:2 | PNG, JPG or WebP | No | Cover | Keep the speaker centred for a possible 4:3 mobile crop. |
| Podcast production alternative | `/images/hero/hero-podcast-production.png` | Not currently rendered; available as a hero alternative | 1570 px | 1001 px | 1.57:1 | PNG, JPG or WebP | No | Cover | Keep both speakers inside the central 4:3 crop. |
| Production equipment cutout | `/images/production/production-equipment.png` | Not currently rendered; available for a production section | 1536 px | 1024 px | 3:2 | Transparent PNG or WebP | Yes | Contain | Keep all equipment within the central safe area for narrow screens. |

The same recommendations are stored beside each image entry in `lib/EDIT-SITE-HERE.ts` so a client can see the required size while changing a path or alt text.
