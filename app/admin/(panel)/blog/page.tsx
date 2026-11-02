import { redirect } from "next/navigation";
import BlogEditor, { WriteDraftButton } from "@/components/admin/BlogEditor";
import ThreadsPageFrame from "@/components/admin/ThreadsPageFrame";
import { isAdmin } from "@/lib/admin/auth";
import { adminText } from "@/lib/admin/text";
import { allPosts } from "@/lib/blog/db";
import { getState, ThreadsSetupError } from "@/lib/threads/db";

export const dynamic = "force-dynamic";

const text = adminText.blog;

export default async function AdminBlogPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  let content;
  try {
    const [posts, error] = await Promise.all([allPosts(), getState("blog_error")]);
    content = (
      <>
        <WriteDraftButton canWrite={Boolean(process.env.ANTHROPIC_API_KEY)} />
        {error && <p role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{text.lastError(error)}</p>}
        {posts.length === 0 ? <p className="rounded-3xl border border-trulab-border/10 bg-trulab-surface p-5 text-trulab-muted">{text.empty}</p> : (
          <div className="grid gap-3">
            {posts.map((post) => <BlogEditor key={`${post.id}-${post.updated_at}`} post={post} siteUrl="" />)}
          </div>
        )}
      </>
    );
  } catch (error) {
    if (!(error instanceof ThreadsSetupError)) throw error;
    content = (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
        <h2 className="font-semibold">{text.setupTitle}</h2>
        <p className="mt-2 text-sm leading-6">{text.setupBody}</p>
      </section>
    );
  }

  return <ThreadsPageFrame kicker={text.kicker} title={text.title} description={text.description}>{content}</ThreadsPageFrame>;
}
