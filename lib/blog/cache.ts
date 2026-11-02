import { revalidatePath, revalidateTag } from "next/cache";
import { BLOG_TAG } from "./db";

/** Shows a new or changed article on the website at once instead of within the hour. */
export function refreshBlog() {
  revalidateTag(BLOG_TAG);
  // Pages are also cleared by path, in case one was built before it read any article.
  revalidatePath("/blog");
  revalidatePath("/blog/[slug]", "page");
  revalidatePath("/sitemap.xml");
}
