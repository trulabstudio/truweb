// Kept free of runtime imports so the tests can load it on its own.

export type Inline = { text: string; bold: boolean }[];
export type TextBlock = { type: "h2" | "h3" | "p"; content: Inline };
export type ListBlock = { type: "ul" | "ol"; items: Inline[] };
export type Block = TextBlock | ListBlock;

/** Splits **bold** runs out of a line. Anything else is plain text, so nothing in an article can inject markup. */
export function inline(text: string): Inline {
  return text.split(/(\*\*[^*]+\*\*)/).filter(Boolean).map((part) => (
    part.startsWith("**") && part.endsWith("**") ? { text: part.slice(2, -2), bold: true } : { text: part, bold: false }
  ));
}

/** Reads the small part of Markdown that articles use: headings, paragraphs, lists and bold. */
export function parseArticle(body: string): Block[] {
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  const flush = () => {
    if (paragraph.length) blocks.push({ type: "p", content: inline(paragraph.join(" ")) });
    paragraph = [];
  };
  for (const raw of body.replace(/\r/g, "").split("\n")) {
    const line = raw.trim();
    const list = line.match(/^(?:([-*])|(\d+)[.)])\s+(.*)$/);
    if (!line) {
      flush();
    } else if (line.startsWith("### ") || line.startsWith("## ")) {
      flush();
      blocks.push({ type: line.startsWith("### ") ? "h3" : "h2", content: inline(line.replace(/^#+\s+/, "")) });
    } else if (list) {
      flush();
      const type = list[1] ? "ul" : "ol";
      const last = blocks.at(-1);
      if (last && last.type === type) last.items.push(inline(list[3]));
      else blocks.push({ type, items: [inline(list[3])] });
    } else {
      paragraph.push(line.replace(/^#\s+/, ""));
    }
  }
  flush();
  return blocks;
}

export function slugify(text: string) {
  return text.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80).replace(/-+$/, "");
}

export const validSlug = (slug: string) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) && slug.length <= 100;

export const wordCount = (body: string) => body.split(/\s+/).filter((word) => /[\p{L}\p{N}]/u.test(word)).length;

/** Rough reading time at 200 words a minute. */
export const readingMinutes = (body: string) => Math.max(1, Math.round(wordCount(body) / 200));
