import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import Container from "@/components/ui/Container";
import { publishedPosts } from "@/lib/blog/db";
import { readingMinutes } from "@/lib/blog/markdown";
import { blogContent as text } from "@/lib/content/blog";
import { siteConfig } from "@/lib/site-config";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: text.metaTitle,
  description: text.metaDescription,
  alternates: { canonical: "/blog" },
  openGraph: { url: "/blog", title: text.metaTitle, description: text.metaDescription, images: [siteConfig.assets.socialImage], locale: "ms_MY" },
};

const dateFormat = new Intl.DateTimeFormat("ms-MY", { dateStyle: "long", timeZone: "Asia/Kuala_Lumpur" });

export default async function BlogPage() {
  const posts = await publishedPosts();
  return (
    <>
      <Navbar />
      <main lang="ms" className="pb-16 pt-28 sm:pt-36">
        <Container className="grid max-w-3xl gap-10">
          <header className="grid gap-4">
            <span className="section-kicker w-fit">{text.kicker}</span>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{text.title}</h1>
            <p className="text-lg leading-8 text-trulab-muted">{text.description}</p>
          </header>
          {posts.length === 0 ? <p className="rounded-3xl bg-trulab-surface p-6 text-trulab-muted">{text.empty}</p> : (
            <ol className="grid gap-4">
              {posts.map((post) => (
                <li key={post.id}>
                  <Link href={`/blog/${post.slug}`} className="focus-ring grid gap-2 rounded-3xl border border-trulab-border/8 bg-trulab-surface p-6 transition hover:shadow-lift">
                    <span className="text-xs text-trulab-muted">{post.published_at ? dateFormat.format(new Date(post.published_at)) : ""} · {text.minutes(readingMinutes(post.body))}</span>
                    <span className="text-xl font-semibold leading-snug">{post.title}</span>
                    <span className="leading-7 text-trulab-muted">{post.description}</span>
                    <span className="text-sm font-semibold underline">{text.readMore}</span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
}
