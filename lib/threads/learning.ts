import type { AccountPost, HourStat } from "./metrics";
import type { Stage } from "./schedule";

// Kept free of runtime imports so the tests can load it on its own.

const DAY = 86_400_000;
// New posts are still collecting views, so judging them early would punish whatever was tried last.
const SETTLE = 2 * DAY;
const LEARN_WINDOW = 60 * DAY;
const PROGRESS_WINDOW = 14 * DAY;
const MIN_POSTS = 3;
// A format starts as typical and needs real results to move away from that.
const PRIOR_POSTS = 3;
// A change smaller than this is treated as noise.
const REAL_CHANGE = 1.05;
export const EXPLORE_NORMAL = 0.2;
export const EXPLORE_STUCK = 0.5;

export const formats: { id: string; stages: Stage[]; brief: string }[] = [
  { id: "story", stages: ["attract", "trust", "offer"], brief: "A short story of one owner's situation, told in a few lines with a clear turn." },
  { id: "opinion", stages: ["attract", "trust"], brief: "One sharp, slightly contrarian opinion, defended in two or three lines." },
  { id: "mistake", stages: ["attract", "trust", "offer"], brief: "One common mistake owners make, what it costs them, and what to do instead." },
  { id: "list", stages: ["attract", "trust", "offer"], brief: "A short numbered list of three practical points." },
  { id: "behind", stages: ["trust", "offer"], brief: "Behind the scenes of how a podcast episode, video shoot or design project is planned or produced. No invented clients." },
  { id: "compare", stages: ["attract", "trust", "offer"], brief: "A before and after, or this versus that, comparison." },
  { id: "oneliner", stages: ["attract"], brief: "One or two lines only: a punchy observation owners will recognise." },
  { id: "question", stages: ["attract", "trust"], brief: "A real question owners will want to answer from their own experience. This format ends with the question." },
];

export type LearnPost = { format?: string; stage: string; posted_at: string | null; views: number; likes: number; replies: number; reposts: number; comments: number; enquiries: number };
export type FormatScore = { id: string; posts: number; score: number };

function median(values: number[]) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = sorted.length >> 1;
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

/** What each stage is for: TOFU is judged on reach, MOFU on reactions and BOFU on enquiries. */
const outcome: Record<string, (post: LearnPost) => number> = {
  attract: (post) => post.views + 20 * post.reposts,
  trust: (post) => post.likes + 3 * post.replies + 5 * post.reposts,
  offer: (post) => 30 * post.enquiries + 5 * post.comments + post.likes,
};

/**
 * How each format does against a typical post of the same stage, where 1 is typical.
 * Comparing within a stage keeps BOFU posts, which reach fewer people, from looking like failures.
 */
export function formatScores(posts: LearnPost[], now: number): FormatScore[] {
  const settled = posts.filter((post) => {
    const at = post.posted_at ? Date.parse(post.posted_at) : 0;
    return at > now - LEARN_WINDOW && at <= now - SETTLE && outcome[post.stage];
  });
  const typical = Object.fromEntries(Object.keys(outcome).map((stage) => [stage, median(settled.filter((post) => post.stage === stage).map(outcome[stage]))]));
  return formats.map(({ id }) => {
    const mine = settled.filter((post) => post.format === id);
    const total = mine.reduce((sum, post) => sum + (outcome[post.stage](post) + 1) / (typical[post.stage] + 1), 0);
    return { id, posts: mine.length, score: Math.round(((total + PRIOR_POSTS) / (mine.length + PRIOR_POSTS)) * 100) / 100 };
  });
}

/**
 * Mostly uses the formats that work, and spends a share of posts trying the least tested ones,
 * so the account keeps finding new things that work instead of repeating one winner.
 */
