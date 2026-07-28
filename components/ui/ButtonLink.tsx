import Link from "next/link";
import type { ComponentProps } from "react";

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: "primary" | "secondary";
};

const variants = {
  primary: "bg-trulab-button-primary text-trulab-button-primary-text shadow-sm hover:-translate-y-0.5 hover:bg-trulab-button-primary-hover",
  secondary: "border border-trulab-border/10 bg-trulab-button-secondary text-trulab-button-secondary-text shadow-sm hover:-translate-y-0.5 hover:shadow-lift",
};

export default function ButtonLink({ className = "", variant = "primary", ...props }: ButtonLinkProps) {
  return (
    <Link
      className={`focus-ring inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition ${variants[variant]} ${className}`.trim()}
      {...props}
    />
  );
}
