"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { sectionIcon } from "@/components/admin/AdminShell";
import { sections } from "@/lib/admin/schema";

export default function SectionCards() {
  const groups = [...new Set(sections.map((section) => section.group))];
  return (
    <div className="grid grid-cols-1 gap-6">
      {groups.map((group) => (
        <section key={group}>
          <h2 className="mb-2 px-1 text-sm font-semibold text-trulab-muted">{group}</h2>
          <div className="divide-y divide-trulab-border/10 overflow-hidden rounded-3xl border border-trulab-border/10 bg-trulab-surface">
            {sections.filter((section) => section.group === group).map((section) => {
              const Icon = sectionIcon(section.key);
              return (
                <Link key={section.key} href={`/admin/${section.key}`} className="focus-ring group flex items-center gap-4 px-5 py-3.5 transition [outline-offset:-3px] hover:bg-trulab-bg">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-trulab-accent/20">
                    <Icon size={17} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1 sm:flex sm:items-center sm:gap-6">
                    <span className="block text-sm font-semibold sm:w-48 sm:shrink-0">{section.label}</span>
                    <span className="block text-sm text-trulab-muted">{section.description}</span>
                  </span>
                  <ChevronRight size={17} aria-hidden className="shrink-0 text-trulab-muted transition group-hover:translate-x-0.5" />
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
