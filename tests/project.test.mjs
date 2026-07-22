import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import test from "node:test";

const url = (path) => new URL(`../${path}`, import.meta.url);
const read = (path) => readFileSync(url(path), "utf8");
const firstExisting = (...paths) => paths.map((path) => new URL(path, import.meta.url)).find((path) => existsSync(path));
const documentationUrl = firstExisting("../Documentation/index.html", "../../../Documentation/index.html");
const changelogUrl = firstExisting("../CHANGELOG.md", "../../../CHANGELOG.md");

test("client handover files are included", () => {
  for (const path of ["README.md", "MAINTENANCE.md"]) {
    assert.equal(existsSync(url(path)), true, `${path} is missing`);
  }
  assert.ok(changelogUrl, "CHANGELOG.md is missing from the project or package root");
  assert.ok(documentationUrl, "Documentation/index.html is missing from the project or package root");
});

test("content and configuration remain centralized", () => {
  for (const path of [
    "lib/site-config.ts",
    "lib/navigation.ts",
    "lib/content/home.ts",
    "lib/content/services.ts",
    "lib/content/process.ts",
    "lib/content/faq.ts",
    "lib/content/certifications.ts",
    "lib/content/pages.ts",
  ]) {
    assert.equal(existsSync(url(path)), true, `${path} is missing`);
  }
});

