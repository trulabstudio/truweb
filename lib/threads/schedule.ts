export type Stage = "attract" | "trust" | "offer";

export type ThreadsSettings = {
  postsPerDay: number;
  postTimes: string[];
  strategy: "auto" | "manual";
  mix: Record<Stage, number>;
  theme: string;
  offer: string;
  keyword: string;
  formLink: string;
  replyText: string;
  autoReply: boolean;
  mode: "approve" | "auto";
  paused: boolean;
};

export const funnelPresets = [
  { id: "grow", mix: { attract: 5, trust: 2, offer: 1 } },
  { id: "balanced", mix: { attract: 4, trust: 2, offer: 1 } },
  { id: "prospects", mix: { attract: 3, trust: 2, offer: 1 } },
] as const;

export const defaultSettings: ThreadsSettings = {
  postsPerDay: 2,
  postTimes: ["11:00", "19:00"],
  strategy: "auto",
  mix: { attract: 4, trust: 2, offer: 1 },
  theme: "Owners do not know what to say on a podcast",
  offer: "A free podcast consultation for your business",
  keyword: "PODCAST",
  formLink: "",
  replyText: "Nak kami bantu rancang podcast untuk bisnes kau? Isi borang ni: {link}",
  autoReply: true,
  mode: "approve",
  paused: false,
};

const MAX_POST_BYTES = 500;
const MYT_OFFSET_MS = 8 * 60 * 60 * 1000;

// Threads counts emoji as UTF-8 bytes, so the limit is measured in bytes rather than characters.
export function fitsThreads(text: string) {
  return text.trim().length > 0 && new TextEncoder().encode(text).length <= MAX_POST_BYTES;
}

export function containsKeyword(text: string, keyword: string) {
  const word = keyword.trim().toLocaleLowerCase();
  return Boolean(word) && text.toLocaleLowerCase().split(/[^\p{L}\p{N}]+/u).includes(word);
}

