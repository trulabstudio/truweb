import { redirect } from "next/navigation";
import ThreadsPageFrame from "@/components/admin/ThreadsPageFrame";
import ThreadsSetupNotice from "@/components/admin/ThreadsSetupNotice";
import { isAdmin } from "@/lib/admin/auth";
import { adminText } from "@/lib/admin/text";
import { recentReplies, ThreadsSetupError } from "@/lib/threads/db";

export const dynamic = "force-dynamic";

const text = adminText.threads;
const dateFormat = new Intl.DateTimeFormat("en-MY", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kuala_Lumpur" });
const statusStyle: Record<string, string> = { done: "bg-trulab-accent/30", failed: "bg-red-100 text-red-800", ignored: "bg-trulab-bg text-trulab-muted" };

export default async function ThreadsConversationsPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  let content;
  try {
    const replies = await recentReplies();
    content = replies.length === 0 ? <p className="rounded-3xl border border-trulab-border/10 bg-trulab-surface p-5 text-trulab-muted">{text.noConversations}</p> : (
      <ul className="grid gap-3">
        {replies.map((reply) => (
          <li key={reply.reply_id} className="grid gap-3 rounded-3xl border border-trulab-border/10 bg-trulab-surface p-5 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold">{reply.username ? `@${reply.username}` : text.kinds[reply.kind]}</span>
              <span className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                <span className="font-normal text-trulab-muted">{dateFormat.format(new Date(reply.created_at))}</span>
                <span className="rounded-full border border-trulab-border/10 px-2.5 py-1">{text.kinds[reply.kind]}</span>
                <span className={`rounded-full px-2.5 py-1 ${statusStyle[reply.status] ?? "bg-trulab-bg"}`}>{text.replyStatuses[reply.status]}</span>
              </span>
            </div>
            {reply.comment_text && <p className="whitespace-pre-wrap leading-6">{reply.comment_text}</p>}
            {reply.reply_text && (
              <p className="whitespace-pre-wrap rounded-xl bg-trulab-bg px-3 py-2 leading-6">
                <span className="block text-xs font-semibold text-trulab-muted">{text.ourReply}</span>
                {reply.reply_text}
              </p>
            )}
            {reply.error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-red-800">{reply.error}</p>}
          </li>
        ))}
      </ul>
    );
  } catch (error) {
    if (!(error instanceof ThreadsSetupError)) throw error;
    content = <ThreadsSetupNotice />;
  }

  return <ThreadsPageFrame kicker={text.conversationsKicker} title={text.conversations} description={text.conversationsDescription}>{content}</ThreadsPageFrame>;
}
