import { parseArticle, type Inline } from "@/lib/blog/markdown";

const Text = ({ parts }: { parts: Inline }) => <>{parts.map((part, index) => (part.bold ? <strong key={index} className="font-semibold text-trulab-ink">{part.text}</strong> : part.text))}</>;

export default function ArticleBody({ body }: { body: string }) {
  return (
    <div className="grid gap-5 text-[1.0625rem] leading-8 text-trulab-ink/80">
      {parseArticle(body).map((block, index) => {
        if ("items" in block) {
          const List = block.type;
          return (
            <List key={index} className={`grid gap-2 pl-6 ${block.type === "ul" ? "list-disc" : "list-decimal"}`}>
              {block.items.map((item, itemIndex) => <li key={itemIndex}><Text parts={item} /></li>)}
            </List>
          );
        }
        if (block.type === "h2") return <h2 key={index} className="mt-6 text-2xl font-semibold leading-snug text-trulab-ink"><Text parts={block.content} /></h2>;
        if (block.type === "h3") return <h3 key={index} className="mt-2 text-xl font-semibold text-trulab-ink"><Text parts={block.content} /></h3>;
        return <p key={index}><Text parts={block.content} /></p>;
      })}
    </div>
  );
}
