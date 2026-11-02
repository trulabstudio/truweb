import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleBody from "@/components/blog/ArticleBody";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import Container from "@/components/ui/Container";
import { publishedPost } from "@/lib/blog/db";
import { readingMinutes } from "@/lib/blog/markdown";
import { blogContent as text } from "@/lib/content/blog";
import { siteConfig } from "@/lib/site-config";

export const revalidate = 3600;

const dateFormat = new Intl.DateTimeFormat("ms-MY", { dateStyle: "long", timeZone: "Asia/Kuala_Lumpur" });

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = await publishedPost((await params).slug);
  if (!post) return {};
  const path = `/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: path },
    openGraph: { type: "article", url: path, title: post.title, description: post.description, images: [siteConfig.assets.socialImage], locale: "ms_MY", publishedTime: post.published_at ?? undefined },
  };
}

export default async function BlogArticle({ params }: { params: Promise<{ slug: string }> }) {
  const post = await publishedPost((await params).slug);
  if (!post) notFound();

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    inLanguage: "ms-MY",
    datePublished: post.published_at,
    dateModified: post.updated_at,
    mainEntityOfPage: `${siteConfig.url}/blog/${post.slug}`,
    image: `${siteConfig.url}${siteConfig.assets.socialImage}`,
    author: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    publisher: { "@type": "Organization", name: siteConfig.name, logo: { "@type": "ImageObject", url: `${siteConfig.url}${siteConfig.assets.logo}` } },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      <Navbar />
      <main lang="ms" className="pb-16 pt-28 sm:pt-36">
        <Container className="grid max-w-3xl gap-8">
          <Link href="/blog" className="focus-ring w-fit text-sm font-semibold text-trulab-muted underline">{text.back}</Link>
          <header className="grid gap-4">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{post.title}</h1>
            <p className="text-sm text-trulab-muted">{post.published_at ? dateFormat.format(new Date(post.published_at)) : ""} · {text.minutes(readingMinutes(post.body))}</p>
          </header>
          <ArticleBody body={post.body} />
          <aside className="grid gap-4 rounded-3xl bg-trulab-dark p-7 text-trulab-on-dark">
            <p className="text-2xl font-semibold">{text.ctaTitle}</p>
            <p className="leading-7 text-trulab-on-dark/75">{text.ctaText}</p>
            <Link href={`/konsultasi?src=blog-${post.id}`} className="focus-ring w-fit rounded-full bg-trulab-accent px-6 py-3 font-semibold text-trulab-ink">{text.ctaButton}</Link>
          </aside>
        </Container>
      </main>
      <Footer />
    </>
  );
}