test("brand asset paths remain centralized", () => {
  const config = read("lib/site-config.ts");
  for (const asset of ["/logo.png", "/logo-white.png", "/full-logo.png", "/og-image.jpg"]) {
    assert.match(config, new RegExp(asset.replace(".", "\\.")));
  }

  for (const path of ["components/layout/Navbar.tsx", "components/layout/Footer.tsx", "components/shared/Preloader.tsx"]) {
    const source = read(path);
    assert.doesNotMatch(source, /src=["{]["']\/(?:logo|full-logo)/, `${path} hardcodes a brand asset`);
  }
});

test("production integration remains server-side", () => {
  const route = read("app/api/leads/route.ts");
  assert.match(route, /TURNSTILE_SECRET_KEY/);
  assert.match(route, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(route, /RESEND_API_KEY/);
  assert.doesNotMatch(route, /NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY/);
  assert.doesNotMatch(route, /NEXT_PUBLIC_RESEND_API_KEY/);
});

test("secret environment files stay ignored", () => {
  assert.match(read(".gitignore"), /^\.env\*\.local$/m);
  assert.equal(existsSync(url(".env.local")), true, ".env.local must be included in the source package");
  assert.equal(existsSync(url(".env.example")), false, ".env.example must not be packaged");
});

test("required package scripts are available", () => {
  const packageJson = JSON.parse(read("package.json"));
  for (const script of ["dev", "test", "lint", "typecheck", "build", "validate"]) {
    assert.equal(typeof packageJson.scripts?.[script], "string", `npm script ${script} is missing`);
  }
});

test("Meta Pixel stays optional", () => {
  const pixels = read("components/shared/MarketingPixels.tsx");
  assert.match(pixels, /process\.env\.NEXT_PUBLIC_META_PIXEL_ID/);
  assert.match(pixels, /consent === "accepted" && metaPixelId/);
});

test("server secrets are not referenced by client components", () => {
  for (const path of ["components/home/ContactForm.tsx", "components/shared/MarketingPixels.tsx"]) {
    const source = read(path);
    assert.doesNotMatch(source, /TURNSTILE_SECRET_KEY|SUPABASE_SERVICE_ROLE_KEY|RESEND_API_KEY/);
  }
});

test("required Supabase migration is included", () => {
  assert.equal(existsSync(url("supabase/migrations/20260715143601_create_leads.sql")), true);
});

test("standalone guide documents every supported environment variable", () => {
  assert.ok(documentationUrl, "Documentation/index.html is missing");
  const documentation = readFileSync(documentationUrl, "utf8");
  const names = [
    "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
    "TURNSTILE_SECRET_KEY",
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "RESEND_API_KEY",
    "LEAD_NOTIFICATION_EMAIL",
    "LEAD_FROM_EMAIL",
    "MAINTENANCE_MODE",
    "MAINTENANCE_RETRY_AFTER",
    "FORBIDDEN_PATHS",
    "NEXT_PUBLIC_GTM_ID",
    "NEXT_PUBLIC_GA_MEASUREMENT_ID",
    "NEXT_PUBLIC_GOOGLE_ADS_ID",
    "NEXT_PUBLIC_META_PIXEL_ID",
    "NEXT_PUBLIC_TIKTOK_PIXEL_ID",
    "NEXT_PUBLIC_LINKEDIN_PARTNER_ID",
    "NEXT_PUBLIC_X_PIXEL_ID",
    "NEXT_PUBLIC_PINTEREST_TAG_ID",
    "NEXT_PUBLIC_SNAP_PIXEL_ID",
  ];

  for (const name of names) {
    assert.match(documentation, new RegExp(name), `${name} is missing from Documentation/index.html`);
  }
});

test("required SEO and status routes are present", () => {
  for (const path of [
    "app/sitemap.ts",
    "app/robots.ts",
    "app/manifest.ts",
    "app/not-found.tsx",
    "app/error.tsx",
    "app/global-error.tsx",
    "app/403/page.tsx",
    "app/maintenance/page.tsx",
  ]) {
    assert.equal(existsSync(url(path)), true, `${path} is missing`);
  }
});

test("navigation resolver preserves supported destination formats", async () => {
  const { resolveNavigationHref } = await import(url("lib/navigation-utils.js"));
  assert.equal(resolveNavigationHref("#services"), "/#services");
  assert.equal(resolveNavigationHref("/#services"), "/#services");
  assert.equal(resolveNavigationHref("/qr-generator"), "/qr-generator");
  assert.equal(resolveNavigationHref("https://example.com"), "https://example.com");
  assert.equal(resolveNavigationHref("http://example.com"), "http://example.com");
  assert.equal(resolveNavigationHref("mailto:hello@example.com"), "mailto:hello@example.com");
  assert.equal(resolveNavigationHref("tel:+60123456789"), "tel:+60123456789");
});

test("hexadecimal brand colors use the production RGB converter", async () => {
  const { hexToRgbChannels } = await import(url("lib/color-utils.js"));
  assert.equal(hexToRgbChannels("#f8fbfd"), "248 251 253");
  assert.equal(hexToRgbChannels("#bfd730"), "191 215 48");
  assert.equal(hexToRgbChannels("#171717"), "23 23 23");
  assert.equal(hexToRgbChannels("#5f666d"), "95 102 109");
  assert.equal(hexToRgbChannels("#BFD730"), "191 215 48");
  assert.throws(() => hexToRgbChannels("#fff"), /six digits/i);
  assert.throws(() => hexToRgbChannels("#gggggg"), /six digits/i);
});

test("TypeScript and initial SQL budget values stay synchronized", () => {
  const types = read("lib/types/lead.ts");
  const migration = read("supabase/migrations/20260715143601_create_leads.sql");
  const arrayBody = types.match(/leadBudgetOptions\s*=\s*\[([\s\S]*?)\]\s*as const/)?.[1] || "";
  const sqlBody = migration.match(/budget in \(([^)]+)\)/i)?.[1] || "";
  const tsValues = [...arrayBody.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
  const sqlValues = [...sqlBody.matchAll(/'([^']+)'/g)].map((match) => match[1]);
  assert.deepEqual(tsValues, sqlValues);
});

test("brand theme, font, SEO and budget example files are included", () => {
  for (const path of [
    "lib/brand-theme.ts",
    "lib/fonts.ts",
    "lib/seo-config.ts",
    "lib/navigation-utils.js",
    "lib/color-utils.js",
    "supabase/examples/update-budget-options.sql",
  ]) assert.equal(existsSync(url(path)), true, `${path} is missing`);
});

test("known brand colors are centralized outside production TSX files", () => {
  const roots = ["app", "components", "pages"];
  const files = [];
  const walk = (path) => {
    const location = url(`${path}/`);
    for (const name of readdirSync(location)) {
      const child = `${path}/${name}`;
      if (statSync(url(child)).isDirectory()) walk(child);
      else if (/\.(?:ts|tsx)$/.test(name)) files.push(child);
    }
  };
  roots.forEach(walk);
  const known = /#(?:f8fbfd|bfd730|9db514|8fa30f|738600|171717|5f666d)/i;
  for (const path of files) assert.doesNotMatch(read(path), known, `${path} hardcodes a brand color`);
});

test("visible brand references stay in editable configuration or content", () => {
  for (const path of ["app", "components", "pages"]) {
    const location = url(`${path}/`);
    const walk = (directory) => {
      for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const child = new URL(`${entry.name}${entry.isDirectory() ? "/" : ""}`, directory);
        if (entry.isDirectory()) walk(child);
        else if (/\.(?:ts|tsx)$/.test(entry.name)) {
          const source = readFileSync(child, "utf8");
          assert.doesNotMatch(source, /Trulab Production|trulabstudio\.com/i, `${child.pathname} hardcodes visible branding`);
        }
      }
    };
    walk(location);
  }
});

test("podcast SEO phrases are centralized", () => {
  for (const path of ["app/page.tsx", "app/layout.tsx"]) {
    assert.doesNotMatch(read(path), /Professional Podcast Production Malaysia|Podcast Production|Podcast Editing/);
  }
});

test("contact point area served is sourced from SEO configuration", () => {
  const page = read("app/page.tsx");
  assert.doesNotMatch(page, /contactPoint\s*:\s*\{[\s\S]*?areaServed:\s*["']MY["']/);
  assert.match(page, /contactPoint\s*:\s*\{[\s\S]*?areaServed:\s*seoConfig\.areaServed\.code/);
});

test("release package has exactly one valid lockfile location", () => {
  assert.equal(existsSync(url("package-lock.json")), true, "project package-lock.json is missing");
  assert.equal(existsSync(new URL("../../package-lock.json", import.meta.url)), false, "Main Files/package-lock.json is invalid");
  assert.equal(existsSync(new URL("../../../package-lock.json", import.meta.url)), false, "release-root package-lock.json is invalid");
});

test("brand RGB channels are derived rather than manually repeated", () => {
  const theme = read("lib/brand-theme.ts");
  assert.match(theme, /hexToRgbChannels\(brandTheme\.background\)/);
  assert.match(theme, /hexToRgbChannels\(brandTheme\.accent\)/);
  assert.doesNotMatch(theme, /background:\s*["']248 251 253["']/);
});

test("release artifacts are ignored and unsafe environment examples are absent", () => {
  assert.equal(existsSync(url(".env.example")), false, ".env.example must not be packaged");
  const gitignore = read(".gitignore");
  for (const pattern of ["node_modules", ".next", "*.tsbuildinfo", "npm-debug.log*"]) {
    assert.match(gitignore, new RegExp(`^${pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "m"));
  }
});

test("documentation covers new customization safety rules", () => {
  assert.ok(documentationUrl);
  const documentation = readFileSync(documentationUrl, "utf8");
  for (const phrase of [
    "update-budget-options.sql",
    "https://example.com",
    "lib/brand-theme.ts",
    "lib/seo-config.ts",
    "dummy placeholder values",
    "Optional Meta Pixel Setup",
  ]) assert.match(documentation, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${phrase} is missing`);
});
