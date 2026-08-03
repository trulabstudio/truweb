import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const url = (path) => new URL(`../${path}`, import.meta.url);
const read = (path) => readFileSync(url(path), "utf8");

function walk(path, extensions = /\.(?:js|mjs|ts|tsx)$/) {
  const files = [];

  for (const entry of readdirSync(url(path), { withFileTypes: true })) {
    const child = `${path}/${entry.name}`;
    if (entry.isDirectory()) files.push(...walk(child, extensions));
    else if (extensions.test(entry.name)) files.push(child);
  }

  return files;
}

const editablePath = "lib/EDIT-SITE-HERE.ts";
const editableSource = read(editablePath);
const editableJavaScript = ts.transpileModule(editableSource, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const { editableSite } = await import(
  `data:text/javascript;base64,${Buffer.from(editableJavaScript).toString("base64")}`
);

const renderedFiles = [
  ...walk("app", /\.tsx$/),
  ...walk("components", /\.tsx$/),
  ...walk("pages", /\.tsx$/),
];
const productionSourceFiles = [
  ...renderedFiles,
  ...walk("lib"),
  "tailwind.config.ts",
];

test("client handover starts from one labelled and indexed editing file", () => {
  for (const path of [
    editablePath,
    "MAINTENANCE.md",
    "HANDOVER-CHECKLIST.md",
    "public/images/IMAGE-SPECS.md",
    "README.md",
  ]) {
    assert.equal(existsSync(url(path)), true, `${path} is missing`);
  }

  assert.match(editableSource, /CLIENT EDITING FILE/);
  assert.match(editableSource, /Do not edit components unless changing the website design/);
  assert.match(editableSource, /export const editableSite/);

  for (const heading of [
    "01. COMPANY",
    "02. CONTACT",
    "03. BRAND COLOURS",
    "04. IMAGES",
    "05. NAVIGATION",
    "06. HOMEPAGE",
    "07. PACKAGES",
    "08. FAQ",
    "09. CONTACT FORM",
    "10. SEO",
    "11. TOOLS",
    "12. STATUS PAGES",
    "13. MARKETING",
  ]) {
    assert.match(editableSource, new RegExp(heading.replace(".", "\\.")));
  }
});

test("the editing object retains every required client section", () => {
  for (const section of [
    "company",
    "branding",
    "images",
    "navigation",
    "homepage",
    "packages",
    "faq",
    "forms",
    "seo",
    "tools",
    "statusPages",
    "marketing",
  ]) {
    assert.ok(section in editableSite, `${section} is missing from editableSite`);
  }
});

test("company and contact details have one runtime source of truth", () => {
  const clientValues = [
    editableSite.company.name,
    editableSite.company.domain,
    editableSite.company.websiteUrl,
    editableSite.company.email,
    editableSite.company.phoneDisplay,
    editableSite.company.whatsappNumber,
  ].filter((value) => typeof value === "string" && value.length > 0);

  for (const value of clientValues) {
    const copies = productionSourceFiles.filter(
      (path) => path !== editablePath && read(path).includes(value),
    );
    assert.deepEqual(copies, [], `a configured company/contact value is duplicated in ${copies.join(", ")}`);
  }
});

test("technical adapters consume the editing file without editable literals", () => {
  const adapters = [
    "lib/site-config.ts",
    "lib/brand-theme.ts",
    "lib/seo-config.ts",
    "lib/navigation.ts",
    "lib/content/home.ts",
    "lib/content/services.ts",
    "lib/content/process.ts",
    "lib/content/packages.ts",
    "lib/content/faq.ts",
    "lib/content/certifications.ts",
    "lib/content/pages.ts",
    "lib/types/lead.ts",
  ];

  for (const path of adapters) {
    const source = read(path);
    assert.match(source, /EDIT-SITE-HERE/, `${path} does not consume the editing file`);
    assert.doesNotMatch(source, /#[0-9a-f]{6}/i, `${path} duplicates an editable colour`);
  }
});

test("rendering files contain no direct visible prose", () => {
  const directJsxText = /(?<![=])>\s*[A-Za-z][^<{]*</;
  const directVisibleAttribute = /\b(?:aria-label|placeholder|alt|title)="[A-Za-z][^"]*"/;

  for (const path of renderedFiles) {
    const source = read(path);
    assert.doesNotMatch(source, directJsxText, `${path} contains direct visible JSX wording`);
    assert.doesNotMatch(source, directVisibleAttribute, `${path} contains a direct visible attribute`);
  }
});

test("every centralized image exists and specifications have one technical home", () => {
  const collectImages = (value, results = []) => {
    if (Array.isArray(value)) {
      for (const item of value) collectImages(item, results);
    } else if (value && typeof value === "object") {
      if (typeof value.src === "string" && typeof value.alt === "string") results.push(value);
      for (const child of Object.values(value)) collectImages(child, results);
    }
    return results;
  };
  const images = collectImages(editableSite.images);
  const centralizedPaths = new Set(images.map((image) => image.src));
  const publicImagePaths = walk(
    "public/images",
    /\.(?:png|jpe?g|webp|svg|ico)$/i,
  ).map((path) => path.replace(/^public/, ""));
  const specifications = read("public/images/IMAGE-SPECS.md");

  assert.ok(images.length > 0);
  assert.deepEqual(
    [...publicImagePaths].sort(),
    [...centralizedPaths].sort(),
    "public/images contains an asset that is not used by the editing object",
  );
  assert.doesNotMatch(
    editableSource,
    /recommendedSize|aspectRatio|preferredFormat|transparentBackground:|mobileConsiderations/,
  );

  for (const image of images) {
    assert.equal(existsSync(url(`public${image.src}`)), true, `${image.src} does not exist`);
    assert.ok(specifications.includes(image.src), `${image.src} is missing from IMAGE-SPECS.md`);
  }

  const imageLiteral = /\/[^"'`\s)]+\.(?:png|jpe?g|webp|svg|ico)/i;
  for (const path of productionSourceFiles) {
    if (path !== editablePath) {
      assert.doesNotMatch(read(path), imageLiteral, `${path} hardcodes an editable image path`);
    }
  }
});

test("package IDs are permanent, unique and independent of editable labels", () => {
  const packages = editableSite.packages.items;
  const additionalOptions = editableSite.forms.contact.additionalPackageOptions;
  const ids = [...packages.map((item) => item.id), ...additionalOptions.map((item) => item.id)];

  assert.equal(new Set(ids).size, ids.length, "every package option ID must be unique");
  assert.ok(ids.every((id) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)));
  assert.match(editableSource, /Never change an existing package `id`/);

  const leadTypes = read("lib/types/lead.ts");
  const contactForm = read("components/home/ContactForm.tsx");
  const api = read("app/api/leads/route.ts");
  const stableMigration = read(
    "supabase/migrations/20260728143000_stabilize_lead_package_ids.sql",
  );

  assert.match(leadTypes, /getPackageDisplayLabel/);
  assert.match(leadTypes, /packageInterestOptions/);
  assert.match(contactForm, /value=\{option\.id\}/);
  assert.match(contactForm, /packageId/);
  assert.match(api, /packageInterestIds/);
  assert.match(api, /budget:\s*lead\.packageId/);

  for (const id of ids) {
    assert.ok(stableMigration.includes(`'${id}'`), `migration does not support package ID ${id}`);
  }
});

test("human-readable package labels are used for WhatsApp and notification email", () => {
  const leadTypes = read("lib/types/lead.ts");
  const contactForm = read("components/home/ContactForm.tsx");
  const api = read("app/api/leads/route.ts");

  assert.match(leadTypes, /getPackageInterestLabel/);
  assert.match(contactForm, /getPackageInterestLabel\(form\.packageId\)/);
  assert.match(api, /const packageLabel = getPackageInterestLabel\(packageId\)/);
  assert.match(api, /escapeHtml\(packageLabel \|\| notificationEmail\.emptyValue\)/);
});

test("successful leads send a detailed confirmation email to the customer", () => {
  const api = read("app/api/leads/route.ts");

  assert.match(api, /to: \[lead\.email\]/);
  assert.match(api, /notificationEmail\.customer\.subject/);
  assert.match(api, /lead-confirmation-\$\{record\.id\}/);
  assert.match(api, /detailsHtml/);
  assert.match(api, /reply_to: notifyEmail/);
});

test("successful contact submissions open WhatsApp without leaving the website", () => {
  const contactForm = read("components/home/ContactForm.tsx");

  assert.match(contactForm, /window\.open\("", "_blank"\)/);
  assert.match(contactForm, /whatsappWindow\.location\.href = whatsappUrl/);
  assert.doesNotMatch(contactForm, /window\.location\.assign\(whatsappUrl\)/);
});

test("legacy database naming is isolated to the API and migrations", () => {
  assert.doesNotMatch(read("components/home/ContactForm.tsx"), /\bbudget\b/);
  assert.doesNotMatch(read("lib/types/lead.ts"), /\bbudget\b/);
  assert.match(read("app/api/leads/route.ts"), /budget:\s*lead\.packageId/);
});

test("historical migration matches the committed version", () => {
  const initialMigration = read("supabase/migrations/20260715143601_create_leads.sql");

  assert.match(initialMigration, /Below RM5,000/);
  for (const id of editableSite.packages.items.map((item) => item.id)) {
    assert.doesNotMatch(initialMigration, new RegExp(`'${id}'`));
  }
});

test("navbar anchors target rendered homepage sections", () => {
  const anchors = editableSite.navigation.navbarLinks
    .map((link) => link.href)
    .filter((href) => href.startsWith("#"))
    .map((href) => href.slice(1));
  const sectionSource = walk("components/home", /\.tsx$/).map(read).join("\n");
  const sectionIds = new Set(
    [...sectionSource.matchAll(/<Section\s+id="([^"]+)"/g)].map((match) => match[1]),
  );

  assert.ok(anchors.length > 0);
  for (const anchor of anchors) {
    assert.equal(sectionIds.has(anchor), true, `#${anchor} has no matching section`);
  }
});

test("brand colours flow through adapters, Tailwind and CSS variables", () => {
  assert.match(read("lib/brand-theme.ts"), /editableSite\.branding\.colors/);
  assert.match(read("tailwind.config.ts"), /brandTheme\.surface/);
  assert.match(read("app/layout.tsx"), /--trulab-button-primary-bg/);
});

test("metadata and public machine-readable routes consume centralized adapters", () => {
  assert.match(read("app/layout.tsx"), /seoConfig\.titleTemplate/);
  assert.match(read("app/layout.tsx"), /siteConfig\.assets\.favicon/);
  assert.match(read("app/robots.ts"), /seoConfig\.robots\.disallow/);
  assert.match(read("app/sitemap.ts"), /seoConfig\.sitemap/);
  assert.match(read("app/manifest.ts"), /editableSite\.images\.pwa/);
});

test("production integrations remain server-only", () => {
  const route = read("app/api/leads/route.ts");
  assert.match(route, /TURNSTILE_SECRET/);
  assert.doesNotMatch(route, /TURNSTILE_SECRET_KEY/);
  assert.match(route, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(route, /RESEND_API_KEY/);
  assert.doesNotMatch(route, /NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY|NEXT_PUBLIC_RESEND_API_KEY/);

  for (const path of ["components/home/ContactForm.tsx", "components/shared/MarketingPixels.tsx"]) {
    assert.doesNotMatch(
      read(path),
      /TURNSTILE_SECRET(?:_KEY)?|SUPABASE_SERVICE_ROLE_KEY|RESEND_API_KEY/,
    );
  }
});

test("Turnstile uses the canonical widget token and server-side siteverify", () => {
  const contactForm = read("components/home/ContactForm.tsx");
  const route = read("app/api/leads/route.ts");

  assert.match(contactForm, /"cf-turnstile-response": turnstileToken/);
  assert.match(contactForm, /data-action="turnstile-spin-v2"/);
  assert.match(contactForm, /window\.turnstile\?\.reset/);
  assert.match(route, /body\["cf-turnstile-response"\]/);
  assert.match(route, /https:\/\/challenges\.cloudflare\.com\/turnstile\/v0\/siteverify/);
  assert.match(route, /challenge\.success !== true/);
});

test("secret and generated files are ignored without requiring local secrets", () => {
  const gitignore = read(".gitignore");
  for (const pattern of [
    ".env*.local",
    "node_modules",
    ".next",
    "*.tsbuildinfo",
    "npm-debug.log*",
  ]) {
    assert.match(
      gitignore,
      new RegExp(`^${pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "m"),
    );
  }
});

test("README and handover documentation are clean and secret-free", () => {
  const readmeBytes = readFileSync(url("README.md"));
  const readme = readmeBytes.toString("utf8");
  const handover = read("HANDOVER-CHECKLIST.md");

  assert.equal(readmeBytes.includes(0), false, "README contains null bytes");
  assert.equal(Buffer.from(readme, "utf8").toString("utf8"), readme);
  for (const item of [".env.local", ".git", ".next", "node_modules", "tsconfig.tsbuildinfo"]) {
    assert.ok(handover.includes(item), `handover checklist does not exclude ${item}`);
  }
  assert.doesNotMatch(`${readme}\n${handover}`, /(?:service_role|secret)[=:]\s*\S+/i);
});

test("required routes, scripts, lockfile and migration files remain available", () => {
  for (const path of [
    "app/page.tsx",
    "app/qr-generator/page.tsx",
    "app/background-remover/page.tsx",
    "app/not-found.tsx",
    "app/error.tsx",
    "app/global-error.tsx",
    "app/403/page.tsx",
    "app/maintenance/page.tsx",
    "package-lock.json",
    "supabase/migrations/20260715143601_create_leads.sql",
    "supabase/migrations/20260728000000_align_lead_packages.sql",
    "supabase/migrations/20260728143000_stabilize_lead_package_ids.sql",
  ]) {
    assert.equal(existsSync(url(path)), true, `${path} is missing`);
    assert.equal(statSync(url(path)).isFile(), true);
  }

  const packageJson = JSON.parse(read("package.json"));
  for (const script of ["dev", "test", "lint", "typecheck", "build", "validate"]) {
    assert.equal(typeof packageJson.scripts?.[script], "string");
  }
});

test("navigation and colour helpers preserve technical behavior", async () => {
  const { resolveNavigationHref } = await import(url("lib/navigation-utils.js"));
  const { hexToRgbChannels } = await import(url("lib/color-utils.js"));

  assert.equal(resolveNavigationHref("#section"), "/#section");
  assert.equal(resolveNavigationHref("/tool"), "/tool");
  assert.equal(resolveNavigationHref("https://example.com"), "https://example.com");
  assert.equal(hexToRgbChannels("#f8fbfd"), "248 251 253");
  assert.throws(() => hexToRgbChannels("#fff"), /six digits/i);
});
