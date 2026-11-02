import { redirect } from "next/navigation";
import ThreadsPageFrame from "@/components/admin/ThreadsPageFrame";
import ThreadsQueue from "@/components/admin/ThreadsQueue";
import ThreadsSetupNotice from "@/components/admin/ThreadsSetupNotice";
import { isAdmin } from "@/lib/admin/auth";
import { adminText } from "@/lib/admin/text";
import { postsWithStatus, ThreadsSetupError } from "@/lib/threads/db";
import { threadsAlerts, threadsHealth } from "@/lib/threads/engine";

export const dynamic = "force-dynamic";

const text = adminText.threads;

export default async function ThreadsQueuePage() {
  if (!(await isAdmin())) redirect("/admin/login");

  let content;
  try {
    const [posts, health, alerts] = await Promise.all([postsWithStatus(["draft", "scheduled", "container", "publishing", "failed"]), threadsHealth(), threadsAlerts()]);
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
