# Website Maintenance

For normal website updates, open:

```text
lib/EDIT-SITE-HERE.ts
```

Do not edit React components for routine wording, contact, package, image or SEO changes. The configuration and content files under `lib/` are technical adapters that read from the editing file.

## Contents

1. `01 COMPANY`
2. `02 CONTACT`
3. `03 BRAND COLOURS`
4. `04 IMAGES`
5. `05 NAVIGATION`
6. `06 HOMEPAGE`
7. `07 PACKAGES`
8. `08 FAQ`
9. `09 CONTACT FORM`
10. `10 SEO`
11. `11 TOOLS`
12. `12 STATUS PAGES`
13. `13 MARKETING`

Use the `Search: EDIT ...` comments in `lib/EDIT-SITE-HERE.ts` to jump directly to a section.

## 01 Company

Edit the company name, slug, domain and website URL in the company section.

Example placeholders:

```ts
const companyName = "Example Company";
const companyDomain = "example.com";
```

The website URL is generated from the domain.

## 02 Contact

Edit the email, displayed phone, WhatsApp number, address, default WhatsApp message and social links in the company/contact block.

```ts
email: "hello@example.com",
phoneDisplay: "+60 12-345 6789",
whatsappNumber: "60123456789",
```

Use digits only for `whatsappNumber`, including the country code.

## 03 Brand colours

Edit six-digit hexadecimal values under `branding.colors`:

```ts
accent: "#aabbcc",
background: "#f5f5f5",
```

Keep the leading `#`. Tailwind and the website CSS consume these values automatically.

## 04 Images

The editing file contains only each image's `src` and `alt`.

The safest replacement process is:

1. Open `public/images/IMAGE-SPECS.md`.
2. Prepare the replacement using the listed dimensions and crop guidance.
3. Replace the existing file using exactly the same filename.

Keeping the filename means no code change is required. If the filename changes, update the matching `src` in `lib/EDIT-SITE-HERE.ts`.

## 05 Navigation

Edit navbar labels and destinations under `navigation`. Homepage anchors begin with `#`; tool pages begin with `/`.

When changing an anchor URL, keep it matched to the corresponding homepage section ID.

## 06 Homepage

Homepage wording includes the hero, trust pills, services, client marquee, production coverage, process, certifications, contact section and footer.

To add a service, duplicate one complete service object:

```ts
{
  title: "Example service",
  description: "Explain the service here.",
  icon: "Mic2",
},
```

To remove a service, delete its complete object, including the surrounding braces and comma.

## 07 Packages

Each package has a permanent technical `id`.

```ts
{
  id: "example-package", // Never change an existing ID.
  name: "Displayed package name",
  price: "Displayed price",
  formLabel: "",
}
```

Safe fields to edit:

- `name`
- `price`
- `priceSuffix`
- `description`
- `features`
- `highlightLabel`
- `closingText`
- CTA wording and URL
- `formLabel`
- `whatsappMessage`

Never change an existing `id`. The form submits that stable ID to Supabase, so changing package names, prices, descriptions, features or display labels does not require a database migration.

Leave `formLabel` empty to generate the dropdown label from the current package name and price. Set it only when a custom dropdown label is required.

To remove a feature, delete only that quoted feature line from the package's `features` array.

Adding a genuinely new package requires a developer to assign a new permanent ID and add that ID through a new Supabase migration.

## 08 FAQ

Add or remove complete objects under `faq.items`:

```ts
{
  question: "Example question?",
  answer: "Example answer.",
},
```

The visible FAQ and structured data use the same array.

## 09 Contact form

Edit field labels, placeholders, success/error wording and notification-email wording under `forms.contact`.

Additional options use permanent IDs:

```ts
additionalPackageOptions: [
  { id: "others", label: "Other enquiry" },
],
```

Do not change an existing option ID.

## 10 SEO

Edit the default title, title template, description, keywords, canonical URL, social metadata and structured-data details under `seo`.

Keep route paths valid when editing robots or sitemap entries.

## 11 Tools

The `tools` section contains client-facing wording and editable choices for the QR Generator and Background Remover. Technical canvas, MIME, file-size and model-processing logic remains in the components.

## 12 Status pages

Edit loading, error, 403, 404, 500 and maintenance wording under `statusPages`.

## 13 Marketing

Edit only the public consent wording and button labels under `marketing`. Tracking IDs remain environment variables.

## Validation after normal edits

Run:

```bash
npm run validate
```

Then check the homepage, navigation, package cards, package dropdown, FAQ, images, tools, contact form, WhatsApp links, status pages and metadata.

## Advanced developer notes

### Contact workflow

```text
Contact form
-> Cloudflare Turnstile
-> POST /api/leads
-> Supabase public.leads
-> Resend notification
-> WhatsApp prefilled message
```

The UI uses `packageId`. The API maps that value into the existing database column named `budget` for backward compatibility. Components do not use the legacy database name.

Notification emails and WhatsApp messages resolve the stable ID back to the current human-readable package label.

### Supabase migrations

- Never modify a migration that may already have run.
- `20260715143601_create_leads.sql` is the original schema history.
- Later migrations update the package constraint while retaining historical values.
- New package names and prices do not need migrations.
- A genuinely new permanent package ID requires a new timestamped migration.

The leads table remains private: browser code never receives the Supabase service-role key.

### Environment variables

Environment variable names used by the project include:

```text
NEXT_PUBLIC_TURNSTILE_SITE_KEY
TURNSTILE_SECRET
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
LEAD_NOTIFICATION_EMAIL
LEAD_FROM_EMAIL
CRON_SECRET
MAINTENANCE_MODE
MAINTENANCE_RETRY_AFTER
FORBIDDEN_PATHS
```

Optional marketing variables remain documented in the deployment environment. Store real values only in `.env.local` or the hosting provider. Never commit or share `.env.local`.

### Clean handover

Read `HANDOVER-CHECKLIST.md` before creating a client ZIP. Exclude secrets, Git history, dependencies, build output, logs and temporary files.
