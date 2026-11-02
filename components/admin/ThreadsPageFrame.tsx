import type { ReactNode } from "react";

export default function ThreadsPageFrame({ kicker, title, description, children }: { kicker: string; title: string; description: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-6 pt-8 lg:pt-12">
      <header>
        <span className="section-kicker">{kicker}</span>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-trulab-muted">{description}</p>
      </header>
      {children}
    </div>
  );
}
