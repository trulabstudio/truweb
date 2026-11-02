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
}).outputText.replace(
  /import (\w+) from "\.\.\/(content\/[^"]+\.json)";/g,
  (_, name, path) => `const ${name} = ${read(path)};`,
);
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
  // Images uploaded from the admin panel have generated names, and replaced ones stay in their folder.
  const isPanelUpload = (path) => /\/\d+-[0-9a-f]{6}\.(?:png|jpg|webp)$/.test(path);
  assert.deepEqual(
    publicImagePaths.filter((path) => !isPanelUpload(path)).sort(),
    [...centralizedPaths].filter((path) => !isPanelUpload(path)).sort(),
    "public/images contains an asset that is not used by the editing object",
  );
  assert.doesNotMatch(
    editableSource,
    /recommendedSize|aspectRatio|preferredFormat|transparentBackground:|mobileConsiderations/,
  );

  for (const image of images) {
    assert.equal(existsSync(url(`public${image.src}`)), true, `${image.src} does not exist`);
    // Client logos and the hero image are specified by the admin panel, not per file.
    if (!/^\/images\/(?:hero|clients)\//.test(image.src) && !isPanelUpload(image.src)) {
      assert.ok(specifications.includes(image.src), `${image.src} is missing from IMAGE-SPECS.md`);
    }
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

test("admin panel schema accepts all current content and does not lose any field", async () => {
  const javascript = ts.transpileModule(read("lib/admin/schema.ts"), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const { sections, validateSection, emptyValue } = await import(
    `data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`
  );

  for (const section of sections) {
    const current = JSON.parse(read(section.path));
    const { data, errors } = validateSection(section, current);
    assert.deepEqual(errors, [], section.key);
    assert.deepEqual(data, current, section.key);
  }

  const packages = sections.find((section) => section.key === "packages");
  const current = JSON.parse(read(packages.path));
  const blank = { ...current.items[0], name: " " };
  assert.ok(validateSection(packages, { ...current, items: [blank] }).errors.length > 0, "blank required text");
  assert.ok(validateSection(packages, { ...current, items: [current.items[0], current.items[0]] }).errors.length > 0, "duplicate id");
  assert.ok(validateSection(packages, { ...current, items: [] }).errors.length > 0, "below minimum");

  const clients = sections.find((section) => section.key === "clients");
  const logo = { name: "A", alt: "A", src: "../../secret.png" };
  assert.ok(validateSection(clients, { title: "T", logos: [logo] }).errors.length > 0, "unsafe image path");
  assert.equal(typeof emptyValue(packages.fields.items.item).name, "string");

  const errorsFor = (key, change) => {
    const section = sections.find((item) => item.key === key);
    const value = JSON.parse(read(section.path));
    change(value);
    return validateSection(section, value).errors;
  };
  assert.ok(errorsFor("navigation", (value) => { value.mainCta.href = "#missing"; }).length > 0, "unknown anchor");
  assert.ok(errorsFor("navigation", (value) => { value.mainCta.href = "/missing"; }).length > 0, "unknown route");
  assert.ok(errorsFor("navigation", (value) => { value.mainCta.href = "javascript:alert(1)"; }).length > 0, "script link");
  assert.deepEqual(errorsFor("navigation", (value) => { value.mainCta.href = "https://example.com/page"; }), []);
  assert.ok(errorsFor("navigation", (value) => { value.navbarLinks[1].href = value.navbarLinks[0].href; }).length > 0, "duplicate link");
  assert.ok(errorsFor("contact", (value) => { value.whatsappNumber = "017-698"; }).length > 0, "bad WhatsApp number");
  assert.ok(errorsFor("contact", (value) => { value.email = "not-an-email"; }).length > 0, "bad email");
  assert.ok(errorsFor("company", (value) => { value.domain = "https://www.example.com"; }).length > 0, "bad domain");
  assert.ok(errorsFor("company", (value) => { value.socialLinks = [{ label: "IG", href: "instagram.com" }]; }).length > 0, "bad social link");
  assert.ok(errorsFor("faq", (value) => { value.title = "Hello {compny}"; }).length > 0, "unknown token");
  assert.ok(errorsFor("emails", (value) => { value.customer.signOff = "<script>x</script>"; }).length > 0, "script in email");
  assert.ok(errorsFor("brand-colors", (value) => { value.text = "#f8fbfd"; }).length > 0, "unreadable text");
  assert.deepEqual(errorsFor("brand-colors", (value) => { value.accent = "#ffd700"; }), []);
});

test("admin link checks match the real homepage sections and routes", async () => {
  const javascript = ts.transpileModule(read("lib/admin/schema.ts"), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const { homepageAnchors, siteRoutes } = await import(
    `data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`
  );
  const sectionSource = walk("components/home", /\.tsx$/).map(read).join("\n");
  const sectionIds = [...sectionSource.matchAll(/<Section\s+id="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual([...homepageAnchors].sort(), [...sectionIds].sort());
  for (const route of siteRoutes) {
    assert.ok(existsSync(url(`app${route === "/" ? "" : route}/page.tsx`)), `${route} has no page`);
  }
});

test("Threads scheduling, stages and settings behave safely", async () => {
  const javascript = ts.transpileModule(read("lib/threads/schedule.ts"), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const { upcomingSlots, planStages, funnelCycle, hasLink, looksComplete, queueIsLow, aiErrorKind, containsKeyword, fitsThreads, validateSettings, cleanLeadSource, defaultSettings } = await import(
    `data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`
  );

  // 2 Nov 10:00 in Malaysia.
  assert.deepEqual(upcomingSlots(new Date("2026-11-02T02:00:00Z"), ["09:00", "20:30"], 1), [
    "2026-11-02T12:30:00.000Z", "2026-11-03T01:00:00.000Z", "2026-11-03T12:30:00.000Z",
  ]);
  // 3 Nov 00:30 in Malaysia is still 2 Nov in UTC.
  assert.deepEqual(upcomingSlots(new Date("2026-11-02T16:30:00Z"), ["09:00"], 0), ["2026-11-03T01:00:00.000Z"]);

  const plan = planStages(14, { attract: 8, trust: 4, offer: 2 });
  assert.deepEqual(["attract", "trust", "offer"].map((stage) => plan.filter((item) => item === stage).length), [8, 4, 2]);
  assert.deepEqual(planStages(2, { attract: 0, trust: 0, offer: 0 }), ["attract", "attract"]);
  assert.deepEqual(funnelCycle({ attract: 4, trust: 2, offer: 1 }), ["attract", "trust", "attract", "attract", "trust", "attract", "offer"]);
  assert.deepEqual(funnelCycle({ attract: 8, trust: 4, offer: 2 }), funnelCycle({ attract: 4, trust: 2, offer: 1 }));
  // Filling one slot at a time must still reach the offer.
  const oneByOne = Array.from({ length: 7 }, (_, position) => planStages(1, { attract: 4, trust: 2, offer: 1 }, position)[0]);
  assert.deepEqual(oneByOne, funnelCycle({ attract: 4, trust: 2, offer: 1 }));

  assert.equal(containsKeyword("nak PODCAST kedai saya", "podcast"), true);
  assert.equal(containsKeyword("podcasting best", "podcast"), false);
  assert.equal(hasLink("cuba https://spam.test"), true);
  assert.equal(hasLink("tengok kedai.com sekarang"), true);
  assert.equal(hasLink("Betul tu. Saya setuju, bos."), false);
  assert.equal(looksComplete("Podcast bina kepercayaan sebelum jualan."), true);
  assert.equal(looksComplete("Kerja ni mudah kalau tahu caranya 😀"), true);
  for (const cut of ["Ramai owner rasa,", "Kau kena fikir pasal jualan dan", "Lepas tu kita buat...", 'Dia kata "jangan', "Contoh (bisnes kecil"]) assert.equal(looksComplete(cut), false, cut);
  const clock = Date.parse("2026-11-02T00:00:00Z");
  assert.equal(queueIsLow(["2026-11-02T01:00:00Z"], { postsPerDay: 2, paused: false }, clock), true);
  assert.equal(queueIsLow(["2026-11-02T01:00:00Z", "2026-11-02T02:00:00Z"], { postsPerDay: 2, paused: false }, clock), false);
  assert.equal(queueIsLow([], { postsPerDay: 2, paused: true }, clock), false);
  assert.equal(aiErrorKind("400 Your credit balance is too low to access the API"), "credit");
  assert.equal(aiErrorKind("401 invalid x-api-key"), "key");
  assert.equal(aiErrorKind("Post generation stopped: refusal"), "other");
  assert.equal(fitsThreads("a".repeat(500)), true);
  assert.equal(fitsThreads(`${"a".repeat(499)}😀`), false);

  assert.deepEqual(validateSettings(defaultSettings).errors, []);
  assert.equal(defaultSettings.mode, "approve");
  const invalid = (patch) => validateSettings({ ...defaultSettings, ...patch }).errors.length > 0;
  assert.ok(invalid({ postTimes: ["09:00"] }), "time count must match");
  assert.ok(invalid({ postTimes: ["09:00", "09:00"] }), "duplicate time");
  assert.ok(invalid({ postTimes: ["25:00", "09:00"] }), "bad time");
  assert.ok(invalid({ keyword: "two words" }), "keyword must be one word");
  assert.ok(invalid({ replyText: "no link" }), "reply needs a link");
  assert.ok(invalid({ mix: { attract: 0, trust: 0, offer: 0 } }), "empty mix");

  assert.equal(cleanLeadSource("threads-12"), "threads-12");
  assert.equal(cleanLeadSource("threads-12; drop"), "website");
  assert.equal(cleanLeadSource(undefined), "website");
});

test("Threads funnel results and best times are measured fairly", async () => {
  const javascript = ts.transpileModule(read("lib/threads/metrics.ts"), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const { bestHours, suggestTimes, funnelReport, followerChange, chooseFocus } = await import(
    `data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`
  );

  const account = (at, views) => ({ at, views, text: "", link: "", likes: 0, replies: 0 });
  // 03:00 UTC is 11:00 in Malaysia. A viral post at another hour, or old posts, must not count.
  const days = [1, 2, 3, 4, 5];
  const hours = bestHours([
    ...days.map((day) => account(`2026-10-0${day}T03:00:00Z`, day * 100)),
    ...days.map((day) => account(`2026-10-0${day}T10:00:00Z`, day * 20)),
    account("2026-10-01T05:00:00Z", 99999),
    ...days.map((day) => account(`2025-07-0${day}T07:00:00Z`, 50000)),
  ], Date.parse("2026-11-01T00:00:00Z"));
  assert.deepEqual(hours.map((hour) => [hour.hour, hour.medianViews]), [[11, 300], [18, 60]]);
  assert.deepEqual(suggestTimes(hours, 2), ["11:00", "18:00"]);
  assert.deepEqual(suggestTimes(hours, 3), []);
  assert.deepEqual(suggestTimes([{ hour: 1 }, { hour: 11 }, { hour: 19 }], 2), ["11:00", "19:00"], "no suggestions in the middle of the night");
  assert.deepEqual(suggestTimes([{ hour: 11 }, { hour: 12 }, { hour: 18 }], 2), ["11:00", "18:00"]);

  const now = Date.parse("2026-11-20T00:00:00Z");
  const post = (daysAgo, stage, views, enquiries = 0) => ({ stage, views, enquiries, likes: 0, replies: 0, comments: 0, posted_at: new Date(now - daysAgo * 86_400_000).toISOString() });
  const report = funnelReport([
    post(3, "attract", 300), post(4, "attract", 300), post(5, "attract", 300),
    post(20, "attract", 100), post(21, "attract", 100), post(22, "attract", 100),
    post(1, "attract", 1), post(3, "offer", 50, 1),
  ], now);
  const row = (stage) => report.find((item) => item.stage === stage);
  assert.equal(row("attract").result, "better");
  assert.equal(row("attract").posts, 3, "posts still collecting views wait");
  assert.equal(row("offer").result, "wait");

  const recent = (views, likes = 0) => Array.from({ length: 6 }, (_, index) => ({ ...account(new Date(now - (index + 3) * 86_400_000).toISOString(), views), likes }));
  assert.equal(chooseFocus([], 1000, [], now).focus, "steady", "too little data");
  assert.equal(chooseFocus(recent(100), 1689, [], now).focus, "reach");
  assert.equal(chooseFocus(recent(1000, 1), 1689, [], now).focus, "trust");
  assert.equal(chooseFocus(recent(1000, 50), 1689, [{ enquiries: 0 }], now).focus, "prospects");
  assert.equal(chooseFocus(recent(1000, 50), 1689, [{ enquiries: 1 }], now).focus, "steady");

  assert.equal(followerChange([{ day: "2026-11-19", count: 10 }], now), null);
  assert.equal(followerChange([{ day: "2026-11-01", count: 10 }, { day: "2026-11-19", count: 25 }], now), 15);
});
