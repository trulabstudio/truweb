import type { HTMLAttributes } from "react";

export default function Section({ className = "", ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={`py-16 sm:py-24 lg:py-28 ${className}`.trim()} {...props} />;
}
