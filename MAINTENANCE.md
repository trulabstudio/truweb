# Website Maintenance

## Admin panel

Wording, contact details, packages and prices, FAQ, hero and client images, and SEO text are edited at:

```text
https://www.trulabstudio.com/admin
```

Log in with the admin password, edit, then press Save. Each save is a commit to `main`, and Vercel publishes it after the deployment finishes, usually in 1-2 minutes. Use `{company}` in text to insert the company name.

Before saving, the panel checks links, email and WhatsApp formats, `{company}` style tokens and brand colour contrast, and it refuses values that would break the website.

The content is stored in `content/`. When running `npm run dev` without `GITHUB_CONTENT_TOKEN`, `/admin` saves to these local files instead of GitHub.

Uploaded images get generated file names, and old images stay in their folder until removed from the repository.

### First-time setup

In Vercel, add these variables to Production and redeploy:

1. `ADMIN_PASSWORD`: the panel login, at least 12 characters. Changing it logs everyone out.
2. `GITHUB_CONTENT_TOKEN`: a GitHub fine-grained token for the `trulabstudio/truweb` repository only, with the Contents read and write permission. Renew it before it expires.

## What the panel covers

| Group | Sections |
| --- | --- |
| Content | Packages and pricing, FAQ, contact details |
| Homepage | Hero section, services, other homepage sections |
| Media | Hero image, client logos |
| SEO | Search engine text |
| Brand | Company details, logos and icons, brand colours, navigation |
| Communication | Contact form, emails |
| Pages | Tool pages, status pages, cookie banner |

Customer messages from the contact form are listed under Enquiries.

## Threads

The Threads Dashboard (the first page after signing in) shows results and what the system is doing. Queue, Conversations and Settings under Threads generate, schedule and publish posts. BOFU posts get a tracked form link in a reply underneath. Comments on panel posts get an AI reply, or the form link if they contain the keyword, and comments with a link are ignored.

Setup:

1. In Supabase SQL editor, run `supabase/migrations/20261102120000_create_threads.sql`, then `supabase/migrations/20261102130000_threads_conversations.sql`.
2. In Vercel, set `ANTHROPIC_API_KEY`, `THREADS_ACCESS_TOKEN`, `THREADS_USER_ID`, `THREADS_APP_SECRET` and `CRON_SECRET`.
3. In Supabase SQL editor, run `supabase/examples/threads-cron.sql` after replacing its secret placeholder. This runs the schedule every minute on any Vercel plan.

Problems are shown on the Queue page and emailed once to `LEAD_NOTIFICATION_EMAIL` through Resend. Settings has a button to send a test email.

New posts need approval by default. Only run one automatic posting system on the account at a time.

## Code editing

Developers only need `lib/EDIT-SITE-HERE.ts` for technical settings that are not in the panel, such as package option IDs, robots rules, the sitemap, structured data and the wording inside the QR Generator and Background Remover tools. Tracking IDs and credentials remain environment variables.

A permanent package `id` must never change, and a new one requires a new Supabase migration. Adding a homepage section or page also requires updating `homepageAnchors` or `siteRoutes` in `lib/admin/schema.ts`, and the tests check that these match.

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
ADMIN_PASSWORD
GITHUB_CONTENT_TOKEN
ANTHROPIC_API_KEY
THREADS_ACCESS_TOKEN
THREADS_USER_ID
THREADS_APP_SECRET
MAINTENANCE_MODE
MAINTENANCE_RETRY_AFTER
FORBIDDEN_PATHS
```

Optional marketing variables remain documented in the deployment environment. Store real values only in `.env.local` or the hosting provider. Never commit or share `.env.local`.

### Clean handover

Read `HANDOVER-CHECKLIST.md` before creating a client ZIP. Exclude secrets, Git history, dependencies, build output, logs and temporary files.
