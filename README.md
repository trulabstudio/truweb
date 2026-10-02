# Trulab Studio Website

This is the Trulab Studio website (a division of Trulab Production Sdn. Bhd.), built with Next.js App Router, React and TypeScript. It includes the public website, production packages, contact workflow, QR Generator and Background Remover.

## Normal website editing

Start normal content updates in:

```text
lib/EDIT-SITE-HERE.ts
```

That file contains the client-editable company details, contact information, colours, images, navigation, homepage wording, packages, FAQ, form wording, SEO and tool-page content.

See:

- `MAINTENANCE.md` for editing instructions.
- `public/images/IMAGE-SPECS.md` for replacement-image dimensions.
- `HANDOVER-CHECKLIST.md` before preparing a client ZIP.

## Install and run

Install dependencies:

```bash
npm install
```

Start local development:

```bash
npm run dev
```

Then open `http://localhost:3000`.

## Validation

Run the complete validation pipeline:

```bash
npm run validate
```

Individual commands are also available:

```bash
npm run test
npm run lint
npm run typecheck
npm run build
```

## Environment and handover safety

Keep credentials only in `.env.local` or the hosting provider's environment settings. Never commit, publish, share or place real secret values in documentation.

A clean client source handover must exclude:

```text
.env.local
.git
.next
node_modules
tsconfig.tsbuildinfo
npm-debug.log
other generated logs and temporary files
```

The receiving client can recreate dependencies and generated build files with `npm install` and the npm commands above.
