import { redirect } from "next/navigation";
import ThreadsPageFrame from "@/components/admin/ThreadsPageFrame";
import ThreadsSetupNotice from "@/components/admin/ThreadsSetupNotice";
import { isAdmin } from "@/lib/admin/auth";
import { adminText } from "@/lib/admin/text";
import { commentCountsByPost, getState, leadCountsBySource, postsWithStatus, ThreadsSetupError } from "@/lib/threads/db";
import { accountSnapshot, followerHistory } from "@/lib/threads/engine";
import { bestHours, followerChange, funnelReport } from "@/lib/threads/metrics";

export const dynamic = "force-dynamic";

const text = adminText.threads;
const dateFormat = new Intl.DateTimeFormat("en-MY", { dateStyle: "medium", timeZone: "Asia/Kuala_Lumpur" });
const cell = "px-4 py-3 text-right tabular-nums";
const panel = "rounded-3xl border border-trulab-border/10 bg-trulab-surface";
const number = (value: number) => Math.round(value * 10) / 10;
const resultStyle: Record<string, string> = { better: "bg-trulab-accent/30", worse: "bg-red-100 text-red-800", same: "bg-trulab-bg", wait: "text-trulab-muted" };

export default async function ThreadsPerformancePage() {
  if (!(await isAdmin())) redirect("/admin/login");

  let content;
  try {
    const snapshot = await accountSnapshot();
    const [posts, leads, comments, followers, history] = await Promise.all([postsWithStatus(["published"], "posted_at.desc", 500), leadCountsBySource(), commentCountsByPost(), getState("followers"), followerHistory()]);
    const enquiries = (id: number) => leads.get(`threads-${id}`) ?? 0;
    const sum = (pick: (post: (typeof posts)[number]) => number) => posts.reduce((total, post) => total + pick(post), 0);
    const growth = followerChange(history, Date.now());
    const report = funnelReport(posts.map((post) => ({ ...post, comments: comments.get(post.id) ?? 0, enquiries: enquiries(post.id) })), Date.now());
    const offers = posts.filter((post) => post.stage === "offer");
    const steps: [string, number][] = [
      [text.conversionSteps.views, offers.reduce((total, post) => total + post.views, 0)],
      [text.conversionSteps.comments, offers.reduce((total, post) => total + (comments.get(post.id) ?? 0), 0)],
      [text.conversionSteps.enquiries, offers.reduce((total, post) => total + enquiries(post.id), 0)],
    ];
    const hours = bestHours(snapshot?.posts ?? [], Date.now()).slice(0, 5);
    const topPosts = [...(snapshot?.posts ?? [])].sort((a, b) => b.views - a.views).slice(0, 5);
    const metrics: [string, string][] = [
      [growth === null ? text.metrics.followers : `${text.metrics.followers} (${text.followerChange(growth)})`, followers === null ? text.noData : Number(followers).toLocaleString("en-MY")],
      [text.metrics.published, posts.length.toLocaleString("en-MY")],
      [text.metrics.views, sum((post) => post.views).toLocaleString("en-MY")],
      [text.metrics.replies, sum((post) => post.replies).toLocaleString("en-MY")],
      [text.metrics.enquiries, sum((post) => enquiries(post.id)).toLocaleString("en-MY")],
    ];
    const sorted = [...posts].sort((a, b) => enquiries(b.id) - enquiries(a.id));
    content = (
      <>
        <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {metrics.map(([label, value]) => (
            <div key={label} className="rounded-3xl border border-trulab-border/10 bg-trulab-surface p-5">
              <p className="text-2xl font-semibold tabular-nums">{value}</p>
              <p className="mt-1 text-sm text-trulab-muted">{label}</p>
            </div>
          ))}
        </section>
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
                    <span className="mt-1 block text-xs tabular-nums text-trulab-muted">{post.views.toLocaleString("en-MY")} {text.columns.views} · {post.likes.toLocaleString("en-MY")} {text.columns.likes} · {post.replies.toLocaleString("en-MY")} {text.columns.replies}</span>
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
                    <td className={`${cell} font-semibold`}>{enquiries(post.id)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </>
    );
  } catch (error) {
    if (!(error instanceof ThreadsSetupError)) throw error;
    content = <ThreadsSetupNotice />;
  }

  return <ThreadsPageFrame kicker={text.performanceKicker} title={text.performance} description={text.performanceDescription}>{content}</ThreadsPageFrame>;
}
