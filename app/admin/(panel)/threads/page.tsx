import { redirect } from "next/navigation";
import ThreadsPageFrame from "@/components/admin/ThreadsPageFrame";
import ThreadsQueue from "@/components/admin/ThreadsQueue";
import ThreadsSetupNotice from "@/components/admin/ThreadsSetupNotice";
import { isAdmin } from "@/lib/admin/auth";
import { adminText } from "@/lib/admin/text";
import { getSettings, postsWithStatus, ThreadsSetupError } from "@/lib/threads/db";
import { aiAlert, threadsHealth } from "@/lib/threads/engine";
import { queueIsLow } from "@/lib/threads/schedule";

export const dynamic = "force-dynamic";

const text = adminText.threads;

export default async function ThreadsQueuePage() {
  if (!(await isAdmin())) redirect("/admin/login");

  let content;
  try {
    const [posts, health, settings] = await Promise.all([
      postsWithStatus(["draft", "scheduled", "container", "publishing", "failed"]),
      threadsHealth(),
      getSettings(),
    ]);
    const alerts = [
      !health.threadsConfigured && text.alerts.noThreads,
      !health.aiConfigured && text.alerts.noAi,
      !health.cronRunning && text.alerts.noCron,
      health.aiError && aiAlert(health.aiError),
      queueIsLow(posts.filter((post) => post.status === "draft" || post.status === "scheduled").map((post) => post.scheduled_at), settings, Date.now()) && text.alerts.queueLow,
      settings.paused && text.alerts.paused,
      health.failedPosts > 0 && text.alerts.failedPosts(health.failedPosts),
      health.stuckPosts > 0 && text.alerts.stuckPosts(health.stuckPosts),
      health.failedReplies > 0 && text.alerts.failedReplies(health.failedReplies),
      health.engineError && text.alerts.engine(health.engineError),
    ].filter((alert): alert is string => Boolean(alert));
    content = (
      <>
        {alerts.length > 0 && (
          <ul role="alert" className="list-disc rounded-2xl border border-amber-200 bg-amber-50 py-3 pl-8 pr-4 text-sm leading-6 text-amber-900">
            {alerts.map((alert) => <li key={alert}>{alert}</li>)}
          </ul>
        )}
        <ThreadsQueue posts={posts} canGenerate={health.aiConfigured} />
      </>
    );
  } catch (error) {
    if (!(error instanceof ThreadsSetupError)) throw error;
    content = <ThreadsSetupNotice />;
  }

  return <ThreadsPageFrame kicker={text.queueKicker} title={text.queue} description={text.queueDescription}>{content}</ThreadsPageFrame>;
}
