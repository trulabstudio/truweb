# Client Source Handover Checklist

Before creating the client ZIP:

- Include the source code, `package.json`, `package-lock.json`, documentation, public assets and Supabase migrations.
- Exclude `.env.local`, `.git`, `.next`, `node_modules`, `tsconfig.tsbuildinfo`, logs and temporary files.
- Never copy environment secrets into documentation, screenshots or example files.
- Confirm `npm run validate` passes from the source project.

After extracting the clean ZIP, the client should run:

```bash
npm install
npm run dev
```

Normal website updates begin in `lib/EDIT-SITE-HERE.ts`.
