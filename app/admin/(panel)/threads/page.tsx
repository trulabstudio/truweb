import Link from "next/link";
import { redirect } from "next/navigation";
import ThreadsPageFrame from "@/components/admin/ThreadsPageFrame";
import ThreadsSetupNotice from "@/components/admin/ThreadsSetupNotice";
import { isAdmin } from "@/lib/admin/auth";
import { adminText } from "@/lib/admin/text";
import { commentCountsByPost, getState, leadCountsBySource, postsWithStatus, threadsLeadsSince, ThreadsSetupError } from "@/lib/threads/db";
import { currentFocus, savedLearning, savedSnapshot, threadsAlerts } from "@/lib/threads/engine";
import { bestHours, funnelReport } from "@/lib/threads/metrics";

export const dynamic = "force-dynamic";

const text = adminText.threads;
const DAY = 86_400_000;
const dateFormat = new Intl.DateTimeFormat("en-MY", { dateStyle: "medium", timeZone: "Asia/Kuala_Lumpur" });
const nextFormat = new Intl.DateTimeFormat("en-MY", { weekday: "long", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Asia/Kuala_Lumpur" });
const cell = "px-4 py-3 text-right tabular-nums";
const panel = "rounded-3xl border border-trulab-border/10 bg-trulab-surface";
const number = (value: number) => Math.round(value * 10) / 10;
const resultStyle: Record<string, string> = { better: "bg-trulab-accent/30", worse: "bg-red-100 text-red-800", same: "bg-trulab-bg", wait: "text-trulab-muted" };

function Change({ now, before, format = (value: number) => number(value).toLocaleString("en-MY") }: { now: number | null; before: number | null; format?: (value: number) => string }) {
  if (now === null || before === null) return <span className="text-trulab-muted">{text.change.wait}</span>;
  const direction = ({ 1: "up", [-1]: "down", 0: "same" } as const)[Math.sign(now - before) as 1 | -1 | 0];
  const style = direction === "up" ? "bg-trulab-accent/30" : direction === "down" ? "bg-red-100 text-red-800" : "bg-trulab-bg";
  return <span className={`rounded-full px-2.5 py-1 font-semibold ${style}`}>{direction === "same" ? text.change.same : text.change[direction](format(before))}</span>;
}

export default async function ThreadsDashboardPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  let content;
  try {
    const now = Date.now();
    const [snapshot, posts, leads, comments, followers, learning, alerts, drafts, scheduled, recentLeads] = await Promise.all([
      savedSnapshot(), postsWithStatus(["published"], "posted_at.desc", 500), leadCountsBySource(), commentCountsByPost(), getState("followers"), savedLearning(), threadsAlerts(),
      postsWithStatus(["draft"], "scheduled_at.asc", 100), postsWithStatus(["scheduled"], "scheduled_at.asc", 5), threadsLeadsSince(new Date(now - 28 * DAY).toISOString()),
    ]);
    const focus = await currentFocus(snapshot?.posts ?? []);
    const enquiries = (id: number) => leads.get(`threads-${id}`) ?? 0;
    const leadsBetween = (from: number, to: number) => recentLeads.filter((lead) => {
      const age = (now - Date.parse(lead.created_at)) / DAY;
      return age >= to && age < from;
    }).length;
    const report = funnelReport(posts.map((post) => ({ ...post, comments: comments.get(post.id) ?? 0, enquiries: enquiries(post.id) })), now);
    const progress = learning?.progress;
    const compared = progress ? (["views", "engagement", "followers"] as const).some((key) => progress.now[key] !== null && progress.before[key] !== null) : false;
    const verdict = learning?.stuck ? "stuck" : compared ? "growing" : "waiting";
    const next = scheduled.find((post) => Date.parse(post.scheduled_at) > now);
    const needs = [
      ...alerts.map((alert) => ({ message: alert, href: "/admin/threads/queue" })),
      ...(drafts.length ? [{ message: text.draftsWaiting(drafts.length), href: "/admin/threads/queue" }] : []),
      ...(leadsBetween(7, 0) ? [{ message: text.newEnquiries(leadsBetween(7, 0)), href: "/admin/enquiries" }] : []),
    ];
    const kpis = [
      { label: text.kpis.followers, value: followers === null ? text.noData : Number(followers).toLocaleString("en-MY"), sub: progress?.now.followers == null ? null : text.followersGained(progress.now.followers), now: progress?.now.followers ?? null, before: progress?.before.followers ?? null, format: (value: number) => text.followersGained(value) },
      { label: text.kpis.views, value: progress?.now.views == null ? text.noData : number(progress.now.views).toLocaleString("en-MY"), sub: null, now: progress?.now.views ?? null, before: progress?.before.views ?? null },
      { label: text.kpis.reactions, value: progress?.now.engagement == null ? text.noData : String(number(progress.now.engagement)), sub: null, now: progress?.now.engagement ?? null, before: progress?.before.engagement ?? null },
      { label: text.kpis.enquiries, value: String(leadsBetween(14, 0)), sub: null, now: leadsBetween(14, 0), before: leadsBetween(28, 14) },
    ];
    const offers = posts.filter((post) => post.stage === "offer");
    const steps: [string, number][] = [
      [text.conversionSteps.views, offers.reduce((total, post) => total + post.views, 0)],
      [text.conversionSteps.comments, offers.reduce((total, post) => total + (comments.get(post.id) ?? 0), 0)],
      [text.conversionSteps.enquiries, offers.reduce((total, post) => total + enquiries(post.id), 0)],
    ];
    const hours = bestHours(snapshot?.posts ?? [], now).slice(0, 5);
    const topPosts = [...(snapshot?.posts ?? [])].sort((a, b) => b.views - a.views).slice(0, 5);
    const sorted = [...posts].sort((a, b) => enquiries(b.id) - enquiries(a.id));
    content = (
      <>
        <section className={`rounded-3xl p-6 ${verdict === "stuck" ? "bg-red-50 text-red-900" : verdict === "growing" ? "bg-trulab-accent/30" : "bg-trulab-surface border border-trulab-border/10"}`}>
          <p className="text-2xl font-semibold leading-snug">{text.verdict[verdict]}</p>
          <p className="mt-2 text-sm">{next ? text.nextPost(nextFormat.format(new Date(next.scheduled_at))) : text.noNextPost}</p>
        </section>

        <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className={`${panel} grid content-start gap-2 p-5`}>
              <p className="text-sm text-trulab-muted">{kpi.label}</p>
              <p className="text-3xl font-semibold tabular-nums">{kpi.value}</p>
              {kpi.sub && <p className="text-sm">{kpi.sub}</p>}
              <p className="text-xs"><Change now={kpi.now} before={kpi.before} format={kpi.format} /></p>
            </div>
          ))}
        </section>
        <p className="-mt-3 text-xs text-trulab-muted">{text.kpiHelp}</p>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <section className={`${panel} p-5`}>
            <h2 className="font-semibold">{text.needsYou}</h2>
            {needs.length === 0 ? <p className="mt-3 rounded-xl bg-trulab-bg px-3 py-2 text-sm">{text.nothingNeeded}</p> : (
              <ul className="mt-3 grid gap-2">
                {needs.map((item) => (
                  <li key={item.message} className="flex items-start justify-between gap-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
                    <span>{item.message}</span>
                    <Link href={item.href} className="focus-ring shrink-0 font-semibold underline">{text.open}</Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className={`${panel} p-5`}>
            <h2 className="font-semibold">{text.systemDoing}</h2>
            <ul className="mt-3 grid gap-2 text-sm">
              <li className="rounded-xl bg-trulab-bg px-3 py-2">{text.form.focusReasons[focus.focus](focus.target, focus.actual)}</li>
              {learning && <li className="rounded-xl bg-trulab-bg px-3 py-2">{text.learningStatus(learning.stuck, learning.explore)}</li>}
              {learning?.times && <li className="rounded-xl bg-trulab-bg px-3 py-2">{text.timesChanged(learning.times.from.join(", "), learning.times.to.join(", "), dateFormat.format(new Date(learning.times.at)))}</li>}
            </ul>
          </section>
        </div>

        <section className={`${panel} p-5`}>
          <h2 className="font-semibold">{text.funnelSimple}</h2>
          <ol className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {report.map((row) => (
              <li key={row.stage} className="grid gap-1 rounded-2xl bg-trulab-bg p-4 text-sm">
                <span className="font-semibold">{text.stages[row.stage]}</span>
                <span className="text-trulab-muted">{text.funnelMeasures[row.stage]}</span>
                <span className="text-2xl font-semibold tabular-nums">{row.value === null ? text.noData : number(row.value)}</span>
                <span><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${resultStyle[row.result]}`}>{text.funnelResults[row.result]}</span></span>
              </li>
            ))}
          </ol>
        </section>

        <details className="group">
          <summary className="focus-ring cursor-pointer rounded-2xl px-1 py-2 font-semibold">{text.details}</summary>
          <p className="px-1 text-sm text-trulab-muted">{text.detailsHelp}</p>
          <div className="mt-4 grid grid-cols-1 gap-6">
            <section className={panel}>
              <h2 className="px-5 pt-5 font-semibold">{text.funnelProgress}</h2>
              <p className="px-5 pt-1 text-sm text-trulab-muted">{text.funnelHelp}</p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-sm">
                  <thead>
                    <tr className="border-y border-trulab-border/10 text-left text-trulab-muted">
                      <th className="px-5 py-3 font-semibold">{text.funnelColumns.stage}</th>
                      <th className="px-4 py-3 font-semibold">{text.funnelColumns.measure}</th>
                      <th className={`${cell} font-semibold`}>{text.funnelColumns.posts}</th>
                      <th className={`${cell} font-semibold`}>{text.funnelColumns.now}</th>
                      <th className={`${cell} font-semibold`}>{text.funnelColumns.before}</th>
                      <th className="px-5 py-3 font-semibold">{text.funnelColumns.result}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.map((row) => (
                      <tr key={row.stage} className="border-b border-trulab-border/10 last:border-0">
                        <td className="px-5 py-3 font-semibold">{text.stages[row.stage]}</td>
                        <td className="px-4 py-3">{text.funnelMeasures[row.stage]}</td>
                        <td className={cell}>{row.posts}</td>
                        <td className={cell}>{row.value === null ? text.noData : number(row.value)}</td>
                        <td className={cell}>{row.earlier === null ? text.noData : number(row.earlier)}</td>
                        <td className="px-5 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${resultStyle[row.result]}`}>{text.funnelResults[row.result]}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-trulab-border/10 p-5">
                <p className="text-sm font-semibold">{text.conversion}</p>
                <ol className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {steps.map(([label, value]) => (
                    <li key={label} className="rounded-xl bg-trulab-bg px-3 py-2 text-sm"><span className="block text-lg font-semibold tabular-nums">{value.toLocaleString("en-MY")}</span>{label}</li>
                  ))}
                </ol>
              </div>
            </section>
            <section className={`${panel} p-5`}>
              <h2 className="font-semibold">{text.learning}</h2>
              <p className="mt-1 text-sm text-trulab-muted">{text.learningHelp}</p>
              {learning === null ? <p className="mt-3 rounded-xl bg-trulab-bg px-3 py-2 text-sm">{text.learningEmpty}</p> : (
                <>
                  <p className={`mt-3 rounded-xl px-3 py-2 text-sm ${learning.stuck ? "bg-red-100 text-red-800" : "bg-trulab-bg"}`}>{text.learningStatus(learning.stuck, learning.explore)}</p>
                  {learning.times && <p className="mt-2 rounded-xl bg-trulab-bg px-3 py-2 text-sm">{text.timesChanged(learning.times.from.join(", "), learning.times.to.join(", "), dateFormat.format(new Date(learning.times.at)))}</p>}
                  <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-trulab-border/10 text-left text-trulab-muted">
                          <th className="py-2 pr-3 font-semibold">{text.funnelColumns.measure}</th>
                          <th className="py-2 pl-3 text-right font-semibold">{text.funnelColumns.now}</th>
                          <th className="py-2 pl-3 text-right font-semibold">{text.funnelColumns.before}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(["views", "engagement", "followers"] as const).map((key) => (
                          <tr key={key} className="border-b border-trulab-border/10 last:border-0">
                            <td className="py-2 pr-3">{text.progressRows[key]}</td>
                            <td className="py-2 pl-3 text-right tabular-nums">{learning.progress.now[key] === null ? text.noData : number(learning.progress.now[key] as number)}</td>
                            <td className="py-2 pl-3 text-right tabular-nums">{learning.progress.before[key] === null ? text.noData : number(learning.progress.before[key] as number)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-trulab-border/10 text-left text-trulab-muted">
                          <th className="py-2 pr-3 font-semibold">{text.formatColumns.format}</th>
                          <th className="py-2 pl-3 text-right font-semibold">{text.formatColumns.posts}</th>
                          <th className="py-2 pl-3 text-right font-semibold">{text.formatColumns.score}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...learning.formats].sort((a, b) => b.score - a.score).map((format) => (
                          <tr key={format.id} className="border-b border-trulab-border/10 last:border-0">
                            <td className="py-2 pr-3">{text.formatNames[format.id] ?? format.id}</td>
                            <td className="py-2 pl-3 text-right tabular-nums">{format.posts}</td>
                            <td className="py-2 pl-3 text-right">{text.formatScore(format.posts, format.score)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </section>
            {snapshot === null ? <p className={`${panel} p-5 text-trulab-muted`}>{text.accountUnavailable}</p> : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <section className={`${panel} p-5`}>
                  <h2 className="font-semibold">{text.bestTimes}</h2>
                  <p className="mt-1 text-sm text-trulab-muted">{text.bestTimesHelp}</p>
                  {hours.length === 0 && <p className="mt-3 rounded-xl bg-trulab-bg px-3 py-2 text-sm">{text.bestTimesEmpty}</p>}
                  <ol className="mt-3 grid gap-2">
                    {hours.map((hour) => (
                      <li key={hour.hour} className="flex items-center justify-between gap-3 rounded-xl bg-trulab-bg px-3 py-2 text-sm">
                        <span className="font-semibold tabular-nums">{text.hourLabel(hour.hour)}</span>
                        <span className="text-trulab-muted">{text.hourDetail(hour.medianViews.toLocaleString("en-MY"), hour.posts)}</span>
                      </li>
                    ))}
                  </ol>
                </section>
                <section className={`${panel} p-5`}>
                  <h2 className="font-semibold">{text.accountPosts}</h2>
                  <p className="mt-1 text-sm text-trulab-muted">{text.accountPostsHelp}</p>
                  <ol className="mt-3 grid gap-2">
                    {topPosts.map((post) => (
                      <li key={post.at} className="rounded-xl bg-trulab-bg px-3 py-2 text-sm">
                        <a href={post.link} target="_blank" rel="noreferrer" className="focus-ring line-clamp-2 hover:underline">{post.text || text.noData}</a>
                        <span className="mt-1 block text-xs tabular-nums text-trulab-muted">{post.views.toLocaleString("en-MY")} {text.columns.views} · {post.likes.toLocaleString("en-MY")} {text.columns.likes} · {post.replies.toLocaleString("en-MY")} {text.columns.replies} · {(post.reposts ?? 0).toLocaleString("en-MY")} {text.columns.reposts}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              </div>
            )}
            {sorted.length === 0 ? <p className="rounded-3xl border border-trulab-border/10 bg-trulab-surface p-5 text-trulab-muted">{text.noPublished}</p> : (
              <div className="overflow-x-auto rounded-3xl border border-trulab-border/10 bg-trulab-surface">
                <table className="w-full min-w-[720px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-trulab-border/10 text-left text-trulab-muted">
                      <th className="px-4 py-3 font-semibold">{text.columns.post}</th>
                      <th className="px-4 py-3 font-semibold">{text.columns.stage}</th>
                      <th className="px-4 py-3 font-semibold">{text.columns.date}</th>
                      <th className={`${cell} font-semibold`}>{text.columns.views}</th>
                      <th className={`${cell} font-semibold`}>{text.columns.likes}</th>
                      <th className={`${cell} font-semibold`}>{text.columns.replies}</th>
                      <th className={`${cell} font-semibold`}>{text.columns.reposts}</th>
                      <th className={`${cell} font-semibold`}>{text.columns.enquiries}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((post) => (
                      <tr key={post.id} className="border-b border-trulab-border/10 last:border-0">
                        <td className="max-w-80 px-4 py-3"><span className="line-clamp-2">{post.text}</span></td>
                        <td className="px-4 py-3">{text.stages[post.stage] ?? post.stage}</td>
                        <td className="whitespace-nowrap px-4 py-3">{post.posted_at ? dateFormat.format(new Date(post.posted_at)) : text.noData}</td>
                        <td className={cell}>{post.views.toLocaleString("en-MY")}</td>
                        <td className={cell}>{post.likes.toLocaleString("en-MY")}</td>
                        <td className={cell}>{post.replies.toLocaleString("en-MY")}</td>
                        <td className={cell}>{post.reposts.toLocaleString("en-MY")}</td>
                        <td className={`${cell} font-semibold`}>{enquiries(post.id)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </details>
      </>
    );
  } catch (error) {
    if (!(error instanceof ThreadsSetupError)) throw error;
    content = <ThreadsSetupNotice />;
  }

  return <ThreadsPageFrame kicker={text.dashboardKicker} title={text.dashboard} description={text.dashboardDescription}>{content}</ThreadsPageFrame>;
}