export function pickFormats(stages: Stage[], scores: FormatScore[], explore: number, random = Math.random) {
  const tried = new Map(scores.map((score) => [score.id, { ...score }]));
  return stages.map((stage) => {
    const options = formats.filter((format) => format.stages.includes(stage)).map((format) => tried.get(format.id) ?? { id: format.id, posts: 0, score: 1 });
    const experiment = random() < explore;
    let pick;
    if (experiment) {
      const fewest = Math.min(...options.map((option) => option.posts));
      const untested = options.filter((option) => option.posts === fewest);
      pick = untested[Math.floor(random() * untested.length)];
    } else {
      const weights = options.map((option) => option.score ** 4);
      let roll = random() * weights.reduce((sum, weight) => sum + weight, 0);
      pick = options.find((_, index) => (roll -= weights[index]) <= 0) ?? options[0];
    }
    // Counting the pick spreads experiments in one batch across different formats.
    pick.posts++;
    return { stage, format: pick.id, experiment };
  });
}

type Window = { views: number | null; engagement: number | null; followers: number | null };
export type Progress = { stuck: boolean; now: Window; before: Window };

const engagementRate = (posts: AccountPost[]) => {
  const views = posts.reduce((sum, post) => sum + post.views, 0);
  return views ? (posts.reduce((sum, post) => sum + post.likes + post.replies + (post.reposts ?? 0), 0) / views) * 100 : 0;
};

/** Whether the account grew in the last 14 settled days compared with the 14 before them. */
export function accountProgress(posts: AccountPost[], history: { day: string; count: number }[], now: number): Progress {
  const end = now - SETTLE;
  const within = (from: number, to: number) => posts.filter((post) => Date.parse(post.at) > from && Date.parse(post.at) <= to);
  const gain = (from: number, to: number) => {
    const at = (time: number) => [...history].reverse().find((entry) => entry.day <= new Date(time).toISOString().slice(0, 10));
    const [start, finish] = [at(from), at(to)];
    return start && finish && start.day !== finish.day ? finish.count - start.count : null;
  };
  const window = (from: number, to: number): Window => {
    const list = within(from, to);
    const enough = list.length >= MIN_POSTS;
    return { views: enough ? median(list.map((post) => post.views)) : null, engagement: enough ? engagementRate(list) : null, followers: gain(from, to) };
  };
  const current = window(end - PROGRESS_WINDOW, end);
  const previous = window(end - 2 * PROGRESS_WINDOW, end - PROGRESS_WINDOW);
  const keys = ["views", "engagement", "followers"] as const;
  const comparable = keys.filter((key) => current[key] !== null && previous[key] !== null);
  const improved = comparable.some((key) => {
    const [value, earlier] = [current[key] as number, previous[key] as number];
    return key === "followers" ? value > earlier : value > earlier * REAL_CHANGE;
  });
  return { stuck: comparable.length > 0 && !improved, now: current, before: previous };
}

const toHour = (time: string) => Number(time.split(":")[0]);
const asTime = (hour: number) => `${String(hour).padStart(2, "0")}:00`;
// Below this share of a typical hour, a time is moved somewhere better.
const WEAK_HOUR = 0.7;

/**
 * Moves post times that have proven weak to proven stronger hours. Times without enough
 * posts yet are kept, because posting at them is how the account learns whether they work.
 */
export function improveTimes(hours: HourStat[], current: string[]) {
  const typical = median(hours.map((hour) => hour.medianViews));
  const stat = new Map(hours.map((hour) => [hour.hour, hour.medianViews]));
  const times = [...current];
  const free = hours.filter((hour) => hour.hour >= 7 && hour.hour <= 23 && hour.medianViews >= typical);
  const weakest = times
    .map((time, index) => ({ index, views: stat.get(toHour(time)) }))
    .filter((item): item is { index: number; views: number } => item.views !== undefined && item.views < typical * WEAK_HOUR)
    .sort((a, b) => a.views - b.views);
  for (const { index } of weakest) {
    const others = times.filter((_, i) => i !== index).map(toHour);
    const better = free.find((hour) => others.every((other) => Math.abs(other - hour.hour) >= 1));
    if (!better) continue;
    times[index] = asTime(better.hour);
    free.splice(free.indexOf(better), 1);
  }
  return times.sort();
}
