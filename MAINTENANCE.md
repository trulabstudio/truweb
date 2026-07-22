# Trulab Production Website Maintenance

This handover guide explains how to update the website without reverse-engineering its components. Make the smallest possible change in the source file listed below, then validate before deployment.

## Common changes

| Change | Source of truth |
| --- | --- |
| Company name, slug, domain, email, phone, WhatsApp and public address | `lib/site-config.ts` |
| Brand palette | `lib/brand-theme.ts` |
| Shared site font | `lib/fonts.ts` |
| Keywords, social alt, service types and structured-data details | `lib/seo-config.ts` |
| Navbar, footer links and tools | `lib/navigation.ts` |
| Hero, trust labels, client logos, Why Trulab, coverage, contact and footer copy | `lib/content/home.ts` |
| Services | `lib/content/services.ts` |
| Production process | `lib/content/process.ts` |
| FAQ | `lib/content/faq.ts` |
| Registrations and recognition | `lib/content/certifications.ts` |
| Tool page headings, status pages and form interface copy | `lib/content/pages.ts` |
| Global responsive styling | `app/globals.css` and `tailwind.config.ts` |
| Logo and social preview image | `public/` |
| Client logos | `public/clients/` |
| Contact-form visible labels, feedback and form WhatsApp wording | `lib/content/pages.ts` |
| Budget options and lead types | `lib/types/lead.ts` plus a new Supabase constraint migration |
| Public contact details, WhatsApp number and default/footer WhatsApp message | `lib/site-config.ts` |
| Form rendering, validation orchestration, submission and message construction | `components/home/ContactForm.tsx` |
| Lead validation, storage and notifications | `app/api/leads/route.ts` |
| Maintenance and protected paths | `.env.local` and `middleware.ts` |
| Sitemap, robots and manifest | `app/sitemap.ts`, `app/robots.ts`, `app/manifest.ts` |

Content is intentionally separated from visual components. Edit `lib/content/*` before changing `components/home/*` when only wording or list items need to change.

## Add, remove or reorder homepage content

- The rendered homepage order is the component list inside `app/page.tsx` between `<main>` and `</main>`.
- To reorder a section, move its component line in `app/page.tsx`; keep `Hero` first and `ContactForm` near the end unless the design is intentionally changing.
- To remove a section, remove its component line and its import. Also remove every navigation link targeting that section from `lib/navigation.ts`.
- To add another item to Services, Process, FAQ, Certifications or client logos, duplicate one object in its corresponding array and replace every value.
- To remove an item, delete its complete object including the comma. Empty arrays are technically valid, but remove the whole rendered section when it no longer has content.
- A new homepage section needs a content export under `lib/content/`, a component under `components/home/`, an import/render line in `app/page.tsx`, and optionally a matching navigation link.
- Every anchor navigation target must match the section `id` exactly, including the leading `#` in `lib/navigation.ts`.

## Images and assets

- Keep website assets inside `public/` and use root-relative paths such as `/logo.png`.
- `public/logo.png` is the standard logo.
- `public/logo-white.png` is the light-on-dark variant.
- `public/full-logo.png` is the full brand lockup.
- `public/og-image.jpg` is the homepage hero and social sharing image.
- Client logo slots are `public/clients/client-01.svg` through `client-06.svg`.
- Preserve filenames to replace an asset without changing code. If a filename changes, update its path in `lib/site-config.ts` or `lib/content/home.ts`.
- After replacing an image, check mobile, tablet and desktop layouts and confirm its alternative text is still accurate.

Current asset specifications:

| Asset | Current pixels | Recommended replacement | Display behavior |
| --- | ---: | --- | --- |
| `logo.png` | 513 × 513 | Square, at least 512 × 512 PNG/WebP | Cropped into a rounded square with `object-cover` |
| `logo-white.png` | 2134 × 2134 | Square, at least 512 × 512 transparent PNG/WebP | Cropped into a rounded square on dark footer |
| `full-logo.png` | 2134 × 399 | Wide transparent image near 5.35:1 | Contained inside preloader, never intentionally cropped |
| `og-image.jpg` | 1730 × 909 | 1200 × 630 or larger, ratio 1.91:1 | Hero uses `object-cover`; social cards expect 1.91:1 |
| `clients/client-01.svg`–`06.svg` | 360 × 140 viewBox | 360 × 140 SVG or equivalent 18:7 ratio | Contained within logo slot; transparent background preferred |

Asset paths are centralized in `siteConfig.assets`. If a filename changes, update the corresponding value there. Client logo paths and accessible names are in `lib/content/home.ts`.

## Contact workflow