const UNFINISHED_ENDING = /(?:[,:;\-–—(]|\.\.\.|…|\b(?:dan|atau|tapi|sebab|kerana|yang|untuk|dengan|kalau|bila|macam|pada|kepada|dari|daripada|di|ke|the|and|or|but|to|of))$/iu;

/** Catches text that stops mid-sentence, so a cut-off post or reply never goes out. */
export function looksComplete(text: string) {
  const clean = text.trim();
  const count = (mark: string) => clean.split(mark).length - 1;
  return Boolean(clean) && !UNFINISHED_ENDING.test(clean) && count('"') % 2 === 0 && count("(") === count(")") && count("“") === count("”");
}

/** Fewer posts waiting than one day needs, so the account is about to go quiet. */
export function queueIsLow(scheduledAt: string[], settings: Pick<ThreadsSettings, "postsPerDay" | "paused">, now: number) {
  return !settings.paused && scheduledAt.filter((at) => Date.parse(at) > now).length < settings.postsPerDay;
}

export function aiErrorKind(detail: string) {
  if (/credit balance|billing|insufficient|quota/i.test(detail)) return "credit";
  if (/authentication|x-api-key|api key|401/i.test(detail)) return "key";
  return "other";
}

/** Adds the post to the link, so the website form can record which post an enquiry came from. */
export function trackedLink(link: string, postId: number | string) {
  const url = new URL(link);
  url.searchParams.set("src", `threads-${postId}`);
  return url.toString();
}

const isWebLink = (value: string) => {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

export function hasLink(text: string) {
  return /https?:\/\/|www\.|\b[\p{L}\p{N}-]+\.(com|net|org|my|co|io|ly|me|app|link|gg|xyz|shop|site)\b/iu.test(text);
}

/** Future post times as ISO strings, with the clock times read as Malaysia time. */
export function upcomingSlots(now: Date, times: string[], days: number) {
  const today = new Date(now.getTime() + MYT_OFFSET_MS).toISOString().slice(0, 10);
  const start = Date.parse(`${today}T00:00:00Z`);
  const slots: string[] = [];
  for (let day = 0; day <= days; day++) {
    for (const time of [...times].sort()) {
      const [hour, minute] = time.split(":").map(Number);
      const at = start + day * 86_400_000 + (hour * 3600 + minute * 60) * 1000 - MYT_OFFSET_MS;
      if (at > now.getTime()) slots.push(new Date(at).toISOString());
    }
  }
  return slots;
}

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/** One funnel cycle: attract and trust posts warm readers up, and offers come after them. */
export function funnelCycle(mix: Record<Stage, number>): Stage[] {
  const divisor = gcd(gcd(mix.attract, mix.trust), mix.offer);
  if (divisor === 0) return ["attract"];
  const [attract, trust, offer] = [mix.attract / divisor, mix.trust / divisor, mix.offer / divisor];
  const warmup = attract + trust;
  if (warmup === 0) return ["offer"];
  const cycle: Stage[] = [];
  let attractUsed = 0;
  let offersUsed = 0;
  for (let i = 1; i <= warmup; i++) {
    const useAttract = (attract * i) / warmup - attractUsed >= (trust * i) / warmup - (i - 1 - attractUsed);
    if (useAttract) attractUsed++;
    cycle.push(useAttract ? "attract" : "trust");
    for (const due = Math.floor((offer * i) / warmup); offersUsed < due; offersUsed++) cycle.push("offer");
  }
  return cycle;
}

/** The next stages, continuing the cycle from where the last batch stopped. */
export function planStages(count: number, mix: Record<Stage, number>, position = 0) {
  const cycle = funnelCycle(mix);
  return Array.from({ length: count }, (_, index) => cycle[(position + index) % cycle.length]);
}

/** Returns clean settings and plain-language errors for anything that would break posting. */
export function validateSettings(input: unknown) {
  const source = (input && typeof input === "object" ? input : {}) as Partial<ThreadsSettings>;
  const errors: string[] = [];
  const postsPerDay = Number(source.postsPerDay);
  if (!Number.isInteger(postsPerDay) || postsPerDay < 1 || postsPerDay > 10) errors.push("Posts per day must be between 1 and 10.");
  const postTimes = Array.isArray(source.postTimes) ? source.postTimes.map(String) : [];
  if (!postTimes.every((time) => /^([01]\d|2[0-3]):[0-5]\d$/.test(time))) errors.push("Post times must look like 09:00.");
  if (new Set(postTimes).size !== postTimes.length) errors.push("Each post time must be different.");
  if (postTimes.length !== postsPerDay) errors.push("Set one post time for each post per day.");
  const raw = (source.mix ?? {}) as Partial<Record<Stage, number>>;
  const mix = { attract: Number(raw.attract), trust: Number(raw.trust), offer: Number(raw.offer) };
  if (Object.values(mix).some((value) => !Number.isInteger(value) || value < 0 || value > 70) || mix.attract + mix.trust + mix.offer === 0) {
    errors.push("The content mix needs whole numbers, with at least one above zero.");
  }
  const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");
  const theme = text(source.theme);
  const offer = text(source.offer);
  const keyword = text(source.keyword);
  const replyText = text(source.replyText);
  if (!theme) errors.push("Theme is required.");
  if (!offer) errors.push("Offer is required.");
  if (!/^[\p{L}\p{N}]{2,30}$/u.test(keyword)) errors.push("Keyword must be one word.");
  const formLink = text(source.formLink);
  if (formLink && !isWebLink(formLink)) errors.push("The form link must be a full address starting with https://.");
  if (!replyText.includes("{link}")) errors.push("The reply must include {link}.");
  if (!fitsThreads(replyText.replace("{link}", "x".repeat(Math.max(70, formLink.length + 25))))) errors.push("The reply is too long once the link is added.");
  return {
    errors,
    settings: {
      postsPerDay,
      postTimes: [...postTimes].sort(),
      strategy: source.strategy === "manual" ? "manual" : "auto",
      mix,
      theme,
      offer,
      keyword,
      formLink,
      replyText,
      autoReply: source.autoReply === true,
      mode: source.mode === "auto" ? "auto" : "approve",
      paused: source.paused === true,
    } as ThreadsSettings,
  };
}

/** Only known post sources are stored with an enquiry. */
export function cleanLeadSource(value: unknown) {
  return typeof value === "string" && /^threads-\d{1,18}$/.test(value) ? value : "website";
}