```text
Contact form
-> Cloudflare Turnstile
-> POST /api/leads
-> Supabase public.leads
-> Resend notification
-> WhatsApp prefilled message
```

The Supabase service-role key, Turnstile secret and Resend API key are server-only. Never expose them in client components or prefix them with `NEXT_PUBLIC_`.

## Environment variables

| Variable | Purpose | Visibility |
| --- | --- | --- |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Renders the Turnstile widget | Browser-safe |
| `TURNSTILE_SECRET_KEY` | Verifies Turnstile tokens | Server only |
| `SUPABASE_URL` | Supabase project URL | Server only in this project |
| `SUPABASE_SERVICE_ROLE_KEY` | Inserts leads through the API | Secret, server only |
| `RESEND_API_KEY` | Sends lead notifications | Secret, server only |
| `LEAD_NOTIFICATION_EMAIL` | Receives lead notifications | Server only |
| `LEAD_FROM_EMAIL` | Verified Resend sender | Server only |
| `MAINTENANCE_MODE` | Enables maintenance routing | Server only |
| `MAINTENANCE_RETRY_AFTER` | Retry-After value in seconds | Server only |
| `FORBIDDEN_PATHS` | Comma-separated protected paths | Server only |

Optional marketing variables are `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_GOOGLE_ADS_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_TIKTOK_PIXEL_ID`, `NEXT_PUBLIC_LINKEDIN_PARTNER_ID`, `NEXT_PUBLIC_X_PIXEL_ID`, `NEXT_PUBLIC_PINTEREST_TAG_ID` and `NEXT_PUBLIC_SNAP_PIXEL_ID`.

In the packaged release, open `../../Documentation/index.html` for every variable's expected format, provider source, required/optional status, blank-value behavior and safe placeholder.

`.env.local` is the source of truth. Do not create or commit `.env.example`. Create matching variables in the hosting platform without copying secrets into documentation, source code, screenshots or messages.

## Supabase

- Create or select the buyer's own Supabase project.
- Table: `public.leads`.
- Schema migration: `supabase/migrations/20260715143601_create_leads.sql`.
- Row Level Security is enabled and public roles do not receive direct table access.
- Website inserts must continue through `/api/leads` with the server-side service role.

When changing the schema, create a new timestamped migration. Do not rewrite production migration history.

## Turnstile and Resend

- Keep the production hostname registered in Cloudflare Turnstile.
- A Turnstile token is single-use and expires; failed submissions reset the widget.
- Do not bypass Turnstile in the production API.
- Verify the domain used by `LEAD_FROM_EMAIL` in Resend.
- `LEAD_NOTIFICATION_EMAIL` receives new lead notifications.
- Visitor email is used as `reply_to`; never send notifications to visitor-controlled recipients.
- A lead remains stored if email delivery fails. Check server and Resend logs when a notification is missing.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Homepage and consultation form |
| `/qr-generator` | QR generator tool |
| `/background-remover` | Browser-based background remover |
| `/403` | Forbidden state |
| `/maintenance` | Maintenance state |
| `/api/leads` | Lead submission endpoint |
| `/robots.txt` | Search engine rules |
| `/sitemap.xml` | Search engine sitemap |
| `/manifest.webmanifest` | Web app metadata |

Unknown routes use `app/not-found.tsx`. Runtime errors use App Router error boundaries, with `pages/500.tsx` as the legacy 500 fallback.

## Safe editing and release workflow

1. Find the source-of-truth file in the table above.
2. Change content without modifying component structure when no layout change is required.
3. Keep all secrets in `.env.local` or the deployment platform.
4. Run `npm run validate`.
5. Test the homepage, navigation, tools, form, Turnstile and WhatsApp redirect.
6. For a real form test, confirm the lead in Supabase and email in Resend.
7. Update `CHANGELOG.md` for a production release.

## Production checklist

- All public routes load without important console errors.
- Desktop, tablet and mobile layouts remain usable.
- Navbar, mobile menu, footer and anchor links work.
- Logo, client logos and OG image load correctly.
- Turnstile verifies the deployed hostname.
- A test lead reaches Supabase.
- Resend accepts notification from a verified sender domain.
- WhatsApp opens with submitted details prefilled.
- Robots, sitemap and manifest use the production domain.
- `npm run validate` passes.

## Recovery notes

- Local build cache issue: stop the server, delete only `.next`, then rebuild.
- Lead saved but email missing: check Resend domain verification and delivery logs.
- Turnstile rejection: check hostname and matching key pair.
- Supabase rejection: check project URL, service-role key, migration and grants.
- Unexpected maintenance page: check `MAINTENANCE_MODE` locally and in production.
